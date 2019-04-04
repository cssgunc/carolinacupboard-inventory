let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    morgan      = require("morgan"),
    ExceptionHandler    = require("./exceptions/exception-handler"),
    config      = require("./config/server"),
    ejs = require("ejs");

    app.engine("html", ejs.renderFile);

    app.get("/entry", function(req, res) {
        res.render("admin/entry.ejs");
      });
      
      app.get("/entry/scan", function(req, res) {
        res.render("admin/entry-scan.ejs");
      });
      
      app.get("/entry/search", function(req, res) {
        res.render("admin/entry-search.ejs");
      });
      
      app.get("/entry/manual", function(req, res) {
        res.render("admin/entry-manual.ejs");
      });
      
      app.get("/approve", function(req, res) {
        res.render("admin/approve.ejs");
      });
      
      app.get("/removal", function(req, res) {
        res.render("admin/removal.ejs");
      });
      
      app.get("/preorder", function(req, res) {
        res.render("user/preorder.ejs");
      });
      
      app.get("/cart", function(req, res) {
        res.render("user/cart.ejs");
      });
      
      app.get("/orderconfirm", function(req, res) {
        res.render("user/orderconfirm.ejs");
      });

/*
 * Set up server parsing and logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
   
app.use(morgan(config.logging));

app.use(express.static('./views'));

/*
 *Register routes on api 
 */
app.use("/", require("./controllers/index"));

app.use(ExceptionHandler);

app.get("*", function(req, res) {
    res.redirect("/");
});

module.exports = app;