import { hashSync } from "bcrypt";
import { db } from '../utls/db.js';

export function findUserByEmail(email){
    return db.user.findUnique({
        where: {
            email,
        }
    })
}

export function createUserByEmailAndPassword(user){
    user.password = hashSync(user.password, 12);
    return db.user.create({
        data: user
    })
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