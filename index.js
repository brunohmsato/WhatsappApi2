const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { 
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || require("puppeteer").executablePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
   }
});

client.on("qr", (qr) => {
  console.log("Escaneie este QR Code para autenticar no WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Cliente conectado com sucesso!");
});

client.initialize();

app.post("/send", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "Número e mensagem são obrigatórios" });
  }

  try {
    await client.sendMessage(`${number}@c.us`, message);
    res.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar mensagem", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
