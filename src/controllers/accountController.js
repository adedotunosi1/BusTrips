const busTripUsers = require('../models/busUsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "duibfsfuyws8722efyfvuy33762";
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { createNewUser } = require('../services');
const images = require('../models/imageModel');
const walletNotification = require('../models/notifications');
const { signJWT, verifyJWT } = require('../utils/jwt.utils');
const { createSession } = require('../utils/session');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Include this line
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET); // Include clientSecret

const register = async (req, res, next) => {
    const {firstName, lastName, email, password, is_admin } = req.body;
    console.log('Reached registration route handler');
    console.log(password)
    console.log(firstName)
  try {
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
   if (!emailRegex.test(email)) {
  return res.status(400).json({error: "Invalid Email!"});
}
      const oldUser = await busTripUsers.findOne({ email });
      if(oldUser){
        return res.status(400).json({error: "Email is already being used."});
      } 
      if (!password) {
        return res.status(400).json({ error: "Password is required." });
      }
      const encryptedPassword = await bcrypt.hash(password, 10);
      const otp = randomstring.generate({
        length: 4,
        charset: 'numeric'
      });
      
    const isAdminUser = is_admin === true;

      const expirationTime = Date.now() + 5 * 60 * 1000;
      const message = `Hello ${firstName},\n\nYour OTP for verification is: ${otp}`;
      const transporter = nodemailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      const mailOptions = {
        from: process.env.APP_EMAIL,
        to: email,
        subject: 'BusTrips OTP Code',
        text: message,
      };
      
      transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
          console.log(error);
          if (error.responseCode === 553) {
            return res.status(400).json({error: "Invalid Email!"});
          } else {
         return res.json({ error: error, message: 'Failed to send OTP' });
          }
        } else {
          console.log('Email sent: ' + info.response);
          const transactionPin = 1111;
        const details =  {firstName, lastName, email, password: encryptedPassword, otp, expirationTime, otpVerified: false, userImage: '', is_admin: isAdminUser, };
        const createUser = await createNewUser(details);

          return res.json({ status: "ok", message: 'Registration Successful. Check email for OTP', userEmail: email });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Internal Server Error"});
    }
}

const login = async (req, res, next) => {
  console.log("testing", req.user);
  try {
    const { email, password } = req.body;
    const user = await busTripUsers.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

     // Check if the user has signed up with Google OAuth
     if (user.provider === 'google') {
      return res.status(400).json({ error: 'Kindly use "Sign In with Google" to log in.' });
    }

    if (user.otpVerified !== true) {
      return res.status(400).json({ error: "Please verify OTP first" });
    }
    const fullName = user.fullName;
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ status: "failed", error: "Incorrect Password" });
    }

    const session = createSession(email, fullName);
    const accessToken = signJWT({ email: user.email, _id: user._id, fullName, sessionId: session.sessionId  }, "7h");
    const refreshToken = signJWT({ sessionId: session.sessionId }, "1y");

    res.cookie('accessToken', accessToken, {
      maxAge: 25200000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 31536000000, // 1 year (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const { payload: decodedUser, expired } = verifyJWT(accessToken);
if (decodedUser) {
  const userdata = {_id: decodedUser._id, email, fullName};
  console.log("users", userdata);
  return res.status(201).json({
    status: "ok",
    message: "Login Successful",
    session,
  });
} else {
  console.error("Error decoding access token:", expired ? "Token expired" : "Token invalid");
  return res.status(500).json({ error: "Internal Server Error", });
}

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie("accessToken", "", {
      maxAge: 0,
      httpOnly: true,
    });

    res.cookie("refreshToken", "", {
      maxAge: 0,
      httpOnly: true,
    });

    return res.status(200).json({
      status: 'success',
      message: 'User logged out',
      data: null,
    });
  } catch (error) {
    
    console.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const delete_account = async (req, res, next) => {
  try {
    const userId  = req.user._id;

    const user = await busTripUsers.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.cookie("accessToken", "", {
      maxAge: 0,
      httpOnly: true,
    });

    res.cookie("refreshToken", "", {
      maxAge: 0,
      httpOnly: true,
    });

     const deleteNotifications = await walletNotification.deleteMany({ userId });
 
     const deleteTransactions = await userTransaction.deleteMany({ userId });
 
    const deleteUserAccount = await busTripUsers.findByIdAndDelete(userId);
    console.log("Deleted User Account:", deleteUserAccount ? deleteUserAccount.toJSON() : null);

    return res.status(200).json({ message: 'User deleted successfully', deleteUserAccount });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const user_data_dashboard = async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = await busTripUsers.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ status: "User does not exist!!" });
    }
    res.status(200).json({ status: "ok", userdata: user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal Server Error" });
  }
};

const verify_otp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await busTripUsers.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (user.expirationTime < Date.now()) {
      return res.status(401).json({ message: "OTP has expired" });
    }

    user.otpVerified = true;
    await user.save();

    return res.status(200).json({ message: "OTP Verification Complete", myuserinfo: user });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const generate_otp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const myuser = await busTripUsers.findOne({ email });
    // Logic to generate OTP
    const otp = randomstring.generate({
      length: 4,
      charset: 'numeric'
    });
    const message = `Hello ${myuser.firstName} ${myuser.lastName},\n\nYour new OTP code is: ${otp}`;
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });
    
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: 'Bank App Wallet New OTP Code',
      text: message,
    };
    
    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to send OTP' });
      } else {
        console.log('Email sent: ' + info.response);
        myuser.otp = otp;
        await myuser.save();
        res.status(200).json({ message: 'New OTP sent successfully' });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Internal Server Error' });
  }
}

