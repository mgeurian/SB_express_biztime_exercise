process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');  

let testInvoice;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('twitter', '200', 'false', '2020-12-25T06:00:00.000Z', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`)
  testInvoice = result.rows[0]
})

// {
//   "invoice": {
//     "id": 7,
//     "comp_code": "twitter",
//     "amt": 200,
//     "paid": false,
//     "add_date": "2020-12-25T06:00:00.000Z",
//     "paid_date": null
//   }
// }

describe("Create an invoice", () => {
  test("blah invoice", () => {
    console.log(testInvoice);
    expect(1).toBe(1);
  })
})

// afterEach(async () => {
//   await db.query(`DELETE FROM companies`);
// })

// afterAll(async () => {
//   await db.end();
// })