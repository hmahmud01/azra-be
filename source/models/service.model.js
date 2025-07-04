module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define("service", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: Sequelize.STRING,
        mobileId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Service
}