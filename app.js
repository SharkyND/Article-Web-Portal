const express = require('express');
const server=express(); 
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')



// coonect to our db
//mongoose.connect('mongoose://localhost/nodekb');
//mongoose.connect('mongodb://localhost:27017/nodekb',{useNewUrlParser: true, useUnifiedTopology: true})  //Changed fron the series
//Its in the config folder now
mongoose.connect(config.database)
//console.log(config.database + config.datastring)
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

//We dont have to write the entire thing for the express validator. The middleware is inside the install
app.use(expressValidator());

//Bring in the passport config
require('./config/passport')(passport)

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
  res.locals.user = req.user || null
  next()
})


// Home route
 app.get('/', (req, res) =>{
     Article.find({},(err,articles) =>{
        if(err){
            console.log(err)
        } else {
            //console.log(articles)
            res.render('index',{
                title:'Article LIST',
                articles:articles
        
             })

        };
    });
});

//Route file
let articles =require('./routes/articles')
app.use('/articles',articles)

//Route file users
let users =require('./routes/users')
app.use('/users',users)


//start server
 app.listen(3000,()=> console.log("Server started at port 3000....."))