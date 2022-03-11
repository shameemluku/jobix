const express = require('express');
const { redirect } = require('express/lib/response');
const router = express.Router();
const projectHelpers = require('../helpers/project-helpers')
const userHelpers = require('../helpers/user-helpers')
const notiHelpers = require('../helpers/notification-helpers')
const userController = require('../controllers/user-controller')
const paymentController = require('../controllers/payment-controller')
const path = require('path');
const async = require('hbs/lib/async');

const { varifyLogin, isActive } = require('../middlewares/authMiddlware')
const { checkNoti, checkRequest } = require('../middlewares/notificationMiddleware')





router.get('/', function(req, res, next) {

    res.render("user/index.hbs", { layout: 'home-layout', title: "User", islogin: req.session.loggedIn })

});

router.route('/signup')
    .post(userController.signup_POST)
    .get(function(req, res, next) {

        if (req.session.loggedIn) {
            res.redirect('/work-dashboard')
        } else {
            res.render("user/signup.hbs", { title: "Join now", sign: true, error: req.session.error })
            req.session.error = false;
        }

    })

router.route('/login')
    .post(userController.login_POST)
    .get(function(req, res, next) {

        if (req.session.loggedIn) {
            res.redirect('/work-dashboard')
        } else {
            res.render("user/login.hbs", { title: "Login", sign: true, error: req.session.error })
            req.session.error = false
        }

    })


router.post('/login-phone', userController.loginPhone)

router.get('/otp', varifyLogin, function(req, res, next) {
    res.render("user/signup.hbs", { title: "Varify Phone", sign: true })
});

// From OTP Page 
router.post('/varify-otp', userController.varify_POST);

router.post('/varify-otp-login', userController.varifyOTPLogin);

// ADDING WORK USER
router.post('/add-worker', userController.add_worker_post);


////////////// WORKER DASHBOARD ////////////////

router.get('/work-dashboard', varifyLogin, isActive, checkNoti, checkRequest, userController.workDashboard);

// Load bidded project [AJAX]
router.post('/home-bidded', varifyLogin, isActive, userController.loadBiddedProjects);

/////////////// HIRE DASHBOARD /////////////////
router.get('/hire-dashboard', varifyLogin, isActive, checkNoti, userController.hire_dashboard);

// Loading added project - Activity Tab 2 [AJAX] 
router.post('/host-projectlist', varifyLogin, isActive, userController.loadAddedProject);

// BROWSE PROJECT
router.get('/browse-project', varifyLogin, isActive, checkNoti, userController.browse_project);

// FILTER AND SKILLS PROJECT
router.get('/filter-projects', userController.filter_skills);

// SAVE AND UNSAVE PROJECT
router.post('/save-project', varifyLogin, isActive, userController.save_project);

router.post('/unsave-project', varifyLogin, isActive, userController.unsave_project);

router.route('/add-project')
    .get(varifyLogin, isActive, checkNoti, userController.add_project)
    .post(userController.add_project_post)


// PROJECT DETAILS PAGE
router.get('/project-details', varifyLogin, isActive, checkNoti, userController.project_Details);

router.get('/download', varifyLogin, isActive, function(req, res, next) {
    let id = req.query.file
    res.download(path.join(__dirname, '../public/files/project-files/' + id + ".zip"));
});

// SEND PROPOSAL
router.post('/send-proposal', varifyLogin, isActive, userController.send_proposal);

router.get('/signout', varifyLogin, isActive, function(req, res, next) {
    req.session.loggedIn = false
    req.session.user = null;
    res.redirect('/')
});

// Render page for host to submit skills
router.get('/select-skills', varifyLogin, isActive, checkNoti, userController.select_skills);

// Host  submit skills to be a worker
router.post('/register-hostSkills', varifyLogin, isActive, userController.registerHost_skills_post);

////// BID DETAILS ////////
router.get('/bid-details', varifyLogin, isActive, checkNoti, userController.bid_details);

// Bids page user additional data
router.post('/bid-userdata', varifyLogin, isActive, userController.bid_userData)

// HIRE A USER
router.post('/hire', varifyLogin, isActive, userController.hire_user)

// PROJECT DETAILS WOKER SIDE (ACTIVE)
router.get('/projects', varifyLogin, isActive, checkNoti, userController.worker_project)

// PROJECT DETAILS WOKER SIDE (ACTIVE)
router.get('/host-projects', varifyLogin, isActive, checkNoti, userController.host_project)

router.post('/send-message', varifyLogin, isActive, userController.sendMessage)

router.post('/extend-date', varifyLogin, isActive, userController.extendProjectDate)

router.post('/upload-file', varifyLogin, isActive, userController.uploadProjectFiles)

//File for ajax request
router.post('/get-file', varifyLogin, isActive, userController.getFile)

router.get('/download-projectfiles', varifyLogin, isActive, (req, res, next) => {

    let id = req.query.id;
    let file = req.query.file;

    res.download(path.join(__dirname, '../public/files/project-files/work/' + id + "/" + file))

})

router.get('/profile', varifyLogin, isActive, checkNoti, userController.userProfile)

router.post('/changeDp', varifyLogin, isActive, userController.changeDp)

router.get('/removedp', varifyLogin, isActive, userController.removeDp)

router.post('/update-details', varifyLogin, isActive, userController.updateDetails)

router.post('/updateskills', varifyLogin, isActive, userController.updateSkills)

router.post('/add-payment', varifyLogin, isActive, userController.updatePayment)

router.post('/remove-payment', varifyLogin, isActive, userController.removePayment)

// Remove self from bidding list
router.post('/remove-bid', varifyLogin, isActive, userController.removeBid)

router.get('/complete-project', varifyLogin, isActive, userController.completeProject)

router.post('/checkout', varifyLogin, isActive, paymentController.checkout)

router.post('/varify-payment', varifyLogin, isActive, paymentController.verifyPayment)


router.post('/removeNoti', function(req, res, next) {

    console.log(req.query.id);
    notiHelpers.setNotiRead(req.body.id).then((data) => {
        if (data) {
            console.log(data);
            res.send({ success: true });
        }
    })

})

router.get('/success-paypal', varifyLogin, isActive, paymentController.paypalSuccess)

router.get('/cancel', varifyLogin, isActive, paymentController.cancel)

router.get('/wallet', varifyLogin, isActive, userController.wallet)

router.post('/payout-request', varifyLogin, isActive, userController.requestPayout)

router.get('/freelancers', varifyLogin, isActive, userController.freelancer)

router.post('/freelancers', varifyLogin, isActive, userController.freelancerPost)

router.post('/send-request', varifyLogin, isActive, userController.freelanceRequest)

router.get('/requests', varifyLogin, isActive, checkNoti, userController.requests)

router.get('/accept-request', varifyLogin, isActive, userController.acceptRequests)

router.get('/search', varifyLogin, isActive, userController.search)

router.post('/change-password', varifyLogin, isActive, userController.changePass)

// router.post('/pay', paymentController.pay)


module.exports = router;