const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { definirSenha } = require('../controllers/passwordController');
const { limitadorAcesso } = require('../middlewares/limitadorAcesso');

//              ↓ middleware entra aqui, antes do controller
router.post('/', limitadorAcesso, login);
router.post('/definir_senha', definirSenha);

module.exports = router;
