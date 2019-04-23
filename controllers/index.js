let express = require("express"),
    router  = express.Router(),
    entry = require("./entry"),
    scan = require("./scan"),
    item = require("./item"),
    admin = require("./admin");

router.use("/entry", entry);
router.use("/scan", scan);
router.use("/items", item);
router.use("/admin", admin);

module.exports = router;