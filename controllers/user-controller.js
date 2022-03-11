const projectHelpers = require('../helpers/project-helpers')
const userHelpers = require('../helpers/user-helpers')
const notiHelpers = require('../helpers/notification-helpers')
const path = require('path');
const async = require('hbs/lib/async');
const base64ToImage = require('base64-to-image');
require('dotenv').config();
const fast2sms = require('fast-two-sms');
const fs = require('fs');
const { promise } = require('bcrypt/promises');
const { response } = require('express');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const paypal = require('paypal-rest-sdk');
const instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_SECRET,
})

paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT,
    'client_secret': process.env.PAYPAL_SECRET
});

let OTP;

let isHost;




// ///////////// LOGIN ///////////////////////////////////////////

exports.login_POST = function(req, res, next) {


    userHelpers.userLogin(req.body).then((response) => {
        if (response.status) {

            req.session.loggedIn = true
            req.session.user = response.user

            userHelpers.loadWorkProfile(req.session.user._id)
                .then((workProfile) => {

                    if (workProfile.length == 0) {
                        res.redirect('/hire-dashboard')
                    } else {
                        req.session.user.workProfile = workProfile[0];

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

    userHelpers.checkUser(req.body)
        .then((result) => {
            if (!result.status) {


                let userType = req.body.userType;
                if (userType) {

                    var otp = Math.floor(Math.random() * 100000 + 1);

                    req.body.userType = "hire";
                    req.body.otp = otp;
                    //sendOTP(otp,req.body.phone)
                    sendOTPfast(otp, req.body.phone)
                    res.render("user/otp.hbs", {
                        userData: req.body,
                        sign: true
                    })
                } else {
                    var otp = Math.floor(Math.random() * 100000 + 1);

                    req.body.userType = "work";
                    req.body.otp = otp;
                    //sendOTP(otp,req.body.phone)
                    sendOTPfast(otp, req.body.phone)
                    res.render("user/otp.hbs", {
                        userData: req.body,
                        sign: true
                    })
                }

            } else {
                req.session.error = result.error;
                result.error = false;
                res.redirect('/signup')
            }
        })
}

exports.loginPhone = function(req, res, next) {

    userHelpers.findPhone(req.body.phone).then((response) => {
        if (response.status) {
            req.session.user = response.user
            var otp = Math.floor(Math.random() * 100000 + 1);

            OTP = otp;
            sendOTPfast(otp, req.body.phone)
            res.send({ status: true, phone: req.body.phone })
        } else {

            res.send({ status: false, error: "Phone is not registered" })
        }
    })
}

// Varify OTP POST

exports.varify_POST = function(req, res, next) {


    if (req.body.userType === 'work') {
        projectHelpers.getSkills().then((skills) => {
            res.render("user/worker-sign.hbs", {
                userData: req.body,
                skills,
                sign: true
            })
        })

    } else if (req.body.userType === 'hire') {

        delete req.body.userType;
        delete req.body.otp;
        delete req.body.genOtp;

        req.body.propic = false;

        userHelpers.addHireUser(req.body).then((response) => {

            if (response) {
                req.session.loggedIn = true
                req.session.user = req.body
                res.redirect('/hire-dashboard')
            }
        })
    }



}


exports.varifyOTPLogin = function(req, res, next) {
    if (req.body.otp == OTP) {

        req.session.loggedIn = true


        userHelpers.loadWorkProfile(req.session.user._id)
            .then((workProfile) => {

                if (workProfile.length == 0) {
                    res.send({ status: true, url: '/hire-dashboard' })
                } else {
                    req.session.user.workProfile = workProfile[0];

                    res.send({ status: true, url: '/work-dashboard' })
                }

            })


    } else {
        res.send({ status: false, error: "Invalid OTP" })
    }
}

///////////////// WORKER DASHBOARD ////////////////////////////////

exports.workDashboard = function(req, res, next) {
    let empty = {}


    notiCount = req.session.notiCount;
    notification = req.session.notification;

    let reqCount = req.session.reqCount;


    var splitname = req.session.user.name.split(" ");
    userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {

        if (workProfile.length == 0) {
            res.redirect('/hire-dashboard')
        } else {
            isHost = false
            req.session.user.workProfile = workProfile[0]
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
                    notiCount,
                    reqCount,
                    isHost
                });

            })

        }

    })

}

///////////////// HIRE DASHBOARD ////////////////////////////////

exports.hire_dashboard = function(req, res, next) {

    let projectempty = {}
        // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

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
                isHost = true;
                res.render("user/hire-dashboard", {
                    title: "Dashboard Hire",
                    user: req.session.user,
                    activePro,
                    completedPro,
                    projectempty,
                    name: splitname[0],
                    work,
                    notification,
                    notiCount
                });
            } else {
                work = true;
                res.render("user/hire-dashboard", {
                    title: "Dashboard Hire",
                    user: req.session.user,
                    activePro,
                    completedPro,
                    projectempty,
                    name: splitname[0],
                    work,
                    notification,
                    notiCount
                });
            }

        })

    })

}

