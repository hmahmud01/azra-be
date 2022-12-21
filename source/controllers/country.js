const getCountries = async(req, res, next) => {
    let result = [
        {id: 1, name: "Bangladesh", short: "BD", code: "+880"},
        {id: 2, name: "India", short: "IND", code: "+980"},
        {id: 3, name: "Pakistan", short: "PAK", code: "+330"},
    ]

    return res.status(200).json({
        message: result
    })
}

const listCountry = async(req, res, next) => {
    let result = [
        {id: 1, name: "Bangladesh"},
        {id: 2, name: "India"},
        {id: 3, name: "Pakistan"}
    ]

    return res.status(200).json({
        message: result
    })
}

const getCountry = async(req, res, next) => {
    let id = req.params.id;
    console.log(id);
    let result = {id:1, name: "Bangladesh", short:"BD"}
    
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

    console.log("name : ", name, "short : ", short);
    let response = "creating the data";

    return res.status(200).json({
        message: response
    })
}

export default { getCountries, listCountry, getCountry, updateCountry, deleteCountry, addCountry };