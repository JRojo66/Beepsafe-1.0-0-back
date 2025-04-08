import { describe, it, before, afterEach } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import { config } from '../src/config/config.js';

const requester = supertest(`${config.ROOT_URL}`);;

describe("Test get products from protected route", function () {
  this.timeout(10000);
  let cookie;

  it("must login user and return COOKIE", async function () {
    const mockUser = {
      email: "adminCoder@coder.com",
      password: "adminCod3r123", // ** ???
    };
    const result = await requester
      .post("/api/sessions/login")
      .send(mockUser);
    const cookieResult = result.headers["set-cookie"][0];
    expect(cookieResult).to.be.ok;
    cookie = {
      name: cookieResult.split("=")[0],
      value: cookieResult.split("=")[1],
    };
    expect(cookie.name).to.be.ok.and.equal("codercookie");
    expect(cookie.value).to.be.ok;
  });

  it("must return products", async function () {
    
    const mockUserb = {
      user: {
        loginStrategy: "jwt",
        role: "admin"
      }
    };

    const response = await requester
      .get("/api/products")
      .set("Cookie", [`${cookie.name}=${cookie.value}`])
      .set("user", mockUserb);
    const products = JSON.parse(response.text).payload;
    expect(products).to.be.an("array");
    for (const product of products) {
      expect(product).to.be.an("object");
      expect(product).to.have.property("_id");
      expect(product).to.have.property("id");
      expect(product.id).to.equal(product._id);
      expect(product).to.have.property("title");
      expect(product.title).to.be.a("string");
      expect(product).to.have.property("price");
      expect(product.price).to.be.a("number");
      expect(product.price).to.be.above(0);
      expect(product).to.have.property("status");
      expect(product.status).to.be.a("boolean");
      expect(product).to.have.property("category");
      expect(product.category).to.be.a("string");
      expect(product).to.have.property("owner");
      expect(product.owner).to.be.a("string");
      expect(product).to.have.property("thumbnails");
      expect(product.thumbnails).to.be.an("array");
      expect(product).to.have.property("code");
      expect(product.code).to.be.a("string");
      expect(product).to.have.property("stock");
      expect(product.stock).to.be.a("number");
    }
  });
});

