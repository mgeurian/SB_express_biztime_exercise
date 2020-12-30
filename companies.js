/** Routes for companies in biztime */

const express = require("express");
var slugify = require('slugify')
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({companies: results.rows})
  } catch (e) {
    return next(e)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResults = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
    [code]);

    const invoiceResults = await db.query(
          `SELECT id FROM invoices WHERE comp_code = $1`,
        [code]
    );

    const industryResults = await db.query(
      `SELECT ind_code FROM comp_ind WHERE comp_code = $1`, [code]
    );

    if (companyResults.rows.length === 0) {
      throw new ExpressError(`There is no company with code: ${code}`, 404)
    }

    const company = companyResults.rows[0];
    const invoices = invoiceResults.rows;
    const industries = industryResults.rows;

    // **fix this** testing won't work for /company/:code route when the line below is un-commented
    company.invoices = invoices.map(inv => inv.id);
    company.industries = industries.map(ind => ind.id);

    return res.json({"company": company});
  } catch (e) {
    return next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, {lower: true})
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);

    console.log(results.rows)
    return res.status(201).json({company: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description]);

    if (results.rows.length === 0) {
      throw new ExpressError(`There is no company with code: ${code}`, 404)
    }

    return res.json({company: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [req.params.code])
    if (results.rows.length == 0){
      throw new ExpressError(`Can't find company with id of ${code}`, 404)
    }
    return res.send({ "msg": "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router;