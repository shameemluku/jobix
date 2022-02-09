var db=require('../config/connection')
var collection=require('../config/collections')

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
        delete projectDetails.ext;
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROJECTLIST_COLLECTION).insertOne(projectDetails).then((result)=>{
                resolve(result.insertedId.toString())
            })
        })
    }


}