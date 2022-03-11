var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')

var path = require('path');
require('dotenv').config();
const fast2sms = require('fast-two-sms');
const fs = require('fs');
const objectId = require('mongodb').ObjectId
var request = require('request');

const Razorpay = require('razorpay')
const paypal = require('paypal-rest-sdk');
const adminHelpers = require('../helpers/admin-helpers');

const instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_SECRET,
})

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AZJe_0UvcUHVk0oObJnKHVA0uj_Qk_q9saBBHAPcbJGqZy37KH9j3j2S7q09mFRyB-khbmSU2_u62_sj',
    'client_secret': 'EPk9kGe4kRvDYGo8X8cOpRF0YqF-v-YZvgPLOiknFuQ0tkf3PNf7fF4VROaBNL8CpAew5K2vSTa9kJFC'
});

let AMOUNT = {};
let DATA = {}




exports.checkout = async function(req, res, next) {

    projectDetails = await projectHelpers.projectDetailsforCheckout(req.body.pId, req.session.user._id);
    console.log(projectDetails);
    DATA.projectDetails = projectDetails;
    DATA.review = req.body;

    try {
        console.log(req.body.payMethod);
        console.log(req.body);
        let amount = parseFloat(projectDetails.bidAmount + (projectDetails.bidAmount * 0.1));
        console.log(projectDetails.workerDetails[0].name);

        let method = req.body.payMethod

        if (method === 'razor') {
            instance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: "" + projectDetails._id,
            }, (err, order) => {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        console.log("Order generated : " + order);
                        res.json({
                            order,
                            type: "RAZOR",
                            key: process.env.RAZOR_KEY_ID,
                            user: projectDetails.workerDetails[0].name,
                            email: projectDetails.workerDetails[0].email,
                            phone: projectDetails.workerDetails[0].phone,
                            workerId: projectDetails.workerDetails[0]._id,
                            project: req.body
                        })
                    } catch (err) {
                        console.log(err);
                    }
                }

            })
        } else if (method === 'paypal') {

            let amount = parseFloat(projectDetails.bidAmount + (projectDetails.bidAmount * 0.1));
            AMOUNT.amount = amount;
            amount = (amount / 75).toFixed(2)
            AMOUNT.dollar = amount;

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:5000/success-paypal",
                    "cancel_url": "http://localhost:5000/cancel"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": amount
                    }
                }]
            };

            paypal.payment.create(create_payment_json, function(error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            // res.redirect(payment.links[i].href);
                            res.send({ url: payment.links[i].href })
                        }
                    }
                }
            });


        }


    } catch (err) {
        console.log(err);
    }

}


exports.verifyPayment = async function(req, res, next) {
    try {
        console.log(req.body);
        if (req.body.type === "RAZOR") {
            let status = await userHelpers.varifyPayment(req.body)
            if (status) {
                let today = new Date().toLocaleDateString()
                var parts = today.split("/");
                today = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);

                let data = {
                    payId: req.body.payment.razorpay_payment_id,
                    date: today,
                    method: "RAZOR",
                    amount: req.body.order.amount / 100,
                    orgiAmount: DATA.projectDetails.bidAmount,
                    sender: objectId(req.session.user._id),
                    receiver: DATA.projectDetails.workerId,
                    type: "PROJECT"
                }
                projectHelpers.createTransaction(data).then(async(response) => {
                    if (response.status) {
                        let status = await projectHelpers.completeProject(req.body.project.pId, response.tId)
                        if (status) {

                            //UPDATE Rating
                            let walletAmount = DATA.projectDetails.bidAmount - DATA.projectDetails.bidAmount * 0.1

                            Promise.all([
                                userHelpers.addRating(req.body.workerId, req.body.project, req.session.user),
                                userHelpers.updateWallet(req.body.workerId, walletAmount)
                            ]).then(() => {
                                DATA = null
                                res.send({ success: true, msg: "Payment successfull" })
                            }).catch((err) => {
                                console.log(err);
                            })


                        } else {
                            DATA = null
                            res.send({ success: false, msg: "Payment failed" })
                        }
                    } else {
                        DATA = null
                        res.send({ success: false, msg: "Payment failed" })
                    }
                })
            } else {
                DATA = null
                res.send({ success: false, msg: "Payment failed" })
            }
        }
    } catch (err) {
        DATA = null
        res.send({ success: false, msg: "Payment failed" })
    }

}



exports.paypalSuccess = async function(req, res, next) {

    console.log("here");
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    console.log(payerId);
    console.log(paymentId);

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": AMOUNT.dollar
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {

            // console.log(JSON.stringify(payment));
            console.log(DATA);

            let today = new Date().toLocaleDateString()
            var parts = today.split("/");
            today = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);

            let data = {
                payId: paymentId,
                date: today,
                method: "PAYPAL",
                amount: (DATA.projectDetails.bidAmount + DATA.projectDetails.bidAmount * 0.1),
                orgiAmount: DATA.projectDetails.bidAmount,
                sender: objectId(req.session.user._id),
                receiver: DATA.projectDetails.workerId,
                type: "PROJECT"
            }

            projectHelpers.createTransaction(data).then(async(response) => {
                if (response.status) {

                    let walletAmount = DATA.projectDetails.bidAmount - DATA.projectDetails.bidAmount * 0.1

                    Promise.all([
                        projectHelpers.completeProject(DATA.projectDetails._id, response.tId),
                        userHelpers.addRating(DATA.projectDetails.workerId, DATA.review, req.session.user),
                        userHelpers.updateWallet(DATA.projectDetails.workerId, walletAmount)
                    ]).then(() => {
                        DATA = null
                            // res.send({ success: true, msg: "Payment successfull" })
                        res.render('user/success', { user: req.session.user })
                    }).catch((err) => {
                        console.log(err);
                        DATA = null
                        res.send({ success: false, msg: "Payment failed" })
                    })
                }
            })

        }
    });
}


exports.cancel = function(req, res, next) {
    res.render('user/failed', { user: req.session.user })
}



exports.sendPayout = async function(req, res, next) {

    console.log(req.body);

    let today = new Date().toLocaleDateString()
    var parts = today.split("/");
    today = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);

    let data = {
        payId: req.body.paydetails.orderID,
        date: today,
        method: "PAYPAL",
        amount: req.body.amount,
        sender: objectId(req.session.admin._id),
        receiver: objectId(req.body.userId),
        type: "PAYOUT"
    }


    projectHelpers.createTransaction(data).then(async(response) => {
        if (response.status) {


            Promise.all([
                userHelpers.updateWallet(req.body.userId, -req.body.amount),
                adminHelpers.completePayout(req.body.id, response.tId)
            ]).then(async() => {
                DATA = null
                let number = await userHelpers.getNumber(req.body.userId)

                var options = { authorization: process.env.API_KEY, message: '\nCongradulations! Your payout request for Rs.' + req.body.amount + ' is Aprroved!', numbers: [number.phone] }
                const messageResponse = await fast2sms.sendMessage(options)

                console.log("Hreeee");
                console.log(messageResponse);

                res.send({ success: true, msg: "Payment successfull" })
            }).catch((err) => {
                console.log(err);
                DATA = null
                res.send({ success: false, msg: "Payment failed" })
            })


        }

        // res.send({ status: "success" });
    })

}