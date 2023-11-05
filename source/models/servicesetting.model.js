module.exports = (sequelize, Sequelize) => {
    const ServiceSetting = sequelize.define("servicesetting", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        serviceId: Sequelize.STRING,
        serviceCode: Sequelize.STRING,
        callingCode: Sequelize.STRING,
        max_length: Sequelize.INTEGER,
        api_code: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        regex: Sequelize.STRING,
        denominationStep: Sequelize.INTEGER,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return ServiceSetting
}