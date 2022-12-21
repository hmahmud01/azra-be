const getServices = async(req, res, next) => {
    let result = [
        {id: 1, service: "TopUp", mno: "GP"},
        {id: 2, service: "DataLoad", mno: "BanglaLink"}
    ]

    res.status(200).json({
        message: result
    })
}

const listService = async(req, res, next) => {
    let result = [
        {id: 1, name: "TopUp", network: 1},
        {id: 2, name: "DataLoad", network: 2},
        {id: 3, name: "FlexiLoad", network: 1},
    ]

    res.status(200).json({
        message: result
    })
}

const getService = async(req, res, next) => {
    let result = {id:1, service: "TopUp", mno: "Gp"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateService = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteService = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addService = async(req, res, next) => {
    let service = req.body.service
    let mno = req.body.mno

    console.log(`service : ${service} and mno : ${mno}`)
    res.status(200).json({
        message: "adding data" 
    })
}

export default {getServices, listService, getService, updateService, addService, deleteService};