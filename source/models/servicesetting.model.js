module.exports = (sequelize, Sequelize) => {
    const ServiceSetting = sequelize.define("servicesetting", {
        serviceId: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        serviceTitle: Sequelize.STRING,
        serviceCode: Sequelize.STRING,
        status: Sequelize.BOOLEAN,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return ServiceSetting
}