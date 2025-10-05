const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// --- INÍCIO DA CLOUD FUNCTION PARA IA (VERSÃO CORRIGIDA E FINAL) ---

// Carrega a chave de API a partir das variáveis de ambiente do Firebase
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// ### CORREÇÃO: Voltando para 'onCall' que resolve o CORS e o Bad Request automaticamente ###
exports.generateMilestones = functions.https.onCall(async (data, context) => {
  // 1. Autenticação (já inclusa no 'onCall')
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Você precisa estar autenticado para usar esta funcionalidade.",
    );
  }

  // 2. Recebendo os dados (o 'onCall' já formata o 'data' corretamente)
  const { goalTitle, goalDescription } = data;
  if (!goalTitle) {
    throw new functions.https.HttpsError("invalid-argument", "O título da meta é obrigatório.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    Você é um assistente especialista em produtividade e planejamento.
    Sua tarefa é quebrar uma meta principal em 5 a 7 marcos ou tarefas acionáveis.
    A meta do usuário é: "${goalTitle}".
    A descrição/motivação é: "${goalDescription}".

    Baseado nisso, sugira de 5 a 7 marcos claros e concisos.
    Responda apenas com uma lista de frases, onde cada frase é um marco.
    Não adicione números, marcadores (como "-"), ou qualquer texto extra antes ou depois da lista.
    Cada marco deve estar em uma nova linha.

    Exemplo de resposta esperada:
    Definir a estrutura e os primeiros 5 episódios
    Criar a identidade visual e as vinhetas
    Gravar o primeiro episódio piloto
    Planejar a estratégia de lançamento nas redes sociais
    Publicar o primeiro episódio
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const milestones = text.split("\n").filter((line) => line.trim() !== "");
    return { milestones }; // O 'onCall' formata o retorno automaticamente
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    throw new functions.https.HttpsError("internal", "Não foi possível gerar as sugestões. Tente novamente.");
  }
});

// --- FIM DA NOVA CLOUD FUNCTION PARA IA ---


// Suas funções existentes permanecem intactas abaixo

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

const sendToWebhook = async (payload) => {
  try {
    functions.logger.info("Tentando enviar dados para o n8n:", payload);
    await axios.post(N8N_WEBHOOK_URL, payload);
    functions.logger.info("Webhook enviado com sucesso para n8n.");
  } catch (error) {
    functions.logger.error("ERRO AO ENVIAR WEBHOOK:", { errorMessage: error.message });
  }
};

exports.onNewUserDocumentCreate = functions.firestore.document("users/{userId}").onCreate(async (snapshot, context) => {
  functions.logger.info("================ onNewUserDocumentCreate ACIONADA ================");
  const userData = snapshot.data();
  const userId = context.params.userId;
  functions.logger.info("Novo documento de usuário criado:", { uid: userId, data: userData });
  const payload = {
    event: "user_created",
    email: userData.email,
    name: `${userData.primeiroNome || ''} ${userData.sobrenome || ''}`.trim(), 
    plan: userData.plano || "gratuito",
    userId: userId,
  };
  await sendToWebhook(payload);
  functions.logger.info("Função onNewUserDocumentCreate concluída.");
  functions.logger.info("================================================================");
  return null;
});

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
      name: `${afterData.primeiroNome || ''} ${afterData.sobrenome || ''}`.trim(),
      plan: afterData.plano,
      userId,
    };
    await sendToWebhook(payload);
  }
  functions.logger.info("==========================================================");
  return null;
});

exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const logger = functions.logger;
  logger.info(`Iniciando limpeza de dados para o usuário deletado: ${userId}`);
  const firestore = admin.firestore();
  try {
    await firestore.collection("users").doc(userId).delete();
    logger.log(`Documento do usuário ${userId} em /users deletado com sucesso.`);
    
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