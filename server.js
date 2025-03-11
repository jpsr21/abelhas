const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const http = require("http");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let ultimoDado = {
  temperatura: "0",
  umidade: "0",
  peso: "0",
  co2: "0"
};

function gerarDados() {
  return {
    temperatura: (Math.random() * (35 - 20) + 20).toFixed(1),
    umidade: (Math.random() * (90 - 40) + 40).toFixed(1),
    peso: (Math.random() * (10 - 5) + 5).toFixed(2),
    co2: Math.floor(Math.random() * (800 - 300) + 300)
  };
}

setInterval(() => {
  ultimoDado = gerarDados();
  console.log("Enviando dados:", ultimoDado);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(ultimoDado));
    }
  });
}, 2000);

app.get("/dados", (req, res) => {
  res.json(ultimoDado);
});

// Iniciar servidor HTTP + WebSocket
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
