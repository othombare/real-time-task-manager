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
    }
});


userSchema.pre('save', async function(next){
    //only run if password is actually modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm field
    this.passwordConfirm= undefined;
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};


const User= mongoose.model('User', userSchema);

module.exports= User;