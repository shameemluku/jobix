var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
const crypto = require('crypto');

module.exports = {


    addUser: (userData) => {


        return new Promise(async(resolve, reject) => {

            let skills = [];
            if (!Array.isArray(userData.skills)) {
                skills.push(userData.skills)
            } else {
                skills = userData.skills
            }

            delete userData.skills;
            userData.status = "ACTIVE";

            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data) => {

                if (data) {
                    db.get().collection(collection.WORKER_COLLECTION).insertOne({
                        'userId': data.insertedId,
                        'skills': skills
                    }).then((response) => {

                        db.get().collection(collection.HIRE_COLLECTION).insertOne({
                            '_id': data.insertedId,
                        }).then((response) => {
                            resolve(response)
                        })

                    })
                }

            }).catch((err) => {
                reject(err)
            })
        })

    },



    userLogin: (userData) => {
        return new Promise(async(resolve, reject) => {

            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userData.email })
            if (user) {

                if (user.status != "BLOCKED") {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            resolve({ status: false, error: "Failed incorrect Password" })
                        }
                    })
                } else {
                    resolve({ status: false, error: "Your account is temporarily blocked." })
                }
            } else {
                resolve({ status: false, error: "Failed, No user found" })
            }
        })
    },



    addHireUser: (userData) => {


        return new Promise(async(resolve, reject) => {

            userData.status = "ACTIVE";
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data) => {

                if (data) {
                    db.get().collection(collection.HIRE_COLLECTION).insertOne({
                        '_id': data.insertedId,
                    }).then((response) => {
                        resolve(response)
                    })
                }

            }).catch((err) => {
                reject(err)
            })
        })

    },

    checkUser: (data) => {
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: data.email })
            if (user) {
                resolve({ status: true, error: "Email already exists" })
            } else {
                let mobileuser = await db.get().collection(collection.USERS_COLLECTION).findOne({ phone: data.phone })
                if (mobileuser) {
                    resolve({ status: true, error: "Mobile already exists" })
                } else { resolve({ status: false }) }
            }
        })
    },

    // Host to worker

    registerHostworker: (id, skills) => {


        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.WORKER_COLLECTION).insertOne({
                userId: objectId(id),
                skills: skills
            }).then((data) => {

                if (data) {
                    resolve(data)
                }

            }).catch((err) => {
                reject(err)
            })
        })

    },


    loadWorkProfile: (id) => {

        return new Promise(async(resolve, reject) => {

            // let workProfile = await db.get().collection(collection.WORKER_COLLECTION).find({userId:objectId(id)}).toArray()      
            // console.log(workProfile.skills); 

            let workProfile = await db.get().collection(collection.WORKER_COLLECTION).aggregate([
                { $match: { userId: objectId(id) } },
                {
                    $lookup: {
                        from: "skills",
                        localField: "skills",
                        foreignField: "code",
                        as: "skillsArray"
                    }
                },
                {
                    $project: {
                        userId: 1,
                        skills: 1,
                        skillsArray: 1,
                        saved: 1,
                        saveCount: { $size: { "$ifNull": ["$saved", []] } }
                    }
                }
            ]).toArray()

            resolve(workProfile)
        })
    },


    loadActiveProjects: (id) => {
        return new Promise(async(resolve, reject) => {

            let projects = await db.get().collection(collection.PROJECTS_COLLECTION).aggregate([
                { $match: { workerId: objectId(id) } }
            ]).toArray()

            resolve(projects)
        })
    },

    // Hire dashboard Load 

    loadHiredProjects: (id) => {
        return new Promise(async(resolve, reject) => {

            let projects = await db.get().collection(collection.PROJECTS_COLLECTION).aggregate([
                { $match: { hostId: objectId(id) } }
            ]).toArray()

            resolve(projects)
        })
    },


    loadSkills: (id) => {

        return new Promise(async(resolve, reject) => {

            let workProfile = await db.get().collection('workprofile').aggregate([{
                    $match: {
                        userId: objectId(id)
                    }
                },
                {
                    $unwind: "$skills"
                },
                {
                    $lookup: {
                        from: "skills",
                        localField: 'skills',
                        foreignField: 'code',
                        as: 'userSkills'
                    }
                }

            ]).toArray()

            // console.log(workProfile)  

            skills = []

            workProfile.forEach(element => {
                skills.push({ 'name': element.userSkills[0].name, 'code': element.userSkills[0].code });
            });

            resolve(skills)

        })
    },




    // Save project

    saveProject: (id, pId) => {

        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.WORKER_COLLECTION).update({ userId: objectId(id) }, {
                $addToSet: {
                    saved: {
                        pId: objectId(pId)
                    }
                }
            }).then((result) => {

                db.get().collection(collection.PROJECTLIST_COLLECTION).update({ _id: objectId(pId) }, {
                    $addToSet: { savedby: { userId: objectId(id) } }
                }).then((result) => {
                    resolve(result)
                })

            })
        })
    },

    //Unsave Project
    unsaveProject: (id, pId) => {

        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.WORKER_COLLECTION).update({ userId: objectId(id) }, { $pull: { 'saved': { 'pId': objectId(pId) } } }).then((result) => {

                db.get().collection(collection.PROJECTLIST_COLLECTION).update({ _id: objectId(pId) }, { $pull: { 'savedby': { 'userId': objectId(id) } } }).then((result) => {
                    resolve(result)
                })


            })
        })
    },


    bid_UserDetails: (id) => {
        return new Promise(async(resolve, reject) => {

            let userDetail = await db.get().collection(collection.WORKER_COLLECTION).aggregate([
                { $match: { userId: objectId(id) } },
                {
                    $lookup: {
                        from: "skills",
                        localField: "skills",
                        foreignField: "code",
                        as: "skillsArray"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userprofile"
                    }
                },

                {
                    $addFields: {
                        "country": { "$arrayElemAt": ["$userprofile.country", 0] },
                        "email": { "$arrayElemAt": ["$userprofile.email", 0] }
                    }
                },

                {
                    $project: {
                        userId: 1,
                        saved: 1,
                        skillsArray: 1,
                        country: 1,
                        email: 1
                    }
                }
            ]).toArray();

            console.log(userDetail[0]);

            resolve(userDetail[0])

        })
    },

    //Removing user from bidding list, work when user get Hired- AUTOMATIC

    removeuserFromBidding: (pId, id) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.PROJECTLIST_COLLECTION).update({ _id: objectId(pId) }, { $pull: { 'bidding': { 'userId': objectId(id) } } }).then((result) => {
                resolve(result)
            })
        })
    },


    removeSaved: (idArray, pId) => {

        console.log("\n\nInside user helper");
        console.log(idArray);

        for (let i = 0; i < idArray.length; i++) {
            idArray[i] = objectId(idArray[i])
        }



        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.WORKER_COLLECTION).updateMany({ userId: { $in: idArray } }, { $pull: { 'saved': { 'pId': objectId(pId) } } }).then((result) => {

                resolve(result)
            })
        })
    },


    bid_projectList: (id) => {


        return new Promise(async(resolve, reject) => {

            let bidList = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([
                { $match: { bidding: { $elemMatch: { userId: objectId(id) } } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "host",
                        foreignField: "_id",
                        as: "userprofile"
                    }
                },

                {
                    $addFields: {
                        "hostname": { "$arrayElemAt": ["$userprofile.name", 0] }
                    }
                },

                {
                    $project: {
                        pheading: 1,
                        pdetails: 1,
                        dueDate: 1,
                        amount: 1,
                        host: 1,
                        hostname: 1,
                        started: 1,
                        bidCount: { $size: { "$ifNull": ["$bidding", []] } },
                    }
                }
            ]).toArray()

            console.log(bidList);

            resolve(bidList);

        })

    },

    // User removing himself from a project bid - Withdrawing

    self_removeBid: (id, pId) => {

        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.PROJECTLIST_COLLECTION).update({ _id: objectId(pId) }, {
                $pull: { 'bidding': { 'userId': objectId(id) } }
            }).then((result) => {
                resolve(true)
            }).catch(() => {
                reject(false)
            })
        })
    },

    //change DP
    changeDpStatus: (id) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).update({ _id: objectId(id) }, { $set: { 'propic': true } })
                .then((result) => {
                    resolve(true)
                }).catch(() => {
                    reject(false)
                })
        })
    },

    removeProPic: (id) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).updateOne({ _id: objectId(id) }, { $set: { 'propic': false } })
                .then((result) => {
                    resolve(true)
                }).catch(() => {
                    reject(false)
                })
        })
    },

    updateUserDetails: (id, details) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION)
                .update({ _id: objectId(id) }, {
                    $set: {
                        'name': details.name,
                        'lname': details.lname,
                        'email': details.email,
                        'phone': details.phone,
                        'country': details.country,
                        'bio': details.bio
                    }
                })
                .then((result) => {

                    db.get().collection(collection.PROJECTS_COLLECTION).bulkWrite(
                        [{
                                updateMany: {
                                    filter: { "workerId": objectId(id) },
                                    update: { $set: { "worker": details.name } }
                                },
                            },
                            {
                                updateMany: {
                                    filter: { "hostId": objectId(id) },
                                    update: { $set: { hostName: details.name } },
                                },
                            },
                        ]).then((res) => {

                        if (res.ok) {
                            db.get().collection(collection.PROJECTLIST_COLLECTION).updateMany({ "bidding.userId": objectId(id) }, {
                                $set: { "bidding.$.username": details.name }
                            }).then(() => {
                                resolve(true)
                            })
                        }
                    })


                }).catch(() => {
                    reject(false)
                })
        })
    },

    updateUserSkills: (id, skills) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.WORKER_COLLECTION).update({ userId: objectId(id) }, { $set: { 'skills': skills } })
                .then((result) => {
                    resolve(true)
                }).catch(() => {
                    reject(false)
                })
        })
    },

    varifyPayment: (details) => {
        return new Promise(async(resolve, reject) => {
            try {

                console.log("here");
                let hmac = crypto.createHmac('sha256', process.env.RAZOR_SECRET)

                console.log(process.env.RAZOR_SECRET);
                console.log(details.payment.razorpay_order_id);
                console.log(details.payment.razorpay_payment_id);
                console.log(details.payment.razorpay_signature);

                hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
                hmac = hmac.digest('hex')
                if (hmac == details.payment.razorpay_signature) {
                    console.log("Resolve");
                    resolve(true)
                } else {
                    console.log("Reject");
                    reject(false)
                }
            } catch (err) {
                console.log(err);
                reject(false)
            }
        })
    },

    addRating: (id, data, user) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.WORKER_COLLECTION).updateOne({ userId: objectId(id) }, {
                    $addToSet: {
                        reviews: {
                            pId: data.pId,
                            rating: parseInt(data.rate),
                            message: data.message,
                            hostId: user._id,
                            hostname: user.name
                        }
                    }
                })
                .then((result) => {
                    resolve(true)
                }).catch(() => {
                    reject(false)
                })
        })
    },

    updateWallet: (id, amount) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).updateOne({ _id: objectId(id) }, { $inc: { wallet: amount } })
                .then((result) => {
                    resolve(true)
                }).catch(() => {
                    reject(false)
                })
        })
    },


    getTransactions: (id) => {
        return new Promise(async(resolve, reject) => {

            let transactions = await db.get().collection(collection.TRANSACTION_COLLECTION).find({
                $or: [{
                        sender: objectId(id)
                    },
                    {
                        receiver: objectId(id)
                    }
                ]
            }).toArray()

            resolve(transactions)
        })
    }

}