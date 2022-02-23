var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();


var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')

var userController = require('../controllers/user-controller')

var path = require('path');
const async = require('hbs/lib/async');


// Authentication

const varifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}



/////////////////


/* GET users listing. */
router.get('/', varifyLogin, function(req, res, next) {
    res.render("user/index.hbs", { title: "User" })
});



router.get('/signup', function(req, res, next) {

    if (req.session.loggedIn) {
        res.redirect('/work-dashboard')
    } else {
        res.render("user/signup.hbs", { title: "Join now", sign: true, error: req.session.error })
        req.session.error = false;
    }

});

router.post('/signup', userController.signup_POST);

// //////// LOGIN  //////////////

router.get('/login', function(req, res, next) {

    if (req.session.loggedIn) {
        res.redirect('/work-dashboard')
    } else {
        res.render("user/login.hbs", { title: "Login", sign: true, error: req.session.error })
        req.session.error = false
    }

});

// Login Post

router.post('/login', userController.login_POST);


router.get('/otp', varifyLogin, function(req, res, next) {
    res.render("user/signup.hbs", { title: "Varify Phone", sign: true })
});

// From OTP Page 

router.post('/varify-otp', userController.varify_POST);


// ADDING WORK USER
router.post('/add-worker', userController.add_worker_post);


////////////// WORKER DASHBOARD ////////////////

router.get('/work-dashboard', varifyLogin, userController.workDashboard);


// Load bidded project [AJAX]

router.post('/home-bidded', varifyLogin, userController.loadBiddedProjects);


/////////////// HIRE DASHBOARD /////////////////

router.get('/hire-dashboard', varifyLogin, userController.hire_dashboard);


// Loading added project - Activity Tab 2 [AJAX] 
router.post('/host-projectlist', varifyLogin, userController.loadAddedProject);



// BROWSE PROJECT

router.get('/browse-project', varifyLogin, userController.browse_project);


// FILTER AND SKILLS PROJECT

router.get('/filter-projects', userController.filter_skills);

// SAVE AND UNSAVE PROJECT

router.post('/save-project', varifyLogin, userController.save_project);

router.post('/unsave-project', varifyLogin, userController.unsave_project);

// //////////////////////////////////

// ADD PROJECT PAGE

router.get('/add-project', varifyLogin, userController.add_project);

// ADD PROJECT FUNCTION POST

router.post('/add-project', userController.add_project_post);


// PROJECT DETAILS PAGE

router.get('/project-details', varifyLogin, userController.project_Details);


router.get('/download', varifyLogin, function(req, res, next) {
    let id = req.query.file
    res.download(path.join(__dirname, '../public/files/project-files/' + id + ".zip"));
});


// SEND PROPOSAL


router.post('/send-proposal', varifyLogin, userController.send_proposal);


router.get('/signout', varifyLogin, function(req, res, next) {
    req.session.loggedIn = false
    req.session.user = null;
    res.redirect('/')
});

// Render page for host to submit skills

router.get('/select-skills', varifyLogin, userController.select_skills);


// Host  submit skills to be a worker
router.post('/register-hostSkills', varifyLogin, userController.registerHost_skills_post);


////// BID DETAILS ////////

router.get('/bid-details', varifyLogin, userController.bid_details);

// Bids page user additional data

router.post('/bid-userdata', varifyLogin, userController.bid_userData)


// HIRE A USER

router.post('/hire', varifyLogin, userController.hire_user)



// PROJECT DETAILS WOKER SIDE (ACTIVE)

router.get('/projects', varifyLogin, userController.worker_project)


// PROJECT DETAILS WOKER SIDE (ACTIVE)

router.get('/host-projects', varifyLogin, userController.host_project)


router.post('/send-message', varifyLogin, userController.sendMessage)


// Remove self from bidding list
router.post('/remove-bid', varifyLogin, userController.removeBid)




// To remove notification 

router.post('/removeNoti', function(req, res, next) {

    console.log(req.query.id);
    notiHelpers.setNotiRead(req.body.id).then((data) => {
        if (data) {
            console.log(data);
            res.send({ success: true });
        }
    })

})






// ////////////////////////////////





module.exports = router;