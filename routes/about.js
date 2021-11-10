const express = require('express');
const router = express.Router()
const gatekeeper =  require('../auth');
const db = require('../models');

router.get('/about', gatekeeper, async (req,res) => {
    let record = await db.users.findByPk(req.user.id)
    res.render('about',
    {
        username: record.username,
        userID: record.id
    })
})
module.exports = router;
