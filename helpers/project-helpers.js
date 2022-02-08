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


}