const dbRedis = require('../db/dbRedis');
const { object } = require('../db/dbRedisConfig');

const ERROR_FLAG = 'N';
const SUCESS_FLAG = 'S';
//BOARD STATE 
const STATE_INCOMPLETO = 'I'; //falta un jugador
const STATE_PLAYING = 'P'; //jugando uno de los 2
const STATE_FINISH = 'F'; // finalizado, "empate"
const STATE_CANCEL = 'C'; //un jugador salio o lo cancelo 
const STATE_WINNER = 'W'; // un ganador



async function getBoard(dtoPlayer) {
    idBoard = dtoPlayer.idBoard;
    idPlayer = dtoPlayer.idPlayer;

    result = new Object();
    //Array del board
    key = `board#${idBoard}`;
    try {
        board = await dbRedis.get(key)
        dtoBoard = new Object();
        dtoBoard.board = board;

        //State
        key = `board#${idBoard}state`;
        try {
            state = await dbRedis.get(key);
            dtoBoard.state = state

            switch (state) {

                case STATE_PLAYING: //determinar jugador actual 
                    isWin = false;
                    key = `board#${idBoard}currentPlayer`;
                    try {
                        currentPlayer = await dbRedis.get(key)
                        if (idPlayer == currentPlayer) {
                            isPlay = true;
                        } else {
                            isPlay = false;
                        }

                    } catch {
                        return driverCatch(key);
                    }
                    break;

                case STATE_WINNER: //determinar ganador
                    isPlay = false
                    key = `board#${idBoard}winner`;
                    try {
                        winnerPlayer = await dbRedis.get(key)
                        if (idPlayer == winnerPlayer) {
                            isWin = true;
                        } else {
                            isWin = false;
                        }

                    } catch {
                        return driverCatch(key);
                    }
                    break;


                default: //STATE_INCOMPLETO,STATE_FINISH,STATE_CANCEL: ni ganador ni jugador 

                    isPlay = false;
                    isWin = false;
                    break;
            }

            dtoBoard.isPlay = isPlay;
            dtoBoard.isWin = isWin;

            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;

        } catch {
            return driverCatch(key);
        }


    } catch {
        return driverCatch(key);

    }
}




async function createBoard(dtoPlayerSimple) {
    idPlayer = dtoPlayerSimple.idPlayer;
    token = dtoPlayerSimple.token;
    dtoBoard = new Object()
        //primero busco si hay alguno en estado incompleto para agregar al segundo jugador
    var result = new Object();
    resultAux = await searchBoardState(STATE_INCOMPLETO)

    if (resultAux.flag == ERROR_FLAG) {
        // si no hay creo un board desde cero
        key = 'boardId';
        lastBoardId = await dbRedis.getLastId(key);
        idBoard = parseInt(lastBoardId) + 1;
        key = `board#${idBoard}`

        try {
            value = '[0,0,0,0,0,0,0,0,0]';
            algo = await dbRedis.set(key, value);
            algo2 = await dbRedis.set('boardId', idBoard);
            //seteo el estado inicial "incompleto"
            resultAux = await setBoardState(idBoard, STATE_INCOMPLETO)
            if (resultAux.flag == 'N') return resultAux;

            //si esta todo ok, seteo el primer player
            keyAux = 'player#1';
            resultAux = await setBoardPlayer(idBoard, keyAux, idPlayer)
            if (resultAux.flag == 'N') return resultAux;

            dtoBoard.idBoard = idBoard;
            dtoBoard.token = token;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;

        } catch {
            driverCatch(key)

        }

    } else {
        //hay un tablero esperando agrego el player 2 y comienzo el juego

        console.log('hay un tablero y es este el status')
        console.log(resultAux)

        idBoard = resultAux.data
        keyAux = 'player#2';

        resultAux = await setBoardPlayer(idBoard, keyAux, idPlayer);
        if (resultAux.flag == 'N') return resultAux;

        //seteo el estado jugando
        resultAux = await setBoardState(idBoard, STATE_PLAYING);
        if (resultAux.flag == 'N') return resultAux;


        //ramdom current player 
        playerRandom = await getRandomArbitrary(1, 3) //entre 1 y 2, ya que el 3 lo excluye
        console.log('randomjugador' + playerRandom)
        console.log('id board c: ' + idBoard)
        key = `board#${idBoard}player#${playerRandom}`;
        try {
            idPlayerRandom = await dbRedis.get(key)
            keyAux = 'currentPlayer';
            resultAux = await setBoardPlayer(idBoard, keyAux, idPlayerRandom)
            if (resultAux.flag == 'N') return resultAux;

            dtoBoard.idBoard = idBoard;
            dtoBoard.token = token;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;
        } catch {
            driverCatch(key);
        }
    }


}


async function markBoard(dtoPlayer, index) {
    console.log(index)
    result = new Object();
    idBoard = dtoPlayer.idBoard;
    idPlayer = dtoPlayer.idPlayer;
    mark = dtoPlayer.mark;
    isPlayer = dtoPlayer.isPlayer;
    otherPlayer = dtoPlayer.otherPlayer;


    if (!isPlayer) {
        result.flag = ERROR_FLAG;
        result.error = 'No es tu turno!';
        return result;
    }


    if (index == undefined || index < 0 || index > 8) {
        result.flag = ERROR_FLAG;
        result.error = 'index incorrecto, los valores son del 0...al 8';
        return result;
    }



    key = `board#${idBoard}state`;
    try {
        state = await dbRedis.get(key);

        if (state != STATE_PLAYING) {
            result.flag = ERROR_FLAG;
            result.error = 'Lo lamento no se esta jugando!';
            return result;
        }

        key = `board#${idBoard}`
        board = await dbRedis.get(key);
        console.log('acaesoty')
        console.log(board)
        boardArray = Array.from(board.split(','))

        if (boardArray[index] != "0") {
            result.flag = ERROR_FLAG;
            result.error = 'movimiento no valido';
            return result;
        }


        boardArray[index] = mark;

        resultAux = await saveMove(idBoard, boardArray, idPlayer, otherPlayer)

        return resultAux;

    } catch {
        driverCatch(key)
    }

}


