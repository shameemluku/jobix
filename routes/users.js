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

router.post('/varify-otp', function(req, res, next) {

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

  var splitname = req.session.user.name.split(" ");
  userHelpers.loadWorkProfile(req.session.user._id).then((workProfile)=>{
    
    projectHelpers.getAddedProjects(req.session.user._id).then((hostedProjects)=>{
        
        if(hostedProjects.length === 0){
          empty=true
        }
        else{
          empty=false;
        }
        req.session.user.workProfile = workProfile
        console.log(hostedProjects);
        res.render("user/dashboard.hbs",{title:"Home" , user:req.session.user,hostedProjects,empty,name:splitname[0]});
    })
    

  }) 
});

/////////////// HIRE DASHBOARD /////////////////

router.get('/hire-dashboard', varifyLogin, function(req, res, next) {

  var splitname = req.session.user.name.split(" ");
  userHelpers.loadWorkProfile(req.session.user._id).then((workProfile)=>{
    
    projectHelpers.getAddedProjects(req.session.user._id).then((hostedProjects)=>{
        
        if(hostedProjects.length === 0){
          empty=true
        }
        else{
          empty=false;
        }
        req.session.user.workProfile = workProfile
        console.log(hostedProjects);
        res.render("user/hire-dashboard",{title:"Home" , user:req.session.user,hostedProjects,empty,name:splitname[0]});
    })
    

  }) 
});



// BROWSE PROJECT

router.get('/browse-project', varifyLogin, function(req, res, next) {

  

    userHelpers.loadSkills(req.session.user._id).then((skills)=>{

      
      var skillArray = [];
      skills.forEach(element => {
          skillArray.push(element.code)
      });

        projectHelpers.getUserBasedPro(skillArray,req.session.user._id).then((projects)=>{
          
          let user=req.session.user,
          saveCount=user.workProfile[0].saveCount;

          if(projects.length!=0)
          {
            skillsArray=projects[0].skillsName;
            res.render("user/browse-project.hbs",{title:"User",skills,skillsArray,projects,user,saveCount})
            console.log(projects);
          }
          else{
            res.render("user/browse-project.hbs",{title:"User",skills,projects,user,saveCount})
            console.log(projects);
          }
          
        })      
      
    })

  
    
});


// FILTER AND SKILLS PROJECT

router.get('/filter-projects',  function(req, res, next) {

  var skillsQuery = req.query.skills , skillArray = [];

  if(Array.isArray(skillsQuery)){
    skillArray = skillsQuery
  }else{
    skillArray.push(skillsQuery)
  }

  console.log(skillArray);

  var amount = parseInt(req.query.amount);


  projectHelpers.getFilteredPro(skillArray,amount,req.session.user._id).then((projects)=>{

      let user=req.session.user,
      saveCount=user.workProfile[0].saveCount;

      if(projects.length!=0)
      {
        skillsArray=projects[0].skillsName;
        res.render("user/cards.hbs",{title:"User",skillsArray,projects,user,saveCount})
      }
      else{
        res.render("user/cards.hbs",{title:"User",projects,user:req.session.user})
      }
     
  })  

 });

// SAVE AND UNSAVE PROJECT

router.post('/save-project', varifyLogin,  function(req, res, next) {

  
  userHelpers.saveProject(req.session.user._id,req.body.pId,).then((response)=>{
      if(response){
        
        req.session.user.workProfile[0].saveCount = req.session.user.workProfile[0].saveCount + 1;
        res.send({success:true});
      }
  })

});

router.post('/unsave-project', varifyLogin,  function(req, res, next) {

  
  userHelpers.unsaveProject(req.session.user._id,req.body.pId,).then((response)=>{
      if(response){
        req.session.user.workProfile[0].saveCount = req.session.user.workProfile[0].saveCount - 1;
        res.send({success:true});
      }
  })

});

// //////////////////////////////////

// ADD PROJECT PAGE

router.get('/add-project', varifyLogin,  function(req, res, next) {
  
  projectHelpers.getSkills().then((skills)=>{
    res.render("user/addproject.hbs",{title:"Add project",skills,user:req.session.user})
  })

});

// ADD PROJECT FUNCTION POST

router.post('/add-project', function(req, res, next) {



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
  let userId = req.session.user._id;
  
  projectHelpers.getProjectDetails(id,userId).then((proDetails)=>{
    
    hostDetails = proDetails.host[0];

    res.render("user/project-details.hbs",{title:"Project Details",proDetails,hostDetails , skills:proDetails.skillsArray,user:req.session.user})
  
  }).catch((err)=>{
      res.status(500).render('error')
  })

});


router.get('/download', varifyLogin,  function(req, res, next) {
    let id = req.query.file
    res.download(path.join(__dirname,'../public/files/project-files/'+id+".zip"));
});


router.post('/send-proposal', varifyLogin,  function(req, res, next) {
    
    projectHelpers.sendProposal(req.body.pId,req.body.id,req.body.name,req.body.message).then((data)=>{
      if(data){
        console.log(data.acknowledged);
        res.send("done");
      }else{
        res.status(500).send('error')
      }
    })
    

});



// END PRODUCT PAGE

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
