var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId

module.exports = {

    login: (data) => {
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: data.email })
            if (user) {
                console.log(user);
                if (user.password === data.password) {
                    resolve({ status: true, user: user })
                } else {
                    resolve({ status: false, error: "Incorrect password" })
                }
            } else {
                resolve({ status: false, error: "No such user found" })
            }
        })
    },


    loadProjectsHome: () => {

        return new Promise(async(resolve, reject) => {
            let projects = await db.get().collection(collection.PROJECTS_COLLECTION).find().limit(10).sort({ "_id": -1 }).toArray()
            if (projects) {
                resolve(projects);
            }
        })
    },

    loadPiedata: () => {

        return new Promise(async(resolve, reject) => {
            let pieData = await db.get().collection(collection.PROJECTS_COLLECTION).aggregate([{
                    $group: {
                        _id: "$status",
                        "count": { $sum: 1 }
                    }
                },
                { $project: { _id: 0, "status": "$_id", count: 1 } }
            ]).toArray()
            if (pieData) {

                count = {};
                pieData.forEach(elem => {
                    if (elem.status == 'ACTIVE') count.activeCount = elem.count
                    else if (elem.status == 'COMPLETED') count.completeCount = elem.count
                    else count.cancelledCount = elem.count
                });
                resolve(count)
            }
        })
    },

    getAllusers: () => {

        return new Promise(async(resolve, reject) => {
            let users = await db.get().collection(collection.USERS_COLLECTION).find({}).toArray()
            if (users) {
                resolve(users)
            }

        })

    },

    blockUser: (id, status) => {

        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.USERS_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    status: status
                }
            }).then((result) => {
                resolve(true)
            })

        })

    },

    loadNumbers: () => {

        return new Promise(async(resolve, reject) => {

            let workerCount = await db.get().collection(collection.WORKER_COLLECTION).count()
            let hireCount = await db.get().collection(collection.HIRE_COLLECTION).count()
            let projectCount = await db.get().collection(collection.PROJECTS_COLLECTION).count()

            let earnings = await db.get().collection(collection.PROJECTS_COLLECTION).aggregate([{
                    $match: {
                        status: "COMPLETED"
                    }
                }, {
                    $addFields: {
                        "total": {
                            $multiply: ["$bidAmount", 0.2]
                        }
                    }
                },
                { $project: { total: 1 } },
                {
                    $group: {
                        _id: "",
                        earning: { $sum: "$total" }
                    }
                }
            ]).toArray()



            let numbers = {
                workerCount: workerCount,
                hireCount: hireCount,
                projectCount: projectCount,
                earnings: earnings[0].earning
            }

            resolve(numbers)

        })
    },

    getPayoutList: (status) => {
        return new Promise(async(resolve, reject) => {

            let payoutList = await db.get().collection(collection.PAYOUT_COLLECTION).find({ status: status }).toArray()

            if (payoutList.length != 0) {
                resolve({ status: true, data: payoutList })
            } else {
                resolve({ status: false })
            }

        })
    },

    completePayout: (id, tId) => {
        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.PAYOUT_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    status: "PAID",
                    tId: objectId(tId)
                }
            }).then((result) => {
                resolve(true)
            })

        })
    },

    getAlltransaction: () => {
        return new Promise(async(resolve, reject) => {
            let transactions = await db.get().collection(collection.TRANSACTION_COLLECTION).find({}).sort({ _id: -1 }).toArray()
            if (transactions) {
                resolve(transactions)
            }

        })
    },


    filterTransaction: (start, end, method) => {

        return new Promise(async(resolve, reject) => {

            if (method === 'ALL') {
                let transactions = await db.get().collection(collection.TRANSACTION_COLLECTION).aggregate([{
                    $match: { date: { $gte: new Date(start), $lt: new Date(end) } }
                }]).toArray()
                if (transactions) {
                    resolve(transactions);
                }
            } else {
                let transactions = await db.get().collection(collection.TRANSACTION_COLLECTION).aggregate([{
                    $match: { method: method, date: { $gte: new Date(start), $lt: new Date(end) } }
                }]).toArray()
                if (transactions) {
                    resolve(transactions);
                }
            }


        })
    },

    loadProjectList: () => {
        return new Promise(async(resolve, reject) => {
            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({}).toArray()
            resolve(projects)
        })
    }

}