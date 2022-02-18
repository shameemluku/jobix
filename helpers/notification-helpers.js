var db=require('../config/connection')
var collection=require('../config/collections')
const req = require('express/lib/request')
var objectId=require('mongodb').ObjectId

module.exports={
    sendNotification:(id,message,url)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne(
                {
                    recieveId:objectId(id),
                    message:message,
                    url:url,
                    read:false
                }
            ).then((result)=>{
                resolve(result.insertedId.toString())
            })
        })
    },

    getNotification:(id)=>{
        return new Promise(async (resolve,reject)=>{
            let notification=await db.get().collection(collection.NOTIFICATION_COLLECTION).find({recieveId:objectId(id),read:false}).toArray()
            resolve(notification);
        })
    },

    setNotiRead:(id)=>{
        console.log("\n\n\n\nHEREEEEEEEEE\n\n"+id+"\n\n");
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.NOTIFICATION_COLLECTION).updateMany({recieveId:objectId(id)},{$set:{read:true}}).then((data)=>{
                resolve(data)
            })
        })
    }

}