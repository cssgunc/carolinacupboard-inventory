const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    config = require('./config/server'),
    ejs = require('ejs'),
    fileUpload = require('express-fileupload'),
    userIsAuthenticated = require('./controllers/util/auth').userIsAuthenticated,
    userHasInfo = require('./controllers/util/auth').userHasInfo,
    userIsBasicUser = require('./controllers/util/auth').userIsBasicUser;

app.engine('html', ejs.renderFile);

if (process.env.NODE_ENV === 'prod') {
    app.set('trust proxy', 1);
}

/*
 * Set up server parsing and logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (config) {
    app.use(morgan(config.logging));
}

app.use(express.static('/views'));
app.use('/static', express.static('static'));

app.use(fileUpload());

// Registers authentication middleware on all routes
app.use([userIsAuthenticated, userHasInfo]);

/*
 *Register routes on api 
 */
app.use('/', require('./controllers/index'));

app.get('/', [userIsBasicUser], async function (req, res) {
    res.render('index.ejs', { onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = app;