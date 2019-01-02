const jwt = require('jsonwebtoken');
const responseController = require('./responseController');
const appSecret = require('../config/authConfig').appSecret;

function verify(req, res, next) {
    jwt.verify(req.cookies.googleOneTap, appSecret, (err, decoded) => {
        if (err) return responseController.sendError(err, res);

        next();
    });
}

module.exports.authorize = verify;