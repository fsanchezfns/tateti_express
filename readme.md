# TATETE - Api REST express
## Programación avanzada 2020
#


## 🚀 Init del proyecto 

* install dependencies:
     > npm install

* redis run:
     > docker run --name redistateti -p 6379:6379 redis 


* config env:
     >HOST_REDIS=192.168.99.100 

     >PORT_REDIS=6379


* run the app:
     > SET DEBUG=tateti-express:* & npm start

     
#
#


# 📄 ApiRest documentation

## Response

* Response

```
{
"status":{
     "flag":"",
     "message":""
     },
"payload":""
}
```

* Response Sucess  - Code HTTP 200

```
{
"status":{
     "flag":"S",
     "message":""
     },
"payload":"Data"
}
```

* Response Error  - Code HTTP 400
```
{
"status":{
     "flag":"N",
     "message":"Error"
     },
"payload":""
}
```


#
# BOARD

## POST
* Crear tablero o asociar a tablero en estado Incompleto

```
curl -X POST localhost:3000/board
```
* Response
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "idBoard": 1,
          "token": "72aebfjdebdece"
     }
}
```


* GET 

```
curl -X GET -H "authorization:72aebfjdebdece" localhost:3000/board/1
```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": "0,0,2,0,0,0,0,0,0",  //array
          "state": "P", //Playing
          "isPlay": true, //turno
          "isWin": false //ganador
     }
}
```


* PUT 
#### index: indice del tablero 
```
curl -X PUT -H "authorization:72aebfjdebdece" -d"index=2" localhost:3000/board/1
```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": [
               "0",
               "0",
               "2",
               "1",
               "0",
               "0",
               "0",
               "0",
               "0"
          ]
     }
}
```



* DELETE
```
-X DELETE -H "authorization:d640bfjdecgeci" localhost:3000/board/7
```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": [
               "0",
               "0",
               "2",
               "1",
               "0",
               "0",
               "0",
               "0",
               "0"
          ]
     }
}
```


# 
# Modelo
* Estados del board
```
STATE_INCOMPLETO = 'I'; //falta un jugador
STATE_PLAYING = 'P'; //jugando uno de los 2
STATE_FINISH = 'F'; // finalizado, "empate"
STATE_CANCEL = 'C'; //un jugador salio o lo cancelo 
STATE_WINNER = 'W'; // un ganador
```


# Key Redis 


```
* ArrayBoard  (Persistencia del array)
key = `board#${idBoard}`; 
key = board#1


* StateBoard  (Persistencia del estado)
key = `board#${idBoard}state`;
key = board#1state


* PlayeresBoard  (Persistencia de los jugadores)
key = `board#${idBoard}player#{idPlayer}`;
key = board#1player#1`;
key = board#1player#2`;
key = `board#${idBoard}currentplayer`;


* WinnerBoard (Persistencia de ganador)
key = `board#${idBoard}winner`;
key = `board#1winner`;

```


# Estructuras - DTO

* dtoPlayer
```
dtoPlayer.idBoard = idBoard;
dtoPlayer.idPlayer = idPlayer
dtoPlayer.mark = mark;
dtoPlayer.isPlayer = isPlayer;
dtoPlayer.otherPlayer = otherPlayer;
```



* dtoPlayerSimple
```
dtoPlayer.idPlayer = idPlayer;
dtoPlayer.token = token;
```


* dtoBoard
```
dtoBoard.board = board;
dtoBoard.state = state
dtoBoard.isPlay = isPlay;
dtoBoard.isWin = isWin;
```

* dtoBoardPlayer
```
dtoBoardPlayer.idPlayer1 = idPlayer1;
dtoBoardPlayer.idPlayer2 = idPlayer2;
dtoBoardPlayer.currentPlayer = currentPlayer;

```



## Ejemplo de juego


* Crear tablero
```
curl -X POST localhost:3000/board
```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "idBoard": 7,
          "token": "d640bfjdecgeci"
     }
}
```

* Consultar tablero 

```
curl -X GET -H "authorization:d640bfjdecgeci" localhost:3000/board/7
```

```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": "0,0,0,0,0,0,0,0,0",
          "state": "I",
          "isPlay": false,
          "isWin": false
     }
}
```


* Crear tablero (como ya hay uno creado solo se asocia otro jugador)


```
curl -X POST localhost:3000/board
```

```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "idBoard": "7",
          "token": "5e28bfjdecgfeh"
     }
}
```



* Get tablero token:5e28bfjdecgfeh
```
GET -H "authorization:5e28bfjdecgfeh" localhost:3000/board/7

```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": "0,0,0,0,0,0,0,0,0",
          "state": "P",
          "isPlay": true,
          "isWin": false
     }
}
```

* Get tablero token:d640bfjdecgeci

```
curl -X GET -H "authorization:d640bfjdecgeci" localhost:3000/board/7
```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": "0,0,0,0,0,0,0,0,0",
          "state": "P",
          "isPlay": false,
          "isWin": false
     }
}
```



* PUT movimiento token:5e28bfjdecgfeh
```
curl -X PUT -H "authorization:5e28bfjdecgfeh" -d"index=2" localhost:3000/board/7

```
```
{
     "status": {
          "flag": "S",
          "message": ""
     },
     "payload": {
          "board": [
               "0",
               "0",
               "2",
               "0",
               "0",
               "0",
               "0",
               "0",
               "0"
          ]
     }
}
```


* PUT movimiento token:5e28bfjdecgfeh (se intenta jugar de nuevo)
```
curl -X PUT -H "authorization:5e28bfjdecgfeh" -d"index=2" localhost:3000/board/7

```
```
{
     "status": {
          "flag": "N",
          "message": "No es tu turno!"
     },
     "payload": ""
}
```

* PUT movimiento token:d640bfjdecgeci (se intenta jugar en el mismo index)
```
curl -X PUT -H "authorization:d640bfjdecgeci" -d"index=2" localhost:3000/board/7
```
```
{
     "status": {
          "flag": "N",
          "message": "Movimiento no valido"
     },
     "payload": ""
}
```