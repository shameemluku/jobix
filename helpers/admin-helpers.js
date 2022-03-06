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

            let numbers = {
                workerCount: workerCount,
                hireCount: hireCount,
                projectCount: projectCount
            }

            resolve(numbers)

        })
    }
}