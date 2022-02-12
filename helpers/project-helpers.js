var db=require('../config/connection')
var collection=require('../config/collections')
const req = require('express/lib/request')
var objectId=require('mongodb').ObjectId

module.exports={

    getSkills:()=>{
        return new Promise(async(resolve,reject)=>{
            console.log(collection.SKILLS_COLLECTION);
            let skills = await db.get().collection('skills').find().toArray()
            resolve(skills)
        
        })
    },


    addProject:(projectDetails)=>{

        projectDetails.amount = parseFloat(projectDetails.amount);
        let ext = projectDetails.ext;
        projectDetails.host = objectId(projectDetails.host)
        delete projectDetails.ext;
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROJECTLIST_COLLECTION).insertOne(projectDetails).then((result)=>{
                resolve(result.insertedId.toString())
            })
        })
    },

    getUserBasedPro:(skillArray,id)=>{

        //checking single value from query. If true make it as an array for Lookup $in

        console.log(skillArray);
       


        return new Promise(async(resolve,reject)=>{

            // let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({'skills':{$in:[...skillArray]}}).toArray()            
            // resolve(project)

            
            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match:{'skills':{ $in:[...skillArray] },  'host':{$ne : objectId(id)} }
                    },
                    {$lookup:
                        {from:"skills",
                        localField:"skills",
                        foreignField:"code",
                        as:"skillsArray"}
                    }
            ]).toArray()

         
            let temp = []
            project.forEach(element => {
                
                let skillsArray = element.skillsArray
                skillsArray.forEach(item =>{
                    temp.push(item.name)
                })

                element.skillsName = temp;
                temp = []
            });
            
            resolve(project)
        
        })   
    },


    getFilteredPro:(skillArray,amount,id)=>{

        //checking single value from query. If true make it as an array for Lookup $in
        
        if(amount==1){
            match = {
                'skills':{ $in:[...skillArray] },
                'host':{$ne : objectId(id)},    
            }
        }else if(amount == 2){
            match = {
                'skills':{ $in:[...skillArray] },
                'amount':{$lt:500},
                'host':{$ne : objectId(id)},    
            }
        }
        else if(amount == 3){
            match = {
                'skills':{ $in:[...skillArray] },
                'amount':{$gte:500, $lt:1000},
                'host':{$ne : objectId(id)},    
            }
        }  
        else if(amount == 4){
            match = {
                'skills':{ $in:[...skillArray] },
                'amount':{$gte:1000, $lt:5000},
                'host':{$ne : objectId(id)},    
            }
        }  
        else if(amount == 5){
            match = {
                'skills':{ $in:[...skillArray] },
                'amount':{$gte:5000},
                'host':{$ne : objectId(id)},    
            }
        }       
       

        return new Promise(async(resolve,reject)=>{


            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                   
                    $match: match
                    },
                    {$lookup:
                        {from:"skills",
                        localField:"skills",
                        foreignField:"code",
                        as:"skillsArray"}
                    }
            ]).toArray()

         
            let temp = []
            project.forEach(element => {
                
                let skillsArray = element.skillsArray
                skillsArray.forEach(item =>{
                    temp.push(item.name)
                })

                element.skillsName = temp;
                temp = []
            });
            
            resolve(project)
        
        })   
    },


    getProjectDetails:(id,hostId)=>{

        return new Promise(async(resolve,reject)=>{
            
            try{
                let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match:{_id:objectId(id)}},
                    {$lookup:{from:"users",localField:"host",foreignField:"_id",as:"host"}},
                    {$lookup:
                        {from:"skills",
                        localField:"skills",
                        foreignField:"code",
                        as:"skillsArray"}
                    }
                ]).toArray()
                resolve(projectDetail[0])
            }catch(err)
            {
                console.log("No id");
            }finally{
                reject()
            }
            
        })
    },

    getAddedProjects:(id)=>{

        return new Promise(async(resolve,reject)=>{

            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({'host':objectId(id)}).sort({_id:-1}).toArray()
            resolve(projects)
        
        })
        
    },

    sendProposal:(pId,id,name,message)=>{

        return new Promise(async(resolve,reject)=>{

            db.get().collection(collection.PROJECTLIST_COLLECTION).update(
                    {_id:objectId(pId)},
                    {$addToSet:{bidding:
                        {
                            userId:objectId(id),
                            username:name,
                            message:message
                        }
                    }}
                ).then((result)=>{
                resolve(result)
            })
        
        })
        
    }

}