// BROWSE PROJECT PAGE

exports.browse_project = function(req, res, next) {


    // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification


    userHelpers.loadSkills(req.session.user._id).then((skills) => {


        var skillArray = [];
        skills.forEach(element => {
            skillArray.push(element.code)
        });

        projectHelpers.getUserBasedPro(skillArray, req.session.user._id).then((projects) => {

            let user = req.session.user,
                saveCount = user.workProfile.saveCount;

            if (projects.length != 0) {
                skillsArray = projects[0].skillsName;
                res.render("user/browse-project.hbs", {
                    title: "User",
                    skills,
                    skillsArray,
                    projects,
                    user,
                    saveCount,
                    notification,
                    notiCount,
                    isHost
                })

            } else {
                res.render("user/browse-project.hbs", {
                    title: "User",
                    skills,
                    projects,
                    user,
                    saveCount,
                    notification,
                    notiCount
                })

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



    var amount = parseInt(req.query.amount);


    projectHelpers.getFilteredPro(skillArray, amount, req.session.user._id).then((projects) => {

        let user = req.session.user,
            saveCount = user.workProfile.saveCount;

        if (projects.length != 0) {
            skillsArray = projects[0].skillsName;
            res.render("user/cards.hbs", {
                layout: 'empty',
                skillsArray,
                projects,
                user,
                saveCount
            })

            // res.send({ projects })
        } else {
            res.render("user/cards.hbs", {
                layout: 'empty',
                projects,
                user: req.session.user
            })

            // res.send({ projects })
        }

    })

}

// ADD WORKER

exports.add_worker_post = function(req, res, next) {

    delete req.body.userType;
    req.body.propic = false;
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

            } else if (key[0] === 'phone') {

            }
        })
}

//Save project 

exports.save_project = function(req, res, next) {


    userHelpers.saveProject(req.session.user._id, req.body.pId, ).then((response) => {
        if (response) {

            req.session.user.workProfile.saveCount = req.session.user.workProfile.saveCount + 1;
            res.send({ success: true });
        }
    })

}

exports.unsave_project = function(req, res, next) {


    userHelpers.unsaveProject(req.session.user._id, req.body.pId, ).then((response) => {
        if (response) {
            req.session.user.workProfile.saveCount = req.session.user.workProfile.saveCount - 1;
            res.send({ success: true });
        }
    })

}

// ADD PROJECT PAGE GET

exports.add_project = function(req, res, next) {


    // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    projectHelpers.getSkills().then((skills) => {
        res.render("user/addproject.hbs", { title: "Add project", skills, user: req.session.user, notification, notiCount, add: true, isHost })
    })

}

// ADD PROJECT POST

exports.add_project_post = function(req, res, next) {


    let filename = req.files.file.name;
    let ext = filename.split('.').pop()
    req.body.ext = ext

    req.body.dueDate = req.body.dueDate.toString().split("-").reverse().join("/")


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
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    let id = req.query.id;
    let hostId = req.query.hId;
    let userId = req.session.user._id;

    projectHelpers.getProjectDetails(id, userId).then((proDetails) => {

        hostDetails = proDetails.host[0];

        res.render("user/project-details.hbs", {
            title: "Project Details",
            proDetails,
            hostDetails,
            skills: proDetails.skillsArray,
            user: req.session.user,
            notification,
            notiCount,
            isHost
        })

    }).catch((err) => {
        res.status(500).render('error')
    })

}


// Send Proposal


