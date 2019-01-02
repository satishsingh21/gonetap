const express = require('express');
const router = express.Router();
const authorize = require('../controllers/authController').authorize;

const userController = require('../controllers/userController');

router.get('/users', authorize, (req, res) => userController.getUsers(res));

module.exports = router;