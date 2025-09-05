let socket;

function conectar() {
  socket = new WebSocket("wss://abelhas.onrender.com");

  socket.onopen = () => {
    console.log("✅ Conectado ao WebSocket!");
    document.getElementById("status").innerText = "✅ Conectado ao servidor!";
    document.getElementById("status").className = "status seguro";
  };

  socket.onmessage = (event) => {
    const dados = JSON.parse(event.data);
    document.getElementById("temp").innerText = dados.temperatura;
    document.getElementById("umid").innerText = dados.umidade;

    const statusEl = document.getElementById("status");
    if (dados.status === "CHAMA") {
      statusEl.innerText = "🔥 ALERTA: Chama detectada!";
      statusEl.className = "status chama";
    } else {
      statusEl.innerText = "✅ Ambiente seguro";
      statusEl.className = "status seguro";
    }
  };

  socket.onerror = (error) => {
    console.error("❌ Erro no WebSocket:", error);
  };

  socket.onclose = () => {
    console.warn("⚠️ WebSocket desconectado, tentando reconectar em 3s...");
    document.getElementById("status").innerText = "⚠️ Reconectando...";
    document.getElementById("status").className = "status chama";

    setTimeout(conectar, 3000); // tenta reconectar a cada 3 segundos
  };
}

// Inicializa a primeira conexão
conectar();
