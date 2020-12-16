import express from 'express';

const app = express();
const PORT = 8001;

app.get('/', (req, res) => res.send('Express with typescript server!!!'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
