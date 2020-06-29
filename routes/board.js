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
    resAux = await boardController.getBoard(token, req.params);
    res.status(resAux.httpCode)
    res.end(resAux.data);
});


router.post('/', async function(req, res, next) {
    body = JSON.stringify(req.body); //no necesito body :)
    resAux = await boardController.createBoard()
    res.status(resAux.httpCode)
    res.end(resAux.data);
});

router.put('/:idBoard', async function(req, res, next) {
    token = req.token
    body = JSON.stringify(req.body);
    console.log('body en router' + body);
    resAux = await boardController.markBoard(token, req.params, body);
    res.status(resAux.httpCode)
    res.end(resAux.data);
});



module.exports = router;