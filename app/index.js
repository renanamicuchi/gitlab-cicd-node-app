const express = require('express');
const app = express();

// Basic route to verify deployment is working
app.get('/', (req, res) => {
  res.send('Deploy funcionando 🚀');
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App rodando na porta ${PORT}`);
});