exports.send_proposal = function(req, res, next) {

    projectHelpers.checkProposal(req.body.pId, req.body.id).then((status) => {


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
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    projectHelpers.getSkills().then((skills) => {

        userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {

            if (workProfile.length == 0) {
                req.session.user.workProfile = workProfile
                res.render("user/skills", { title: "Home", user: req.session.user, skills, notification, notiCount, isHost });
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
            isHost = false;
            res.send({ success: true })
        }
    })


}


exports.bid_details = function(req, res, next) {

    try {

        // Notification
        notiCount = req.session.notiCount;
        notification = req.session.notification;

        // End notification


        projectHelpers.bidDetails(req.query.id, req.session.user._id).then((projectDetail) => {

                res.render('user/bid-details', { projectDetail, user: req.session.user, notification, notiCount, isHost })
            })
            .catch((err) => {
                res.status(500).render('error', { message: err })
            })
    } catch (err) {
        console.log(err);
    }


}


exports.bid_userData = function(req, res, next) {



    userHelpers.bid_UserDetails(req.body.userId).then((userDetail) => {

        res.send(userDetail);

    })


}


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

    // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    pId = req.query.id;


    projectHelpers.loadActiveDetails(pId, req.session.user._id).then((activeProDetails) => {


        remaining = checkDays(activeProDetails.dueDate)
        messages = activeProDetails.messages;

        projectHelpers.loadProjectFiles(pId).then((pFiles) => {

            for (let i = 0; i < messages.length; i++) {
                if (messages[i].sender == req.session.user._id) {
                    messages[i].class = "self"
                } else {
                    messages[i].class = "other"
                }
            }

            res.render("user/worker-project", { activeProDetails, messages, remaining, pFiles, user: req.session.user, notiCount, notification, isHost })

        })


    }).catch((err) => {

        res.status(404).render('error', { message: err });
    })


}



// Host user Project side Page RENDER


exports.host_project = function(req, res, next) {

    // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    pId = req.query.id;


    projectHelpers.load_HostActiveDetails(pId, req.session.user._id).then((activeProDetails) => {


        remaining = checkDays(activeProDetails.dueDate)
        messages = activeProDetails.messages;

        projectHelpers.loadProjectFiles(pId).then((pFiles) => {

            for (let i = 0; i < messages.length; i++) {
                if (messages[i].sender == req.session.user._id) {
                    messages[i].class = "self"
                } else {
                    messages[i].class = "other"
                }
            }

            res.render("user/host-project", { activeProDetails, messages, remaining, pFiles, user: req.session.user, isHost })

        })



    }).catch((err) => {

        res.status(404).render('error', { message: err });
    })


}


exports.completeProject = function(req, res, next) {

    projectHelpers.load_HostActiveDetails(req.query.id, req.session.user._id).then((proDetails) => {


        if (proDetails.status === "ACTIVE") {
            proDetails.fee = proDetails.bidAmount * 0.1;
            proDetails.finalAmount = proDetails.bidAmount + proDetails.fee;
            res.render('user/complete-project', { user: req.session.user, proDetails, pay: true })
        } else {
            res.redirect('/host-projects?id=' + proDetails._id)
        }

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


exports.uploadProjectFiles = async function(req, res, next) {

    let database_files = [];
    let filesArray = [];


    try {

        if (Array.isArray(req.files.file)) {
            filesArray = req.files.file
        } else {
            filesArray.push(req.files.file)
        }

        filesArray.forEach((file, i, array) => {

            let filename = file.name.split(" ").join("_");


            let dir = path.join(__dirname, '../public/files/project-files/work/' + req.body.pId + '/')

            if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }

            fs.readdir(dir, function(err, files) {

                getName(filename, files).then((name) => {
                    file.mv(dir + name, (err, done) => {
                        if (!err) {

                            var datetime = new Date();

                            database_files.push({ id: new objectId(), filename: name, date: datetime.toISOString().slice(0, 10) })


                            if (i === array.length - 1) {

                                projectHelpers.uploadProjectFiles(database_files, req.body.pId)
                                    .then((response) => {
                                        res.send({ success: true })
                                    })

                            }


                        } else {
                            res.status(400).send({ success: false, err });
                        }
                    })
                })

            });


        })


    } catch (err) {

    }


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

exports.extendProjectDate = function(req, res, next) {

    projectHelpers.extendDate(req.body.pId, req.body.date).then((status) => {
        if (status) {
            res.send({ status: true, day: checkDays(req.body.date) })
        }
    })

}

exports.getFile = function(req, res, next) {


    projectHelpers.loadProjectFiles(req.body.pId).then((files) => {
        res.send(files)
    })

}


exports.userProfile = function(req, res, next) {

    // Notification
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    // End notification

    let user = req.session.user
    let isWorker;

    projectHelpers.getAllSkills().then((skills) => {



        if (!req.session.user.workProfile) {

            isWorker = false;

            res.render('user/profile', { user, skills, isWorker })

        } else {

            isWorker = true;
            userSkills = req.session.user.workProfile.skillsArray;

            for (let i = 0; i < skills.length; i++) {
                userSkills.forEach(elem => {
                    if (elem.code === skills[i].code) {
                        skills[i].checked = true;
                    }
                })
            }

            res.render('user/profile', { user, skills, isWorker })
        }


    })


}

exports.changeDp = function(req, res, next) {

    try {

        var base64Str = req.body.crop_image
        var dir = path.join(__dirname, '../public/images/profile-pics/');
        var optionalObj = { 'fileName': req.session.user._id, 'type': 'jpg' };

        var imageInfo = base64ToImage(base64Str, dir, optionalObj);
        if (imageInfo) {


            if (!req.session.user.propic) {
                userHelpers.changeDpStatus(req.session.user._id).then((data) => {
                    if (data) {
                        req.session.user.propic = true
                        res.send({ status: true, image: req.session.user._id + ".jpg" })
                    }
                })
            } else {
                res.send({ status: true, image: req.session.user._id + ".jpg" })
            }
        } else {
            res.send({ status: false })
        }

    } catch (err) {

    }

}


exports.removeDp = function(req, res, next) {


    userHelpers.removeProPic(req.session.user._id).then((response) => {
        if (response) {

            let dir = path.join(__dirname, '../public/images/profile-pics/' + req.session.user._id + ".jpg")
            fs.unlink(dir, function(err) {
                if (err) {
                    res.send({ status: false })
                } else {
                    req.session.user.propic = false;
                    res.send({ status: true })
                }
            });
        }
    })
}

exports.updateDetails = function(req, res, next) {
    userHelpers.updateUserDetails(req.session.user._id, req.body).then((response) => {
        if (response) {

            req.session.user.name = req.body.name;
            req.session.user.lname = req.body.lname;
            req.session.user.email = req.body.email;
            req.session.user.country = req.body.country;
            req.session.user.phone = req.body.phone;
            req.session.user.bio = req.body.bio;



            res.send({ status: true, name: req.body.name })
        } else {
            res.send({ status: false })

        }
    })
}

exports.updateSkills = function(req, res, next) {

    userHelpers.updateUserSkills(req.session.user._id, req.body.skills).then((response) => {

        userHelpers.loadWorkProfile(req.session.user._id).then((workProfile) => {



            req.session.user.workProfile.skillsArray = [...workProfile[0].skillsArray]

            res.send(req.session.user.workProfile.skillsArray)

        })
    })

}

exports.updatePayment = function(req, res, next) {


    if (req.session.user.hasOwnProperty("payments")) {
        req.session.user.payments.forEach(elem => {
            if (elem === req.body.email) {
                res.send({ status: false, err: "Email already exists" })
            }
        })
    }

    userHelpers.updatePayment(req.session.user._id, req.body.email).then((response) => {
        if (response) {
            req.session.user.payments.push(req.body.email);
            res.send({ status: true, email: req.body.email })
        } else {
            res.send({ status: false, err: "Something went wrong" })
        }
    })
}

exports.removePayment = function(req, res, next) {


    userHelpers.removePayment(req.session.user._id, req.body.email).then((response) => {
        if (response) {
            req.session.user.payments.pop(req.body.email);
            res.send({ status: true })
        }
    })
}

exports.wallet = function(req, res, next) {

    userHelpers.checkPayout(req.session.user._id).then((response) => {

        userHelpers.getTransactions(req.session.user._id).then((transactions) => {

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].type === "PROJECT") {
                    if ((transactions[i].sender).toString() === req.session.user._id) {
                        transactions[i].debit = transactions[i].amount
                    }
                    if ((transactions[i].receiver).toString() === req.session.user._id) {
                        transactions[i].credit = transactions[i].orgiAmount - (transactions[i].orgiAmount * 0.1)
                    }
                } else {
                    transactions[i].debit = transactions[i].amount
                }

                transactions[i].date = transactions[i].date.toString().substring(0, 15)
            }

            res.render('user/wallet', {
                title: "Wallet",
                user: req.session.user,
                transactions,
                isAlready: response.status,
                payoutData: response.data
            })
        })

    })

}

exports.requestPayout = function(req, res, next) {

    userHelpers.requestPayout(req.session.user._id, req.body).then((status) => {

    })
}


exports.freelancer = function(req, res, next) {

    projectHelpers.getAllSkills().then((skills) => {

        let skillsCode = []
        skills.forEach(elem => {
            skillsCode.push(elem.code)
        })

        projectHelpers.getFreelancers(skillsCode, 0, req.session.user._id).then((workers) => {
            res.render('user/freelancers', { skills, workers, user: req.session.user, isHost })
        })


    })

}

// Filter freelancers

exports.freelancerPost = function(req, res, next) {

    try {


        if (!Array.isArray(req.body.skills)) {
            let skills = []
            skills.push(req.body.skills)
            req.body.skills = skills
        }

        let rating = parseInt(req.body.rating)
        projectHelpers.getFreelancers(req.body.skills, rating, req.session.user._id).then((workers) => {

            if (workers.length != 0) {
                res.render('user/card-freelancer', { layout: 'empty', workers })
            } else {
                res.render('user/card-freelancer', { layout: 'empty' })
            }
        })
    } catch (err) {

    }


}

exports.freelanceRequest = function(req, res, next) {

    req.body.dueDate = req.body.dueDate.toString().split("-").reverse().join("/")
    req.body.hostId = objectId(req.session.user._id);
    req.body.userId = objectId(req.body.userId)


    projectHelpers.sendRequest(req.body).then((status) => {
        res.send({ status: status, uId: req.body.userId })
    })

}

exports.requests = function(req, res, next) {
    notiCount = req.session.notiCount;
    notification = req.session.notification;

    userHelpers.loadRequests(req.session.user._id).then(async(requests) => {
        let isempty = false
        if (requests.length == 0) {
            isempty = true
        }
        let status = await userHelpers.markRead(req.session.user._id)
        if (status) {
            res.render('user/requests', { user: req.session.user, notification, notiCount, requests, isempty, isHost })
        }

    })

}


exports.acceptRequests = function(req, res, next) {

    projectHelpers.acceptProjectRequest(req.query.id, req.session.user).then(async(data) => {
        let status = await userHelpers.removeRequest(req.query.id)
        if (status) {
            res.send({ status: true })
        }

    })

}


exports.search = function(req, res, next) {

        notiCount = req.session.notiCount;
        notification = req.session.notification;

        let searchResult = []
        let key = req.query.search;

        projectHelpers.search().then(async(data) => {

            for (let i = 0; i < data.length; i++) {
                if ((data[i].pdetails.toUpperCase()).includes(key.toUpperCase())) {
                    searchResult.push(data[i])
                    continue
                } else if ((data[i].pheading.toUpperCase()).includes(key.toUpperCase())) {
                    searchResult.push(data[i])
                    continue
                } else if ((data[i].hostname.toUpperCase()).includes(key.toUpperCase())) {
                    searchResult.push(data[i])
                    continue
                } else {
                    for (let j = 0; j < data[i].skills.length; j++) {
                        if ((data[i].skills[j].toUpperCase()).includes(key.toUpperCase())) {
                            searchResult.push(data[i])
                            continue
                        }
                    }
                }
            }

            let isempty = false
            if (searchResult.length == 0) {
                isempty = true
            }

            res.render('user/search', { user: req.session.user, notification, notiCount, searchResult, isempty, key: key })

        })
    },


    exports.changePass = function(req, res, next) {


        userHelpers.changePass(req.body, req.session.user._id).then((response) => {
            if (response.status) {
                res.send({ status: true })
            } else {
                res.send({ status: false, error: response.error })
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




const getName = async(fileName, fileList) => {

    return new Promise(async(resolve, reject) => {
        let [name, end] = fileName.split('.');
        let num = 0;
        let curName = `${name}.${end}`;
        let exists = fileList.filter(f => f === curName).length;
        while (exists) {

            curName = `${name}(${++num}).${end}`;
            exists = fileList.filter(f => f === curName).length;
        }
        resolve(curName)
    })

}