const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { definirSenha } = require('../controllers/passwordController');

router.post('/', login);
router.post('/definir_senha', definirSenha);

module.exports = router;