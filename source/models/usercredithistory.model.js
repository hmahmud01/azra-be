module.exports = (sequelize, Sequelize) => {
    const AgentTransferHistory = sequelize.define("agenttransferhistory", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        transferhistoryId: Sequelize.STRING,
        credit_amount: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return AgentTransferHistory;
}