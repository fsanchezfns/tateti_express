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
curl -X GET localhost:3000/
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