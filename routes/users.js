var express = require('express');
var router = express.Router();

const accountSid = 'AC702ff942469e68b3c1a21b786097eb79';
const authToken = 'fd0dc8f02a3502ab7b6a5908f071bf85';

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);


var projectHelpers=require('../helpers/project-helpers')
var userHelpers=require('../helpers/user-helpers')




/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("user/index.hbs",{title:"User"})
});


router.get('/login', function(req, res, next) {
  res.render("user/login.hbs",{title:"Login"})
});

router.get('/signup', function(req, res, next) {
  res.render("user/signup.hbs",{title:"Join now"})
});

router.post('/signup', function(req, res, next) {
    
  let userType = req.body.userType;
  if(userType){
    
    var otp = Math.floor(Math.random()*100000+1);
    console.log(otp);
    req.body.userType="hire";
    req.body.otp = otp;
    sendOTP(otp,req.body.phone)
    res.render("user/otp.hbs",{userData:req.body})
    //console.log(Math.floor(Math.random()*100000+1));
  }
  else{
    var otp = Math.floor(Math.random()*100000+1);
    console.log(otp);
    req.body.userType="work";
    req.body.otp = otp;
    sendOTP(otp,req.body.phone)
    res.render("user/otp.hbs",{userData:req.body})
  }

});


router.get('/otp', function(req, res, next) {
  res.render("user/signup.hbs",{title:"Varify Phone"})
});

// From OTP Page 

router.post('/signup-skills', function(req, res, next) {

  projectHelpers.getSkills().then((skills)=>{
      res.render("user/worker-sign.hbs",{userData:req.body,skills})
  })
  console.log(req.body);
  

});

// No need

router.get('/signup-skills', function(req, res, next) {
  
});

// ADDING WORK USER
router.post('/add-worker', function(req, res, next) {

  delete req.body.userType;
  userHelpers.addUser(req.body).then((response)=>{

    if(response){
        res.end("Done")
    }
  })
  .catch((err)=>{
      var key = Object.keys(err.keyPattern)
      if(key[0] === 'email'){
        console.log("Email already exists");
      }
      else if(key[0] === 'phone'){
        console.log("Mobile already exists");
      }
  })
});


function sendOTP(otp,mobile){
  var num = '+91'+mobile;
  console.log(num);
  client.messages
  .create({
    body: '\nYour OTP for JobX website is '+otp,
    to: num, 
    from: '+18608314293', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
}

module.exports = router;
