module.exports = (sequelize, Sequelize) => {
    const ApiTransaction = sequelize.define("apitransaction", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiId: Sequelize.STRING,
        transactionId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return ApiTransaction
}