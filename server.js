const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let clients = [];

// Quando o navegador conecta via WebSocket
wss.on("connection", (ws) => {
  console.log("✅ Novo cliente conectado!");
  clients.push(ws);

  ws.on("close", () => {
    console.log("⚠️ Cliente desconectado!");
    clients = clients.filter((client) => client !== ws);
  });
});

// Rota para o ESP32 enviar dados
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

  // Repassa para todos os navegadores conectados
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
