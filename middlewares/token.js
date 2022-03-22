const crypto = require('crypto');

// https://www.codegrepper.com/code-examples/javascript/create+16+char+token+js
const token = crypto.randomBytes(8).toString('hex');
console.log(token);

module.exports = token;
