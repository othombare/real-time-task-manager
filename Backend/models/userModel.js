const crypto = require('crypto');
const mongoose= require('mongoose');
const validator= require('validator');
const bcrypt= require('bcrypt');

//Creating Schema
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name!"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
         validate:[validator.isEmail, 'Please provide valid email'],
        unique:true,
        lowercase:true
    },
    photo:{
        type:String
    },
    role: {
        type: String,
        default: 'Workspace Member'
    },
    about: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,"Confirm the password"],
        minlength:8,
        select:false,
        //only works on save and create not on update
        validate:{
        validator: function(el){
            return el===this.password;
        },
        message:"Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    }
});


userSchema.pre('save', async function() {
    //only run if password is actually modified
    if (!this.isModified('password')) return;

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm field
    this.passwordConfirm = undefined;

    //set passwordChangedAt
    this.passwordChangedAt = Date.now();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }


    // False means NOT changed
    return false;
};

const User= mongoose.model('User', userSchema);

module.exports= User;
