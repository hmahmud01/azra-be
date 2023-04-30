module.exports = (sequelize, Sequelize) => {
    const Api = sequelize.define("api", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: Sequelize.STRING,
        code: Sequelize.STRING,
        status: Sequelize.BOOLEAN,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return Api
}