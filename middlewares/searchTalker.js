const fs = require('fs').promises;

module.exports = async (req, res) => {
  const { q } = req.query;

  const file = await fs.readFile('./talker.json', 'utf-8')
   .then(JSON.parse);
   
  const person = file.filter((p) => p.name.includes(q));
 
    res.status(200).json(person);  
};
