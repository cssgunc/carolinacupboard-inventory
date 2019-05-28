let express = require("express"),
    router  = express.Router(),
    item = require("./item"),
    history = require("./history"),
    entry = require("./entry"),
    scan = require("./scan"),
    admin = require("./admin");

router.use("/items", item);
router.use("/history", history);
router.use("/entry", entry);
router.use("/scan", scan);
router.use("/admin", admin);

module.exports = router;