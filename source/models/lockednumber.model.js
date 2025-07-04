module.exports = (sequelize, Sequelize) => {
    const LockedNumber = sequelize.define("lockednumber", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        phone: Sequelize.STRING,
        status: Sequelize.BOOLEAN,
        trx_id: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return LockedNumber
}