module.exports = (sequelize, Sequelize) => {
    const ApiPercent = sequelize.define("apipercent", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        apiId: Sequelize.STRING,
        mobileId: Sequelize.STRING,
        percent: Sequelize.FLOAT,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return ApiPercent
}