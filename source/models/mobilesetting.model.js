module.exports = (sequelize, Sequelize) => {
    const MobileSetting = sequelize.define("mobilesetting", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        logo: Sequelize.STRING,
        mobileId: Sequelize.STRING,
        serviceCode: Sequelize.STRING,
        callingCode: Sequelize.STRING,
        startsWith: Sequelize.STRING,
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

    return MobileSetting
}