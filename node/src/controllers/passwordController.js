const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const definirSenha = async (req, res) => {
  const { controle, senha } = req.body;

  try {
    // verifica se o usuário existe
    const resultado = await pool.query(
      'SELECT * FROM tusuarios WHERE controle = $1 AND ativo = true',
      [controle]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    // criptografa a nova senha
    const hash = await bcrypt.hash(senha, 10);

    // salva no banco
    await pool.query(
      'UPDATE tusuarios SET senha = $1 WHERE controle = $2',
      [hash, controle]
    );

    return res.status(200).json({ mensagem: 'Senha definida com sucesso!' });

  } catch (err) {
    console.error('Erro ao definir senha:', err.message);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

module.exports = { definirSenha };