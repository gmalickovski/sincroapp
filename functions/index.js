const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Inicializa o SDK Admin
admin.initializeApp();

const N8N_WEBHOOK_URL = "https://n8n.studiomlk.com.br/webhook/sincroapp";

const sendToWebhook = async (payload) => {
  try {
    // IMPORTANTE: O emulador bloqueia chamadas externas por padrão.
    // Esta chamada só funcionará em produção (deploy).
    // No emulador, ela vai falhar, mas não vai quebrar a função.
    functions.logger.info("Tentando enviar dados para o n8n:", payload);
    await axios.post(N8N_WEBHOOK_URL, payload);
    functions.logger.info("Webhook enviado com sucesso para n8n.");
  } catch (error) {
    functions.logger.error("ERRO AO ENVIAR WEBHOOK (esperado no emulador):", {
      errorMessage: error.message,
    });
    // Não lançamos o erro para não marcar a execução como falha no emulador
  }
};

// Gatilho de criação de usuário (SINTAXE V1)
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("================ onUserCreate ACIONADA (V1) ================");
  functions.logger.info("Novo usuário criado:", { uid: user.uid, email: user.email });

  const payload = {
    event: "user_created",
    email: user.email,
    name: user.displayName || user.email.split('@')[0],
    plan: "gratuito",
    userId: user.uid,
  };

  await sendToWebhook(payload);
  functions.logger.info("Função onUserCreate (V1) concluída.");
  functions.logger.info("==========================================================");
  return null; // Retornar null ou uma Promise resolvida é necessário na V1
});

// Gatilho de atualização de documento de usuário (SINTAXE V1)
exports.onUserUpdate = functions.firestore.document("users/{userId}").onUpdate(async (change, context) => {
  functions.logger.info("================ onUserUpdate ACIONADA (V1) ================");
  const beforeData = change.before.data();
  const afterData = change.after.data();
  const userId = context.params.userId;

  functions.logger.info(`Documento do usuário ${userId} foi atualizado.`);

  if (beforeData.plano !== "premium" && afterData.plano === "premium") {
    functions.logger.info(`Usuário ${userId} fez upgrade para o plano Premium.`);
    const payload = {
      event: "plan_upgraded",
      email: afterData.email,
      name: afterData.nome,
      plan: afterData.plano,
      userId,
    };
    await sendToWebhook(payload);
  }

  functions.logger.info("==========================================================");
  return null;
});