var db=require('../config/connection')
var collection=require('../config/collections')
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

        let ext = projectDetails.ext;
        projectDetails.host = objectId(projectDetails.host)
        delete projectDetails.ext;
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROJECTLIST_COLLECTION).insertOne(projectDetails).then((result)=>{
                resolve(result.insertedId.toString())
            })
        })
    },

    getUserBasedPro:(skills)=>{


        skillArray = [];
        skills.forEach(element => {
            skillArray.push(element.code)
        });
        return new Promise(async(resolve,reject)=>{

            // let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({'skills':{$in:[...skillArray]}}).toArray()            
            // resolve(project)
            
            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match:{
                        'skills':{
                            $in:[...skillArray]
                        }}
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

            resolve(project);
        
        })   
    },


    getProjectDetails:(id,hostId)=>{

        return new Promise(async(resolve,reject)=>{
            
            let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                $match:{_id:objectId(id)}},
                {$lookup:{from:"users",localField:"host",foreignField:"_id",as:"host"}}
            ]).toArray()
            
            resolve(projectDetail[0])
        
        })
        

    }

}

