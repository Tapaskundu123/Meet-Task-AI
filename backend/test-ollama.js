const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3';

async function testOllama() {
  console.log('Sending request to Ollama...');
  try {
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: OLLAMA_MODEL,
        prompt: 'Hello, respond with a single word "success".',
        stream: false,
      },
      { timeout: 3000 } // Short timeout for testing
    );
    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error stringified:', err.toString());
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error keys:', Object.keys(err));
  }
}

testOllama();
