let express = require("express"),
    router  = express.Router();

router.use("/scan", require("./scan"));

module.exports = router;