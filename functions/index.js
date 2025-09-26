// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Inicializa o SDK Admin
admin.initializeApp();

const N8N_WEBHOOK_URL = "https://n8n.studiomlk.com.br/webhook/sincroapp";

const sendToWebhook = async (payload) => {
  try {
    functions.logger.info("Tentando enviar dados para o n8n:", payload);
    await axios.post(N8N_WEBHOOK_URL, payload);
    functions.logger.info("Webhook enviado com sucesso para n8n.");
  } catch (error) {
    functions.logger.error("ERRO AO ENVIAR WEBHOOK:", {
      errorMessage: error.message,
    });
  }
};

// ==================================================================
// ### FUNÇÃO ANTIGA (REMOVIDA) ###
// A função onUserCreate(functions.auth.user().onCreate) foi removida 
// porque ela é disparada antes dos dados do usuário (nome, sobrenome)
// serem salvos no Firestore.
// ==================================================================


// ==================================================================
// ### NOVA FUNÇÃO CORRIGIDA ###
// Esta nova função é acionada QUANDO um novo documento de usuário é
// CRIADO no Firestore, garantindo que temos todos os dados.
exports.onNewUserDocumentCreate = functions.firestore.document("users/{userId}").onCreate(async (snapshot, context) => {
  functions.logger.info("================ onNewUserDocumentCreate ACIONADA ================");
  const userData = snapshot.data();
  const userId = context.params.userId;

  functions.logger.info("Novo documento de usuário criado:", { uid: userId, data: userData });

  const payload = {
    event: "user_created",
    email: userData.email,
    // CORREÇÃO: Agora pegamos o primeiroNome e sobrenome do documento
    name: `${userData.primeiroNome || ''} ${userData.sobrenome || ''}`.trim(), 
    plan: userData.plano || "gratuito",
    userId: userId,
  };

  await sendToWebhook(payload);
  functions.logger.info("Função onNewUserDocumentCreate concluída.");
  functions.logger.info("================================================================");
  return null;
});
// ==================================================================


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
      // CORREÇÃO: Usando os campos corretos para formar o nome completo
      name: `${afterData.primeiroNome || ''} ${afterData.sobrenome || ''}`.trim(),
      plan: afterData.plano,
      userId,
    };
    await sendToWebhook(payload);
  }

  functions.logger.info("==========================================================");
  return null;
});


// Gatilho de exclusão de usuário (permanece igual, está correto)
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const logger = functions.logger;
  logger.info(`Iniciando limpeza de dados para o usuário deletado: ${userId}`);
  const firestore = admin.firestore();
  try {
    await firestore.collection("users").doc(userId).delete();
    logger.log(`Documento do usuário ${userId} em /users deletado com sucesso.`);
    
    // Lógica para deletar subcoleções (manter como está)
    const tasksRef = firestore.collection("users").doc(userId).collection("tasks");
    const tasksSnapshot = await tasksRef.get();
    if (!tasksSnapshot.empty) {
        const batch = firestore.batch();
        tasksSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        logger.log(`Subcoleção 'tasks' do usuário ${userId} deletada.`);
    }

    const journalRef = firestore.collection("users").doc(userId).collection("journalEntries");
    const journalSnapshot = await journalRef.get();
    if (!journalSnapshot.empty) {
        const journalBatch = firestore.batch();
        journalSnapshot.docs.forEach((doc) => journalBatch.delete(doc.ref));
        await journalBatch.commit();
        logger.log(`Subcoleção 'journalEntries' do usuário ${userId} deletada.`);
    }

    return { status: "success", message: `Dados do usuário ${userId} limpos com sucesso.` };
  } catch (error) {
    logger.error(`Erro ao limpar dados para o usuário ${userId}:`, error);
    return { status: "error", message: `Falha ao limpar dados para o usuário ${userId}.` };
  }
});