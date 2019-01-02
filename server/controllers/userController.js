const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const connection = require('../config/dbConnection').connection;
const authConfig = require('../config/authConfig');
const responseController = require('./responseController');
const googleAuth = authConfig.googleClient;

const googleClient = new OAuth2Client(googleAuth.clientID);

function verifyGoogleToken(idToken, onTokenVerifyCallback) {
    googleClient.verifyIdToken({ idToken, audience: googleAuth.clientID }, onTokenVerifyCallback);
};

function registerAndLoginUser(req, res) {
    const registerUserInfo = {
        name: req.body.name,
        emailId: req.body.emailId
    };

    verifyGoogleToken(req.body.googleTokenId, (err, googleRes) => {
        if (err) {
            return responseController.sendError(err, res);
        }

        const payload = googleRes.getPayload();
        const userid = payload['sub'];

        if (!userid) return responseController.sendError(new Error('Invalid google user.'), res);

        connection(db =>
            db.collection('users')
                .updateOne({ emailId: registerUserInfo.emailId },
                    {
                        $set: { lastseen: Date.now() },
                        $setOnInsert: {
                            name: registerUserInfo.name,
                            emailId: registerUserInfo.emailId,
                            createdOn: Date.now()
                        }
                    },
                    { upsert: true },
                    (err, mongoDbRes) => {
                        if (err) return responseController.sendError(err, mongoDbRes);

                        const data = { auth_token: jwt.sign({ name: registerUserInfo.name, emailId: registerUserInfo.emailId }, authConfig.appSecret, { expiresIn: '30s' }) };
                        responseController.sendResponse(data, res);
                    }
                ));
    });
};

function loginUser(req, res) {
    if (req.cookies.googleOneTap) {
        jwt.verify(req.cookies.googleOneTap, authConfig.appSecret, (err, decoded) => {
            if (err) {
                return responseController.sendError(err, res);
            }

            getUserByEmail(decoded, false, res);
        });
    } else {
        registerAndLoginUser(req, res);
    }
}

function getUserInfo(req, res) {
    jwt.verify(req.headers['user-identifier'], authConfig.appSecret, (err, decoded) => {
        if (err) {
            return responseController.sendError(err, res);
        }

        getUserByEmail(decoded, true, res);
    })
}

function getUsers(res) {
    connection(db =>
        db.collection('users')
            .find({}, { projection: { _id: 0 } })
            .toArray((err, userResp) => {
                if (err) {
                    return responseController.sendError(err, res);
                }

                responseController.sendResponse(userResp, res);
            }));
};

function getUserByEmail(userInfo, generateToken, res) {
    connection(db =>
        db.collection('users')
            .findOne({ emailId: userInfo.emailId }, { projection: { _id: 0 } }, (err, userResp) => {
                if (err) {
                    return responseController.sendError(err, res);
                }

                const data = { user: userResp };
                if (generateToken) data.token = jwt.sign({ name: userResp.name, emailId: userResp.emailId }, authConfig.appSecret, { expiresIn: '5m' });

                responseController.sendResponse(data, res);
            })
    );
};

module.exports = {
    getUsers,
    registerAndLoginUser,
    loginUser,
    getUserInfo
};