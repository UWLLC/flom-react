const Router = require('express-promise-router');
const passport = require('passport');

const db = require('../config/db');

const router = new Router();
// export our router to be mounted by the parent application
module.exports = router;

//var status;

const dbModify = async (queryStatment, queryVar) => {
    var queryRes;
    try {
        const { rows } = await db.query(queryStatment, queryVar);
        queryRes = { "code": 201, "data": rows }
    } catch (err) {
        queryRes = { "code": 400, "data": err }
    }
    return queryRes;
}

// Survey Modifyer 
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var queryVar;
    var status;
    switch (req.body.mode) {

        case "add":
            if (req.body.data.visible) { req.body.data.visible = 1 } else { req.body.data.visible = 0 };
            queryVar = [req.body.data.id, req.body.data.name, req.body.data.visible, req.body.data.details, req.body.data.start_time, req.body.data.stop_time];
            status = await dbModify('INSERT INTO survey (id,name,visibility_id,detail,start_time,end_time) VALUES ($1,$2,$3,$4,$5,$6)', queryVar);
            break;

        case "delete":
            queryVar = [req.body.data.id];
            status = await dbModify('DELETE FROM survey WHERE id = $1', queryVar);
            status = await dbModify('DELETE FROM response WHERE survey = $1', queryVar);
            break;

        case "modify":
            if (req.body.data.visible) { req.body.data.visible = 1 } else { req.body.data.visible = 0 };
            queryVar = [req.body.data.id, req.body.data.visible]
            status = await dbModify('UPDATE survey SET visibility_id = $2 WHERE id = $1', queryVar);
            break;
    }
    res.status(status["code"]).json(status["data"]);
});

// Survey Modifyer posting with username info
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var queryVar;
    const token = req.headers.authorization;
    const verified = jwt.decode(token.split(' ')[1]);
    console.log('Verified:', verified);
    const username = verified.user.userName;
    console.log('Username:', username);

    switch (req.body.mode) {

        case "add":
            if (req.body.data.visible) { req.body.data.visible = 1 } else { req.body.data.visible = 0 };
            queryVar = [req.body.data.id, req.body.data.name, req.body.data.visible, req.body.data.details, username, req.body.data.start_time, req.body.data.stop_time];            
            dbModify('INSERT INTO survey (id,name,visibility_id,detail,author,start_time,end_time) VALUES ($1,$2,$3,$4,$5,$6,$7)', queryVar);            
            break;

        case "delete":
            queryVar = [req.body.data.id];
            dbModify('DELETE FROM survey WHERE id = $1', queryVar);
            dbModify('DELETE FROM response WHERE survey = $1', queryVar);
            break;

        case "modify":
            if (req.body.data.visible) { req.body.data.visible = 1 } else { req.body.data.visible = 0 };
            queryVar = [req.body.data.id, req.body.data.visible]
            dbModify('UPDATE survey SET visibility_id = $2 WHERE id = $1', queryVar);
            break;
    }
    res.status(status.code).json(status.data);
});