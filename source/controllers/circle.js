const getCircles = async( req, res, next ) => {
    let result = [
        {id: 1, name: "National", ctry: "BD",},
        {id: 2, name: "International", ctry: "IND"}
    ]

    return res.status(200).json({
        message : result
    })
}

const getCircle = async(req, res, next) => {
    let id = req.params.id;
    console.log(id);
    let result = {id: 1, name: "National", city: "BD"}

    return res.status(200).json({
        message: result
    })
}

const updateCircle = async(req, res, next) => {
    return res.status(200).json({
        message: `updating the id for ${req.params.id}`
    })
}

const deleteCircle = async(req, res, next) => {
    let id = req.params.id;
    let msg = `Deleting id ${id}`

    return res.status(200).json({
        message: msg
    })
}

const addCircle = async(req, res, next) => {
    let name = req.body.name
    let ctry = req.body.country

    console.log("name : ", name, "ctry : ", ctry)
    let response = "creating the data";

    return res.status(200).json({
        message: response
    })
}

export default { getCircles, getCircle, updateCircle, deleteCircle, addCircle };