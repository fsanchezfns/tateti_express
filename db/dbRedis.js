var redisClient = require('./dbRedisConfig');

function get(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });

}


function set(key, value) {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });

}

function clear(key) {
    return new Promise((resolve, reject) => {
        redisClient.del(key, (err, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
}


function getLastId(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, result) => {
            if (result) {
                resolve(result);
            } else {
                resolve(0);
            }
        });
    });
}



function getKeys(key) {
    return new Promise((resolve, reject) => {
        redisClient.keys(key, (err, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
}


module.exports = {get, set, clear, getLastId, getKeys }