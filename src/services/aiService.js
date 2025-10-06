// src/services/aiService.js

import { getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from './firebase'; // Importamos a instância do app

// Declaramos a variável do modelo aqui, mas não a inicializamos.
let model;

// Esta função garante que o modelo seja inicializado apenas uma vez, quando for necessário.
const getModel = () => {
  if (!model) {
    console.log("Inicializando o modelo de IA pela primeira vez...");
    model = getGenerativeModel(app, {
      model: "gemini-1.5-flash",
      backend: new GoogleAIBackend(),
    });
  }
  return model;
};

// A função de geração de sugestões agora usa o getModel()
export const generateSuggestions = async (goalTitle, goalDescription) => {
  const prompt = `
    Você é um assistente especialista em produtividade e planejamento.
    Sua tarefa é quebrar uma meta principal em 5 a 7 marcos ou tarefas acionáveis.
    A meta do usuário é: "${goalTitle}".
    A descrição/motivação é: "${goalDescription || "Não fornecida"}".

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
    // 1. Pega o modelo (inicializa apenas se for a primeira vez)
    const generativeModel = getModel();
    
    // 2. Chama o modelo com o prompt
    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 3. Formata a resposta em um array de marcos
    const milestones = text.split('\n').filter(line => line.trim() !== '');
    return milestones;

  } catch (error) {
    console.error("Erro ao gerar sugestões com Firebase AI Logic:", error);
    return [];
  }
};