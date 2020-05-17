const   User = require("../db/sequelize").users,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");


exports.createUser = async function(onyen, type) {
    try {
        if(await User.count({ where: {onyen : onyen } }) > 0) {
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

exports.countAllAdmins = async function () {
    try {
        let users = await User.count({
            where: {type: "admin"}
        });
        return users;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving users",e);
    }
}

exports.getAllUsers = async function () {
    try {
        let users = await User.findAll();
        return users;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving all users",e);
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
        throw new InternalErrorException("A problem occurred when editting the user",e);
    }
}

exports.deleteUser = async function(onyen) {
    if(onyen !== "PREORDER") {
        try {
            User.destroy(
                { where: { onyen: onyen } }
            );
        } catch (e) {
            if(e instanceof CarolinaCupboardException) {
                throw e;
            }

            throw new InternalErrorException("A problem occurred when deleting the user",e);
        }
    }
}

exports.deleteAllUsers = async function() {
    try {
        await User.destroy({
            where: {},
            truncate: false
        });
        this.createUser(process.env.DEFAULT_ADMIN, "admin");
        this.createUser("PREORDER", "admin");
    } catch(e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        
        throw e;
    }
}