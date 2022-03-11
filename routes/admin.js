const express = require('express');
const router = express.Router();
const projectHelpers = require('../helpers/project-helpers')
const notiHelpers = require('../helpers/notification-helpers')
const adminController = require('../controllers/admin-controller');
const paymentController = require('../controllers/payment-controller');
const adminHelpers = require('../helpers/admin-helpers');

const { isAdminLogged } = require('../middlewares/authMiddlware')


router.get('/', isAdminLogged, adminController.home);

router.get('/login', adminController.login);

router.post('/login', adminController.loginPost)

router.post('/load-pie', isAdminLogged, adminController.loadPie)

router.get('/users', isAdminLogged, adminController.users)

router.post('/block-user', isAdminLogged, adminController.blockUser)

router.post('/home-numbers', isAdminLogged, adminController.homeNumbers)

router.get('/payouts', isAdminLogged, adminController.payouts)

router.post('/payouts', isAdminLogged, paymentController.sendPayout)

router.get('/transactions', isAdminLogged, adminController.transactions)

router.post('/filter-transaction', isAdminLogged, adminController.transactionsFilter)

router.get('/projects', isAdminLogged, adminController.projects)

router.get('/logout', adminController.logout)

module.exports = router;