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
    if (!req.body) {
      return res.status(400).send("JSON inválido ou vazio");
    }

    // Espera receber do ESP32: DHT11, MQ135 e GPS
    const { temperatura, umidade, mq135, latitude, longitude } = req.body;

    if (
      temperatura === undefined ||
      umidade === undefined ||
      mq135 === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).send("Campos incompletos no JSON");
    }

   // Ajusta limites com base no MQ135
let status = "SEGURO";

if (temperatura > 30 && mq135 > 3000) {
  status = "INCENDIO"; // Alta temperatura + fumaça forte
} else if (mq135 > 3000) {
  status = "FUMACA";   // Apenas fumaça forte
} else if (temperatura > 50) {
  status = "CALOR";    // Apenas temperatura elevada
} else {
  status = "SEGURO";   // Ambiente normal
}


    const dados = {
      temperatura,
      umidade,
      mq135,
      latitude,
      longitude,
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
