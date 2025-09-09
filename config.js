// --- AgentricAI Configuration ---
//
// This application is designed to be "API-Optional".
// You can run and interact with an agent's native logic and persistent memory
// without any API key.
//
// To unlock advanced features like persona generation, visual generation,
// or complex reasoning, you need to provide a Google AI API key.
//
// 1. Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
// 2. Paste your key in the placeholder below.
// 3. This file is ignored by git to prevent accidental exposure of your key.

window.process = {
  env: {
    API_KEY: 'YOUR_API_KEY_HERE'
  }
};
