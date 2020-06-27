var env = require('node-env-file');
env('./.env');

const host = process.env.HOST_REDIS; //"192.168.99.100" //url que corre mi docker
const port = process.env.PORT_REDIS;

//conection con redis
var redis = require('redis')
const redisClient = redis.createClient(port, host, redis)

redisClient.on('connect', function() {
    console.log("Redis Connected")
});
redisClient.on('error', function(err) {
    console.log(err)
});

module.exports = redisClient;