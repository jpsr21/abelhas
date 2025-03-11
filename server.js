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
    temperatura: 30
    umidade: 70
    peso: 10
    co2: 500
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
