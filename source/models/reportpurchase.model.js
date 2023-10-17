module.exports = (sequelize, Sequelize) => {
    const Purchase = sequelize.define("purchase", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        telco: Sequelize.STRING,
        dist: Sequelize.STRING,
        purchase: Sequelize.FLOAT,
        payable: Sequelize.FLOAT,
        commission: Sequelize.FLOAT,
        entrydate: Sequelize.STRING,
        locale: Sequelize.STRING,
        conv: Sequelize.FLOAT,
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Purchase
}