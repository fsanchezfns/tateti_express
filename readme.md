# TATETE - Api REST express
## Programación avanzada 2020
#


## 🚀 Init del proyecto 

* install dependencies:
     > npm install

* redis run:
     > docker run --name redistateti -p 6379:6379 redis 

* run the app:
     > SET DEBUG=tateti-express:* & npm start

     


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


## Tablero

* GET 

```
GET localhost:3000/
```
```
curl -X GET -H "authorization:08e7bfjdebcjeg" localhost:3000/board/16
curl -X GET -H "authorization:49fcbfjdebbdgg" localhost:3000/board/16
```



* POST 

```
curl -X POST localhost:3000/board
```
```
{"status":{"flag":"S","message":""},"payload":{"idBoard":17,"token":"72aebfjdebdece"}}
```
```
curl -X GET -H "authorization:72aebfjdebdece" localhost:3000/board/17
```
```
-X POST localhost:3000/board
```
```
{"status":{"flag":"S","message":""},"payload":{"idBoard":"17","token":"991dbfjdebdehg"}}
```
```
curl -X GET -H "authorization:991dbfjdebdehg" localhost:3000/board/17
```

## Key Redis 


```
* ArrayBoard
key = `board#${idBoard}`; 
key = board#1


* StateBoard
key = `board#${idBoard}state`;
key = board#1state


* PlayeresBoard
key = `board#${idBoard}player#{idPlayer}`;
key = board#1player#1`;
key = board#1player#2`;

key = `board#${idBoard}currentplayer`;


* WinnerBoard
key = `board#${idBoard}winner`;
key = `board#1winner`;

```


* Estructuras
```
/*
dtoPlayer
dtoPlayer.idPlayer = idPlayer
dtoPlayer.mark = mark;
dtoPlayer.isPlayer = isPlayer;
dtoPlayer.otherPlayer = otherPlayer;
*/


/*
dtoPlayerSimple
dtoPlayer.idPlayer = idPlayer;
dtoPlayer.token = token;
*/


dtoBoard

dtoBoardPlayer
dtoBoardPlayer = new Object()
dtoBoardPlayer.idPlayer1 = idPlayer1;
dtoBoardPlayer.idPlayer2 = idPlayer2;
dtoBoardPlayer.currentPlayer = currentPlayer;

```