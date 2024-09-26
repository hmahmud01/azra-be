module.exports = (sequelize, Sequelize) => {
    const ApiCountryPrioirty = sequelize.define("apicountrypriority", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiId: Sequelize.STRING,
        countryId: Sequelize.STRING,
        priority: Sequelize.INTEGER,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return ApiCountryPrioirty
}