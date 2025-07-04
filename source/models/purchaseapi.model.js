module.exports = (sequelize, Sequelize) => {
    const PurchaseApi = sequelize.define("purchaseapi", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        api: Sequelize.STRING,
        purchase: Sequelize.FLOAT,
        amountpurchased: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        payable: Sequelize.FLOAT,
        entrydate: Sequelize.STRING,
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return PurchaseApi
}