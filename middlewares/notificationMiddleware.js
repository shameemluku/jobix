const userHelpers = require("../helpers/user-helpers")
const notiHelpers = require("../helpers/notification-helpers");
const async = require("hbs/lib/async");

exports.checkNoti = (req, res, next) => {
    // Notification
    let notification = [],
        projectempty = {},
        notiCount, notiEmpty = true;

    notiHelpers.getNotification(req.session.user._id).then((result) => {
        notification = result;
        notiCount = notification.length

        req.session.notification = notification;
        req.session.notiCount = notiCount;
        next()
    })

    // End notification
}


exports.checkRequest = async(req, res, next) => {

    let reqCount = await notiHelpers.getRequestCount(req.session.user._id);
    req.session.reqCount = reqCount;
    next()

}