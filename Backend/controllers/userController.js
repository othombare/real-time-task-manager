const fs = require('fs');
const User= require('./../models/userModel');
const catchAsync= require('./../utils/catchAsync');

//Get current user details
exports.getMe = catchAsync(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

//USERS
//const users=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`));
//To get all the users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});
       
//Creating new user
exports.createUser = (req, res)=>
{
    res.status(200).json({
        status:"500",
        message:"This route is not yet defined!"
    });
};


//To get user by id
exports.getUser = (req, res)=>{
    res.status(200).json({
        status:"500",
        message:"This route is not yet defined!"
    });
};



//Not doing much just to see the PATCH
exports.updateUser = (req, res)=>{
res.status(200).json({
        status:"500",
        message:"This route is not yet defined!"
    });
};



//Deleting a user demo
exports.deleteUser = (req, res)=>{
    res.status(200).json({
        status:"500",
        message:"This route is not yet defined!"
    });
};