var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')

var path = require('path');
const async = require('hbs/lib/async');

require('dotenv').config();
const fast2sms = require('fast-two-sms');
const { stat } = require('fs');

var objectId = require('mongodb').ObjectId


// ///////////// LOGIN ///////////////////////////////////////////

exports.login_POST = function(req, res, next) {


    userHelpers.userLogin(req.body).then((response) => {
        if (response.status) {

            req.session.loggedIn = true
            req.session.user = response.user

            userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {

                if (workProfile.length == 0) {
                    res.redirect('/hire-dashboard')
                } else {
                    res.redirect('/work-dashboard')
                }

            })

        } else {
            req.session.error = response.error;
            response.error = false;
            res.redirect('/login')

        }
    })
}

exports.signup_POST = function(req, res, next) {

    userHelpers.checkUser(req.body).then((result) => {
        if (!result.status) {

            console.log(req.body);
            let userType = req.body.userType;
            if (userType) {

                var otp = Math.floor(Math.random() * 100000 + 1);
                console.log(otp);
                req.body.userType = "hire";
                req.body.otp = otp;
                //sendOTP(otp,req.body.phone)
                sendOTPfast(otp, req.body.phone)
                res.render("user/otp.hbs", { userData: req.body, sign: true })
                    //console.log(Math.floor(Math.random()*100000+1));
            } else {
                var otp = Math.floor(Math.random() * 100000 + 1);
                console.log(otp);
                req.body.userType = "work";
                req.body.otp = otp;
                //sendOTP(otp,req.body.phone)
                sendOTPfast(otp, req.body.phone)
                res.render("user/otp.hbs", { userData: req.body, sign: true })
            }

        } else {
            req.session.error = result.error;
            result.error = false;
            res.redirect('/signup')
        }
    })
}

// Varify POST

exports.varify_POST = function(req, res, next) {

    console.log(req.body);
    if (req.body.userType === 'work') {
        projectHelpers.getSkills().then((skills) => {
            res.render("user/worker-sign.hbs", { userData: req.body, skills, sign: true })
        })
        console.log(req.body);
    } else if (req.body.userType === 'hire') {

        delete req.body.userType;
        delete req.body.otp;
        delete req.body.genOtp;

        userHelpers.addHireUser(req.body).then((response) => {

            /////////////////// ADD HIRE //////////////////////////

            if (response) {
                req.session.loggedIn = true
                req.session.user = req.body
                res.redirect('/hire-dashboard')
            }
        })
    }



}

///////////////// WORKER DASHBOARD ////////////////////////////////

exports.workDashboard = function(req, res, next) {

    // Notification
    let notification = [],
        empty = {},
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification


    var splitname = req.session.user.name.split(" ");
    userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {

        if (workProfile.length == 0) {
            res.redirect('/hire-dashboard')
        } else {
            req.session.user.workProfile = workProfile
            userHelpers.loadActiveProjects(req.session.user._id).then((projects) => {

                let completedPro = [],
                    activePro = [];
                if (projects.length != 0) {

                    projects.forEach(obj => {
                        if (obj.status == "ACTIVE") {

                            day = checkDays(obj.dueDate)
                            obj.days = day.days;
                            obj.color = day.color;

                            activePro.push(obj)

                        } else {
                            completedPro.push(obj)
                        }
                    })
                }

                if (activePro.length == 0) { empty.active = true }
                if (completedPro.length == 0) { empty.complete = true }

                res.render("user/dashboard", {
                    title: "Home",
                    user: req.session.user,
                    name: splitname[0],
                    activePro,
                    completedPro,
                    empty,
                    notification,
                    notiCount
                });

            })

        }

    })

}

///////////////// HIRE DASHBOARD ////////////////////////////////

