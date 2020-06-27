var express = require('express');
var router = express.Router();
var Tablero = require('../model/Tablero');
var hlresponse = require('../helper/hlResponse');

router.get('/:idBoard', async function(req, res, next) {

    idBoard = req.params.idBoard;
    result = await Tablero.getBoard(idBoard);
    resAux = hlresponse.response(result);
    res.status(resAux.httpCode)
    res.end(resAux.data);
});


router.post('/', async function(req, res, next) {
    value = JSON.stringify(req.body);
    idPlayer = 1
    result = await Tablero.createBoard(idPlayer);
    resAux = hlresponse.response(result);
    res.status(resAux.httpCode)
    res.end(resAux.data);
});

router.put('/', async function(req, res, next) {
    //value = JSON.stringify(req.body);
    //idPlayer = 1
    result = await Tablero.log();
    resAux = hlresponse.response(result);
    res.status(resAux.httpCode)
    res.end(resAux.data);
});



module.exports = router;