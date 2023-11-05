module.exports = (sequelize, Sequelize) => {
    const UserProfile = sequelize.define("userprofile", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        f_name: Sequelize.STRING,
        l_name: Sequelize.STRING,
        age: Sequelize.INTEGER,
        email: Sequelize.STRING,
        role: Sequelize.STRING,
        phone: Sequelize.STRING,
        address: Sequelize.STRING,
        userId: Sequelize.STRING, // User UUID
        connectedUser: Sequelize.STRING, // SUPER USER ID
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    });

    return UserProfile;
}