exports.hire_dashboard = function(req, res, next) {

    // Notification
    let notification = [],
        projectempty = {},
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification

    var splitname = req.session.user.name.split(" ");
    let work, empty;
    userHelpers.loadHiredProjects(req.session.user._id).then((projects) => {

        let completedPro = [],
            activePro = [];
        if (projects.length != 0) {

            projects.forEach(obj => {
                if (obj.status == "ACTIVE") {

                    day = checkDays(obj.dueDate)
                    obj.days = day.days;
                    obj.color = day.color;

                    activePro.push(obj)

                } else {
                    completedPro.push(obj)
                }
            })
        }

        if (activePro.length == 0) { projectempty.active = true }
        if (completedPro.length == 0) { projectempty.complete = true }

        userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {


            /// Counting bids and saved by


            if (workProfile.length == 0) {
                work = false;
                res.render("user/hire-dashboard", { title: "Dashboard Hire", user: req.session.user, activePro, completedPro, projectempty, name: splitname[0], work, notification, notiCount });
            } else {
                work = true;
                res.render("user/hire-dashboard", { title: "Dashboard Hire", user: req.session.user, activePro, completedPro, projectempty, name: splitname[0], work, notification, notiCount });
            }

        })

    })

}

// BROWSE PROJECT PAGE

exports.browse_project = function(req, res, next) {

    // Notification
    let notification = [],
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification


    userHelpers.loadSkills(req.session.user._id).then((skills) => {


        var skillArray = [];
        skills.forEach(element => {
            skillArray.push(element.code)
        });

        projectHelpers.getUserBasedPro(skillArray, req.session.user._id).then((projects) => {

            let user = req.session.user,
                saveCount = user.workProfile[0].saveCount;

            if (projects.length != 0) {
                skillsArray = projects[0].skillsName;
                res.render("user/browse-project.hbs", { title: "User", skills, skillsArray, projects, user, saveCount, notification, notiCount })
                console.log(projects);
            } else {
                res.render("user/browse-project.hbs", { title: "User", skills, projects, user, saveCount, notification, notiCount })
                console.log(projects);
            }

        })
    })


}

// FILTER AND SKILLS PROJECT

exports.filter_skills = function(req, res, next) {

    var skillsQuery = req.query.skills,
        skillArray = [];

    if (Array.isArray(skillsQuery)) {
        skillArray = skillsQuery
    } else {
        skillArray.push(skillsQuery)
    }

    console.log(skillArray);

    var amount = parseInt(req.query.amount);


    projectHelpers.getFilteredPro(skillArray, amount, req.session.user._id).then((projects) => {

        let user = req.session.user,
            saveCount = user.workProfile[0].saveCount;

        if (projects.length != 0) {
            skillsArray = projects[0].skillsName;
            res.render("user/cards.hbs", { title: "User", skillsArray, projects, user, saveCount })
        } else {
            res.render("user/cards.hbs", { title: "User", projects, user: req.session.user })
        }

    })

}

// ADD WORKER

exports.add_worker_post = function(req, res, next) {

    delete req.body.userType;
    userHelpers.addUser(req.body).then((response) => {

            if (response) {
                req.session.loggedIn = true
                req.session.user = req.body
                res.redirect('/work-dashboard')
            }
        })
        .catch((err) => {
            var key = Object.keys(err.keyPattern)
            if (key[0] === 'email') {
                console.log("Email already exists");
            } else if (key[0] === 'phone') {
                console.log("Mobile already exists");
            }
        })
}

//Save project 

exports.save_project = function(req, res, next) {


    userHelpers.saveProject(req.session.user._id, req.body.pId, ).then((response) => {
        if (response) {

            req.session.user.workProfile[0].saveCount = req.session.user.workProfile[0].saveCount + 1;
            res.send({ success: true });
        }
    })

}

exports.unsave_project = function(req, res, next) {


    userHelpers.unsaveProject(req.session.user._id, req.body.pId, ).then((response) => {
        if (response) {
            req.session.user.workProfile[0].saveCount = req.session.user.workProfile[0].saveCount - 1;
            res.send({ success: true });
        }
    })

}

// ADD PROJECT PAGE GET

exports.add_project = function(req, res, next) {

    // Notification
    let notification = [],
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification

    projectHelpers.getSkills().then((skills) => {
        res.render("user/addproject.hbs", { title: "Add project", skills, user: req.session.user, notification, notiCount })
    })

}

// ADD PROJECT POST

