var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId

module.exports={


    addUser:(userData)=>{


        return new Promise(async (resolve,reject)=>{

            let skills = [];
            if(!Array.isArray(userData.skills)){
                skills.push(userData.skills)
            }else{
                skills = userData.skills
            }
            
            delete userData.skills;

            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                
                if(data){
                    db.get().collection(collection.WORKER_COLLECTION).insertOne({
                        'userId' : data.insertedId,
                        'skills':skills
                    }).then((response)=>{
                        resolve(response)
                    })
                }
            
            }).catch((err)=>{
                reject(err)
            })
        })
        
    },



    userLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{

            let loginStatus=false
            let response={}

            let user=await db.get().collection(collection.USERS_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                    }
                    else{
                        resolve({status:false , error:"Failed incorrect Password"})
                    }
                })
            }else{
                resolve({status:false , error:"Failed, No user found"})
            }
        })
    },



    addHireUser:(userData)=>{


        return new Promise(async (resolve,reject)=>{

            
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                
                if(data){
                    db.get().collection(collection.HIRE_COLLECTION).insertOne({
                        '_id' : data.insertedId,
                    }).then((response)=>{
                        resolve(response)
                    })
                }
            
            }).catch((err)=>{
                reject(err)
            })
        })
        
    },

    checkUser:(data)=>{
        return new Promise(async (resolve,reject)=>{
            let user=await db.get().collection(collection.USERS_COLLECTION).findOne({email:data.email})
            if(user){
                resolve({status:true,error:"Email already exists"})
            }
            else{
                let mobileuser=await db.get().collection(collection.USERS_COLLECTION).findOne({phone:data.phone})
                if(mobileuser) {
                    resolve({status:true,error:"Mobile already exists"})
                } 
                else{ resolve({status:false}) }
            }
        })
    },

    // Host to worker

    registerHostworker:(id,skills)=>{

  
        return new Promise(async (resolve,reject)=>{
            db.get().collection(collection.WORKER_COLLECTION).insertOne({
                userId:objectId(id),
                skills:skills
            }).then((data)=>{
                
                if(data){
                    resolve(data)
                }
            
            }).catch((err)=>{
                reject(err)
            })
        })

    },


    loadWorkProfile:(id)=>{
        
        return new Promise(async(resolve,reject)=>{

            // let workProfile = await db.get().collection(collection.WORKER_COLLECTION).find({userId:objectId(id)}).toArray()      
            // console.log(workProfile.skills); 

            let workProfile = await db.get().collection(collection.WORKER_COLLECTION).aggregate([
                {$match:{userId:objectId(id)}},
                {$project:{
                    userId:1,
                    skills:1,saved:1,
                    saveCount:{$size:{"$ifNull":["$saved",[]]}}
                }}
            ]).toArray()
            
            console.log(workProfile);
            resolve(workProfile)           
        })   
    },


    loadSkills:(id)=>{

        return new Promise(async(resolve,reject)=>{

            let workProfile = await db.get().collection('workprofile').aggregate([
                {
                    $match:{
                        userId:objectId(id)
                    }
                },
                {
                    $unwind:"$skills"
                },
                {
                    $lookup:{
                        from:"skills",
                        localField: 'skills',
                        foreignField: 'code',
                        as: 'userSkills'
                    }
                }

            ]).toArray()  
                 
            // console.log(workProfile)  

            skills = []
            
            workProfile.forEach(element => {
                skills.push({'name':element.userSkills[0].name , 'code':element.userSkills[0].code} );
            });

            resolve(skills)
        
        }) 
    },

    // Save project

    saveProject:(id,pId)=>{
        
        return new Promise(async(resolve,reject)=>{

            await db.get().collection(collection.WORKER_COLLECTION).update(
                {userId:objectId(id)},
                {$addToSet:{saved:
                    {
                        pId:objectId(pId)
                    }
                }
            }).then((result)=>{

                db.get().collection(collection.PROJECTLIST_COLLECTION).update(
                    {_id:objectId(pId)},
                    {
                        $addToSet:{savedby:{userId:objectId(id)}}
                    }
                ).then((result)=>{
                    resolve(result)
                })
                
            })         
        })   
    },

    //Unsave Project
    unsaveProject:(id,pId)=>{  
        
        return new Promise(async(resolve,reject)=>{

            await db.get().collection(collection.WORKER_COLLECTION).update( 
                {userId:objectId(id)},
                {$pull: {'saved':{'pId': objectId(pId)}}}   
            ).then((result)=>{
               
                db.get().collection(collection.PROJECTLIST_COLLECTION).update(
                    {_id:objectId(pId)},
                    {$pull: {'savedby':{'userId': objectId(id)}}}
                ).then((result)=>{
                    resolve(result)
                })
                     
            
            })         
        })   
    }

}






