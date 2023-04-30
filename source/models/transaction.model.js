module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("transaction", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        phone : Sequelize.STRING,
        amount : Sequelize.FLOAT,
        agent: Sequelize.STRING,
        userId: Sequelize.STRING, // agent user id by whome transaction is done
        rechargeStatus: Sequelize.BOOLEAN,
        countryId: Sequelize.STRING,
        mobileId: Sequelize.STRING,
        serviceId: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return Transaction
}