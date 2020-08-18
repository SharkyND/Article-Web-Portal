const express = require('express');
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
//Bringing in Article
let User = require('../models/user');

router.get('/register',(req,res)=>{
    res.render('register')

})

router.post('/register',(req,res)=>{
    const name = req.body.name
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const password2 = req.body.password2

    console.log(name);



    req.checkBody('name','Name is required').notEmpty()
    req.checkBody('email','Email is required').isEmail()
    req.checkBody('password','Password is need to be minimum 7').isLength({min:7})
    req.checkBody('password2','Password is required').equals(password)
 
    let err = req.validationErrors()

    if (err){
        res.render('register',{
            err:err
        })
    } else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        })

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if (err){
                    console.log(err)
                } 
                newUser.password = hash
                newUser.save((err)=>{
                    if(err){
                        console.log(err)
                        return
                    }else{
                        req.flash('success','You are now registered')
                        res.redirect('/users/login')
                    }
                })
            })
            
        })
    }
 
})

//login form
router.get('/login',(req,res)=>{
    res.render('login')
})

//Login Proecess
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successReturnToOrRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next)
})

//logout
router.get('/logout',(req,res,next)=>{
    req.logOut();
    req.flash('success','You are logged out')
    res.redirect('/users/login')    

})
module.exports = router;