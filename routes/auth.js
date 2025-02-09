const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const { storeReturnTo } = require('../middleware');
const auths = require('../controllers/auths')

router.route('/register')
    .get(auths.registerForm)
    .post(catchAsync(auths.register))

router.route('/login')
    .get(auths.loginForm)
    .post(storeReturnTo, passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }), auths.login)

router.get('/logout', auths.logout);

module.exports = router;
