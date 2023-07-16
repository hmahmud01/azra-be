module.exports = (sequelize, Sequelize) => {
    const currency = sequelize.define("currency", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        countryId: Sequelize.STRING,
        aedConversionValue: Sequelize.FLOAT,
        nationalCurrency: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return currency
}