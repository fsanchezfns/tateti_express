var Board = require('../model/Board');
var authentication = require('../security/authentication')
var hlresponse = require('../helper/hlResponse');
const ERROR_FLAG = 'N';
const SUCESS_FLAG = 'S';



async function getBoard(token, params) {
    idBoard = params.idBoard;
    authAux = await authentication.getPlayers(token, idBoard)

    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayer = authAux.data;

        result = await Board.getBoard(dtoPlayer);
        return hlresponse.response(result);

    } else {
        return hlresponse.response(authAux);
    }
}

async function createBoard() {
    authAux = await authentication.newPlayer()
    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayerSimple = authAux.data;
        result = await Board.createBoard(dtoPlayerSimple);

        return hlresponse.response(result);
    } else {
        return hlresponse.response(authAux);
    }
}



async function markBoard(token, params, body) {
    index = parseInt(JSON.parse(body).index);
    idBoard = params.idBoard;
    authAux = await authentication.getPlayers(token, idBoard)

    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayer = authAux.data;
        result = await Board.markBoard(dtoPlayer, index);
        return hlresponse.response(result);

    } else {
        return hlresponse.response(authAux);
    }
}


async function cancelBoard(token, params) {
    idBoard = params.idBoard;
    authAux = await authentication.getPlayers(token, idBoard)

    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayer = authAux.data;

        result = await Board.cancelBoard(dtoPlayer);
        return hlresponse.response(result);

    } else {
        return hlresponse.response(authAux);
    }
}






module.exports = { getBoard, createBoard, markBoard, cancelBoard };