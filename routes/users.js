var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();



require('dotenv').config();
const fast2sms = require('fast-two-sms')

// const twilio = require('twilio');
// const client = new twilio(accountSid, authToken);



var projectHelpers=require('../helpers/project-helpers')
var userHelpers=require('../helpers/user-helpers')

var path = require('path');


// Authentication

const varifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/////////////////


/* GET users listing. */
router.get('/', varifyLogin, function(req, res, next) {
  res.render("user/index.hbs",{title:"User"})
});



router.get('/signup', function(req, res, next) {

  if(req.session.loggedIn)
  {
    res.redirect('/work-dashboard')
  }else{
    res.render("user/signup.hbs",{title:"Join now",sign:true , error: req.session.error})
    req.session.error = false;
  }
  
});

router.post('/signup', function(req, res, next) {

  userHelpers.checkUser(req.body).then((result)=>{
    if(!result.status){

      console.log(req.body);
      let userType = req.body.userType;
      if(userType){
        
        var otp = Math.floor(Math.random()*100000+1);
        console.log(otp);
        req.body.userType="hire";
        req.body.otp = otp;
        //sendOTP(otp,req.body.phone)
        sendOTPfast(otp,req.body.phone)
        res.render("user/otp.hbs",{userData:req.body, sign:true})
        //console.log(Math.floor(Math.random()*100000+1));
      }
      else{
        var otp = Math.floor(Math.random()*100000+1);
        console.log(otp);
        req.body.userType="work";
        req.body.otp = otp;
        //sendOTP(otp,req.body.phone)
        sendOTPfast(otp,req.body.phone)
        res.render("user/otp.hbs",{userData:req.body , sign:true})
      }

    }else{
      req.session.error = result.error;
      result.error = false;
      res.redirect('/signup')
    }
  })

});

// //////// LOGIN  //////////////

router.get('/login', function(req, res, next) {

  if(req.session.loggedIn)
  {
    res.redirect('/work-dashboard')
  }
  else{
    res.render("user/login.hbs",{title:"Login",sign:true , error: req.session.error})
    req.session.error = false
  }
  
});

// Login Post

router.post('/login', function(req, res, next) {


  userHelpers.userLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true
      req.session.user=response.user
      res.redirect('/work-dashboard')
    }else{
      req.session.error = response.error;
      response.error = false;
      res.redirect('/login')
      
    }
})
});


router.get('/otp', varifyLogin, function(req, res, next) {
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

      /////////////////// ADD WORKER //////////////////////////

      if(response){
        req.session.loggedIn = true
        req.session.user=req.body
        res.redirect('/hire-dashboard')
      }
    })
  }

  

});

// No need

router.get('/signup-skills', varifyLogin,  function(req, res, next) {
  
});

// ADDING WORK USER
router.post('/add-worker', function(req, res, next) {

  delete req.body.userType;
  userHelpers.addUser(req.body).then((response)=>{

    if(response){
      req.session.loggedIn = true
      req.session.user=req.body
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


////////////// WORKER DASHBOARD ////////////////

router.get('/work-dashboard', varifyLogin, function(req, res, next) {

  
  userHelpers.loadWorkProfile(req.session.user._id).then((workProfile)=>{

    req.session.user.workProfile = workProfile
    res.render("user/dashboard.hbs",{title:"Home" , user:req.session.user})

  }) 
});

/////////////// HIRE DASHBOARD /////////////////

router.get('/hire-dashboard', varifyLogin, function(req, res, next) {
  res.render("user/index.hbs",{title:"Home"})
});



// BROWSE PROJECT

router.get('/browse-project', varifyLogin, function(req, res, next) {
  userHelpers.loadSkills(req.session.user._id).then((skills)=>{

    projectHelpers.getUserBasedPro(skills,req.session.user._id).then((projects)=>{

      if(projects.length!=0)
      {
        skillsArray=projects[0].skillsName;
        console.log(skillsArray);
        res.render("user/browse-project.hbs",{title:"User",skills,skillsArray,projects,user:req.session.user})
      }
      else{
        res.render("user/browse-project.hbs",{title:"User",skills,projects,user:req.session.user})
      }
      
    })
    

  })
    
});



// ADD PROJECT PAGE

router.get('/add-project', varifyLogin,  function(req, res, next) {
  
  projectHelpers.getSkills().then((skills)=>{
    res.render("user/addproject.hbs",{title:"Add project",skills,user:req.session.user})
  })

});

// ADD PROJECT FUNCTION POST

router.post('/add-project', function(req, res, next) {

  console.log(req.body);

  let filename = req.files.file.name;
  let ext = filename.split('.').pop()
  req.body.ext = ext

  console.log(ext);

  hostId = req.session.user._id // change with req.session.user._id
  req.body.host = hostId

  projectHelpers.addProject(req.body).then((id)=>{

    let file = req.files.file
    file.mv(path.join(__dirname,'../public/files/project-files/')+id+'.'+ext,(err,done)=>{
      if(!err){
        res.send({ success: true })
      }
      else{
        res.status(400).send({ success: false , err });
      }
    })

  })
});


// PROJECT DETAILS PAGE

router.get('/project-details', varifyLogin,  function(req, res, next) {
  
  let id = req.query.id;
  let hostId = req.query.hId;
  
  projectHelpers.getProjectDetails(id,hostId).then((proDetails)=>{
    
    hostDetails = proDetails.host[0];

    res.render("user/project-details.hbs",{title:"Project Details",proDetails,hostDetails , skills:proDetails.skillsArray,user:req.session.user})
  })

});


router.get('/download', varifyLogin,  function(req, res, next) {
    let id = req.query.file
    res.download(path.join(__dirname,'../public/files/project-files/'+id+".zip"));
});

router.get('/signout', varifyLogin,  function(req, res, next) {
    req.session.loggedIn = false
    req.session.user=null;
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

async function sendOTPfast(otp,mobile){
  var options = {authorization : process.env.API_KEY , message : '\nYour OTP for JobX website is '+otp ,  numbers : [mobile]} 
  const response = await fast2sms.sendMessage(options)
}

module.exports = router;
