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
    // user.password = hashSync(user.password, 12);

    const data = {
        email: user.email,
        phone: user.phone,
        password: hashSync(user.password, 12),
        type: user.type
    }

    const profile = {}

    console.log("user value : ",user);
    const dbuser = await db.user.create({
        data: data
    })

    console.log(dbuser)

    if(user.type == 'agent'){
        const agent = await db.agentProfile.create({
            data:  {
                f_name: user.fname,
                l_name: user.lname,
                age: parseInt(user.age),
                email: user.email,
                role: user.type,
                phone: user.phone,
                address: user.address,
                user: {
                    connect: {
                        id: dbuser.id
                    }
                },
                subDealerRef: {
                    connect: {
                        id: user.ref
                    }
                }
            }
        })
        console.log("agent date : ", agent);
    }else if(user.type == 'dealer'){
        const dealer = await db.dealerProfile.create({
            data:  {
                f_name: user.fname,
                l_name: user.lname,
                age: parseInt(user.age),
                email: user.email,
                role: user.type,
                phone: user.phone,
                address: user.address,
                user: {
                    connect: {
                        id: dbuser.id
                    }
                }
            }
        })
        console.log("dealer date : ", dealer);
    }else if(user.type == 'subdealer'){
        const subdealer = await db.subDealerProfile.create({
            data:  {
                f_name: user.fname,
                l_name: user.lname,
                age: parseInt(user.age),
                email: user.email,
                role: user.type,
                phone: user.phone,
                address: user.address,
                user: {
                    connect: {
                        id: dbuser.id
                    }
                },
                dealerRef: {
                    connect: {
                        id: user.ref
                    }
                }
            }
        })
        console.log("subdealer date : ", subdealer);
    }

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