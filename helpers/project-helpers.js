const db = require('../config/connection')
const collection = require('../config/collections')
const req = require('express/lib/request')
const notiHelpers = require('../helpers/notification-helpers')
const async = require('hbs/lib/async')
const objectId = require('mongodb').ObjectId

module.exports = {

    getSkills: () => {
        return new Promise(async(resolve, reject) => {
            let skills = await db.get().collection(collection.SKILLS_COLLECTION).find().toArray()
            resolve(skills)

        })
    },


    addProject: (projectDetails) => {

        projectDetails.amount = parseFloat(projectDetails.amount);
        projectDetails.started = false;
        projectDetails.bidding = [];
        let ext = projectDetails.ext;
        projectDetails.host = objectId(projectDetails.host)
        delete projectDetails.ext;
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PROJECTLIST_COLLECTION).insertOne(projectDetails).then((result) => {
                resolve(result.insertedId.toString())
            })
        })
    },

    getUserBasedPro: (skillArray, id) => {




        return new Promise(async(resolve, reject) => {


            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match: { 'skills': { $in: [...skillArray] }, 'host': { $ne: objectId(id) }, started: false }
                },
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
                        pdetails: 1,
                        pheading: 1,
                        bidding: 1,
                        host: 1,
                        amount: 1,
                        dueDate: 1,
                        skills: 1,
                        skillsArray: 1,
                        bidCount: { $size: { "$ifNull": ["$bidding", []] } },
                        savedby: 1
                    }
                }

            ]).toArray()




            let temp = []
            project.forEach(element => {

                let skillsArray = element.skillsArray
                skillsArray.forEach(item => {
                    temp.push(item.name)
                })

                element.skillsName = temp;
                temp = []
            });

            project.forEach(element => {

                if (Array.isArray(element.savedby)) {
                    element.savedby.forEach(i => {
                        if (i.userId.toString() == id) {
                            element.saved = true;
                        }
                    })
                }
            })

            resolve(project)

        })
    },


    getFilteredPro: (skillArray, amount, id) => {

        //checking single value from query. If true make it as an array for Lookup $in


        if (amount == 1) {
            amount = { $gte: 0 }
        } else if (amount == 2) {
            amount = { $lt: 500 }
        } else if (amount == 3) {
            amount = { $gte: 500, $lt: 1000 }
        } else if (amount == 4) {
            amount = { $gte: 1000, $lt: 5000 }
        } else if (amount == 5) {
            amount = { $gte: 5000 }
        }


        return new Promise(async(resolve, reject) => {


            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{

                    $match: {
                        'skills': { $in: [...skillArray] },
                        'amount': amount,
                        'host': { $ne: objectId(id) },
                        started: false
                    }
                },
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
                        pdetails: 1,
                        pheading: 1,
                        bidding: 1,
                        host: 1,
                        amount: 1,
                        dueDate: 1,
                        skills: 1,
                        skillsArray: 1,
                        bidCount: { $size: { "$ifNull": ["$bidding", []] } },
                        savedby: 1
                    }
                }
            ]).toArray()


            let temp = []
            project.forEach(element => {

                let skillsArray = element.skillsArray
                skillsArray.forEach(item => {
                    temp.push(item.name)
                })

                element.skillsName = temp;
                temp = []
            });

            project.forEach(element => {

                if (Array.isArray(element.savedby)) {
                    element.savedby.forEach(i => {
                        if (i.userId.toString() == id) {
                            element.saved = true;
                        }
                    })
                }
            })

            resolve(project)

        })
    },


    getProjectDetails: (id, userId) => {


        return new Promise(async(resolve, reject) => {

            try {
                let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                        $match: { _id: objectId(id) }
                    },
                    { $lookup: { from: "users", localField: "host", foreignField: "_id", as: "host" } },
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
                            pdetails: 1,
                            pheading: 1,
                            bidding: 1,
                            host: 1,
                            amount: 1,
                            dueDate: 1,
                            skills: 1,
                            skillsArray: 1,
                            savedby: 1,
                            bidCount: { $size: { "$ifNull": ["$bidding", []] } }
                        }
                    }
                ]).toArray()

                if (!Array.isArray(projectDetail[0].savedby)) {
                    projectDetail[0].savedby = [];
                }

                projectDetail[0].savedby.forEach(i => {
                    if (i.userId.toString() == userId) {
                        projectDetail[0].saved = true;
                    }
                })


                resolve(projectDetail[0])
            } catch (err) {

            } finally {
                reject()
            }

        })
    },

    getAllSkills: () => {
        return new Promise(async(resolve, reject) => {
            let skills = db.get().collection(collection.SKILLS_COLLECTION).find().toArray()
            resolve(skills)
        })
    },

    getAddedProjects: (id) => {

        return new Promise(async(resolve, reject) => {

            // let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({'host':objectId(id)}).sort({_id:-1}).toArray()
            // resolve(projects)

            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([
                { $match: { 'host': objectId(id) } },
                {
                    $project: {
                        pdetails: 1,
                        pheading: 1,
                        bidding: 1,
                        amount: 1,
                        dueDate: 1,
                        skills: 1,
                        saveCount: { $size: { "$ifNull": ["$savedby", []] } },
                        bidCount: { $size: { "$ifNull": ["$bidding", []] } }
                    }
                }
            ]).toArray()
            resolve(projects)
        })

    },

    checkProposal: (pId, id) => {



        return new Promise(async(resolve, reject) => {

            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({ _id: objectId(pId), 'bidding.userId': objectId(id) }).toArray()





            if (projects.length === 0) {

                resolve(false)
            } else {

                resolve(true)
            }




        })
    },

    sendProposal: (pId, id, name, message, amount) => {

        amount = parseFloat(amount);

        return new Promise(async(resolve, reject) => {

            db.get().collection(collection.PROJECTLIST_COLLECTION).update({ _id: objectId(pId) }, {
                $addToSet: {
                    bidding: {
                        userId: objectId(id),
                        username: name,
                        message: message,
                        amount: amount
                    }
                }
            }).then((result) => {
                resolve(result)
            })

        })

    },


    bidDetails: (id, userId) => {

        return new Promise(async(resolve, reject) => {


            try {

                let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({ _id: objectId(id), host: objectId(userId) }).toArray();


                if (project[0].hasOwnProperty('bidding')) {
                    if (project[0].bidding.length != 0) {

                        let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                                $match: { _id: objectId(id), host: objectId(userId) }
                            },
                            // {$lookup:{from:"users",localField:"host",foreignField:"_id",as:"host"}},


                            {
                                $lookup: {
                                    from: "skills",
                                    localField: "skills",
                                    foreignField: "code",
                                    as: "skillsArray"
                                }
                            },

                            {
                                $unwind: {
                                    path: '$bidding',
                                    preserveNullAndEmptyArrays: true,
                                }
                            },

                            {
                                $lookup: {
                                    from: "workprofile",
                                    localField: "bidding.userId",
                                    foreignField: "userId",
                                    as: "bidWorkProfile"
                                }
                            },
                            {
                                $unwind: '$bidWorkProfile',
                            },
                            {
                                $addFields: {
                                    'bidding.skills': '$bidWorkProfile.skills',
                                    'bidding.workId': '$bidWorkProfile._id',
                                    'bidding.reviews': '$bidWorkProfile.reviews',
                                    "bidding.rating": {
                                        $sum: "$bidWorkProfile.reviews.rating"
                                    },
                                    //More will be added here, eg Rating
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id',
                                    pheading: {
                                        $first: '$pheading'
                                    },
                                    pdetails: {
                                        $first: '$pdetails'
                                    },
                                    bidding: {
                                        $push: '$bidding'
                                    },
                                    skillsArray: {
                                        $first: "$skillsArray"
                                    },
                                    dueDate: {
                                        $first: "$dueDate"
                                    },
                                    amount: {
                                        $first: "$amount"
                                    }
                                }
                            },
                            { "$addFields": { "bidCount": { $size: { "$ifNull": ["$bidding", []] } } } }

                        ]).toArray()



                        if (projectDetail[0].hasOwnProperty('bidding')) {

                            let bidding = projectDetail[0].bidding;
                            for (let i = 0; i < bidding.length; i++) {
                                if (bidding[i].reviews) {
                                    projectDetail[0].bidding[i].average = bidding[i].rating / bidding.length
                                } else {
                                    projectDetail[0].bidding[i].average = 0;
                                }
                            }
                        }

                        resolve(projectDetail[0])

<<<<<<< Updated upstream
                console.log(projectDetails);

                let bidding = projectDetail[0].bidding;
                for (let i = 0; i < bidding.length; i++) {
                    if (bidding[i].reviews) {
                        projectDetail[0].bidding[i].average = bidding[i].rating / bidding.length
=======
>>>>>>> Stashed changes
                    } else {

                        let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                                $match: { _id: objectId(id), host: objectId(userId) }
                            },
                            // {$lookup:{from:"users",localField:"host",foreignField:"_id",as:"host"}},


                            {
                                $lookup: {
                                    from: "skills",
                                    localField: "skills",
                                    foreignField: "code",
                                    as: "skillsArray"
                                }
                            },

                            { "$addFields": { "bidCount": { $size: { "$ifNull": ["$bidding", []] } } } }


                        ]).toArray()

                        resolve(projectDetail[0])

                    }
                }





                // if (Array.isArray(projectDetail[0].bidding)) {
                //     for (let i = 0; i < projectDetail[0].bidding.length; i++) {
                //         projectDetail[0].bidding[i] = Object.assign({}, projectDetail[0].bidding[i], projectDetail[0].bidWorkProfile[i])
                //         
                //     }

                //     delete projectDetail[0].bidWorkProfile;
                // }

                // 
                // //


            } catch (err) {


            } finally {
                reject("Not accessible")
            }

        })

    },

    hireUser: (projectDetails, hostname) => {

        projectDetails._id = objectId(projectDetails._id)
        projectDetails.workerId = objectId(projectDetails.workerId)
        projectDetails.hostId = objectId(projectDetails.hostId)

        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.PROJECTS_COLLECTION).insertOne(projectDetails).then((result) => {

                if (result.acknowledged) {

                    db.get().collection(collection.PROJECTLIST_COLLECTION).updateMany({ _id: projectDetails._id }, { $set: { started: true } }).then((update_result) => {
                        if (update_result.acknowledged) {

                            //Acknowledge Hired user

                            message = "CONGRATULATIONS!!\n" + hostname + " hired you on his project";
                            url = '#';

                            notiHelpers.sendNotification(projectDetails.workerId.toString(), message, url).then((result) => {

                                resolve(true)
                            })

                            //////

                        }
                    })

                } else {

                }
            })
        })
    },


    loadActiveDetails: (id, wId) => {

        return new Promise(async(resolve, reject) => {
            let projectDetail = await db.get().collection(collection.PROJECTS_COLLECTION).find({
                _id: objectId(id),
                workerId: objectId(wId)
            }).toArray()

            if (projectDetail[0]) {
                if (!projectDetail[0].hasOwnProperty('messages')) {
                    projectDetail[0].messages = []
                }
                resolve(projectDetail[0])
            } else {
                reject("Not accessible")
            }


        })
    },

    load_HostActiveDetails: (id, wId) => {

        return new Promise(async(resolve, reject) => {
            let projectDetail = await db.get().collection(collection.PROJECTS_COLLECTION).find({
                _id: objectId(id),
                hostId: objectId(wId)
            }).toArray()

            if (projectDetail[0]) {
                if (!projectDetail[0].hasOwnProperty('messages')) {
                    projectDetail[0].messages = []
                }
                resolve(projectDetail[0])
            } else {
                reject("Not accessible")
            }


        })
    },



    projectDetailsforCheckout: (id, wId) => {

        return new Promise(async(resolve, reject) => {
            let projectDetail = await db.get().collection(collection.PROJECTS_COLLECTION).aggregate([{
                    $match: { _id: objectId(id), hostId: objectId(wId) }

                },
                {
                    $lookup: {
                        from: "users",
                        localField: "workerId",
                        foreignField: "_id",
                        as: "workerDetails"
                    }
                },
                {
                    $project: {
                        messages: 0,
                        bidding: 0,
                        workfiles: 0
                    }
                }

            ]).toArray()

            resolve(projectDetail[0])

        })
    },


    sendMessage: (id, message) => {

        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.PROJECTS_COLLECTION).updateOne({ _id: objectId(id) }, { $push: { messages: message } }).then((result) => {
                resolve(true)
            })

        })
    },


    uploadProjectFiles: async(files, id) => {


        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.PROJECTS_COLLECTION).updateOne({ _id: objectId(id) }, {
                $push: {
                    "workfiles": {
                        $each: files
                    }
                }
            }).then((result) => {
                resolve(true)
            })

        })
    },

    loadProjectFiles: (id) => {
        return new Promise(async(resolve, reject) => {

            let projectFiles = await db.get().collection(collection.PROJECTS_COLLECTION)
                .aggregate([{ $match: { _id: objectId(id) } }, { $unwind: '$workfiles' }, { $sort: { "workfiles.id": -1 } }, { $project: { workfiles: 1 } }]).toArray()


            resolve(projectFiles)

        })
    },

    extendDate: (pId, date) => {
        return new Promise(async(resolve, reject) => {

            await db.get().collection(collection.PROJECTS_COLLECTION).updateOne({ _id: objectId(pId) }, {
                $set: {
                    dueDate: date
                }
            }).then((result) => {
                resolve(true)
            })

        })
    },

    createTransaction: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRANSACTION_COLLECTION).insertOne(data).then((result) => {
                resolve({ status: true, tId: result.insertedId.toString() })
            })
        })
    },


    completeProject: (pId, tId) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.PROJECTS_COLLECTION).updateOne({ _id: objectId(pId) }, {
                    $set: {
                        status: "COMPLETED",
                        tId: objectId(tId)
                    }
                }).then((result) => {
                    resolve(true)
                })
                .catch((err) => {
                    reject(false)
                })
        })
    },

    getFreelancers: (skills, rating, id) => {
        return new Promise(async(resolve, reject) => {

            let workers = await db.get().collection(collection.WORKER_COLLECTION).aggregate([{
                    $match: {
                        skills: { $in: skills },
                        userId: { $ne: objectId(id) }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                { $unwind: '$userData' },
                {
                    $addFields: {
                        'name': '$userData.name',
                        'email': '$userData.email',
                        'phone': '$userData.phone',
                        "rating": {
                            $avg: "$reviews.rating"
                        },
                    }
                },
                {
                    $project: {
                        userId: 1,
                        skills: 1,
                        name: 1,
                        email: 1,
                        phone: 1,
                        "rating": {
                            $cond: {
                                if: { $eq: ["$rating", null] },
                                then: 0,
                                else: "$rating"
                            }
                        }
                    }
                },
                {
                    $match: {
                        rating: { $gte: rating }
                    }
                }
            ]).toArray()

            for (let i = 0; i < workers.length; i++) {

                workers[i].rating = (workers[i].rating).toFixed(2)
                workers[i].rating = parseFloat(workers[i].rating);

            }
            resolve(workers)
        })
    },

    sendRequest: (data) => {
        data.amount = parseFloat(data.amount)
        data.read = false;
        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.REQUEST_COLLECTION).insertOne(data).then((result) => {
                if (result) {

                    resolve(true)
                }
            })
        })
    },

    acceptProjectRequest: (id, user) => {
        return new Promise(async(resolve, reject) => {
            let data = await db.get().collection(collection.REQUEST_COLLECTION).aggregate([
                { $match: { _id: objectId(id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "hostId",
                        foreignField: "_id",
                        as: "hostDetails"
                    }
                },
                {
                    $addFields: {
                        "hostname": { "$arrayElemAt": ["$hostDetails.name", 0] },
                        "hostemail": { "$arrayElemAt": ["$hostDetails.email", 0] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        pheading: 1,
                        pdetails: 1,
                        dueDate: 1,
                        amount: 1,
                        hostId: 1,
                        read: 1,
                        hostname: 1,
                        hostemail: 1
                    }
                }
            ]).toArray()

            data[0].worker = user.name;
            data[0].workerId = objectId(user._id);
            data[0].orgiAmount = parseFloat(data[0].amount);
            data[0].bidAmount = parseFloat(data[0].amount);
            data[0].hostName = data[0].hostname;
            data[0].status = "ACTIVE";
            data[0].messages = [];

            delete data[0].read;
            delete data[0].userId;
            delete data[0].hostname;
            delete data[0].amount

            await db.get().collection(collection.PROJECTS_COLLECTION).insertOne(data[0]).then((response) => {
                resolve(data)
            })

        })
    },


    search: () => {
        return new Promise(async(resolve, reject) => {
            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "host",
                        foreignField: "_id",
                        as: "hostDetails"
                    }
                },

                {
                    $addFields: {
                        "hostname": { "$arrayElemAt": ["$hostDetails.name", 0] }
                    }

                },
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
                        pheading: 1,
                        pdetails: 1,
                        amount: 1,
                        hostname: 1,
                        skillsArray: 1
                    }
                }
            ]).toArray()


            for (let i = 0; i < projects.length; i++) {
                projects[i].skills = []
                if (Array.isArray(projects[i].skillsArray)) {
                    projects[i].skillsArray.forEach(elem => {
                        projects[i].skills.push(elem.name)
                    })
                } else {
                    projects[i].skills.push(projects[i].skillsArray)
                    delete projects[i].skillsArray;
                }

            }


            resolve(projects)

        })
    }

}