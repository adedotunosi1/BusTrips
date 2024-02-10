const busUsers = require("../models/AfriMoveUsersModel");

exports.register = async (details) => {
    try {
        const newUser = await busUsers.create({...details});
        if(!newUser)
        return {error: "Account Registration Failed"};
        return newUser;
    } catch (error) {
        console.log(error)
        return {error}
    }
}
