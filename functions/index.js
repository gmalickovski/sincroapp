const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const N8N_WEBHOOK_URL = "https://n8n.studiomlk.com.br/webhook/sincroapp";

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { uid, email } = user;

  if (!email) {
    console.log(`Usuário ${uid} não possui e-mail.`);
    return;
  }

  try {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    let userName = "Usuário"; // Valor padrão

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && userData.nome) {
        userName = userData.nome.split(" ")[0];
      }
    }

    const payload = {
      email: email,
      name: userName,
    };

    console.log("Enviando dados para o n8n:", payload);
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log(`Webhook de boas-vindas acionado com sucesso para ${email}`);

  } catch (error) {
    console.error("Erro ao acionar webhook de boas-vindas:", uid, error);
  }
});