const AccountModule = require('./authServices');
const BusModule = require('./busServices');

//Auth Paths
exports.createNewUser = async (details) => AccountModule.register(details);
exports.addNewBus = async (details) => BusModule.addbus(details);