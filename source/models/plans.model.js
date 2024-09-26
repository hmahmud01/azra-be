module.exports = (sequelize, Sequelize) => {
    const plans = sequelize.define("plans", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        operator_code: Sequelize.STRING,
        circle_code: Sequelize.STRING,
        rechargeType: Sequelize.STRING,
        credit_amount: Sequelize.STRING,
        credit_currency: Sequelize.STRING,
        debit_amount: Sequelize.STRING,
        debit_currency: Sequelize.STRING,
        validity: Sequelize.INTEGER,
        narration: Sequelize.STRING,
        is_range: Sequelize.BOOLEAN, 
        api_plan_id: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return plans
}
