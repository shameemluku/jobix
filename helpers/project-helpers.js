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


        console.log(objectId(id));

        return new Promise(async(resolve,reject)=>{

            
            let project = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match:{'skills':{ $in:[...skillArray] },  'host':{$ne : objectId(id)} }
                    },
                    {$lookup:
                        {from:"skills",
                        localField:"skills",
                        foreignField:"code",
                        as:"skillsArray"}
                    },
                    {$project:{
                        pdetails:1,pheading:1,bidding:1,
                        host:1,
                        amount:1,dueDate:1,skills:1,
                        skillsArray:1,
                        bidCount:{$size:{"$ifNull":["$bidding",[]]}},
                        savedby:1
                    }}
                    
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

            project.forEach(element => {

                if(Array.isArray(element.savedby)){
                    element.savedby.forEach(i=>{
                        if(i.userId.toString() == id){
                            element.saved=true;
                        }
                    })
                }
            })

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
                    },
                    {$project:{
                        pdetails:1,pheading:1,bidding:1,
                        host:1,
                        amount:1,dueDate:1,skills:1,
                        skillsArray:1,
                        bidCount:{$size:{"$ifNull":["$bidding",[]]}},
                        savedby:1
                    }}
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

            project.forEach(element => {

                if(Array.isArray(element.savedby)){
                    element.savedby.forEach(i=>{
                        if(i.userId.toString() == id){
                            element.saved=true;
                        }
                    })
                }
            })
            
            resolve(project)
        
        })   
    },


    getProjectDetails:(id,userId)=>{

        console.log(userId);
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
                    },
                    {$project:{
                        pdetails:1,pheading:1,bidding:1,
                        host:1,
                        amount:1,dueDate:1,skills:1,
                        skillsArray:1,savedby:1,
                        bidCount:{$size:{"$ifNull":["$bidding",[]]}}
                    }}
                ]).toArray()

                if(!Array.isArray(projectDetail[0].savedby)){
                    projectDetail[0].savedby=[];
                }

                projectDetail[0].savedby.forEach(i=>{
                    if(i.userId.toString()==userId){
                        projectDetail[0].saved = true;
                    }
                })


                resolve(projectDetail[0])
            }catch(err)
            {
                console.log(err);
            }finally{
                reject()
            }
            
        })
    },

    getAddedProjects:(id)=>{

        return new Promise(async(resolve,reject)=>{

            // let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).find({'host':objectId(id)}).sort({_id:-1}).toArray()
            // resolve(projects)

            let projects = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([
                {$match:{'host':objectId(id)}},
                {$project:{
                    pdetails:1,pheading:1,bidding:1,
                    amount:1,dueDate:1,skills:1,
                    saveCount:{$size:{"$ifNull":["$savedby",[]]}},
                    bidCount:{$size:{"$ifNull":["$bidding",[]]}}
                }}
            ]).toArray()
            resolve(projects)
        })
        
    },

    checkProposal:(pId,id)=>{
        
        console.log('project id:'+pId+'\nuser id: '+id);

        return new Promise(async(resolve,reject)=>{

            let projects =await db.get().collection(collection.PROJECTLIST_COLLECTION).find({_id:objectId(pId),'bidding.userId': objectId(id)}).toArray()
       
            console.log("\nLength and details\n");
            console.log(projects);
            console.log(projects.length);

            if(projects.length===0){
                console.log("\nNEW PROPOSAL\n");
                resolve(false)
            }else{
                console.log("\nALREADY\n");
                resolve(true)
            }
            
            
                     
        
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
        
    },


    bidDetails:(id)=>{

        return new Promise(async(resolve,reject)=>{

            try{
                let projectDetail = await db.get().collection(collection.PROJECTLIST_COLLECTION).aggregate([{
                    $match:{_id:objectId(id)}},
                    // {$lookup:{from:"users",localField:"host",foreignField:"_id",as:"host"}},
                    {$lookup:
                        {from:"skills",
                        localField:"skills",
                        foreignField:"code",
                        as:"skillsArray"}
                    },
                    {$lookup:
                        {from:"workprofile",
                        localField:"bidding.userId",
                        foreignField:"userId",
                        as:"bidWorkProfile"}
                    },
                    {$project:{
                        pdetails:1,pheading:1,bidding:1,
                        amount:1,dueDate:1,skills:1,
                        skillsArray:1,savedby:1,bidWorkProfile:1,
                        bidCount:{$size:{"$ifNull":["$bidding",[]]}},
                    }}
                ]).toArray()

                if(Array.isArray(projectDetail[0].bidding)){
                    for(let i=0; i<projectDetail[0].bidding.length;i++){
                        projectDetail[0].bidding[i] = Object.assign({}, projectDetail[0].bidding[i], projectDetail[0].bidWorkProfile[i] )
                    }
    
                    delete projectDetail[0].bidWorkProfile;
                }

                
                console.log(projectDetail[0]);
                resolve(projectDetail[0])

            }catch(err)
            {
                console.log("Error");
                console.log(err);
            }finally{
                reject()
            }
        
        })
        
    }

}

