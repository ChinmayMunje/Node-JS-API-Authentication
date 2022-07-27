require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");

// adding imports for cookies
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Out little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.DB_URL);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//below line is for adding cookies
userSchema.plugin(passportLocalMongoose);

//on below line we are encrypting our schema
// on below line secret key is present in .env
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);

// on below line we are using passport
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
})

app.post("/register",function(req,res){
  // const user = new User({
  //   email:req.body.username,
  //   password:md5(req.body.password)
  // });
  // user.save(function(err){
  //   if(!err){
  //     res.render("secrets");
  //   }else{
  //     res.send(err);
  //   }
  // });

//using cookies.
  User.register({username: req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      })
    }
  })

})

app.post("/login",function(req,res){
  // const email=req.body.username;
  // const password=req.body.password;
  // User.findOne({email:email},function(err,foundUser){
  //   if(!err){
  //     if(foundUser.password === md5(password)){
  //       res.render("secrets");
  //     }else{
  //       res.send("User not found");
  //     }
  //   }else{
  //     res.send(err);
  //   }
  // });

const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user,function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
    });
  }
});



});

app.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});






app.listen(3000,function(){
  console.log("Server started");
})
