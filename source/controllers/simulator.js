import e from "express";
import fetch from "node-fetch";

const submitData = async(req, res, next) => {
    console.log(req.body);

    // LIST OF API GET
    let apiList = [
        {id: 1, api: "test", code: "TST", status: false},
        {id: 2, api: "ZOLO", code: "ZLO", status: true},
        {id: 3, api: "Etisalat", code: "ETS", status: true},
    ]

    const activeApi = apiList.filter((data) => {
        return data ? data.status == true : {}
    });

    let mobile = req.body.mobile
    let amount = req.body.amount
    
    console.log(activeApi);
    console.log(parseInt(amount));

    for (let i=0; i<activeApi.length; i++){
        console.log(activeApi[i].code);
        if(activeApi[i].code == "TST"){
            const res = await fetch(
                'http://127.0.0.1:8090/api/collections/testbalance/records'
            );
            const data = await res.json();
            console.log(data);
        }else if(activeApi[i].code == "ETS"){
            const res = await fetch(
                'http://127.0.0.1:8090/api/collections/etisalatbalance/records'
            );
            const data = await res.json();
            console.log(data);  
        }else if(activeApi[i].code == "ZLO"){
            const res = await fetch(
                'http://127.0.0.1:8090/api/collections/zolobalance/records'
            );
            const data = await res.json();
            console.log(data);
        }
    }

    res.status(200).json({
        message: `data got for ${req.body.mobile}`
    })
}

export default {submitData};

