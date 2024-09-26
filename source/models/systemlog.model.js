module.exports = (sequelize, Sequelize) => {
    const SystemLog = sequelize.define("systemlog", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        type: Sequelize.STRING,
        detail: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return SystemLog
}