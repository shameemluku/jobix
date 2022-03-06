var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')
const adminHelpers = require('../helpers/admin-helpers')


exports.login = function(req, res, next) {

    if (req.session.adminloggedIn) {
        res.redirect('/admin')
    } else {
        res.render('admin/login', { layout: 'adlayout', sign: true })
    }

}

exports.loginPost = function(req, res, next) {

    adminHelpers.login(req.body).then((response) => {
        if (response.status) {
            req.session.admin = response.user
            req.session.adminloggedIn = true
            res.send(response)
        } else {
            res.send(response)
        }
    })
}

exports.home = function(req, res, next) {

    let user = req.session.admin;
    adminHelpers.loadProjectsHome().then((projects) => {
        res.render('admin/index', {
            layout: 'adlayout',
            page: "home",
            title: 'Dashboard',
            projects,
            user
        });
    })

}

exports.loadPie = function(req, res, next) {
    adminHelpers.loadPiedata().then((pieData) => {
        res.send(pieData);
    })
}


exports.users = function(req, res, next) {

    adminHelpers.getAllusers().then((users) => {
        res.render('admin/users', {
            layout: 'adlayout',
            title: 'Users',
            page: "user",
            users
        });
    })


}

exports.blockUser = function(req, res, next) {

    adminHelpers.blockUser(req.body.id, req.body.status).then((result) => {
        if (result) {


            console.log(req.session);
            if (req.session.loggedIn) {
                if (req.session.user._id == req.body.id) {
                    req.session.user = null;
                    req.session.loggedIn = false;
                }
            }

            res.send({ status: true })
        }
    })
}


exports.homeNumbers = function(req, res, next) {

    adminHelpers.loadNumbers().then((result) => {
        res.send(result)
    })

}

exports.logout = function(req, res, next) {

    req.session.admin = null
    req.session.adminloggedIn = false;
    res.redirect('/admin/login')
}