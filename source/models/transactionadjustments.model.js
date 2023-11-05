module.exports = (sequelize, Sequelize) => {
    const TransactionAdjustments = sequelize.define("transactionadjustments", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        adjusted_profit : Sequelize.FLOAT,
        refund_note: Sequelize.STRING,
        transactionId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return TransactionAdjustments
}