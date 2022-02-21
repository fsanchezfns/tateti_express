const dbRedis = require('../db/dbRedis');

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
        dtoBoard.board = Array.from(board.split(','));

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
            value = '0,0,0,0,0,0,0,0,0';
            await dbRedis.set(key, value);
            await dbRedis.set('boardId', idBoard);
            //seteo el estado inicial "incompleto"
            resultAux = await setBoardState(idBoard, STATE_INCOMPLETO)
            if (resultAux.flag == ERROR_FLAG) return resultAux;

            //si esta todo ok, seteo el primer player
            keyAux = 'player#1';
            resultAux = await setBoardPlayer(idBoard, keyAux, idPlayer)
            if (resultAux.flag == ERROR_FLAG) return resultAux;

            dtoBoard.idBoard = idBoard;
            dtoBoard.token = token;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            result.message= "Jugador N° 1";
            return result;

        } catch {
            driverCatch(key)

        }

    } else {
        //hay un tablero esperando, agrego el player 2 y comienzo el juego

        idBoard = resultAux.data
        keyAux = 'player#2';

        resultAux = await setBoardPlayer(idBoard, keyAux, idPlayer);
        if (resultAux.flag == ERROR_FLAG) return resultAux;

        //seteo el estado jugando
        resultAux = await setBoardState(idBoard, STATE_PLAYING);
        if (resultAux.flag == ERROR_FLAG) return resultAux;


        //ramdom current player 
        playerRandom = await getRandomArbitrary(1, 3) //entre 1 y 2, ya que el 3 lo excluye
        key = `board#${idBoard}player#${playerRandom}`;
        try {
            idPlayerRandom = await dbRedis.get(key)
            keyAux = 'currentPlayer';
            resultAux = await setBoardPlayer(idBoard, keyAux, idPlayerRandom)
            if (resultAux.flag == ERROR_FLAG) return resultAux;

            dtoBoard.idBoard = idBoard;
            dtoBoard.token = token;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            result.message= "Jugador N° 2";
            return result;
        } catch {
            driverCatch(key);
        }
    }


}


async function markBoard(dtoPlayer, index) {
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
            result.error = `Lo lamento no se esta jugando, el estado es: ${state}`;
            return result;
        }

        //recupero el string del board y lo paso a array
        key = `board#${idBoard}`
        board = await dbRedis.get(key);
        boardArray = Array.from(board.split(','))

        //verifico que no este ocupado
        if (boardArray[index] != "0") {
            result.flag = ERROR_FLAG;
            result.error = 'Movimiento no valido';
            return result;
        }

        //marco el lugar
        boardArray[index] = mark;
        resuAux = await saveMove(idBoard, boardArray, idPlayer, otherPlayer);
        return resuAux;

    } catch {
        driverCatch(key)
    }

}

async function cancelBoard(dtoPlayer) {
    result = new Object();
    dtoBoard = new Object();
    idBoard = dtoPlayer.idBoard;
    isPlayer = dtoPlayer.isPlayer;


    if (!isPlayer) {
        result.flag = ERROR_FLAG;
        result.error = 'No es tu turno!';
        return result;
    }

    key = `board#${idBoard}state`;
    try {
        state = await dbRedis.get(key);

        if (state != STATE_PLAYING) {
            result.flag = ERROR_FLAG;
            result.error = `Lo lamento no se esta jugando, el estado es: ${state}`;
            return result;
        }

        resultAux = await setBoardState(idBoard, STATE_CANCEL);
        if (resultAux.flag == ERROR_FLAG) return resultAux;

        dtoBoard.board = boardArray;
        result.flag = SUCESS_FLAG;
        result.data = dtoBoard;
        return result;

    } catch {
        driverCatch('No se pudo finalizar la partida')

    }
}




//guarda movimiento y evalua ganador o finalizacion
async function saveMove(idBoard, boardArray, idPlayer, otherPlayer) {
    result = new Object();
    try {
        dtoBoard = new Object();
        isFinish = false;
        isWin = await checkIsWin(boardArray);

        //SI NO HAY WIN, Verificacion de juego terminado 
        if (!isWin) isFinish = await checkIsFinish(boardArray);


        //guardo el board
        key = `board#${idBoard}`
        await dbRedis.set(key, boardArray.toString());


        //Determino respuesta segun logica
        if (isWin) {
            key = `board#${idBoard}winner`;
            await dbRedis.set(key, idPlayer);

            resultAux = await setBoardState(idBoard, STATE_WINNER);
            if (resultAux.flag == ERROR_FLAG) return resultAux;

            dtoBoard.board = boardArray;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;
        }

        if (isFinish) {
            resultAux = await setBoardState(idBoard, STATE_FINISH)
            if (resultAux.flag == ERROR_FLAG) return resultAux;
            dtoBoard.board = boardArray;
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;
        }

        keyAux = 'currentPlayer';
        resultAux = await setBoardPlayer(idBoard, keyAux, otherPlayer)
        if (resultAux.flag == ERROR_FLAG) return resultAux;
        dtoBoard.board = boardArray;
        result.flag = SUCESS_FLAG;
        result.data = dtoBoard;
        return result;


    } catch {

        result.flag = ERROR_FLAG;
        result.error = 'error al guardar el movimiento';
        return result

    }
}

//verificar winner
function checkIsWin(boardArray) {
    //horizontales
    if (boardArray[0] != "0" & boardArray[0] == boardArray[1] & boardArray[1] == boardArray[2]) return true;
    if (boardArray[3] != "0" & boardArray[3] == boardArray[4] & boardArray[4] == boardArray[5]) return true;
    if (boardArray[6] != "0" & boardArray[6] == boardArray[7] & boardArray[7] == boardArray[8]) return true;

    //verticales 
    if (boardArray[0] != "0" & boardArray[0] == boardArray[3] & boardArray[3] == boardArray[6]) return true;
    if (boardArray[1] != "0" & boardArray[1] == boardArray[4] & boardArray[4] == boardArray[7]) return true;
    if (boardArray[2] != "0" & boardArray[2] == boardArray[5] & boardArray[5] == boardArray[8]) return true;

    //cruzado
    if (boardArray[0] != "0" & boardArray[0] == boardArray[4] & boardArray[4] == boardArray[8]) return true;
    if (boardArray[2] != "0" & boardArray[2] == boardArray[4] & boardArray[4] == boardArray[6]) return true;

    return false;
}


//verificar finihs
function checkIsFinish(boardArray) {
    isFinish = true;
    for (let i = 0; i < 9; i++) {
        element = boardArray[i];
        if (element == '0') {
            //si hay algun elemento '0' se sigue jugando
            isFinish = false;
            break
        }
    }
    return isFinish;
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
    return resultAux;
}



//Helper para selecionar al azar el jugador
// Retorna un número aleatorio entre min (incluido) y max (excluido), ENTERO 
async function getRandomArbitrary(min, max) {
    n = Math.random() * (max - min) + min;
    return Math.trunc(n);
}


module.exports = { getBoard, createBoard, markBoard, cancelBoard };