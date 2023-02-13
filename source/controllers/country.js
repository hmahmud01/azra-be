import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getCountries = async(req, res, next) => {
    let countries = await prisma.nation.findMany();
    console.log(countries);

    return res.status(200).json({
        message: countries
    })
}

const listCountry = async(req, res, next) => {
    let result = [
        {id: 1, api: 2, apiList: [1,2], name: "Bangladesh", checked: true},
        {id: 2, api: 2, apiList: [1,3], name: "India", checked: true},
        {id: 3, api: 1, apiList: [2,3], name: "Pakistan", checked: true}
    ]

    let api_ctry = [
        {id: 1, api: 1, name: "Bangladesh", checked: false},
        {id: 2, api: 2, name: "India", checked: true},
        {id: 3, api: 3, name: "Pakistan", checked: false}
    ]

    let ctry_api = [
        {id: 1, ctry: 1, api:1, pri: 2},
        {id: 2, ctry: 1, api:2, pri: 1},
        {id: 3, ctry: 2, api:2, pri: 5},
    ]

    // result = await prisma.nation.findMany();

    return res.status(200).json({
        message: result
    })
}

const getCountry = async(req, res, next) => {
    let id = req.params.id;
    console.log(id);

    let result = {id:1, name: "Bangladesh", short:"BD"}
    result = await prisma.country.findFirst({
        where:{
            id: id
        }
    });
    console.log(result);
    return res.status(200).json({
        message: result
    })
}

const updateCountry = async(req, res, next) => {
    return res.status(200).json({
        message: "update"
    })
}

const deleteCountry = async(req, res, next) => {
    let id = req.params.id;
    let msg = "Deleting id";

    return res.status(200).json({
        message: msg
    })
}

const addCountry = async(req, res, next) => {
    let name = req.body.name
    let short = req.body.short
    let code = req.body.code

    console.log("name : ", name, "short : ", short);
    let data = {
        name: name,
        short: short,
        code: code
    }
    const country = await prisma.nation.create({ data: data });
    console.log(country);
    let response = `creating the data ${country}`;

    return res.status(200).json({
        message: response
    })
}

export default { getCountries, listCountry, getCountry, updateCountry, deleteCountry, addCountry };