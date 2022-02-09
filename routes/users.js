var express = require('express');
const { redirect } = require('express/lib/response');
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
  res.render("user/login.hbs",{title:"Login",sign:true})
});

router.get('/signup', function(req, res, next) {
  res.render("user/signup.hbs",{title:"Join now",sign:true})
});

router.post('/signup', function(req, res, next) {
  console.log(req.body);
  let userType = req.body.userType;
  if(userType){
    
    var otp = Math.floor(Math.random()*100000+1);
    console.log(otp);
    req.body.userType="hire";
    req.body.otp = otp;
    //sendOTP(otp,req.body.phone)
    res.render("user/otp.hbs",{userData:req.body, sign:true})
    //console.log(Math.floor(Math.random()*100000+1));
  }
  else{
    var otp = Math.floor(Math.random()*100000+1);
    console.log(otp);
    req.body.userType="work";
    req.body.otp = otp;
    //sendOTP(otp,req.body.phone)
    res.render("user/otp.hbs",{userData:req.body , sign:true})
  }

});


router.get('/otp', function(req, res, next) {
  res.render("user/signup.hbs",{title:"Varify Phone" , sign:true})
});

// From OTP Page 

router.post('/signup-skills', function(req, res, next) {

  console.log(req.body);
  if(req.body.userType === 'work'){
      projectHelpers.getSkills().then((skills)=>{
        res.render("user/worker-sign.hbs",{userData:req.body,skills , sign:true})
      })
      console.log(req.body);
  }
  else if(req.body.userType === 'hire'){

    delete req.body.userType;
    delete req.body.otp;
    delete req.body.genOtp;
    
    userHelpers.addWorkUser(req.body).then((response)=>{

      if(response){
        res.redirect('/hire-dashboard')
      }
    })
  }

  

});

// No need

router.get('/signup-skills', function(req, res, next) {
  
});

// ADDING WORK USER
router.post('/add-worker', function(req, res, next) {

  delete req.body.userType;
  userHelpers.addUser(req.body).then((response)=>{

    if(response){
        res.redirect('/work-dashboard')
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


// WORKER DASHBOARD

router.get('/work-dashboard', function(req, res, next) {
  res.render("user/index.hbs",{title:"Home"})
});

// HIRE DASHBOARD

router.get('/hire-dashboard', function(req, res, next) {
  res.render("user/index.hbs",{title:"Home"})
});



// BROWSE PROJECT

router.get('/browse-project', function(req, res, next) {
  res.render("user/browse-project.hbs",{title:"User"})
});



// ADD PROJECT PAGE

router.get('/add-project', function(req, res, next) {
  res.render("user/addproject.hbs",{title:"User"})
});

// ADD PROJECT FUNCTION

router.post('/add-project', function(req, res, next) {


    // let ext = filename.split('.').pop()
  console.log(req.files);
  
  console.log("Request body = ");
  console.log(req.body);
  res.redirect('/')
});




// ////////////////////////////////


function sendOTP(otp,mobile){
  var num = '+91'+mobile;
  client.messages
  .create({
    body: '\nYour OTP for JobX website is '+otp,
    to: num, 
    from: '+18608314293', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
}

module.exports = router;
