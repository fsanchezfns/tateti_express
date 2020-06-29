var express = require('express');
var router = express.Router();
var boardController = require('../controller/boardController');

var authorization;

//middleware para obtener el token 
var myAuthorization = function(req, res, next) {
    headers = JSON.parse(JSON.stringify(req.headers));
    req.token = headers.authorization

    next();
};

router.use(myAuthorization)

router.get('/:idBoard', async function(req, res, next) {
    token = req.token
    console.log('token', token)
    resAux = await boardController.getBoard(token, req.params);
    console.log('final' + resAux)
    res.status(resAux.httpCode)
    res.end(resAux.data);
});


router.post('/', async function(req, res, next) {
    body = JSON.stringify(req.body);
    resAux = await boardController.createBoard(body)
    res.status(resAux.httpCode)
    res.end(resAux.data);
});

router.put('/:token', async function(req, res, next) {
    //value = JSON.stringify(req.body);
    //idPlayer = 1
    // token = req.params.token;
    // security.checkToken(token);

    // res.end(token);
});



module.exports = router;