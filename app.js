const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const hbs = require('express-handlebars')
const db = require('./config/connection')
const fileUpload = require('express-fileupload')
const session = require('express-session')
const MongoStore = require('connect-mongo');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',

    helpers: {
        eq: function(arg1, arg2) {
            return (arg1 == arg2) ? true : false; //custom helper for comparison
        },

        json: function(context) {
            return JSON.stringify(context);
        },

        inc: function(value, options) {
            return parseInt(value) + 1;
        }
    }
}));


app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//Middleware for file upload
app.use(fileUpload())

app.use(session({
    secret: "secretKeyJobix",
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DATABASE
    }),
    cookie: {
        maxAge: 600000
    },
    resave: false,
    saveUninitialized: false
}))


db.connect((err) => {
    if (err) {
        console.log("Connection Error");
        console.log(err);
    } else {
        console.log("Connected to Database")
    }
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { layout: 'error-layout' });
});

module.exports = app;