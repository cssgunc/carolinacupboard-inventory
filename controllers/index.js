let express = require("express"),
    router  = express.Router();

router.use("/scan", require("./scan"));
router.use("/item", require("./item"));

module.exports = router;