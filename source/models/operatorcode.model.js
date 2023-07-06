module.exports = (sequelize, Sequelize) => {
    const OperatorId = sequelize.define("operatorid", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiProviderId: Sequelize.STRING, //API id
        countryId: Sequelize.STRING,
        mobileId: Sequelize.STRING,
        operatorShort: Sequelize.STRING,
        operatorCode: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return OperatorId
}