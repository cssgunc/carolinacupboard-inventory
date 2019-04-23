let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    morgan      = require("morgan"),
    config      = require("./config/server"),
    ejs         = require("ejs"),
    authService = require("./services/authorization-service");

app.engine("html", ejs.renderFile);

/*
 * Set up server parsing and logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
   
app.use(morgan(config.logging));

app.use(express.static('/views'));
app.use("/static", express.static("static"));

var middle = function(req, res, next) {
    var uid = req.get("HTTP_UID");
    console.log(uid);
    res.send(uid);
}

/*
 *Register routes on api 
 */
app.use("/", require("./controllers/index"));

app.get("/", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    console.log(req.headers);
    res.render("index.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/approve", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("admin/approve.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/removal", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("admin/removal.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/preorder", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("user/preorder.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/cart", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("user/cart.ejs", {onyen: onyen, userType: userType});
});
  
app.get("/history", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("user/history.ejs", {onyen: onyen, userType: userType});
});

module.exports = app;