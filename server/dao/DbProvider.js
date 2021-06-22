const MongoClient = require('mongodb').MongoClient

module.exports = class DbProvider {
  constructor() {
    if (DbProvider._instance) return DbProvider._instance;
    DbProvider._instance = this;
    DbProvider.dbUrl = process.env.DB_URL+'/olive_pass';
    DbProvider.db = null;
    MongoClient.connect(DbProvider.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err,client)=>{
      if (err) return console.error(err)
      console.log('Connected to Database')
      DbProvider.db = client.db("olive_pass");
    });
  }

  static getInstance() {
    if (!DbProvider._instance) DbProvider._instance = new DbProvider();
    return DbProvider._instance;
  }

  getDb = () => DbProvider.db;
}
