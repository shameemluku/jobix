const userHelpers = require("../helpers/user-helpers")

exports.varifyLogin = (req, res, next) => {
    if (req.session.loggedIn) next()
    else res.redirect('/login')
}

exports.isActive = (req, res, next) => {
    userHelpers.checkStatus(req.session.user._id).then((response) => {
        if (response.status) {
            req.session.user.wallet = response.wallet;
            next()
        } else {
            req.session.loggedIn = false;
            req.session.user = null;
            res.redirect('/login')
        }
    })
}

exports.isAdminLogged = (req, res, next) => {
    if (req.session.adminloggedIn) next()
    else res.redirect('/admin/login')
}