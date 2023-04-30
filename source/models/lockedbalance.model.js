module.exports = (sequelize, Sequelize) => {
    const LockedBalance = sequelize.define("lockedbalance", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING, // Agent ID
        amountLocked: Sequelize.FLOAT,
        api_trx_id: Sequelize.STRING, // Transaction with api reference
        lockedStatus: Sequelize.BOOLEAN,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return LockedBalance
}