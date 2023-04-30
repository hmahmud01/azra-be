module.exports = (sequelize, Sequelize) => {
    const Country = sequelize.define("country", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: Sequelize.STRING,
        short: Sequelize.STRING,
        code: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Country
}