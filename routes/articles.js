const express = require('express');
const router = express.Router()

//Bringing in Article
let Article = require('../models/article');
//User Model
let User = require('../models/user');    

router.get('/add',(req,res) => {
     res.render('add_article',{
         title:'Add Article'
     })
    })

router.post('/add',ensureAuthentication,(req,res) => {
   req.checkBody('title','Title is required').notEmpty()
   //req.checkBody('author','Author is required').notEmpty()
   req.checkBody('body','Body is required').notEmpty()

   let errors = req.validationErrors()

   if (errors){
    req.flash('danger','Not Valid Entry')   
    res.render('add_article',{
           title:'Add Article',
           errors:errors,
           
       })
     console.log("error messages send")  
     
   }else{

   let article = new Article();
   article.title =req.body.title;
   console.log(req.user)
   article.author = req.user._id;
   article.body = req.body.body;


   article.save((err)=>{
       if(err){
        console.log(err);
        return;
       }else {
           req.flash('success','Article Added')
           res.redirect('/');
       }
   })}

})

//load edit foam

router.get('/edit/:x',ensureAuthentication, (req,res) =>{
    Article.findById(req.params.x, (err,article)=>{
        if(article.author!= req.user._id){
            req.flash('danger','You are NOT Authorised')
            res.redirect('/users/login')
        } else{
            res.render('edit_article',{
                title:'Edit',
               article:article
            });
        }
        
    });
});

//update submit
router.post('/edit/:x',(req,res) => {
    let article = {};
    article.title =req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;


    let query={_id:req.params.x}
 
    Article.update(query,article, (err)=>{
        if(err){
         console.log(err);
         return;
        }else {
            req.flash('success','Article Updates')
            res.redirect('/');
        }
    });
 
 })

 router.delete('/:x',(req,res)=>{
    if(!req.user._id){
        res.status(500).send()}

    Article.findById(req.params.x,(err,article)=>{
        if(article.author != req.user._id){
            res.status(500).send()
        }else{
            let query={_id:req.params.x}
            Article.deleteOne(query,function(err){
            if(err){
                console.log(err)
            }
            res.send('Success') // This is to the ajex req, since we have to send a reponse to the request
            })
        }
    })
 })
//get single article
//Moved it down here since we want the others to be called first rather than the place holder to be called first


router.get('/:x', (req,res) =>{
    Article.findById(req.params.x, (err,article)=>{
        User.findById(article.author,(err,user)=>{
            res.render('article',{
                article:article,
                author:user.name
             });

        })

    });
});

//Access Control

function ensureAuthentication (req,res,next){
    if(req.isAuthenticated()){
        console.log("YES Autneticated")
        return next()
    }else{
        req.flash('danger','Please Login')
        res.redirect('/users/login')
    }
}
module.exports = router;