module.exports = (sequelize, Sequelize) => {
    const TransactionResponse = sequelize.define("transactionresponse", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        response : Sequelize.STRING,
        status: Sequelize.BOOLEAN,
        transactionId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return TransactionResponse
}