module.exports = (sequelize, Sequelize) => {
    const Sales = sequelize.define("sales", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        balance: Sequelize.FLOAT,
        amount: Sequelize.FLOAT,
        agent: Sequelize.STRING,
        number: Sequelize.STRING,
        operator: Sequelize.STRING,
        api: Sequelize.STRING,
        profit: Sequelize.FLOAT,
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Sales
}