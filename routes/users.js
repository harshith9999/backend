const express = require('express');
const router = express.Router();
const bcrypt =require('bcrypt');
const User=require('../models/user')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')
const sendEmail = require("../utils/email");

/* GET users listing. */

router.get('/', async function(req, res) {
  try{
   const users=await User.find({})
   if(users.length<1){
    return res.status(200).json({
      message: "No Users"
    });
  }
  else{
    res.status(200).send(users)
        }
  }
  catch(e){
    res.status(500).json({
      msg: 'Not working'
    });
  }
});

router.post('/signup', async (req, res) => {
  const usercheck= await User.find({username: req.body.username})
  if(usercheck.length!=0){
    return res.status(400).send({message:"Already this Username has been registered"})
  }
  const user = new User(req.body)
  try {
      const message = `http://localhost:4000/users/verify/${user.id}`;
      function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
      if(!validateEmail(user.username)){
    return res.status(400).send({message:"Pls enter valid email in username"})
      }
    await sendEmail(user.username, "Verify Email", message);
    await user.save()
    res.status(201).send({msg:"Pls verify ur account"})
  } catch (e) {
    console.log(e)
      res.status(400).send({message:"Pls tell me what is wrong"})
  }
})
router.post('/forgot-password', async(req, res) => {
  try {
   const user= await User.find({username: req.body.username})
   if(user.length==0){
     return res.status(400).send({message:"Please enter a right username"})
   }
   const message = `http://localhost:3000/reset/${user[0].id}`;
   await sendEmail(user[0].username, "Reset Password", message);
    res.status(200).send({message:"Please check your mailbox"})
  } catch (e) {
    console.log(e)
      res.status(400).send(e)
  }
})
router.post('/reset/:id', async(req, res) => {
  try {
    if(req.body.password.length<7){
      res.status(400).send({message:"password length should be greater than 7"})
    }
   let hash = await bcrypt.hash(req.body.password, 7);
  const user= await User.findOneAndUpdate({_id: req.params.id},{
    $set: {
        "password": hash
    }
 }, { new: true });
  console.log(user)
    res.status(200).send({message:"Password Changed"})
  } catch (e) {
    console.log(e)
      res.status(400).send(e)
  }
})
router.get('/verify/:id', async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id},{
      $set: {
          "verified": true
      }
   }, { new: true }, );
    res.status(200).send("Account Verified")

  } catch (e) {
    console.log(e)
      res.status(400).send(e)
  }
})
router.post('/login', async (req, res) => {
  try {
    // console.log(req.user)
      // const user = await User.findByCredentials(req.body.username, req.body.password)
       let user = await User.find({username:req.body.username})
       console.log(user)
       if(user.length==0){
        return res.status(400).send({message:"Pls signup",status:400})
       }
       if(user[0].verified!==true){
         return res.status(400).send({message:"Pls verify ur username",status:400})
       }
      if(!user.token){
        const token = jwt.sign({ _id: user[0]._id}, 'thisismynewcourse')
     user= await User.findOneAndUpdate({ username:req.body.username },{
            $set: {
                "token": token
            }
         }, { new: true }, );
        }

     const pass =bcrypt.compareSync(req.body.password,user.password)
      if(user.length!=0){
  if(pass){
      res.status(200).send({status:200,token:user.token})
      }
      else{
      res.status(400).send({message:"Wrong Password",status:400})
      }
  } 
  }catch (e) {
    console.log(e)
      res.status(400).send(e)
  }
})
router.get('/me', auth, async (req, res) => {
  res.send({user:req.user})
})

// router.post('/signup', function(req, res) {
//   User.find({email:req.body.email}).exec().then(user=>{
//     if(user.length>=1){
//       return res.status(409).json({
//         message: "Mail exists"
//       });
//     }
//     else{
//        bcrypt.hash(req.body.password, 10, (err, hash) => {
//       if (err) {
//         console.log('here')
//         return res.status(500).json({ 
//           error: err
//         });
//       } else {
//         const user = new User({
//           _id: new mongoose.Types.ObjectId(),
//           email: req.body.email,
//           password: hash
//         });
//         user.save()
//         .then(result => {
//           console.log(result);
//           res.status(201).json({
//             message: "User created"
//           });
//         })
//         .catch(err => {
//           console.log(err);
//           res.status(500).json({
//             error: err
//           });
//         });
//         console.log(user)
//       }
//     });
//   }
// });
// });

// router.post("/login", (req, res) => {
//   User.find({ email: req.body.email })
//     .exec()
//     .then(user => {
//       if (user.length < 1) {
//         console.log('hi')
//         return res.status(401).json({
//           message: "Auth failed"
//         });

//       }
//       bcrypt.compare(req.body.password, user[0].password, (err, result) => {
//         if (err) {
//           return res.status(401).json({
//             message: "Auth failed"
//           });
//         }
//         if (result) {
//           const token = jwt.sign(
//             {
//               email: user[0].email,
//               userId: user[0]._id
//             },
//             'secret',
//             {
//                 expiresIn: "1h"
//             }
//           );
//           return res.status(200).json({
//             message: "Auth successful",
//             token: token
//           });
//         }
//         res.status(401).json({
//           message: "Auth failed"
//         });
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });
module.exports = router;
