import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const dealer = async(req, res, next) => {
    const dealers = await prisma.user.findMany({
        where: {
            type: "dealer"
        }
    })

    res.status(200).json({
        message: dealers
    })
}

const dealerSubDealerReport = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    console.log(uid);
    const sdprofile = await prisma.dealerProfile.findFirst({
        where: {
            user: {
                id: uid
            }
        }
    })

    const sds = await prisma.subDealerProfile.findMany({
        where: {
            dealerProfileId: sdprofile.id
        }
    })


    for (let i =0; i<sds.length; i++){
        console.log(sds[i].userId);
    }


    console.log("agent for subd")
    res.status(200).json({
        message: sds
    })
}

const dealersubDealerAgentReport = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    console.log(uid);
    const sdprofile = await prisma.subDealerProfile.findFirst({
        where: {
            user: {
                id: uid
            }
        }
    })

    const agents = await prisma.agentProfile.findMany({
        where: {
            subDealerProfileId: sdprofile.id
        }
    })


    for (let i =0; i<agents.length; i++){
        console.log(agents[i].userId);
    }


    console.log("agent for subd")
    res.status(200).json({
        message: agents
    })  
}

export default { dealer, dealerSubDealerReport, dealersubDealerAgentReport }