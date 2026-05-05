const rateLimit = require('express-rate-limit');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const limitadorAcesso = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    const erro = encodeURIComponent('Muitas tentativas de login. Tente novamente mais tarde.');
    return res.redirect(`${FRONTEND_URL}/?erro=${erro}`);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limitadorAcesso };
