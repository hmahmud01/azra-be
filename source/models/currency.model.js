module.exports = (sequelize, Sequelize) => {
    const currency = sequelize.define("currency", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        title: Sequelize.STRING,
        credit_currency: Sequelize.STRING,
        debit_currency: Sequelize.STRING,
        conversionValue: Sequelize.FLOAT,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return currency
}