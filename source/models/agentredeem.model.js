module.exports = (sequelize, Sequelize) => {
    const AgentRedeem = sequelize.define("agentredeem", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING,
        redeemamount: Sequelize.FLOAT,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return AgentRedeem
}