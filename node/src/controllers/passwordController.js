const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const sanitize = (str) =>
  typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : '';

const redirectDefinirSenha = (res, motivo) => {
  const query = motivo ? `?erro=${encodeURIComponent(motivo)}` : '';
  return res.redirect(`${FRONTEND_URL}/definirSenha.html${query}`);
};

const definirSenha = async (req, res) => {
  let { senha, confirmarSenha } = req.body;
  let controle = req.signedCookies?.primeiro_acesso;

  if (!controle || !senha) {
    return redirectDefinirSenha(res, 'Sessao expirada. Faca o login novamente.');
  }

  senha = sanitize(senha);
  confirmarSenha = sanitize(confirmarSenha);

  if (senha !== confirmarSenha) {
    return redirectDefinirSenha(res, 'As senhas nao coincidem.');
  }

  controle = parseInt(controle, 10);
  if (Number.isNaN(controle) || controle <= 0) {
    return redirectDefinirSenha(res, 'Sessao invalida.');
  }

  if (typeof senha !== 'string' || senha.length < 6 || senha.length > 128) {
    return redirectDefinirSenha(res, 'A senha deve ter entre 6 e 128 caracteres.');
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM tusuarios WHERE controle = $1 AND ativo = true',
      [controle]
    );

    if (resultado.rows.length === 0) {
      return redirectDefinirSenha(res, 'Usuario nao encontrado.');
    }

    const hash = await bcrypt.hash(senha, 10);

    await pool.query(
      'UPDATE tusuarios SET senha = $1 WHERE controle = $2',
      [hash, controle]
    );

    res.clearCookie('primeiro_acesso');
    return res.redirect(`${FRONTEND_URL}/?senha=definida`);
  } catch (err) {
    console.error('Erro ao definir senha:', err.message);
    return redirectDefinirSenha(res, 'Erro interno no servidor.');
  }
};

module.exports = { definirSenha };
