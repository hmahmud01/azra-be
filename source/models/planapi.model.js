module.exports = (sequelize, Sequelize) => {
    const planapi = sequelize.define("planapi", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        plan_id: Sequelize.STRING,
        api: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return planapi
}