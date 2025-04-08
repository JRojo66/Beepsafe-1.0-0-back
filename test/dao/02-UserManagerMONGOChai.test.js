import { UserDaoMONGO } from "../../src/dao/UserDaoMONGO.js";
import mongoose from "mongoose";
import {describe, it, before, afterEach} from "mocha";
import { isValidObjectId } from "mongoose";
import { expect } from "chai";
import { config } from "../../src/config/config.js";

const connDB = async () => {
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

  describe("Test UserDaoMONGO - Chai",function(){
    this.timeout(10000);
    
    before(function(){
        this.dao=new UserDaoMONGO();
    })
    afterEach(async function(){
        await mongoose.connection.collection("users").deleteMany({email:"test20240804@test.com"})
    })

    it("UserDaoMONGO getBy returns user (CHAI)",async function(){
        let result = await this.dao.getBy();
        expect(Object.keys(result).includes("_id")).to.be.true;
        expect(Object.keys(result)).to.includes("email");
        expect(Object.keys(result._id)).to.exist;
    })

    it("UserDaoMONGO create creates a user in Mongo Database (CHAI)", async function(){
        let checknull = await mongoose.connection.collection("users").findOne({email:"test20240804@test.com"})
        //assert.equal(checknull, null);
        expect(checknull).to.be.null
        await this.dao.create({name:"testname", lastname:"testlastname", age: 1, role:"user", cart: "66789f7c7e06af63bddf1c09", email:"test20240804@test.com", password:"123"});
        let result = await mongoose.connection.collection("users").findOne({email:"test20240804@test.com"})
        expect(isValidObjectId(result._id)).to.exist
    })
  })