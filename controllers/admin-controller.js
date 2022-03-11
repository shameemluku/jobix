const projectHelpers = require('../helpers/project-helpers')
const userHelpers = require('../helpers/user-helpers')
const notiHelpers = require('../helpers/notification-helpers')
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


<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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

exports.payouts = function(req, res, next) {

    adminHelpers.getPayoutList("PENDING").then((response) => {

        res.render('admin/payouts', {
            layout: 'adlayout',
            title: 'Users',
            page: "payout",
            isNotEmpty: response.status,
            payoutList: response.data
        });
    })

}

exports.transactions = async function(req, res, next) {
    adminHelpers.getAlltransaction().then((data) => {

        for (let i = 0; i < data.length; i++) {
            data[i].date = data[i].date.toString().substring(0, 15)
        }
        res.render('admin/transactions', {
            layout: 'adlayout',
            title: 'Users',
            page: "trans",
            data
        });
    })
}


exports.transactionsFilter = function(req, res, next) {



    let dates = req.body.daterange.split(" - ")

    let start = new Date(dates[0]);
    start = start.toISOString();

    let end = new Date(dates[1]);
    end = end.toISOString();

    adminHelpers.filterTransaction(start, end, req.body.method).then((data) => {
        for (let i = 0; i < data.length; i++) {
            data[i].date = data[i].date.toString().substring(0, 15)
        }
        res.send({ status: true, data: data })
    })
}


exports.projects = function(req, res, next) {
    adminHelpers.loadProjectList().then((data) => {
        res.render('admin/projects', {
            layout: 'adlayout',
            title: 'Projects',
            page: "projects",
            data
        });
    })
}