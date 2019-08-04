let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    morgan      = require("morgan"),
    config      = require("./config/server"),
    ejs         = require("ejs"),
    session     = require('express-session'),
    authService = require("./services/authorization-service");

app.engine("html", ejs.renderFile);

let sess = session({
    name: 'sessionId',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false
    }
});

if (process.env.NODE_ENV === 'prod') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
    sess.cookie.httpOnly = true;
}

/*
 * Set up server parsing and logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
   
app.use(morgan(config.logging));

app.use(sess);

app.use(express.static('/views'));
app.use("/static", express.static("static"));

/*
 *Register routes on api 
 */
app.use("/", require("./controllers/index"));

app.get("/", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(process.env.NODE_ENV === "dev")
        console.log(req.headers);
    res.render("index.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/approve", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    res.render("admin/approve.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/preorder", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    res.render("user/preorder.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/cart", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    res.render("user/cart.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/history", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    res.render("user/history.ejs", {onyen: onyen, userType: userType});
});

module.exports = app;