let express     = require("express"),
    router      = express.Router(),
    admin       = require("./admin"),
    entry       = require("./entry"),
    history     = require("./history"),
    item        = require("./items"),
    preorders   = require("./preorders"),
    scan        = require("./scan");
    
router.use("/admin", admin);
router.use("/entry", entry);
router.use("/history", history);
router.use("/items", item);
router.use("/preorders", preorders);
router.use("/scan", scan);

module.exports = router;