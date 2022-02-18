var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();





var projectHelpers=require('../helpers/project-helpers')
var userHelpers=require('../helpers/user-helpers')
var notiHelpers=require('../helpers/notification-helpers')

var usermiddlewares=require('../middlewares/user-middlewares')

var path = require('path');
const async = require('hbs/lib/async');


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

router.post('/signup', usermiddlewares.signup_POST);

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

router.post('/login', usermiddlewares.login_POST);


router.get('/otp', varifyLogin, function(req, res, next) {
  res.render("user/signup.hbs",{title:"Varify Phone" , sign:true})
});

// From OTP Page 

router.post('/varify-otp', usermiddlewares.varify_POST);


// ADDING WORK USER
router.post('/add-worker', usermiddlewares.add_worker_post);


////////////// WORKER DASHBOARD ////////////////

router.get('/work-dashboard', varifyLogin, usermiddlewares.workDashboard);


/////////////// HIRE DASHBOARD /////////////////

router.get('/hire-dashboard', varifyLogin, usermiddlewares.hire_dashboard);



// BROWSE PROJECT

router.get('/browse-project', varifyLogin, usermiddlewares.browse_project);


// FILTER AND SKILLS PROJECT

router.get('/filter-projects',  usermiddlewares.filter_skills);

// SAVE AND UNSAVE PROJECT

router.post('/save-project', varifyLogin, usermiddlewares.save_project);

router.post('/unsave-project', varifyLogin,  usermiddlewares.unsave_project);

// //////////////////////////////////

// ADD PROJECT PAGE

router.get('/add-project', varifyLogin, usermiddlewares.add_project);

// ADD PROJECT FUNCTION POST

router.post('/add-project', usermiddlewares.add_project_post);


// PROJECT DETAILS PAGE

router.get('/project-details', varifyLogin,  usermiddlewares.project_Details);


router.get('/download', varifyLogin,  function(req, res, next) {
    let id = req.query.file
    res.download(path.join(__dirname,'../public/files/project-files/'+id+".zip"));
});


// SEND PROPOSAL


router.post('/send-proposal', varifyLogin,  usermiddlewares.send_proposal);


router.get('/signout', varifyLogin,  function(req, res, next) {
    req.session.loggedIn = false
    req.session.user=null;
    res.redirect('/')
});

// Render page for host to submit skills

router.get('/select-skills', varifyLogin, usermiddlewares.select_skills);


// Host  submit skills to be a worker
router.post('/register-hostSkills', varifyLogin, usermiddlewares.registerHost_skills_post);


////// BID DETAILS ////////

router.get('/bid-details', varifyLogin, usermiddlewares.bid_details);

// To remove notification 

router.post('/removeNoti', function(req,res, next){

  console.log(req.query.id);
  notiHelpers.setNotiRead(req.body.id).then((data)=>{
    if(data){
      console.log(data);
      res.send({success:true});
    }
  })

})






// ////////////////////////////////





module.exports = router;
