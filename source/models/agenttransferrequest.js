module.exports = (sequelize, Sequelize) => {
    const AgentTransferRequest = sequelize.define("agenttransferrequest", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        customer_name: Sequelize.STRING,
        provider_name: Sequelize.STRING,
        prefix: Sequelize.STRING,
        voucher_no: Sequelize.STRING,
        status: Sequelize.STRING,
        requested_amount: Sequelize.STRING,
        narration: Sequelize.STRING,
        voucher_date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return AgentTransferRequest;
}