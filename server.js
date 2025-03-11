const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir requisições JSON e CORS
app.use(cors());
app.use(bodyParser.json());

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

let ultimoDado = {}; // Armazena o último dado recebido

// Rota para receber dados do ESP32
app.post("/dados", (req, res) => {
  ultimoDado = req.body;
  console.log("Recebido do ESP32:", ultimoDado);

  // Enviar dados para todos os clientes WebSocket conectados
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(ultimoDado));
    }
  });

  res.json({ status: "OK" });
});

// Iniciar servidor HTTP
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// WebSocket conectado
wss.on("connection", ws => {
  console.log("Cliente WebSocket conectado!");
  if (Object.keys(ultimoDado).length > 0) {
    ws.send(JSON.stringify(ultimoDado)); // Envia o último dado ao novo cliente
  }
});
