const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir requisições JSON e CORS
app.use(cors());

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

let ultimoDado = {}; // Armazena o último dado gerado

// Função para gerar valores aleatórios (simulação de sensores)
function gerarDados() {
  return {
    temperatura: (Math.random() * (35 - 20) + 20).toFixed(1), // 20°C a 35°C
    umidade: (Math.random() * (90 - 40) + 40).toFixed(1), // 40% a 90%
    peso: (Math.random() * (10 - 5) + 5).toFixed(2), // 5kg a 10kg
    co2: Math.floor(Math.random() * (800 - 300) + 300) // 300ppm a 800ppm
  };
}

// Envia dados aleatórios a cada 2 segundos
setInterval(() => {
  ultimoDado = gerarDados();
  console.log("Enviando dados:", ultimoDado);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(ultimoDado));
    }
  });
}, 2000);

// Endpoint para testar a API via HTTP
app.get("/dados", (req, res) => {
  res.json(ultimoDado);
});

// Iniciar servidor HTTP
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`WebSocket rodando em ws://localhost:8080/`);
});
