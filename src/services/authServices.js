const bankUsers = require("../models/busUsersModel");

exports.register = async (details) => {
    try {
        const newUser = await bankUsers.create({...details});
        if(!newUser)
        return {error: "Account Registration Failed"};
        return newUser;
    } catch (error) {
        console.log(error)
        return {error}
    }
}
