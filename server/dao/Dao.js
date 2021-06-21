var ObjectID = require('mongodb').ObjectID;
const DbProvider = require("./DbProvider");

module.exports = class Dao {
  constructor(collectionName) {
    this.provider = DbProvider.getInstance();
    this.collectionName = collectionName;
    this.collection = this.provider.getDb().collection(this.collectionName);
    if (!this.collection) throw new Error("Not connected to database!");
  }
  
  async getById(id) {
    return await this.collection.findOne({ "_id":ObjectID(id) })
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
  
  async update(filter,data) {
    delete data._id;
    let result = await this.collection.updateOne(filter, { $set: data })
    let success = result.modifiedCount >= 1;
    return new Promise((res,rej)=>{
      if (success) res(result);
      else rej(result);
    })
  }

  async delete(filter) {
    let result = await this.collection.deleteOne(filter)
    let success = result.deletedCount >= 1;
    return new Promise((res,rej)=>{
      if (success) res(result);
      else rej(result);
    })
  }

  static IdFilter(id) {
    return { "_id": ObjectID(id) };
  }
}