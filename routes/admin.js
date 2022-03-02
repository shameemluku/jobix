var express = require('express');
var router = express.Router();
var projectHelpers = require('../helpers/project-helpers')
var userHelpers = require('../helpers/user-helpers')
var notiHelpers = require('../helpers/notification-helpers')
var adminController = require('../controllers/admin-controller');
const adminHelpers = require('../helpers/admin-helpers');


router.get('/', adminController.home);


router.post('/load-pie', adminController.loadPie)

router.get('/users', adminController.users)

module.exports = router;