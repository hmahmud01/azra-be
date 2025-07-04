module.exports = (sequelize, Sequelize) => {
    const Mobile = sequelize.define("mobile", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: Sequelize.STRING,
        countryId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Mobile
}