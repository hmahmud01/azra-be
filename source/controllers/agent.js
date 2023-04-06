import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getAgents = async(req, res, next) => {
    const agents = await prisma.user.findMany({
        where: {
            type: "agent"
        },
        select:{
            id: true,
            uuid: true,
            email: true,
            phone: true,
            store: true,
            createdAt: true,
            updatedAt: true,
            type: true,
            status: true
        }
    })
    
    res.status(200).json({
        message: agents
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


const findId = async(uuid) => {
    const user = await prisma.user.findFirst({
        where: {
            uuid: uuid
        }
    })

    return user.id;
}


const balanceTransfer = async(req, res, next) => {
    console.log("inside balacne")
    let uid = 0
    let amount = req.body.amount
    let id = req.params.id

    console.log(`Id is :${id}`)

    await findId(id).then(res => {uid = res});

    const transfer = await prisma.agentTransaction.create({
        data: {
            user: {
                connect: {
                    id: uid 
                }
            },
            transferedAmount: amount,
            deductedAmount: 0.00
        }
    })
    
    console.log("transfer data, ", transfer);

    const settlement = await prisma.userAmountSettlement.create({
        data: {
            user: {
                connect: {
                    id: uid
                }
            },
            debit: 0.00,
            credit: amount,
            note: "User Credit Data"
        }
    })

    const logmsg = `Amount ${amount} has been transferred to ${uid}'s account`
    const syslog = await prisma.systemLog.create({
        data: {
            type: "Transfer",
            detail: logmsg
        }
    })

    res.status(200).json({
        message: "transfer done",
        data: transfer
    })
}

const settleDebt = async(req, res, next)=> {
    const amount = req.body.amount
    let id = req.params.id
    let uid = 0
    console.log(`Id is :${id}`)

    await findId(id).then(res => {uid = res});

    const settlement = await prisma.userAmountSettlement.create({
        data: {
            user: {
                connect: {
                    id: uid
                }
            },
            debit: amount,
            credit: 0.00,
            note: "User Credit withdrawn"
        }
    })

    const logmsg = `Withdrawal has been made from the user ${id} for the amount of %${amount}`
    const syslog = await prisma.systemLog.create({
        data: {
            type: "Withdrawal",
            detail: logmsg
        }
    })

    res.status(200).json({
        message: "SUCCESS"
    })
}

const assignPercent = async(req, res, next) => {
    let uid = 0;
    const percent = req.body.percent
    let id = req.params.id

    await findId(id).then(res => {uid = res});

    console.log(`Id is :${id}`)

    const percentAssign = await prisma.agentPercentage.update({
        where: {
            userId: uid
        },
        data: {
            percentage: percent
        }
    })
    const logmsg = `Agent Profit has been udpated for ${id} for the amount of ${percent}%`
    const syslog = await prisma.systemLog.create({
        data: {
            type: "AgentProfit",
            detail: logmsg
        }
    })

    res.status(200).json({
        message: "SUCCESS"
    })
}

// remove adjusted amounts
function excludeAmount(balance, keys) {
    for (let key of keys) {
      delete balance[key]
    }
    return balance
}

const transferData = async(req, res, next) => {
    let id = req.params.id

    const data = await prisma.agentTransaction.findMany({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    const dataRe = excludeAmount(data, ['deductedAmount'])

    console.log(`inside data transfer for ${id}`)

    res.status(200).json({
        message: dataRe
    })
}

// remove adjusted amounts
function excludeCredit(withdrawal, keys) {
    for (let key of keys) {
      delete withdrawal[key]
    }
    return withdrawal
}

const withdrawData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await prisma.userAmountSettlement.findMany({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    const dataRe = excludeCredit(data, ['credit'])

    console.log(`inside data withdraw for ${id}`)
    console.log(dataRe)

    res.status(200).json({
        message: dataRe
    })
    
}

const percentData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await prisma.agentPercentage.findMany({
        where: {
            user: {
                uuid: id
            }
        }
    })

    console.log(`inside data percent for ${id}`)
    console.log(data);
    res.status(200).json({
        message: data
    })
}

const allUserList = async(req, res, next) => {
    const data = await prisma.user.findMany();

    res.status(200).json({
        message: data
    })
}

const percTest = async(req, res, next) => {
    const data = await prisma.agentPercentage.findFirst({
        where: {
            userId: 11
        }
    })

    res.status(200).json({
        message: data
    })
}

const orgTest = async(req, res, next) => {
    const data = await prisma.apiPercent.findFirst({
        where: {
            apiId: 2,
            mobileId: 3
        }
    })

    let dummy = []

    const apicreds = await prisma.apiCountryPriority.findMany({
        where: {
            nationId: 1
        },
        include: {
            api: true
        }
    })

    for (let i = 0; i< apicreds.length; i++){
        if(apicreds[i].api.status == true){
            dummy.push(apicreds[i])
        }
    }

    res.status(200).json({
        message: apicreds,
        dummy: dummy
    })


}

const calculateDue = async(id) => {
    let total = 0;
    let debit = 0;
    let credit = 0; 
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    for(let i=0; i<dues.length; i++){
        debit += dues[i].debit
        credit += dues[i].credit
    }

    total = debit-credit

    console.log("remaing: ", total);
    return {total: total};
}

const calculateEarning = async(id) => {
    let total = 0;
    let result = []
    const earning = await prisma.agentEarning.findMany({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    for(let i=0; i<earning.length; i++){
        total += earning[i].amount
    }
    return {earn: total};
}

const calculateSale = async(id) => {
    let total = 0;
    let count = 0;
    const trx = await prisma.transaction.findMany({
        where: {
            doneBy: {
                is: {
                    uuid: id
                }
            }
        }
    })

    for(let i= 0; i<trx.length; i++){
        if(trx[i].rechargeStatus == true){
            total+= trx[i].amount  
            count++  
        }
    }
    return {sale: total, count: count};
}

const calculateBalance = async(id) => {
    let total = 0;
    let transfer = 0;
    let deduct = 0;
    const atrx = await prisma.agentTransaction.findMany({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    for (let i = 0; i<atrx.length; i++){
        transfer += atrx[i].transferedAmount
        deduct += atrx[i].deductedAmount
    }

    total = transfer - deduct

    return {balance: total};
}

const information = async(req, res, next) => {
    let id = req.params.uuid
    let total_trx = 0
    let total_recharged = 0
    let balance = 0
    let debt = 0
    let percent = 0

    console.log(id)
    const percentage = await prisma.agentPercentage.findFirst({
        where: {
            user: {
                is: {
                    uuid: id
                }
            }
        }
    })

    console.log(percentage);

    let dues = await calculateDue(id).then(res => {debt = res.total})
    let totat = await calculateSale(id).then(res => {total_trx = res.sale; total_recharged = res.count})
    let cbalance = await calculateBalance(id).then(res => {balance = res.balance})
    percent = percentage.percentage
    let data = {
        dues: debt,
        total_trx: total_trx,
        total_recharged: total_recharged,
        balance: balance,
        percent: percent
    }

    res.status(200).json({
        message: data
    })
}

const adjustments = async(req, res, next) => {
    let id = req.params.id
    const adjustments = await prisma.transactionAdjustments.findMany({
        include: {
            trx: true
        }
    })

    console.log(adjustments);

    const adjustedVal = adjustments.filter((data) => {
        return data ? data.trx.userId == parseInt(id) : {}
    });

    console.log(adjustedVal);

    res.status(200).json({
        message: adjustedVal
    })
}


const trxRefund = async(req, res, next) => {
    let tid = req.body.tid
    let note = req.body.note
    const transaction = await prisma.transaction.update({
        where: {
            id: tid
        },
        data: {
            rechargeStatus: false
        }
    })

    const trxProfit = await prisma.organizationEarned.findFirst({
        where: {
            transactionId: tid
        }
    })

    const adjustment = await prisma.transactionAdjustments.create({
        data: {
            adjusted_profit: trxProfit.cutAmount,
            trx: {
                connect:{
                    id: tid
                }
            },
            refund_note: note
        }
    })

    const agentBalanceUpdate = await prisma.agentTransaction.create({
        data: {
            user: {
                connect: {
                    id: transaction.userId
                }
            },
            transferedAmount: transaction.amount,
            deductedAmount: 0.00,
            note: `Transaction has been refunded for trx no ${transaction.id} - Refund trx id - ${adjustment.id}`,
            trx: {
                connect: {
                    id: transaction.id
                }
            }
        }
    })

    const percent = await prisma.agentPercentage.findFirst({
        where: {
            userId: transaction.userId
        }
    })

    let profitadjustment = transaction.amount * percent.percentage / 100
    const earningadjustment = await prisma.agentEarning.create({
        data: {
            agent: {
                connect: {
                    id: transaction.userId
                }
            },
            amount: -(profitadjustment),
            trx: {
                connect: {
                    id: transaction.id
                }
            }
        }
    })

    // TODO
    // CREATE A SYSTEM LOG HERE

    const logmsg = `TRX-${tid} has been refunded for manual refund status`
    const syslog = await prisma.systemLog.create({
        data: {
            type: "Refund",
            detail: logmsg
        }
    })

    res.status(200).json({
        message: `Refund for ${tid}`,
        trxProfit: trxProfit,
        trx: transaction,
        adjustment: adjustment,
        agentBalanceUpdate: agentBalanceUpdate,
        earningadjustment: earningadjustment
    })
}

export default {getAgents, getAgent, updateAgent, addAgent, deleteAgent, balanceTransfer, settleDebt, assignPercent, transferData, withdrawData, percentData, allUserList, percTest, orgTest, information, adjustments, trxRefund};