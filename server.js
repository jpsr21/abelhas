const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware para receber JSON
app.use(bodyParser.json());

// Lista de clientes WebSocket
let clients = [];

// Conexão WebSocket
wss.on("connection", (ws) => {
  console.log("✅ Novo cliente conectado!");
  clients.push(ws);

  ws.on("close", () => {
    console.log("⚠️ Cliente desconectado!");
    clients = clients.filter((client) => client !== ws);
  });

  ws.on("error", (err) => {
    console.error("❌ Erro no WebSocket:", err);
  });
});

// Rota para receber dados do ESP32
app.post("/dados", (req, res) => {
  try {
    // Valida se o corpo do POST existe
    if (!req.body) {
      return res.status(400).send("JSON inválido ou vazio");
    }

    // Extrai os dados, garantindo que existam
    const { temperatura, umidade, chama, status } = req.body;
    if (
      temperatura === undefined ||
      umidade === undefined ||
      chama === undefined ||
      status === undefined
    ) {
      return res.status(400).send("Campos incompletos no JSON");
    }

    const dados = {
      temperatura,
      umidade,
      chama,
      status,
      horario: new Date().toLocaleString("pt-BR"),
    };

    console.log("📡 Dados recebidos do ESP32:", dados);

    // Envia para todos os clientes WebSocket abertos
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(dados));
        } catch (err) {
          console.error("❌ Erro ao enviar para cliente:", err);
        }
      }
    });

    res.send("✅ Dados recebidos e enviados aos clientes!");
  } catch (err) {
    console.error("❌ Erro na rota /dados:", err);
    res.status(500).send("Erro interno do servidor");
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
