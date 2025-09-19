const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

async function testOpenAIApiKey() {
  console.log('Testing OpenAI API Key...');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('❌ Error: OPENAI_API_KEY is not set or is still the placeholder value');
    console.log('Please update the .env file with your actual OpenAI API key');
    return;
  }
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    // Test the API key with a simple request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say this is a test' }],
      max_tokens: 10,
    });
    
    console.log('✅ Success: OpenAI API key is valid');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.log('❌ Error: OpenAI API key test failed');
    console.log('Error details:', error.message);
    
    if (error.message.includes('401')) {
      console.log('This usually means the API key is invalid or expired');
    }
  }
}

// Run the test
testOpenAIApiKey();