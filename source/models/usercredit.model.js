module.exports = (sequelize, Sequelize) => {
    const UserCredit = sequelize.define("usercredit", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: Sequelize.STRING, 
        credit: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        credit_limit: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        max_credit: {
            type:Sequelize.FLOAT,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    })

    return UserCredit
}