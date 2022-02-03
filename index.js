const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
// const crypto = require('crypto');
const token = require('./middlewares/token');

console.log(token);
const ageF = require('./middlewares/age');
const talkF = require('./middlewares/talk');
const authorizationF = require('./middlewares/authorization');
const nameF = require('./middlewares/name');
const watchedAtF = require('./middlewares/watchedAt');
const rateF = require('./middlewares/rate');

const talkersJson = './talker.json';

// https://www.codegrepper.com/code-examples/javascript/create+16+char+token+js
// const token = crypto.randomBytes(8).toString('hex');
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

// 2 - Crie o endpoint GET /talker/:id;
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

// 4 - Crie o endpoint POST /talker
app.post('/talker', authorizationF, nameF, ageF, talkF, rateF, watchedAtF, async (req, res) => {
  const { age, name, talk } = await req.body;
  const talkersArray = await fs.readFile(talkersJson, 'utf-8');
  const talkers = await JSON.parse(talkersArray);
  const newId = talkers[talkers.length - 1].id + 1;
    const newTalker = {
      id: newId,
      name,
      age,
      talk,
    };
    talkers.push(newTalker);
    await fs.writeFile(talkersJson, JSON.stringify(talkers));
    return res.status(201).json(newTalker);
});

// 5 - Crie o endpoint PUT /talker/:id
app.put('/talker/:id', authorizationF, nameF, ageF, talkF, rateF, watchedAtF, async (req, res) => {
  const { id } = req.params;
  const talkersArray = await fs.readFile(talkersJson, 'utf-8');
  const talkerIndex = talkersArray.findIndex((t) => t.id === parseInt(id, 10));
  talkersArray[talkerIndex] = req.body;
  talkersArray[talkerIndex].id = parseInt(id, 10);
  const talkerString = await JSON.stringify(talkersArray);
  await fs.writeFile(talkersJson, talkerString);
  return res.status(200).json(talkersArray[talkerIndex]);
});

// 6 - Crie o endpoint DELETE /talker/:id
app.delete('/talker/:id', authorizationF, async (req, res) => {
  const { id } = req.params;
  const talkersArray = await fs.readFile(talkersJson, 'utf-8');
  const talkers = await JSON.parse(talkersArray);
  const talkerById = talkers.find((t) => `${t.id}` === id);

  if (talkerById === -1) {
    return res.status(204).end();
  }

  // Aula Roz, sugerindo splice ao invés de delete.
  
  talkers.splice(talkerById, 1);

  await fs.writeFile(talkersJson, JSON.stringify(talkersArray));
  res.status(204).end();
});

// 7 - Crie o endpoint GET /talker/search?q=searchTerm
app.get('/talker/search', authorizationF, async (req, res) => {
  const { q: searchTerm } = req.query;
  const talkersArray = await JSON.parse(await fs.readFile(talkersJson, 'utf-8'));
  const talkers = await JSON.parse(talkersArray);
  if (!searchTerm) return res.status(200).json(talkers); 

  const search = talkers.filter((t) => t.name.includes(searchTerm));

  res.status(200).json(search);  
});