exports.add_project_post = function(req, res, next) {


    let filename = req.files.file.name;
    let ext = filename.split('.').pop()
    req.body.ext = ext

    req.body.dueDate = req.body.dueDate.toString().split("-").reverse().join("/")
    console.log(req.body.dueDate);

    hostId = req.session.user._id // change with req.session.user._id
    req.body.host = hostId

    projectHelpers.addProject(req.body).then((id) => {

        let file = req.files.file
        file.mv(path.join(__dirname, '../public/files/project-files/') + id + '.' + ext, (err, done) => {
            if (!err) {
                res.send({ success: true })
            } else {
                res.status(400).send({ success: false, err });
            }
        })

    })
}

exports.project_Details = function(req, res, next) {

    // Notification
    let notification = [],
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification

    let id = req.query.id;
    let hostId = req.query.hId;
    let userId = req.session.user._id;

    projectHelpers.getProjectDetails(id, userId).then((proDetails) => {

        hostDetails = proDetails.host[0];

        res.render("user/project-details.hbs", { title: "Project Details", proDetails, hostDetails, skills: proDetails.skillsArray, user: req.session.user, notification, notiCount })

    }).catch((err) => {
        res.status(500).render('error')
    })

}


// Send Proposal


exports.send_proposal = function(req, res, next) {

    projectHelpers.checkProposal(req.body.pId, req.body.id).then((status) => {

        console.log(status);
        if (!status) {
            projectHelpers.sendProposal(req.body.pId, req.body.id, req.body.name, req.body.message, req.body.amount).then((data) => {
                if (data.acknowledged) {
                    // Send notifications
                    message = "New project proposal from " + req.body.name + " on Project " + req.body.pId;
                    url = '/bid-details?id=' + req.body.pId;
                    notiHelpers.sendNotification(req.body.host, message, url).then((result) => {
                        res.send("done");
                    })
                } else {
                    res.status(500).send('Server timeout. Try login again')
                }
            })
        } else {
            res.status(500).send('Already submit send')
        }
    })

}

// Select skills

exports.select_skills = function(req, res, next) {

    // Notification
    let notification = [],
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification

    projectHelpers.getSkills().then((skills) => {

        userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {

            if (workProfile.length == 0) {
                req.session.user.workProfile = workProfile
                res.render("user/skills", { title: "Home", user: req.session.user, skills, notification, notiCount });
            } else {
                res.redirect('/work-dashboard')
            }
        })

    })

}

// Register host skills POST

exports.registerHost_skills_post = function(req, res, next) {

    let skillArray = []
    if (!Array.isArray(req.body.skills)) {
        skillArray.push(req.body.skills)
    } else {
        skillArray = req.body.skills
    }

    userHelpers.registerHostworker(req.session.user._id, skillArray).then((data) => {
        if (data) {
            res.send({ success: true })
        }
    })


}


exports.bid_details = function(req, res, next) {

        // Notification
        let notification = [],
            notiCount, notiEmpty = true;

        notiHelpers.getNotification(req.session.user._id).then((result) => {
            notification = result;
            notiCount = notification.length
        })

        // End notification


        projectHelpers.bidDetails(req.query.id, req.session.user._id).then((projectDetail) => {

                res.render('user/bid-details', { projectDetail, user: req.session.user, notification, notiCount })
            })
            .catch((err) => {
                res.status(500).render('error', { message: err })
            })


    },


    exports.bid_userData = function(req, res, next) {



        userHelpers.bid_UserDetails(req.body.userId).then((userDetail) => {

            res.send(userDetail);

        })


    },


    exports.hire_user = function(req, res, next) {

        req.body.hostId = req.session.user._id;
        req.body.hostName = req.session.user.name;
        req.body.status = "ACTIVE"

        allBids = Array.from(req.body.bidding)
        biddingUser = Array.from(req.body.bidding)



        //Getting all bidding users to send notification except got hired user

        const index = biddingUser.indexOf(req.body.workerId);
        if (index > -1) {
            biddingUser.splice(index, 1);
        }

        req.body.bidding = biddingUser;


        projectHelpers.hireUser(req.body, req.session.user.name).then((status) => {

            if (status) {

                // Acknowledge all bidded users
                message = "Sorry! " + req.session.user.name + " hired another user for his project. Better luck next time! Don't worry you can find new jobs";
                url = '/browse-project';
                notiHelpers.sendBidFailNotificaton(biddingUser, message, url).then((result) => {



                    userHelpers.removeSaved(allBids, req.body._id).then((result) => {

                        //Removing user name from bidding list
                        userHelpers.removeuserFromBidding(req.body._id, req.body.workerId).then((status) => {
                            console.log("Done");
                            res.send("done");
                        })

                    })


                })

            }

        })

    }


