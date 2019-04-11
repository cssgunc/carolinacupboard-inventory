let express = require("express"),
    router  = express.Router(),
    scan = require("./scan"),
    item = require("./item");

router.use("/scan", scan);
router.use("/items", item);

module.exports = router;