const forgot_pass = async (req, res) => {
  const {email} = req.body;
     try {
      const oldUser = await busTripUsers.findOne({ email });
      if(!oldUser){
        return res.status(400).json({ error: "User does not exist!!"});
      }
      const Useremail = oldUser.email;
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({ email: oldUser.email, id: oldUser._id },secret,{
        expiresIn: "5m",
      });
      const link = `https://wallet-wb.vercel.app/reset-password/${oldUser._id}/${token}`;
      const message = `Reset your Passoword using the following link :- \n\n ${link} \n\nif you have not requested this email then, please ignore it. \n\n This link expires in 5 minutes. You must request a new link if that time elapses.`;
   
      const transporter = nodemailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
      });
      
      const mailOptions = {
        from: process.env.APP_EMAIL,
        to: Useremail,
        subject: 'Bank App Wallet Password Reset',
        text: message,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.status(400).json({ error: "error", message: "There is an issue sending password reset link"});
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json({ status: "ok", message: "Password Reset Link Sent Check Your Email!"});
        }
      });
     } catch (error) {
      console.log(error)
      return res.status(400).json({ error: "error", message: "Internal Serval Error"});
     }
}

const pass_reset = async (req, res) => {
    const {password, id, token} = req.body;
  //  const token = req.params.token;
    const oldUser = await busTripUsers.findOne({ _id: id }); 
      if(!oldUser){
      return res.json({ status: "User does not exist!!"});
      }
      const secret = JWT_SECRET + oldUser.password;
      try {
        const verify = jwt.verify(token, secret);
        const encryptedPassword = await bcrypt.hash(password, 10);
        await busTripUsers.updateOne({
          _id: id,
        }, {
          $set: {
            password: encryptedPassword,
          },
        });
        res.json({ status: "Password Updated"});
      } catch (error) {
        console.log(error);
        res.status(400).json({status: "Error: Your password could not be changed."});
      }
}

const userImage = async (req, res) => {
   const {userId} = req.params;
   const {myuserimage} = req.body;
   try {
     // Find the user by userId
     const user = await busTripUsers.findById(userId);
     console.log(user);
 
     if (!user) {
       return res.status(404).json({ error: 'User not found.' });
     }
 
   const image =  await images.create({
      image: myuserimage,
      userId,
    });

    user.userImage = myuserimage;
    await user.save();

    res.send({ status: "ok", message: "Image upload successful"});
   } catch (error) {
    console.log(error);
    res.send({ status: "error", data: error});
   }
}

module.exports = {
    register,
    login,
    verify_otp,
    generate_otp,
    forgot_pass,
    pass_reset,
    userImage,
    user_data_dashboard,
    logout,
    delete_account
} 