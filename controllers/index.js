let express = require("express"),
    router  = express.Router();

router.use("/scan", require("./scan"));
router.use("/items", require("./item"));

module.exports = router;