import { hashSync } from "bcrypt";
import { db } from '../utls/db.js';

export function findUserByEmail(email){
    return db.user.findUnique({
        where: {
            email,
        }
    })
}

export function findUserByPhone(phone){
    return db.user.findUnique({
        where: {
            phone
        }
    })
}

export async function createUserByEmailAndPassword(user){
    user.password = hashSync(user.password, 12);
    const dbuser = await db.user.create({
        data: user
    })

    console.log(dbuser)

    const trx = {
        user: {
            connect: {
                id: dbuser.id
            }
        },
        transferedAmount: 0.00,
        deductedAmount: 0.00
    }

    console.log(trx);

    const agentTrx = await db.agentTransaction.create({
        data: trx
    })

    const openingPercent = {
        user: {
            connect: {
                id: dbuser.id
            }
        },
        percentage: 0.10
    }

    const agentPercent = await db.agentPercentage.create({
        data: openingPercent
    })

    console.log(`first trx from ${dbuser.id}`, agentTrx, agentPercent);

    return dbuser;
}

export function findUserById(id){
    return db.user.findUnique({
        where: {
            id,
        }
    })
}

// module.exports = {
//     findUserByEmail,
//     findUserById,
//     createUserByEmailAndPassword
// }