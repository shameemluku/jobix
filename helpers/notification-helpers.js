var db = require('../config/connection')
var collection = require('../config/collections')
const req = require('express/lib/request')
const { ObjectId } = require('mongodb')
const collections = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    sendNotification: (id, message, url) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne({
                recieveId: [objectId(id)],
                message: message,
                url: url,
                read: false
            }).then((result) => {
                resolve(result.insertedId.toString())
            })
        })
    },

    getNotification: (id) => {
        return new Promise(async(resolve, reject) => {
            let notification = await db.get().collection(collection.NOTIFICATION_COLLECTION).find({ recieveId: { $in: [objectId(id)] }, read: false }).toArray()
            resolve(notification);
        })
    },

    setNotiRead: (id) => {
        console.log("\n\n\n\nHEREEEEEEEEE\n\n" + id + "\n\n");
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.NOTIFICATION_COLLECTION).updateMany({ recieveId: { $in: [objectId(id)] } }, { $set: { read: true } }).then((data) => {
                resolve(data)
            })
        })
    },


    sendBidFailNotificaton: (bidusers, message, url) => {

        for (let i = 0; i < bidusers.length; i++) {
            bidusers[i] = objectId(bidusers[i])
        }


        return new Promise((resolve, reject) => {
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne({
                recieveId: bidusers,
                message: message,
                url: url,
                read: false
            }).then((result) => {
                resolve(result.insertedId.toString())
            })
        })

    },

    getRequestCount: (id) => {
        return new Promise(async(resolve, reject) => {
            let count = await db.get().collection(collections.REQUEST_COLLECTION).find({ userId: objectId(id), read: false }).count()
            resolve(count)
        })
    }

}