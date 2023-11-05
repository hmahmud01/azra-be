module.exports = (sequelize, Sequelize) => {
    const OrganizationEarned = sequelize.define("organizationearned", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiId: Sequelize.STRING,
        transactionId: Sequelize.STRING,
        cutAmount: Sequelize.FLOAT,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return OrganizationEarned
}