const CarolinaCupboardException = require("./carolina-cupboard-exception");

module.exports = class BadRequestException extends CarolinaCupboardException {
    constructor(message) {
        super(message,400);
        this.name = this.constructor.name;
    }
}