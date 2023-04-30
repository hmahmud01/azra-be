module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        email: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        password : {
            type: Sequelize.STRING
        },
        store: {
            type: Sequelize.STRING,
            allowNull: true
        },
        usertype: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return User;
}