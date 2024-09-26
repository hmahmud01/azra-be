module.exports = (sequelize, Sequelize) => {
    const UserAmountSettlement = sequelize.define("useramountsettlement", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING, // Agent User
        debit: Sequelize.FLOAT,
        credit: Sequelize.FLOAT,
        note: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return UserAmountSettlement;
}