module.exports = (sequelize, Sequelize) => {
    const TransactionRecordApi = sequelize.define("transactionrecordapi", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        status : Sequelize.BOOLEAN,
        statement: Sequelize.STRING,
        apiTransactionId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return TransactionRecordApi
}