import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orgReport = async(req, res, next) => {
    let result = await prisma.organizationEarned.findMany({
        include: {
            trx: true,
            api: true
        }
    });
    res.status(200).json({
        message: result
    })
}

export default {orgReport};