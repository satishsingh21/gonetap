const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/signUp', (req, res) => userController.registerAndLoginUser(req, res));

router.post('/login', (req, res) => userController.loginUser(req, res));

router.get('/userInfo', (req, res) => userController.getUserInfo(req, res));

module.exports = router;