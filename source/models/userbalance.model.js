module.exports = (sequelize, Sequelize) => {
    const UserBalance = sequelize.define("userbalance", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        balance: Sequelize.FLOAT,
        previousBalance: Sequelize.FLOAT,
        agentTrxId: Sequelize.STRING, //AgentTransaction Model
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })
    return UserBalance
}