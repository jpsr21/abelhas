const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());

// Lista de clientes WebSocket
let clients = [];

wss.on("connection", (ws) => {
  console.log("✅ Novo cliente conectado!");
  clients.push(ws);

  ws.on("close", () => {
    console.log("⚠️ Cliente desconectado!");
    clients = clients.filter((client) => client !== ws);
  });
});

// Rota para receber dados do ESP32
app.post("/dados", (req, res) => {
  const { temperatura, umidade, chama, status } = req.body;

  const dados = {
    temperatura,
    umidade,
    chama,
    status,
    horario: new Date().toLocaleString("pt-BR"),
  };

  console.log("📡 Dados recebidos do ESP32:", dados);

  // Envia para todos os navegadores conectados via WebSocket
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(dados));
    }
  });

  res.send("✅ Dados recebidos e enviados aos clientes!");
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
