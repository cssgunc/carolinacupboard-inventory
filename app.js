let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    morgan      = require("morgan"),
    config      = require("./config/server"),
    ejs         = require("ejs"),
    authService = require("./services/authorization-service");

app.engine("html", ejs.renderFile);

if (process.env.NODE_ENV === 'prod') {
    app.set('trust proxy', 1);
}

/*
 * Set up server parsing and logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
   
app.use(morgan(config.logging));

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

module.exports = app;