var db=require('../config/connection')
var collection=require('../config/collections')
const req = require('express/lib/request')
var objectId=require('mongodb').ObjectId

module.exports={
    sendNotification:(id,message,url)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne(
                {
                    recieveId:id,
                    message:message,
                    url:url,
                    read:false
                }
            ).then((result)=>{
                resolve(result.insertedId.toString())
            })
        })
    }
}