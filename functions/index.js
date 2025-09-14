const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Certifique-se de colocar sua URL de produção real do n8n aqui
const N8N_WEBHOOK_URL = "https://n8n.studiomlk.com.br/webhook/sincroapp";

/**
 * Gatilho que dispara quando um novo usuário é criado no Firebase Authentication.
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { uid, email } = user;

  if (!email) {
    functions.logger.log(`Usuário ${uid} não possui e-mail.`);
    return null;
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

    functions.logger.log("Enviando dados para o n8n:", payload);
    await axios.post(N8N_WEBHOOK_URL, payload);
    functions.logger.log(`Webhook de boas-vindas acionado com sucesso para ${email}`);

    return null;
  } catch (error) {
    functions.logger.error("Erro ao acionar webhook de boas-vindas:", uid, error);
    return null;
  }
});