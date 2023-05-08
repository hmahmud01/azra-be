// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const db = require("../models")
const User = db.user;
const AgentTransaction = db.agenttransaction;
const UserAmountSettlement = db.useramountsettlement;
const SystemLog = db.systemlog;
const AgentPercentage = db.agentpercentage;
const ApiPercent = db.apipercent;
const ApiCountryPriority = db.apicountrypriority;
const AgentEarning = db.agentearning;
const Transaction = db.transaction;
const TransactionAdjustments =db.transactionadjustments;
const OrganizationEarned = db.organizationearned;

exports.getAgents = async(req, res, next) => {
    // const agents = await User.findAll({
    //     where: {
    //         type: "agent"
    //     },
    //     select:{
    //         id: true,
    //         uuid: true,
    //         email: true,
    //         phone: true,
    //         store: true,
    //         createdAt: true,
    //         updatedAt: true,
    //         type: true,
    //         status: true
    //     }
    // })

    const agents = await User.findAll({
        where: {
            usertype: "agent"
        }
    })

    console.log(agents);
    
    res.status(200).json({
        message: agents
    })
}

exports.getAgent = async(req, res, next) => {
    let result = {id: 2, name: "Mr. Z", manager: "Mr. X", area: "Location"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

exports.updateAgent = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

exports.deleteAgent = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

exports.addAgent = async(req, res, next) => {
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
    const user = await User.findOne({
        where: {
            uuid: uuid
        }
    })

    return user.id;
}


exports.balanceTransfer = async(req, res, next) => {
    console.log("inside balacne")
    let uid = 0
    let amount = req.body.amount
    let id = req.params.id

    console.log(`Id is :${id}`)

    await findId(id).then(res => {uid = res});

    const transfer = await AgentTransaction.create({
        userId: id,
        transferedAmount: amount,
        dedcutedAmount: 0.00
    })
    
    console.log("transfer data, ", transfer);

    const settlement = await UserAmountSettlement.create({
        userId: id,
        debit: 0.00,
        credit: amount,
        note: "User Credit Data"
    })

    const logmsg = `Amount ${amount} has been transferred to ${id}'s account`
    const syslog = await SystemLog.create({
        type: "Transfer",
        detail: logmsg
    })

    res.status(200).json({
        message: "transfer done",
        data: transfer
    })
}

exports.settleDebt = async(req, res, next)=> {
    const amount = req.body.amount
    let id = req.params.id
    let uid = 0
    console.log(`Id is :${id}`)

    await findId(id).then(res => {uid = res});

    const settlement = await UserAmountSettlement.create({
        userId: id,
        debit: amount,
        credit: 0.00,
        note: "User Credit withdrawn"
    })

    const logmsg = `Withdrawal has been made from the user ${id} for the amount of %${amount}`
    const syslog = await SystemLog.create({
        type: "Withdrawal",
        detail: logmsg
    })

    res.status(200).json({
        message: "SUCCESS"
    })
}

exports.assignPercent = async(req, res, next) => {
    let uid = 0;
    const percent = req.body.percent
    let id = req.params.id

    await findId(id).then(res => {uid = res});

    console.log(`Id is :${id}`)

    const percentAssign = await AgentPercentage.update(
        {
            percentage: percent
        },
        {
            where: {
                userId: id
            }
        }
        
    )
    const logmsg = `Agent Profit has been udpated for ${id} for the amount of ${percent}%`
    const syslog = await SystemLog.create({
        type: "AgentProfit",
        detail: logmsg
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

exports.transferData = async(req, res, next) => {
    let id = req.params.id

    const data = await AgentTransaction.findAll({
        where: {
            userId: id
        }
    })

    const dataRe = excludeAmount(data, ['dedcutedAmount'])

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

exports.withdrawData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await UserAmountSettlement.findAll({
        where: {
            userId: id
        }
    })

    const dataRe = excludeCredit(data, ['credit'])

    console.log(`inside data withdraw for ${id}`)
    console.log(dataRe)

    res.status(200).json({
        message: dataRe
    })
    
}

exports.percentData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await AgentPercentage.findAll({
        where: {
            userId: id
        }
    })

    console.log(`inside data percent for ${id}`)
    console.log(data);
    res.status(200).json({
        message: data
    })
}

exports.allUserList = async(req, res, next) => {
    const data = await User.findAll();

    res.status(200).json({
        message: data
    })
}

exports.percTest = async(req, res, next) => {
    const data = await AgentPercentage.findFirst({
        where: {
            userId: 11
        }
    })

    res.status(200).json({
        message: data
    })
}

exports.orgTest = async(req, res, next) => {
    const data = await ApiPercent.findFirst({
        where: {
            apiId: 2,
            mobileId: 3
        }
    })

    let dummy = []

    const apicreds = await ApiCountryPriority.findAll({
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
    const dues = await UserAmountSettlement.findAll({
        where: {
            userId: id
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
    const earning = await AgentEarning.findAll({
        where: {
            userId: id
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
    const trx = await Transaction.findAll({
        where: {
            userId: id
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
    const atrx = await AgentTransaction.findAll({
        where: {
            userId: id
        }
    })

    console.log(atrx)

    for (let i = 0; i<atrx.length; i++){
        transfer += atrx[i].transferedAmount
        deduct += atrx[i].dedcutedAmount
    }

    total = transfer - deduct

    return {balance: total};
}

exports.information = async(req, res, next) => {
    let id = req.params.uuid
    let total_trx = 0
    let total_recharged = 0
    let balance = 0
    let debt = 0
    let percent = 0

    console.log(id)
    const percentage = await AgentPercentage.findOne({
        where: {
            userId: id
        }
    })

    console.log(percentage);

    await calculateDue(id).then(res => {debt = res.total})
    await calculateSale(id).then(res => {total_trx = res.sale; total_recharged = res.count})
    await calculateBalance(id).then(res => {balance = res.balance})
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

exports.adjustments = async(req, res, next) => {
    let id = req.params.id
    const adjustments = await TransactionAdjustments.findAll()

    console.log(adjustments);

    const adjustedVal = adjustments.filter((data) => {
        return data ? data.trx.userId == parseInt(id) : {}
    });

    console.log(adjustedVal);

    res.status(200).json({
        message: adjustedVal
    })
}


exports.trxRefund = async(req, res, next) => {
    let tid = req.body.tid
    let note = req.body.note
    const transaction = await Transaction.update(
        {
            rechargeStatus: false
        },
        {
            where: {
                uuid: tid
            },
        }
    )

    const trx = await Transaction.findOne({
        where: {
            uuid: tid
        }
    })

    console.log("RECHARGE STATUS TO : FALSE")

    const trxProfit = await OrganizationEarned.findOne({
        where: {
            transactionId: tid
        }
    })

    const adjustment = await TransactionAdjustments.create({
        adjusted_profit: trxProfit.cutAmount,
        transactionId: trx.uuid,
        refund_note: note
    })

    console.log("TRX ADJUSTMENTS CREATED ", adjustment);

    const agentBalanceUpdate = await AgentTransaction.create({
        userId: trx.userId,
        transferedAmount: trx.amount,
        dedcutedAmount: 0.00,
        note: `Transaction has been refunded for trx no ${transaction.id} - Refund trx id - ${adjustment.id}`,
        transactionId: transaction.uuid
    })


    console.log("Agent Balance Updated ", agentBalanceUpdate);

    console.log(trx)
    console.log(trx.userId)

    const percent = await AgentPercentage.findOne({
        where: {
            userId: trx.userId
        }
    })

    let profitadjustment = transaction.amount * percent.percentage / 100
    const prevEarned = await AgentEarning.findOne({
        where: {
            trxId: trx.uuid
        }
    })

    console.log(prevEarned);

    const earnedData = {
        userId: trx.userId,
        amount: -(prevEarned.amount),
        trxId: trx.uuid
    }

    console.log("EARNING ADJUSTMENTS DT : ", earnedData);
    
    const earningadjustment = await AgentEarning.create(earnedData)

    console.log("Agent Earning Adjusted ", earningadjustment);

    // TODO
    // CREATE A SYSTEM LOG HERE

    const logmsg = `TRX-${tid} has been refunded for manual refund status`
    const syslog = await SystemLog.create({
        type: "Refund",
        detail: logmsg
    })

    console.log(syslog)
    console.log("REFUND SUCCESS")

    res.status(200).json({
        message: `Refund for ${tid}`,
        trxProfit: trxProfit,
        trx: transaction,
        adjustment: adjustment,
        agentBalanceUpdate: agentBalanceUpdate,
        earningadjustment: earningadjustment
    })
}

// export default {getAgents, getAgent, updateAgent, addAgent, deleteAgent, balanceTransfer, settleDebt, assignPercent, transferData, withdrawData, percentData, allUserList, percTest, orgTest, information, adjustments, trxRefund};