module.exports = (sequelize, Sequelize) => {
    const AgentPercentage = sequelize.define("agentpercentage", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING, // Agent User
        percentage: Sequelize.FLOAT,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return AgentPercentage
}