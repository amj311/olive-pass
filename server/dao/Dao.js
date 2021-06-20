var ObjectID = require('mongodb').ObjectID;
const DbProvider = require("./DbProvider");

module.exports = class Dao {
  constructor(collectionName) {
    this.provider = DbProvider.getInstance();
    this.collectionName = collectionName;
    this.collection = this.provider.getDb().collection(this.collectionName);
    if (!this.collection) throw new Error("Not connected to database!");
  }

  newId(id) {
    return ObjectID(id);
  }

  async getById(id) {
    return await this.collection.findOne({ "_id":this.newId(id) })
  }

  async findOne(filter) {
    return await this.collection.findOne(filter)
  }

  async filter(filter) {
    return await this.collection.find(filter).toArray();
  }

  create(data) {
    return new Promise((res,rej)=>{
      this.collection.insertOne(data).then(result=>{
        let success = result.insertedCount >= 1;
        if (success) res(result.ops[0]);
        else rej(result);
      })
      .catch(error=>{rej(error)});
    })
  }
  
  async update(id,data) {
    delete data._id;
    let result = await this.collection.updateOne({ "_id": this.newId(id) }, { $set: data })
    let success = result.modifiedCount >= 1;
    return new Promise((res,rej)=>{
      if (success) res(result);
      else rej(result);
    })
  }

  async deleteById(id) {
    let result = await this.collection.deleteOne({ "_id": this.newId(id) })
    let success = result.deletedCount >= 1;
    return new Promise((res,rej)=>{
      if (success) res(result);
      else rej(result);
    })
  }
}