/**
 * MemeCraft IA - Módulo de chat Node.js
 * Uso: node app.js
 */

const API_KEY = "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";
const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

async function chat(mensaje) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "mistralai/mixtral-8x7b-instruct-v0.1",
      messages: [{ role: 'user', content: mensaje }],
      temperature: 0.4,
      max_tokens: 4096
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || data.error || 'Error';
}

// CLI interactivo
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('MemeCraft IA Node.js Assistant');
console.log('Escribe "salir" para terminar\n');

function preguntar() {
  rl.question('MemeCraft IA > ', async (texto) => {
    if (texto.toLowerCase() === 'salir') { rl.close(); return; }
    if (texto.trim()) {
      const respuesta = await chat(texto);
      console.log(`\n${respuesta}\n`);
    }
    preguntar();
  });
}
preguntar();
