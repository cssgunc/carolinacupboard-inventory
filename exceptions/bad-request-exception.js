const CarolinaCupboardException = require("./carolina-cupboard-exception");

module.exports = class BadRequestException extends CarolinaCupboardException {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}