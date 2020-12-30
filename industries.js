/** Routes for industries in biztime */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({ industries: results.rows })
  } catch (e) {
    return next(e)
  }
})

router.get('/:ind_code', async (req, res, next) => {
  try {
    const { ind_code } = req.params;
    const industryResults = await db.query(
      `SELECT ind_code, industry FROM industries WHERE ind_code = $1`,
    [ind_code]);

    if (industryResults.rows.length === 0) {
      throw new ExpressError(`There is no industry with code: ${ind_code}`, 404)
    }

    const companyResults = await db.query(
      `SELECT comp_code FROM comp_ind WHERE ind_code = $1`, [ind_code]
    );

    if(companyResults.rows.length === 0){
      throw new ExpressError(`There are no companies associated with the industry code: ${ind_code}`, 404)
    }

    const industry = industryResults.rows[0];
    const companies = companyResults.rows;

    industry.companies = companies.map(c => c.code)

    return res.json({"industry": industry});
  } catch (e) {
    return next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { ind_code, industry } = req.body;
    const results = await db.query('INSERT INTO industries (ind_code, industry) VALUES ($1, $2) RETURNING ind_code, industry', [ind_code, industry]);

    return res.status(201).json({company: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

// router.patch('/:ind_code', async (req, res, next) => {
//   try {
//     const { ind_code } = req.params;
//     const { industry } = req.body;
//     const results = await db.query('UPDATE industries SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description]);

//     if (results.rows.length === 0) {
//       throw new ExpressError(`There is no company with code: ${code}`, 404)
//     }

//     return res.json({company: results.rows[0]})
//   } catch (e) {
//     return next(e)
//   }
// })

module.exports = router;