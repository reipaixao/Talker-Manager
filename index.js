const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const talkersJson = './talker.json';

// https://www.codegrepper.com/code-examples/javascript/create+16+char+token+js
const token = crypto.randomBytes(8).toString('hex');
// console.log(token);

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// 1 - Crie o endpoint GET /talker
app.get('/talker', async (_req, res) => {
  const talkersArray = await fs.readFile(talkersJson, 'utf-8');
  const talkers = await JSON.parse(talkersArray);
  res.status(200).json(talkers);
});

// 2 - Crie o endpoint GET /talker/:id
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkersArray = await fs.readFile(talkersJson, 'utf-8');
  const talkers = await JSON.parse(talkersArray);
  const talkerId = talkers.find((t) => `${t.id}` === id);
  if (!talkerId) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(talkerId);
});

// 3 - Crie o endpoint POST /login
// https://www.geeksforgeeks.org/how-to-validate-email-address-using-regexp-in-javascript/
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const regexCodeEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const validate = regexCodeEmail.test(email); // Boolean
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!validate) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  return res.status(200).json({ token });
});
