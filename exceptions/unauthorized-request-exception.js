const CarolinaCupboardException = require("./carolina-cupboard-exception");

module.exports = class UnauthorizedRequestException extends CarolinaCupboardException {
    constructor(message) {
        super(message,401);
        this.name = this.constructor.name;
    }
}