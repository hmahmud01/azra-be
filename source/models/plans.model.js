module.exports = (sequelize, Sequelize) => {
    const plans = sequelize.define("plans", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiProviderId: Sequelize.STRING,
        operatoratorCode: Sequelize.STRING,
        countryId: Sequelize.STRING,
        rechargeType: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })
}