import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import calculator from './agentReportCalculators.js';


const subDealers = async(req, res, next) => {
    const subdealers = await prisma.user.findMany({
        where: {
            type: "subdealer"
        }
    })

    res.status(200).json({
        message: subdealers
    })
}

const subDealerAgentReport = async(req, res, next) => {
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

    const agents = await prisma.userProfile.findMany({
        where: {
            connectedUserId: uid
        },
        include: {
            user: true
        }
    })

    console.log(agents);

    console.log("agent for subd")
    res.status(200).json({
        message: agents
    })  
}

export default {subDealers, subDealerAgentReport}