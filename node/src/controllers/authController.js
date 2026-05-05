const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const sanitize = (str) =>
  typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : '';

const usuarioPermitido = /^[A-Za-z0-9_.]+$/;

const redirectLogin = (res, motivo) => {
  const query = motivo ? `?erro=${encodeURIComponent(motivo)}` : '';
  return res.redirect(`${FRONTEND_URL}/${query}`);
};

const login = async (req, res) => {
  let { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return redirectLogin(res, 'Usuario e senha sao obrigatorios.');
  }

  usuario = sanitize(usuario);
  senha = typeof senha === 'string' ? senha : '';

  if (typeof usuario !== 'string' || usuario.length > 100 || !usuarioPermitido.test(usuario)) {
    return redirectLogin(res, 'Usuario invalido.');
  }

  if (typeof senha !== 'string' || senha.length < 6 || senha.length > 128) {
    return redirectLogin(res, 'Senha invalida.');
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET nao configurado.');
    return redirectLogin(res, 'Erro interno no servidor.');
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM tusuarios WHERE usuario = $1 AND ativo = true',
      [usuario]
    );

    if (resultado.rows.length === 0) {
      return redirectLogin(res, 'Usuario ou senha incorretos.');
    }

    const user = resultado.rows[0];
    const senhaBanco = typeof user.senha === 'string' ? user.senha : '';
    const temHash = senhaBanco.startsWith('$2');

    if (!temHash) {
      if (senhaBanco !== senha) {
        return redirectLogin(res, 'Usuario ou senha incorretos.');
      }

      res.cookie('primeiro_acesso', String(user.controle), {
        ...cookieOptions,
        signed: true,
        maxAge: 15 * 60 * 1000,
      });

      return res.redirect(`${FRONTEND_URL}/definirSenha.html`);
    }

    const senhaValida = await bcrypt.compare(senha, senhaBanco);
    if (!senhaValida) {
      return redirectLogin(res, 'Usuario ou senha incorretos.');
    }

    const token = jwt.sign(
      {
        controle: user.controle,
        usuario: user.usuario,
        nome: user.nome,
        nivel: user.nivel,
        programador: user.programador,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(process.env.LOGIN_SUCCESS_REDIRECT || `${FRONTEND_URL}/`);
  } catch (err) {
    console.error('Erro no login:', err.message);
    return redirectLogin(res, 'Erro interno no servidor.');
  }
};

module.exports = { login };
