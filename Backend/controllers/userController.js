const fs = require('fs');
const User= require('./../models/userModel');
const catchAsync= require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const normalizeProfileLink = (value) => {
    const trimmedValue = String(value || '').trim();

    if (!trimmedValue) {
        return '';
    }

    return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

//Get current user details
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
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
exports.updateMe = catchAsync(async (req, res, next) => {
    const allowedFields = [
        'name',
        'photo',
        'role',
        'about',
        'location',
        'githubProfile',
        'linkedinProfile'
    ];
    const updates = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] =
                field === 'githubProfile' || field === 'linkedinProfile'
                    ? normalizeProfileLink(req.body[field])
                    : req.body[field];
        }
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError('No valid profile fields were provided.', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

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
