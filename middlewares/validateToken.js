const token = require('./token');

console.log(token);

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization !== token) return res.status(401).json({ message: 'Token inválido' });

  return next();
};

module.exports = validateToken;
