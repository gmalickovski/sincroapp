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
    functions.logger.error("ERRO AO ENVIAR WEBHOOK (esperado no emulador):", {
      errorMessage: error.message,
    });
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
  return null;
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

// ### NOVA FUNÇÃO ADICIONADA AQUI ###
/**
 * Gatilho de Autenticação que é acionado na exclusão de um usuário.
 * Esta função limpa os dados do usuário no Firestore.
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const logger = functions.logger;

  logger.info(`Iniciando limpeza de dados para o usuário deletado: ${userId}`);

  const firestore = admin.firestore();

  try {
    // 1. Deleta o documento principal do usuário (ex: /users/{userId})
    await firestore.collection("users").doc(userId).delete();
    logger.log(`Documento do usuário ${userId} em /users deletado com sucesso.`);

    // NOTA IMPORTANTE: Para deletar subcoleções (tasks, journalEntries),
    // a melhor prática é usar a extensão oficial "Delete User Data" do Firebase.
    // O código abaixo é uma demonstração de como fazer isso manualmente,
    // mas a extensão é mais robusta para produção.

    // 2. Deleta subcoleção 'tasks'
    const tasksRef = firestore.collection("users").doc(userId).collection("tasks");
    const tasksSnapshot = await tasksRef.get();
    const batch = firestore.batch();
    tasksSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    logger.log(`Subcoleção 'tasks' do usuário ${userId} deletada.`);

    // 3. Deleta subcoleção 'journalEntries'
    const journalRef = firestore.collection("users").doc(userId).collection("journalEntries");
    const journalSnapshot = await journalRef.get();
    const journalBatch = firestore.batch();
    journalSnapshot.docs.forEach((doc) => {
        journalBatch.delete(doc.ref);
    });
    await journalBatch.commit();
    logger.log(`Subcoleção 'journalEntries' do usuário ${userId} deletada.`);


    return {
      status: "success",
      message: `Dados do usuário ${userId} limpos com sucesso.`,
    };
  } catch (error) {
    logger.error(`Erro ao limpar dados para o usuário ${userId}:`, error);
    return {
      status: "error",
      message: `Falha ao limpar dados para o usuário ${userId}.`,
    };
  }
});