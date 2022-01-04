const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const userSchema=mongoose.Schema({
   username: {
        type: String,
        required: true,
        trim: true,
        unique: true, // note - this is a unqiue index - not a validation
        validate: {
            validator: function(value) {
                const self = this;
                const errorMsg = 'Username already in use!';
                return new Promise((resolve, reject) => {
                    self.constructor.findOne({ username: value })
                        .then(model => model._id ? reject(new Error(errorMsg)) : resolve(true)) // if _id found then email already in use 
                        .catch(err => resolve(true)) // make sure to check for db errors here
                });
            },
        }
    },   
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        // validate(value) {
        //     if (value.toLowerCase().includes('password')) {
        //         throw new Error('Password cannot contain "password"')
        //     }
        // }
    },
    token: {
        type: String,
        trim: true,
    },
    verified: {
        type: Boolean
    }
 })

userSchema.methods.generateAuthToken = async function () {
        // const user = this
        const token = jwt.sign({ _id: this._id }, 'thisismynewcourse')
    
        // user.tokens = user.tokens.concat({ token })
        // await user.save()
    console.log("gen",token)
        return token
    }

// userSchema.statics.findByCredentials = async (email, password) => {
//         const user = await User.findOne({ email })
    
//         if (!user) {
//             throw new Error('Unable to login')
//         }
    
//         const isMatch = await bcrypt.compare(password, user.password)
    
//         if (!isMatch) {
//             throw new Error('Unable to login')
//         }
    
//         return user
//     }
    
    // Hash the plain text password before saving
    userSchema.pre('save', async function (next) {
        const user = this
        // console.log('this',this)
        // const salt = bcrypt.genSalt();
        // user.password = await bcrypt.hash(user.password, salt)
        // console.log('this',this)
       let hash = await bcrypt.hash(user.password, 7);
       user.password=hash
        next()
    })

const User = mongoose.model('User', userSchema)
module.exports=User