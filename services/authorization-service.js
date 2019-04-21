const   User = require("../db/sequelize").users,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");


exports.createUser = async function(onyen, type) {
    try {
        if(User.findOne({ where: {onyen : onyen } })) {
            return;
        }
        let user = await User.build({
            onyen: onyen,
            type: type
        });
        await user.save();
    } catch (e) {
        if (e instanceof Sequelize.ValidationError) {
            let errorMessage = "The following values are invalid:";
            e.errors.forEach((error) => {
                errorMessage += `\n${error.path}: ${error.message}`;
            });
            throw new BadRequestException(errorMessage);
        }
        throw new InternalErrorException("A problem occurred when saving the user",e);
    }
}

exports.getUserType = async function (onyen) {
    try {
        let user = await User.findOne({ where: { onyen: onyen } });
        if (!user) {
            return "user"
        }
        return user.type;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }

        throw new InternalErrorException("A problem occurred when retrieving the item",e);
    }
}

exports.changeUserType = async function(onyen, type) {
    try {
        User.update(
            { type: type },
            { where: { onyen: onyen } }
        );
    } catch (e) {
        if (e instanceof Sequelize.ValidationError) {
            let errorMessage = "The following values are invalid:";
            e.errors.forEach((error) => {
                errorMessage += `\n${error.path}: ${error.message}`;
            });
            throw new BadRequestException(errorMessage);
        }
        throw new InternalErrorException("A problem occurred when saving the user",e);
    }
}

exports.deleteUser = async function(onyen) {
    try {
        User.destroy(
            { where: { onyen: onyen } }
        );
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }

        throw new InternalErrorException("A problem occurred when saving the user",e);
    }
}