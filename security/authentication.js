const dbRedis = require('../db/dbRedis');
const securityToken = require('./token');

const ERROR_FLAG = 'N';
const SUCESS_FLAG = 'S';
const MARK_PLAYER1 = '1';
const MARK_PLAYER2 = '2';


async function newPlayer() {
    result = new Object();
    dtoPlayerSimple = new Object();
    try {
        key = 'playerId';
        lastPlayerId = await dbRedis.getLastId(key);
        idPlayer = parseInt(lastPlayerId) + 1;

        //generoToken
        token = await securityToken.newToken()

        //persisto token y idPlayer
        a = await dbRedis.set(token, idPlayer)
        b = await dbRedis.set(key, idPlayer)

        dtoPlayerSimple.token = token
        dtoPlayerSimple.idPlayer = idPlayer
        result.flag = SUCESS_FLAG;
        result.data = dtoPlayerSimple;
        return result;

    } catch (err) {
        result.flag = ERROR_FLAG;
        result.error = 'Error interno al crear un nuevo jugador';
        return result;
    }

}


async function getPlayers(token, idBoard) {
    result = new Object();
    dtoPlayer = new Object();
    isValidToken = securityToken.checkToken(token)
    if (isValidToken) {
        try {
            idPlayer = await dbRedis.get(token)

            //querys de player#1 player#2 y current
            dtoBoardPlayer = await getPlayerForBoard(idBoard);
            idPlayer1 = dtoBoardPlayer.idPlayer1
            idPlayer2 = dtoBoardPlayer.idPlayer2
            currentPlayer = dtoBoardPlayer.currentPlayer
                //verificacion de jugadores, seteo de mark y other player
            switch (idPlayer) {
                case idPlayer1:
                    mark = MARK_PLAYER1;
                    otherPlayer = idPlayer2;
                    break;

                case idPlayer2:
                    mark = MARK_PLAYER2
                    otherPlayer = idPlayer1;
                    break;

                default:
                    result.flag = ERROR_FLAG;
                    result.error = 'El nro de board no tiene a un jugador con este nro de token';
                    return result;
            }

            //determino si es el jugador actual
            if (idPlayer == currentPlayer) {
                isPlayer = true;

            } else {

                isPlayer = false;
            }

            //DTO PLAYER
            dtoPlayer.idBoard = idBoard;
            dtoPlayer.idPlayer = idPlayer;
            dtoPlayer.mark = mark;
            dtoPlayer.isPlayer = isPlayer;
            dtoPlayer.otherPlayer = otherPlayer;


            result.flag = SUCESS_FLAG;
            result.data = dtoPlayer;
            return result;

        } catch (err) {
            result.flag = ERROR_FLAG;
            result.error = 'Error en recuperar el player ' + err;
            return result;
        }

    } else {
        result.flag = ERROR_FLAG
        result.error = 'tokenInvalid'
        return result;
    }
}



//helper para evitar error cuando no encuentra
async function getPlayerForBoard(idBoard) {
    try {
        key = `board#${idBoard}player#1`;
        idPlayer1 = await dbRedis.get(key);
    } catch {
        idPlayer1 = 0

    }

    try {
        key = `board#${idBoard}player#2`;
        idPlayer2 = await dbRedis.get(key);
    } catch {
        idPlayer2 = 0

    }

    try {

        key = `board#${idBoard}currentPlayer`;
        currentPlayer = await dbRedis.get(key);
    } catch {
        currentPlayer = 0

    }

    dtoBoardPlayer = new Object()
    dtoBoardPlayer.idPlayer1 = idPlayer1;
    dtoBoardPlayer.idPlayer2 = idPlayer2;
    dtoBoardPlayer.currentPlayer = currentPlayer;

    return dtoBoardPlayer;
}

module.exports = { newPlayer, getPlayers }