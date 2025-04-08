import { UserDaoMONGO } from "../../src/dao/UserDaoMONGO.js";
import mongoose from "mongoose";
import Assert from "assert";
import {describe, it} from "mocha";
import { isValidObjectId } from "mongoose";
import { config } from "../../src/config/config.js";

const assert = Assert.strict;

const connDB = async () => {
    // Connects to mongoDb
    try {
      await mongoose.connect(config.MONGO_URL, {
        dbName: config.DB_NAME,
      });
      console.log("DB Online...!!!");
    } catch (error) {
      console.log(error);
    }
  };
  connDB();

  describe("Test UserDaoMONGO - Assert",function(){
    this.timeout(10000);
    
    before(function(){
        this.dao=new UserDaoMONGO();          // instanciates 
    })
    afterEach(async function(){
        await mongoose.connection.collection("users").deleteMany({email:"test20240804@test.com"})
    })

    it("UserDdaoMONGO getBy returns user",async function(){
        let result = await this.dao.getBy();
        assert.ok(Object.keys(result).includes("_id"));
    })

    it("UserDaoMONGO create creates a user in Mongo Database", async function(){
        let checknull = await mongoose.connection.collection("users").findOne({email:"test20240804@test.com"})
        assert.equal(checknull, null);
        await this.dao.create({name:"testname", lastname:"testlastname", age: 1, role:"user", cart: "66789f7c7e06af63bddf1c09", email:"test20240804@test.com", password:"123"});
        let result = await mongoose.connection.collection("users").findOne({email:"test20240804@test.com"})
        assert.ok(isValidObjectId(result._id));
    })
  })