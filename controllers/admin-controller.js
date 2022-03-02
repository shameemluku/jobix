var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')
const adminHelpers = require('../helpers/admin-helpers')


exports.home = function(req, res, next) {

    adminHelpers.loadProjectsHome().then((projects) => {
        res.render('admin/index', {
            layout: 'adlayout',
            page: "home",
            title: 'Dashboard',
            projects
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