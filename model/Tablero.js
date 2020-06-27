const dbRedis = require('../db/dbRedis');

const ERROR_FLAG = 'N';
const SUCESS_FLAG = 'S';
//BOARD STATE 
const STATE_INCOMPLETO = 'I'; //falta un jugador
const STATE_PLAYING = 'P'; //jugando uno de los 2
const STATE_FINISH = 'F'; // finalizado, "empate"
const STATE_CANCEL = 'C'; //un jugador salio o lo cancelo 
const STATE_WINNER = 'W'; // un ganador



async function getBoard(idBoard, idPlayer) {
    result = new Object();
    idPlayer = 2
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




async function createBoard(idPlayer) {
    dtoBoard = new Object()
        //primero busco si hay alguno en estado incompleto para agregar al segundo jugador
    var result = new Object();
    console.log('aca toy ')
    resultAux = await searchBoardState(STATE_INCOMPLETO)
    console.log(resultAux)

    if (resultAux.flag == ERROR_FLAG) {
        // si no hay creo un board desde cero
        key = 'boardId';
        lastBoardId = await dbRedis.getLastId(key);
        idBoard = parseInt(lastBoardId) + 1;
        key = `board#${idBoard}`

        try {
            value = '[]';
            algo = await dbRedis.set(key, value);
            algo2 = await dbRedis.set('boardId', idBoard);
            //seteo el estado inicial "incompleto"
            resultAux = await setBoardState(idBoard, STATE_INCOMPLETO)
            if (resultAux.flag == 'N') return resultAux;

            //si esta todo ok, seteo el primer player
            keyAux = 'player#1';
            resultAux = await setBoardPlayer(idBoard, keyAux, idPlayer)
            if (resultAux.flag == 'N') return resultAux;

            dtoBoard.idBoard = idBoard
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
            result.flag = SUCESS_FLAG;
            result.data = dtoBoard;
            return result;
        } catch {
            driverCatch(key);
        }
    }


}



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



function driverCatch(key) {
    resultAux = new Object()
    resultAux.flag = ERROR_FLAG;
    resultAux.error = `${key} not found`;
    console.log('ERRORRRRRR de driver')
    console.log(resultAux)
    return resultAux;
}


// Retorna un número aleatorio entre min (incluido) y max (excluido), ENTERO 
async function getRandomArbitrary(min, max) {
    n = Math.random() * (max - min) + min;
    return Math.trunc(n);
}

async function log() {
    resultLog = new Object()

    log = await getRandomArbitrary(1, 3)
    resultLog.flag = SUCESS_FLAG;
    resultLog.data = log;
    return resultLog;

}

module.exports = { getBoard, createBoard, log };