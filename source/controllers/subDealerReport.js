// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import calculator from './agentReportCalculators.js';

const db = require("../models");


exports.subDealers = async(req, res, next) => {
    const subdealers = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })

    res.status(200).json({
        message: subdealers
    })
}

exports.subDealerAgentReport = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    console.log(uid);
    // const sdprofile = await prisma.subDealerProfile.findFirst({
    //     where: {
    //         user: {
    //             id: uid
    //         }
    //     }
    // })

    // const agents = await prisma.agentProfile.findMany({
    //     where: {
    //         subDealerProfileId: sdprofile.id
    //     }
    // })


    // for (let i =0; i<agents.length; i++){
    //     console.log(agents[i].userId);
    // }

    const agents = await db.userprofile.findAll({
        where: {
            connectedUserId: uid
        }
    })

    console.log(agents);

    console.log("agent for subd")
    res.status(200).json({
        message: agents
    })  
}

// export default {subDealers, subDealerAgentReport}