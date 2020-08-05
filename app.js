const express = require('express');
const server=express(); 
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
 


// coonect to our db
//mongoose.connect('mongoose://localhost/nodekb');
mongoose.connect('mongodb://localhost:27017/nodekb', {useNewUrlParser: true, useUnifiedTopology: true});  //Changed fron the series
let db =mongoose.connection;

//check connecitons

db.once('open',() => {
    console.log('Connected to mongodb')
})


//check for db errors

db.on('error',(err) => {
  console.log(err)  
})

// init app
const app = express();
app.use(expressValidator());

//Bring in model 
let Article = require('./models/article');


// Load views engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');



//parser middle ware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder   => which is a static folder // to upload static files like CSS and pictures
app.use(express.static(path.join(__dirname,"public")));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))

//Express Messages Middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Home route
 app.get('/', (req, res) =>{
     Article.find({},(err,articles) =>{
        if(err){
            console.log(err)
        } else {
            //console.log(articles)
            res.render('index',{
                title:'Add Article',
                articles:articles
        
             })

        };
    });
});

//get single article

app.get('/article/:x', (req,res) =>{
    Article.findById(req.params.x, (err,article)=>{
        res.render('article',{
           article:article
        });

    });
});
    

app.get('/articles/add',(req,res) => {
     res.render('add_article',{
         title:'Add Article'
     })
    })

app.post('/articles/add',(req,res) => {
   req.checkBody('title','Title is required').notEmpty()
   req.checkBody('author','Author is required').notEmpty()
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
   console.log(req.body.title)
   article.author = req.body.author;
   console.log(req.body.author)
   article.body = req.body.body;
   console.log(req.body.body)

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

app.get('/article/edit/:x', (req,res) =>{
    Article.findById(req.params.x, (err,article)=>{
        res.render('edit_article',{
            title:'Edit',
           article:article
        });

    });
});

//update submit
app.post('/articles/edit/:x',(req,res) => {
    let article = {};
    article.title =req.body.title;
    console.log(req.body.title)
    article.author = req.body.author;
    console.log(req.body.author)
    article.body = req.body.body;
    console.log(req.body.body)

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

app.delete('/article/:x',(req,res)=>{
    let query={_id:req.params.x}
    Article.deleteOne(query,function(err){
        if(err){
            console.log(err)
        }
        res.send('Sucess') // This is to the ajex req, since we have to send a reponse to the request
    })
}
)




//start server
 app.listen(3000,()=> console.log("Server started at port 3000....."))