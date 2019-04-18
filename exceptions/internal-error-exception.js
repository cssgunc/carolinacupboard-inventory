const CarolinaCupboardException = require("./carolina-cupboard-exception");

module.exports = class InternalErrorException extends CarolinaCupboardException {
    constructor(message, e) {
        super(message);
        this.name = this.constructor.name;
        this.e = e;
    }
}