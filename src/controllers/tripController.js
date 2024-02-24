const AfriMoveBus = require('../models/AfriMoveBusModel');
const AfriMoveUsers = require('../models/AfriMoveUsersModel');
const AfriMoveBooking = require('../models/bookingModel');
const AfriMoveTrip = require('../models/tripModel');
const { initiatePayment } = require('./paystackController');
const randomstring = require('randomstring');

const create_trip = async (req, res) => {
    const { busId, tripDate, paymentOption, seatNumber, people } = req.body;
    const userId = req.user._id;
    console.log(userId);
    const email = req.user.email;
    console.log(email, "yes fixing it all");
    console.log(busId);

    try {
        const bus = await AfriMoveBus.findOne({ busId });
        if (!bus) {
            return res.status(404).json({ error: 'Bus Not Found' });
        }
        const basePrice = bus.price;
        const amount = basePrice * people;

        const destination = bus.destination;
        const tripNumber = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });

        if (paymentOption === 'online') {
            const paystackResponse = await initiatePayment(amount, email);

            if (paystackResponse instanceof Error) {
                console.error('Paystack request error:', paystackResponse.message);
                return res.status(500).json({ error: "Paystack request failed", message: paystackResponse.message });
            }

            const newTrip = new AfriMoveTrip({
                userId,
                busId,
                tripDate,
                destination,
                price: amount,
                paymentOption,
                tripNumber,
                seatNumber,
                people
            });

            await newTrip.save();

            const newBooking = new AfriMoveBooking({
                tripId: newTrip._id,
                userId
            });

            await newBooking.save();

            res.json({
                authorizationUrl: paystackResponse.data.authorization_url,
                message: 'User should be redirected here and then click successful',
            });
        } else {
            const status = "active";
            const newTrip = new AfriMoveTrip({
                userId,
                busId,
                tripDate,
                destination,
                price: amount,
                paymentOption,
                tripNumber,
                seatNumber,
                status,
                people
            });

            await newTrip.save();

            // creating a newbooking

            const newBooking = new AfriMoveBooking({
                tripId: newTrip._id,
                userId
            });

            await newBooking.save();

            res.json({ message: 'Trip Created!', data: newTrip });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error });
    }
}

const cancel_trip = async (req, res) => {
    const { tripId } = req.body;
    const userId = req.user._id;
    try {

        const trip = await AfriMoveTrip.findOne({ tripId });

        if (!trip) {
            return res.status(404).json({ error: "Trip not found or unauthorized to cancel" });
        }

        // Update the trip status to cancelled
        trip.status = 'cancelled';
        await trip.save();

        return res.status(200).json({ message: "Trip cancelled successfully" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error});
    }
}

const get_trips = async (req, res) => {
    const userId = req.user._id;
    try {
        const userTrips = await AfriMoveTrip.find({userId});
        if (!userTrips) {
            return res.status(404).json({ error: 'No Data' });
          }
          res.json({ message: 'Your Trips', data: userTrips });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error});
    }
}

const trip_data = async (req, res) => {
    const userId = req.user._id;
   const {tripId} = req.body;
    try {
        const myBus = await AfriMoveTrip.findOne({ tripId });
        if (!myBus) {
            return res.status(404).json({ error: 'Trip Not Found!' });
          }
          res.json({ message: 'Your Trip Data', data: myBus });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error});
    }
}

const trip_payment = async (req, res) => {
    const userId = req.user._id;
    const email = req.user.email;
    const {tripId} = req.body;

   try {

    const trip = await AfriMoveTrip.findOne({ tripId });
    if (!trip) {
        return res.status(404).json({ error: 'Trip Not Found' });
      }
    const amount = trip.price;

    const paystackResponse = await initiatePayment(amount, email);
          
          console.log('Paystack Response Data:', paystackResponse);

          // Check for Paystack request errors
          if (paystackResponse instanceof Error) {
              console.error('Paystack request error:', paystackResponse.message);
              return res.status(500).json({ error: "Paystack request failed", message: paystackResponse.message });
          }
          // Return the authorization URL to the client
              res.json({
              authorizationUrl: paystackResponse.data.authorization_url,
              message: 'User should be redirected here and then click successful',
           });

        } catch (error) {
         console.log(error);
         return res.status(404).json({ messsage: 'Internal Server Error', coderror: error });
        } 
}

const track_trip = async (req, res) => {
    const { tripNumber } = req.body;
    try {
        const myBus = await AfriMoveTrip.findOne({ tripNumber });
        if (!tripNumber) {
            return res.status(404).json({ error: 'Trip Not Found!' });
          }
          res.json({ message: 'Trip Data', data: myBus });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ messsage: 'Internal Server Error', coderror: error });
    }
}
const paystack_webhook = async (req, res) => {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      const payload = JSON.stringify(req.body);
  
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(payload)
        .digest('hex');
  
      const paystackSignature = req.headers['x-paystack-signature'];
  
      if (hash === paystackSignature) {
        const event = req.body.event;
        const reference = req.body.data.reference;
        const email = req.body.data.customer.email;
        const amount = req.body.data.amount / 100; // Paystack amount is in kobo, convert to naira or usd
        const user = await AfriMoveUsers.findOne({ email });
        const  userId = user._id.toString(); // Convert the ObjectId to a string
        if (event === 'charge.success') {
      
          const trips = await AfriMoveTrip.findOne({ userId });
          if (!trips) {
            return res.status(404).send('Trip not found');
          }

          // Update the trip status to cancelled
        trips.status = 'active';
        await trips.save();
        }
  
        // Respond to the Paystack webhook with a 200 OK status
        res.status(200).send('Webhook Received');
      } else {
        res.status(400).send('Invalid Webhook Signature');
      }
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(500).send('Webhook Error');
    }
  };

module.exports = {
    create_trip,
    cancel_trip,
    get_trips,
    trip_data,
    trip_payment,
    track_trip
}