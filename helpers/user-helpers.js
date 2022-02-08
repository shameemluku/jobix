var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')

module.exports={

    addUser:(userData)=>{



        return new Promise(async (resolve,reject)=>{

            let country = userData.country;
            let skills = userData.skills;

            delete userData.country;
            delete userData.skills;

            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                
                if(data){
                    db.get().collection(collection.WORKER_COLLECTION).insertOne({
                        'userId' : data.insertedId,
                        'skills':skills,
                        'country':country
                    }).then((response)=>{
                        resolve(response)
                    })
                }
            
            }).catch((err)=>{
                reject(err)
            })
        })
        
    },

    addWorkUser:(userData)=>{


        return new Promise(async (resolve,reject)=>{

            
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                
                if(data){
                    resolve(data)
                }
            
            }).catch((err)=>{
                reject(err)
            })
        })
        
    },

}