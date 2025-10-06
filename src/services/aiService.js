// src/services/aiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a API key do .env
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

let genAI;
let model;

// Valida se a API key existe
if (!API_KEY) {
  console.error("❌ VITE_GOOGLE_AI_API_KEY não encontrada no arquivo .env");
}

const getModel = () => {
  if (!model) {
    console.log("Inicializando o modelo de IA pela primeira vez...");
    
    if (!API_KEY) {
      throw new Error("API Key do Google AI não configurada. Adicione VITE_GOOGLE_AI_API_KEY no arquivo .env");
    }
    
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return model;
};

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
    const generativeModel = getModel();
    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const milestones = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
    
    return milestones;

  } catch (error) {
    console.error("Erro ao gerar sugestões:", error);
    
    // Fornece mensagens de erro mais específicas
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API Key inválida. Verifique sua chave no Google AI Studio.");
    } else if (error.message?.includes("QUOTA_EXCEEDED")) {
      throw new Error("Cota de uso da API excedida. Tente novamente mais tarde.");
    }
    
    throw error;
  }
};