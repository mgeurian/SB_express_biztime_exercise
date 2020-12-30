process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon', 'Work Hard. Have Fun.') RETURNING code, name, description`)
  testCompany = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
  await db.end()
})


describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({companies: [testCompany]});
  })
})


describe("GET /companies/:code", () => {
  test("Get a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: testCompany})
  })

  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).get('/companies/blipblap')
    expect(res.statusCode).toBe(404);  
  })
})


describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post('/companies').send({ code: 'walmart', name: 'Wal-Mart', description: 'we sell walls and stuff' })
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ company: { code: 'walmart', name: 'Wal-Mart', description: 'we sell walls and stuff' }});
  })
})


describe("PATCH /companies/:code", () => {
  test("Updates a single company", async () => {
    // console.log(testCompany)
    const res = await request(app).patch(`/companies/${testCompany.code}`).send({name: "Amazon Logistics", description: "Work Hard. Have Fun. Make History."})
    console.log(testCompany)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: { code: "amazon", name: "Amazon Logistics", description: "Work Hard. Have Fun. Make History." }});
  })

  //* write a fail test case for when no code is found.
})

describe("DELETE, /companies/:code", () => {
  test("Delete a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({msg: "DELETED!"})
  })

  //* write a test for deleting a company that doesn't exist
})