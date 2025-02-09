const User = require('../models/user');
const flash = require('connect-flash');

module.exports.registerForm = (req, res) => {
    res.render('auth/register', { title: 'Register' });
};

module.exports.register = async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpEvent!');
            return res.redirect('/events');
        });
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/events';
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'Goodbye!');
        res.redirect('/events');
    });
};