// Work user Project side Page RENDER


exports.worker_project = function(req, res, next) {

    pId = req.query.id;


    projectHelpers.loadActiveDetails(pId, req.session.user._id).then((activeProDetails) => {


        remaining = checkDays(activeProDetails.dueDate)
        messages = activeProDetails.messages;


        for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender == req.session.user._id) {
                messages[i].class = "self"
            } else {
                messages[i].class = "other"
            }
        }



        res.render("user/worker-project", { activeProDetails, messages, remaining })

    }).catch((err) => {
        console.log(err);
        res.status(404).render('error', { message: err });
    })


}



// Host user Project side Page RENDER


exports.host_project = function(req, res, next) {

    pId = req.query.id;


    projectHelpers.load_HostActiveDetails(pId, req.session.user._id).then((activeProDetails) => {


        remaining = checkDays(activeProDetails.dueDate)
        messages = activeProDetails.messages;


        for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender == req.session.user._id) {
                messages[i].class = "self"
            } else {
                messages[i].class = "other"
            }
        }



        res.render("user/host-project", { activeProDetails, messages, remaining })

    }).catch((err) => {
        console.log(err);
        res.status(404).render('error', { message: err });
    })


}





// for Showing bidded projects list in home tab


exports.loadBiddedProjects = function(req, res, next) {

    userHelpers.bid_projectList(req.session.user._id).then((data) => {

        for (let i = 0; i < data.length; i++) {
            if (data[i].started) {
                data[i].status = "Client chose another user for the project"
            } else { data[i].status = "" }
        }
        res.send({ status: true, list: data })
    })

}


// Removing bid

exports.removeBid = function(req, res, next) {

    pId = req.body.id;
    console.log(pId);

    userHelpers.self_removeBid(req.session.user._id, pId).then((status) => {

        if (status) {
            res.send({ status: true })
        } else {
            res.send({ status: false })
        }
    }).catch(() => {
        res.send({ status: false })
    })

}



exports.loadAddedProject = function(req, res, next) {


    projectHelpers.getAddedProjects(req.session.user._id).then((hostedProjects) => {
        res.send({ status: true, list: hostedProjects })
    })

}



// SENDING MESSAGE

exports.sendMessage = function(req, res, next) {

    let today = new Date().toLocaleDateString()
    var parts = today.split("/");
    req.body.date = parts[0] + "/" + parts[1] + "/" + parts[2];

    pId = req.body.id;
    delete req.body.id;

    req.body.sender = objectId(req.session.user._id)

    projectHelpers.sendMessage(pId, req.body).then((status) => {

        if (status) {
            res.status(200).send({ status: true })
        }


    })


}





// //////////////////////////////////////////////////////////


async function sendOTPfast(otp, mobile) {
    var options = { authorization: process.env.API_KEY, message: '\nYour OTP for JobX website is ' + otp, numbers: [mobile] }
    const response = await fast2sms.sendMessage(options)
}


function checkDays(pDate) {

    let today = new Date().toLocaleDateString()
    var parts = today.split("/");
    today = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);


    var parts = pDate.split("/");
    var proDate = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);

    var diffTime = (proDate - today);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 10) {
        color = "green"
    } else if (diffDays < 10 && diffDays > 0) {
        color = "#eb9e34"
    } else {
        diffDays = "No"
        color = "#eb4034"
    }

    return { days: diffDays, color: color };

}



function checkNotification() {
    // Notification
    let notification = [],
        empty = {},
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length
    })

    // End notification
}