if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const http = require('http');
const cron = require('node-cron');
const Event = require('./models/event');
const events = require('./routes/events');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError');

// MongoDB connection
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err.message);
    });

// Middleware and configurations
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(mongoSanitize({ replaceWith: '_', }));
app.use(helmet());

// CSP configuration
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkn97rfk1/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Session configuration
const sessionConfig = {
    name: 'MaSh',
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
        secret: process.env.SESSION_SECRET,
        touchAfter: 24 * 60 * 60
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true // Enable this in production for HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport authentication setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass user data to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.get("/", async (req, res, next) => {
    try {
        const allEvents = await Event.find({});
        res.render("home", { title: 'Home', allEvents });
    } catch (err) {
        next(new ExpressError("Failed to retrieve events", 500));
    }
});

// Auth routes
app.use('/', auth);

// Reviews routes
app.use('/events/:id/reviews', reviews);

// Events routes
app.use('/events', events);

// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error", { message, statusCode, err, title: "Error" });
});

// Function to ping the server
const pingServer = () => {
    http.get('http://your-app-url.com');
};

// Schedule a cron job to ping the server every 29 minutes
cron.schedule('*/29 * * * *', () => {
    pingServer();
    console.log('Pinged server to keep it awake.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is serving on port ${PORT}`);
});
