module.exports = (sequelize, Sequelize) => {
    const pins = sequelize.define("pins", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        pin: Sequelize.STRING,
        operator_code: Sequelize.STRING,
        status: Sequelize.BOOLEAN,
        api: Sequelize.STRING,
        customer: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return pins
}
