const   User = require("../db/sequelize").users,
        Visitor = require("../db/sequelize").visitors,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception"),
        initAdmin = require("../db/db-util").initAdmin,
        csvParser = require("csv-parse");


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
        await User.update(
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

// Takes a CSV file and appends it to the Users table
exports.appendCsvUsers = async function (data) {
    // wrapping everything in a Promise, so we can return exceptions from the csvParser callback
    // this will allow the caller to tell when the Users table creation fails
    return new Promise((resolve, reject) => {
        try {
            csvParser(data.data, 
                {
                    delimiter: ',', 
                    endLine: '\n', 
                    escapeChar: '"', 
                    enclosedChar: '"'
                }, 
                function(err, output) {
                    if (err) {
                        throw new InternalErrorException("A problem occurred when parsing CSV data");
                    }
                    let newUsers = [];
                    for(let i = 0; i < output.length; i++) {
                        let entry = output[i];
                        if (i === 0 && entry[0] === "onyen" && entry[1] === "type") continue; // skip optional headers
                        try {
                            let user = {
                                onyen: entry[0],
                                type: entry[1]
                            }
                            newUsers.push(user);
                        } catch (e) {
                            console.error(e);
                            reject(e);
                        }
                    }

                    User.bulkCreate(newUsers,
                        {
                            updateOnDuplicate: ["type"]
                        }
                    ).then(function(result) {
                        resolve(result);
                    }).catch(function(e) {
                        console.error(e);
                        reject(e);
                    });
                }
            );
        } catch(e) {
            console.error(e);
            reject(e);
        }
    });
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
        initAdmin(false);
    } catch(e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        
        throw e;
    }
}