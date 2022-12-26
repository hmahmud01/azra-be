const getSubDealers = async(req, res, next) => {
    let result = [
        {id: 1, name: "Mr. Y", mobile: "01XXXXXX00", area: "Location"},
        {id: 2, name: "Mr. Z", mobile: "01XXXXXXXX", area: "Location"},
    ]

    res.status(200).json({
        message: result
    })
}

const getSubDealer = async(req, res, next) => {
    let result = {id: 2, name: "Mr. Z", mobile: "01XXXXXXXX", area: "Location"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateSubDealer = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteSubDealer = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addSubDealer = async(req, res, next) => {
    let name = req.body.name
    let phone = req.body.mobile
    let area = req.body.area

    console.log(`subdealer : ${name} and phone : ${phone}`)
    res.status(200).json({
        message: "adding data" 
    })
}

export default {getSubDealers, getSubDealer, updateSubDealer, addSubDealer, deleteSubDealer};