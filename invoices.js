/** Routes for invoices */

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({invoices: results.rows})
  } catch (e) {
    return next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code) WHERE id = $1`, [id])
    if (results.rows.length === 0){
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }

    const data = results.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({"invoice": invoice})

  } catch (e) {
    return next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
    return res.status(201).json({"invoice": results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paidDate = null;

    const invoiceResults = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);
    console.log(invoiceResults)
    if (invoiceResults.rows.length === 0) {
      throw new ExpressError(`There is no invoice with id: ${id}`, 404)
    }    

    const invoicePaidDate = invoiceResults.rows[0].paid_date;
    console.log(invoicePaidDate)
    if(!invoicePaidDate && paid){
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null
    } else {
      paidDate = invoicePaidDate
    }

    const results = await db.query('UPDATE invoices SET amt=$2 paid=$3 paid_date=$4 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date', [id, amt, paid, paidDate]);

    return res.json({"invoice": results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [req.params.id])
    if (results.rows.length == 0){
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    return res.send({ "msg": "DELETED!" })    
  } catch (e) {
    return next(e)
  }
})

module.exports = router;