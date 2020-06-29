const should = require('should');

// Checks response body for a match to the fail message on invalid CSV import
let matchResponseText = (res, pattern) => {
    res.text.should.match(pattern);
}

exports.matchResponseText = matchResponseText;