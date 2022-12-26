const getDealers = async(req, res, next) => {
    let result = [
        {id: 1, name: "Mr. Y", mobile: "01XXXXXX00", area: "Location"},
        {id: 2, name: "Mr. Z", mobile: "01XXXXXXXX", area: "Location"},
    ]

    res.status(200).json({
        message: result
    })
}

const getDealer = async(req, res, next) => {
    let result = {id: 2, name: "Mr. Z", mobile: "01XXXXXXXX", area: "Location"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateDealer = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteDealer = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addDealer = async(req, res, next) => {
    let name = req.body.name
    let phone = req.body.mobile
    let area = req.body.area

    console.log(`dealer : ${name} and phone : ${phone}`)
    res.status(200).json({
        message: "adding data" 
    })
}

export default {getDealers, getDealer, updateDealer, addDealer, deleteDealer};