// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// Pega a instância do Firestore
const db = admin.firestore();

// Lógica para conectar ao emulador do Firestore se estiver em ambiente de desenvolvimento
if (process.env.FIRESTORE_EMULATOR_HOST) {
  db.settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false
  });
  functions.logger.info(`Firestore Admin SDK conectado ao emulador em: ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

const N8N_WEBHOOK_URL = "https://n8n.studiomlk.com.br/webhook/sincroapp";

// Função de envio de webhook, separada para facilitar o teste
const sendToWebhook = async (payload) => {
  functions.logger.info("[ETAPA 3] Tentando enviar dados para o n8n:", payload);
  await axios.post(N8N_WEBHOOK_URL, payload);
  functions.logger.info(`[ETAPA 4] Webhook enviado com sucesso.`);
};

// --- FUNÇÃO DE CRIAÇÃO DE USUÁRIO PARA TESTE ---
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("================ NOVO TESTE DE USUÁRIO ================");
  functions.logger.info("[ETAPA 1] Função onUserCreate ACIONADA para o usuário:", user.email);
  
  const payload = {
    event: "user_created",
    email: user.email,
    name: user.displayName || user.email.split('@')[0],
    plan: "gratuito",
    userId: user.uid,
  };
  
  functions.logger.info("[ETAPA 2] Payload preparado:", payload);

  // --- INÍCIO DO TESTE DE ISOLAMENTO ---
  // A chamada para o n8n está comentada. Se a função for concluída com sucesso agora,
  // saberemos que o problema é 100% na conexão de rede com o n8n.
  
  // await sendToWebhook(payload); 
  
  functions.logger.info("[ETAPA 3 e 4 - PULADAS] Chamada de Webhook desativada para teste.");
  // --- FIM DO TESTE DE ISOLAMENTO ---
  
  functions.logger.info("[ETAPA 5] Função onUserCreate concluída com sucesso.");
  functions.logger.info("==========================================================");
});


// --- OUTRAS FUNÇÕES (permanecem inalteradas, mas com a chamada de webhook comentada para segurança) ---

exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  const payload = {
    event: "user_deleted",
    email: user.email,
    userId: user.uid,
  };
  // await sendToWebhook(payload);
});

exports.onUserUpdate = functions.firestore.document("users/{userId}").onUpdate(async (change) => {
  const beforeData = change.before.data();
  const afterData = change.after.data();

  if (beforeData.plano !== "premium" && afterData.plano === "premium") {
    const payload = { event: "plan_upgraded", email: afterData.email, name: afterData.nome, plan: afterData.plano, userId: change.after.id };
    // await sendToWebhook(payload);
  }

  if (beforeData.plano === "premium" && afterData.plano !== "premium") {
    const payload = { event: "plan_downgraded", email: afterData.email, name: afterData.nome, plan: afterData.plano, userId: change.after.id };
    // await sendToWebhook(payload);
  }

  if (beforeData.nome !== afterData.nome) {
    const payload = { event: "profile_updated", email: afterData.email, oldName: beforeData.nome, newName: afterData.nome, userId: change.after.id };
    // await sendToWebhook(payload);
  }
});