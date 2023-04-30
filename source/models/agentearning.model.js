module.exports = (sequelize, Sequelize) => {
    const AgentEarning = sequelize.define("agentearning", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING, // Agent User Ids
        amount: Sequelize.FLOAT,
        trxId : Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return AgentEarning
}