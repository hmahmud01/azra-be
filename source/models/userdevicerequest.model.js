module.exports = (sequelize, Sequelize) => {
    const UserDeviceRequest = sequelize.define("userdevicerequest", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        deviceId: Sequelize.STRING,
        updateDevice: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    });

    return UserDeviceRequest;
}