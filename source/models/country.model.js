module.exports = (sequelize, Sequelize) => {
    const Country = sequelize.define("country", {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: Sequelize.STRING,
        short: Sequelize.STRING,
        code: Sequelize.STRING,
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    })

    return Country
}

// let data = {
//     name: network[j].name,
//     group: "recharge",
//     category: "mobile",
//     type: "operator",
//     logo: setting.logo,
//     service_code: setting.serviceCode,
//     calling_code: [
//         setting.callingCode,
//     ],
//     settings: {
//         code: setting.serviceCode,
//         regex: setting.regex,
//         max_length: setting.max_length,
//         data: []
//     },
//     config: {
//         code: setting.api_code,
//         regex: setting.regex,
//         denomination_step: setting.denominationStep
//     },
//     country_code: countries[i].short,
//     data : [
//         countries[i].name,
//         countries[i].name,
//         countries[i].short,
//         setting.callingCode,
//     ]
// }