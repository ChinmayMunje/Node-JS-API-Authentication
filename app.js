require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect(process.env.DB_URL);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//on below line we are encrypting our schema
// on below line secret key is present in .env
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"]});


const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const user = new User({
    email:req.body.username,
    password:md5(req.body.password)
  });

  user.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      res.send(err);
    }
  });


})

app.post("/login",function(req,res){
  const email=req.body.username;
  const password=req.body.password;

  User.findOne({email:email},function(err,foundUser){
    if(!err){
      if(foundUser.password === md5(password)){
        res.render("secrets");
      }else{
        res.send("User not found");
      }
    }else{
      res.send(err);
    }
  })
});







app.listen(3000,function(){
  console.log("Server started");
})
