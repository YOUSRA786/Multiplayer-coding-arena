const express = require('express');
const cors = require('cors');
const { executeCode } = require('./execute');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/execute', async (req, res) => {
  const { language, code, testCases } = req.body;

  if (!language || !code || !testCases) {
    return res.status(400).json({ error: 'Language, code, and testCases are required' });
  }

  try {
    const results = await executeCode(language, code, testCases);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Execution service running on port ${PORT}`);
});
