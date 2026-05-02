require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.slice(0, 15)}...` : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

model.generateContent('Say hello in one word').then(result => {
  console.log('SUCCESS:', result.response.text());
}).catch(err => {
  console.error('ERROR:', err.message);
  if (err.status) console.error('STATUS:', err.status);
});
