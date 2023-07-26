module.exports = (sequelize, Sequelize) => {
    const plantypes = sequelize.define("plantypes", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        type: Sequelize.STRING,
        operator_code: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return plantypes
}
