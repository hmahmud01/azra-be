module.exports = (sequelize, Sequelize) => {
    const AgentTransaction = sequelize.define("agenttransaction", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING,
        transferedAmount: Sequelize.FLOAT,
        dedcutedAmount: Sequelize.FLOAT,
        note: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        transactionId: Sequelize.STRING // Transaction Model UUID
    })
    return AgentTransaction;
}