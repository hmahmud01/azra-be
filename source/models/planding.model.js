module.exports = (sequelize, Sequelize) => {
    const planding = sequelize.define("planding", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        operator: Sequelize.STRING,
        type: Sequelize.STRING,
        country: Sequelize.STRING,
        skucode: Sequelize.STRING,
        providercode: Sequelize.STRING,
        send_amount: Sequelize.FLOAT,
        send_currency: Sequelize.STRING,
        receive_amount: Sequelize.FLOAT,
        receive_currency: Sequelize.STRING,
        plan_id: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return planding
}