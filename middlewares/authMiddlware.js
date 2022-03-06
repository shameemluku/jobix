exports.varifyLogin = (req, res, next) => {
    if (req.session.loggedIn) next()
    else res.redirect('/login')
}

exports.isAdminLogged = (req, res, next) => {
    if (req.session.adminloggedIn) next()
    else res.redirect('/admin/login')
}