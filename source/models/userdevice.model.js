module.exports = (sequelize, Sequelize) => {
    const UserDevice = sequelize.define("userdevice", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        currentDevice: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        prevDevice: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        userId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    });

    return UserDevice;
}