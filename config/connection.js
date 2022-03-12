require('dotenv').config();
const mongoClient = require('mongodb').MongoClient
const state = {
    db: null
}

module.exports.connect = function(done) {
    const url = "mongodb+srv://shameemlukman:shameemmongo123@cluster0.gvq0l.mongodb.net/jobix?retryWrites=true&w=majority"
    const dbname = 'jobix'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })

}

module.exports.get = function() {
    return state.db
}