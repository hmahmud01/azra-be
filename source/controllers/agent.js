const getAgents = async(req, res, next) => {
    let result = [
        {id: 1, name: "Mr. Y", manager: "Mr. X", area: "Location"},
        {id: 2, name: "Mr. Z", manager: "Mr. X", area: "Location"},
    ]

    res.status(200).json({
        message: result
    })
}

const getAgent = async(req, res, next) => {
    let result = {id: 2, name: "Mr. Z", manager: "Mr. X", area: "Location"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateAgent = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteAgent = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addAgent = async(req, res, next) => {
    let name = req.body.name
    let phone = req.body.phone
    let manger = req.body.manager
    let area = req.body.city

    console.log(`agent : ${name} and phone : ${phone}`)
    res.status(200).json({
        message: "adding data" 
    })
}

export default {getAgents, getAgent, updateAgent, addAgent, deleteAgent};