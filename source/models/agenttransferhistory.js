module.exports = (sequelize, Sequelize) => {
    const AgentTransferHistory = sequelize.define("agenttransferhistory", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        transferId: Sequelize.STRING,
        from: Sequelize.STRING,
        to: Sequelize.STRING,
        transferredToUserType: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        transactionId: Sequelize.STRING // Transaction Model UUID
    })
    return AgentTransferHistory;
}