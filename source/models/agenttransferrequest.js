module.exports = (sequelize, Sequelize) => {
    const AgentTransferRequest = sequelize.define("agenttransferrequest", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        customer_name: Sequelize.STRING,
        provider_name: Sequelize.STRING,
        prefix: Sequelize.STRING,
        voucher_no: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: Sequelize.STRING,
        requested_amount: Sequelize.STRING,
        transfer_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        narration: Sequelize.STRING,
        ui_voucher_date: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        voucher_date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })
    return AgentTransferRequest;
}