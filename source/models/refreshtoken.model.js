module.exports = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("refreshtoken", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        hashedToken: Sequelize.STRING,
        revoked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        userId: Sequelize.STRING, // USER ID
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    });
    return RefreshToken;
}