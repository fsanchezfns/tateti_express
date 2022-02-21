//https://www.npmjs.com/package/token-generator

const tokenGenerator = require('token-generator');

var TokenGenerator = require('token-generator')({
    salt: 'your secret ingredient for this magic recipe',
    timestampMap: 'abcdefghij', // 10 chars array for obfuscation proposes
});


function newToken() {
    var token = TokenGenerator.generate();

    return token;
}


function checkToken(token) {
    console.log(token)
    if (TokenGenerator.isValid(token)) {
        isOk = true
    } else {
        isOk = false
    }

    return isOk;

}

module.exports = { newToken, checkToken };