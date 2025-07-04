module.exports = (sequelize, Sequelize) => {
    const AgentCommission = sequelize.define("agentcommission", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        agent: Sequelize.STRING,
        operator: Sequelize.STRING,
        commission: Sequelize.FLOAT,
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return AgentCommission
}