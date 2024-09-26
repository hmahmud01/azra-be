module.exports = (sequelize, Sequelize) => {
    const TransactionSource = sequelize.define("transactionsource", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        ip_addr : Sequelize.STRING,
        device: Sequelize.STRING,
        transactionId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return TransactionSource
}