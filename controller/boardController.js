var Board = require('../model/Board');
var authentication = require('../security/authentication')
var hlresponse = require('../helper/hlResponse');
const tokenGenerator = require('token-generator');
const { auth } = require('../db/dbRedisConfig');
const ERROR_FLAG = 'N';
const SUCESS_FLAG = 'S';



async function getBoard(token, params) {
    console.log('getBoard')
    console.log(token)
    idBoard = params.idBoard;
    console.log(idBoard)
    authAux = await authentication.getPlayers(token, idBoard)

    console.log(authAux)
    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayer = authAux.data;
        idPlayer = dtoPlayer.idPlayer;
        console.log('duda' + dtoPlayer.idPlayer)
        result = await Board.getBoard(idBoard, idPlayer);
        return hlresponse.response(result);

    } else {
        return hlresponse.response(authAux);
    }
}

async function createBoard() {
    authAux = await authentication.newPlayer()
    console.log('dale' + authAux)
    if (authAux.flag == SUCESS_FLAG) {
        dtoPlayer = authAux.data;
        result = await Board.createBoard(dtoPlayer);

        return hlresponse.response(result);
    } else {
        return hlresponse.response(authAux);
    }
}


module.exports = { getBoard, createBoard };