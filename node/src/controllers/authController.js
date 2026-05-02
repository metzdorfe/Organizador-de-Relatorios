const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM tusuarios WHERE usuario = $1 AND ativo = true',
      [usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
    }

    const user = resultado.rows[0];

    // verifica se a senha tem hash bcrypt
    const temHash = user.senha.startsWith('$2');

    if (!temHash) {
      // senha em texto puro — verifica e pede pra definir
      if (user.senha !== senha) {
        return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
      }

      return res.status(200).json({
        primeiroacesso: true,
        controle: user.controle,
        mensagem: 'Defina sua senha para continuar.'
      });
    }

    // senha com hash — fluxo normal
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
    }

    const token = jwt.sign(
      {
        controle:    user.controle,
        usuario:     user.usuario,
        nome:        user.nome,
        nivel:       user.nivel,
        programador: user.programador,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        nome:        user.nome,
        nivel:       user.nivel,
        programador: user.programador,
      }
    });

  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

module.exports = { login };