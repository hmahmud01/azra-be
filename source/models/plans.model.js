module.exports = (sequelize, Sequelize) => {
    const plans = sequelize.define("plans", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiProviderId: Sequelize.STRING,
        operatorCode: Sequelize.STRING,
        countryId: Sequelize.STRING,
        circle_code: Sequelize.STRING,
        rechargeType: Sequelize.STRING,
        amount: Sequelize.FLOAT,
        daylimit: Sequelize.INTEGER,
        credit_amount: Sequelize.STRING,
        cerdit_currency: Sequelize.STRING,
        debit_amount: Sequelize.STRING,
        debit_currency: Sequelize.STRING,
        validity: Sequelize.INTEGER,
        narration: Sequelize.STRING,
        is_range: Sequelize.BOOLEAN, 
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return plans
}
