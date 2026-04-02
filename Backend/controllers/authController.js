const { promisify } = require('util');
const User= require('./../models/userModel');
const catchAsync= require('./../utils/catchAsync');
const jwt= require('jsonwebtoken');
const AppError= require('./../utils/AppError');


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async(req, res, next)=>
{
    //const newUser = await User.create(req.body);
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });


    const token = signToken(newUser._id);

    res.status(201).json({
        status:"success",
        token,
        data:{
            user: newUser
        }
    });
});


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    //1) check if email and password exist
    if(!email || !password)
    { 
        return next(new AppError('Please provide email and password', 400));
    }

    //2) check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');
    const correct = await user.correctPassword(password, user.password);

    if(!user || !correct)
    {
        return next(new AppError('Incorrect email or password', 401));
    }


    //3) if everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status:'success',
        token,
        data: {
            user: user
        }
    });
});



exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Please provide your email address.', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('There is no user with that email address.', 404));
    }

    // TODO: generate reset token, store, and send email. For now we return success.
    res.status(200).json({
        status: 'success',
        message: 'If your email is registered, a password reset link has been sent.'
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    //1) Getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
        console.log(token);
    }
    if(!token)
    {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }


    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    //3) Get user from token
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser;
    next();
});