//guarda movimiento y evalua ganador o finalizacion
async function saveMove(idBoard, boardArray, idPlayer, otherPlayer) {
    try {
        result = new Object();
        isWin = false;
        isFinish = false;
        //horizontales
        if (boardArray[0] != "0" & boardArray[0] == boardArray[1] & boardArray[1] == boardArray[2]) isWin = true;
        if (boardArray[3] != "0" & boardArray[3] == boardArray[4] & boardArray[4] == boardArray[5]) isWin = true;
        if (boardArray[6] != "0" & boardArray[6] == boardArray[7] & boardArray[7] == boardArray[8]) isWin = true;

        //verticales 
        if (boardArray[0] != "0" & boardArray[0] == boardArray[3] & boardArray[3] == boardArray[6]) isWin = true;
        if (boardArray[1] != "0" & boardArray[1] == boardArray[4] & boardArray[4] == boardArray[7]) isWin = true;
        if (boardArray[2] != "0" & boardArray[2] == boardArray[5] & boardArray[5] == boardArray[8]) isWin = true;

        //cruzado
        if (boardArray[0] != "0" & boardArray[0] == boardArray[4] & boardArray[4] == boardArray[8]) isWin = true;
        if (boardArray[2] != "0" & boardArray[2] == boardArray[4] & boardArray[4] == boardArray[6]) isWin = true;

        //SI NO HAY WIN, Verificacion de juego terminado 
        if (!isWin) {
            isFinish = true;
            for (let i = 0; i < 9; i++) {
                element = boardArray[i];
                if (element == '0') {
                    //si hay algun elemento '0' se sigue jugando
                    isFinish = false;
                    break
                }
            }

        }
        console.log('niii:' + boardArray)

        //guardo el board
        key = `board#${idBoard}`
        p = await dbRedis.set(key, boardArray.toString());
        console.log(p)

        //Determino respuesta segun logica
        if (isWin) {
            key = `board#${idBoard}winner`;
            await dbRedis.set(key, idPlayer);

            resultAux = await setBoardState(idBoard, STATE_WINNER);
            if (resultAux.flag = ERROR_FLAG) return resultAux;

            result.flag = SUCESS_FLAG;
            result.data = 'winner' + boardArray;
            return result;
        }

        if (isFinish) {
            resultAux = await setBoardState(idBoard, STATE_FINISH)
            if (resultAux.flag = ERROR_FLAG) return resultAux;
            result.flag = SUCESS_FLAG;
            result.data = 'finish' + boardArray;
            return result;
        }

        keyAux = 'currentPlayer';
        resultAux = await setBoardPlayer(idBoard, keyAux, otherPlayer)
        if (resultAux.flag = ERROR_FLAG) return resultAux;
        result.flag = SUCESS_FLAG;
        result.data = 'playing' + boardArray;
        return result;


    } catch (err) {

        result.flag = ERROR_FLAG;
        result.error = 'error al guardar el movimiento ' + (err);
        return result

    }
}


//setea estado al board
async function setBoardState(id, state) {
    result = new Object();
    key = `board#${id}state`;
    try {
        value = state;
        await dbRedis.set(key, value);

        result.flag = SUCESS_FLAG;
        return result;

    } catch {
        driverCatch(key)
    }
}

//Setea jugadores al board
async function setBoardPlayer(idBoard, keyAux, idPlayer) {
    console.log('setBoardPlayer' + idBoard + keyAux + idPlayer)
    result = new Object();
    key = `board#${idBoard}${keyAux}`;
    try {
        value = idPlayer;
        await dbRedis.set(key, value);

        result.flag = SUCESS_FLAG;
        return result;

    } catch {
        driverCatch(key)
    }
}


//busca boards segun estado
async function searchBoardState(state) {
    result = new Object();
    key = "board#[1-9]*state"
    try {
        keys = await dbRedis.getKeys(key)
        console.log('keys' + keys)
        for (var item in keys) {
            boardState = await dbRedis.get(keys[item]);
            if (boardState == state) {
                //si encuentro claves con el state buscado me quedo solo con el idBoard
                aux = keys[item].replace('board#', '');
                idBoard = aux.replace('state', '');
                result.flag = SUCESS_FLAG;
                result.data = idBoard;
                return result;
            }
        }

        return driverCatch(key)

    } catch {
        driverCatch(key)
    }

}


//helper para el manejo de catch
function driverCatch(key) {
    resultAux = new Object()
    resultAux.flag = ERROR_FLAG;
    resultAux.error = `${key} not found`;
    console.log('ERRORRRRRR de driver')
    console.log(resultAux)
    return resultAux;
}


//Helper para selecionar al azar el jugador
// Retorna un número aleatorio entre min (incluido) y max (excluido), ENTERO 
async function getRandomArbitrary(min, max) {
    n = Math.random() * (max - min) + min;
    return Math.trunc(n);
}


module.exports = { getBoard, createBoard, markBoard };