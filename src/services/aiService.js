// src/services/aiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { textosDescritivos } from '../data/content'; // Importamos as descrições

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
    // ATUALIZADO: Usar Gemini 1.5 Flash
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  }
  return model;
};

// ### ALTERAÇÃO PRINCIPAL: FUNÇÃO AGORA RECEBE MAIS CONTEXTO ###
export const generateSuggestionsWithDates = async (goalTitle, goalDescription, userBirthDate, startDate) => {

  // Transforma as descrições do dia pessoal em um formato simples para o prompt
  const numerologyContext = Object.entries(textosDescritivos.diaPessoal)
    .filter(([key]) => !isNaN(key)) // Filtra apenas chaves numéricas
    .map(([day, { titulo, desc }]) => `Dia Pessoal ${day} (${titulo}): ${desc}`)
    .join('\n');

  const formattedStartDate = startDate.toLocaleDateString('pt-BR');

  const prompt = `
    Você é um assistente especialista em produtividade e planejamento, com profundo conhecimento em numerologia.
    Sua tarefa é quebrar uma meta principal em 5 a 7 marcos ou tarefas acionáveis E atribuir a data ideal para cada um, baseado na numerologia do dia pessoal do usuário.

    **Contexto Numerológico para Análise:**
    ${numerologyContext}
    ---
    Um dia de vibração 1 é bom para inícios.
    Um dia de vibração 4 é bom para trabalho duro e organização.
    Um dia de vibração 5 é bom para mudanças e ações versáteis.
    Um dia de vibração 9 é bom para finalizações.
    Use as outras vibrações de forma complementar.
    ---

    **Dados do Usuário:**
    - Meta Principal: "${goalTitle}"
    - Motivação: "${goalDescription || "Não fornecida"}"
    - Data de Nascimento do Usuário: ${userBirthDate} (use isso para calcular o dia pessoal de datas futuras)
    - Data de Início para o Planejamento: ${formattedStartDate}

    **Sua Tarefa:**
    1.  Crie de 5 a 7 marcos claros e concisos para atingir a meta.
    2.  Para cada marco, determine a data futura mais apropriada para sua execução, começando a partir de ${formattedStartDate}. Considere a energia do dia pessoal para cada data. Por exemplo, agende tarefas de "início" em dias de vibração 1.
    3.  As datas devem ser sequenciais e realistas, com espaçamento de alguns dias ou semanas entre elas.
    4.  Responda **APENAS** com um objeto JSON. Não inclua a palavra "json" ou quaisquer marcadores de código como \`\`\`.
    
    O JSON deve ser um array de objetos, onde cada objeto tem duas chaves: "title" (o marco) e "date" (a data sugerida no formato "YYYY-MM-DD").

    **Exemplo de Resposta Esperada:**
    [
      {"title": "Definir a estrutura e os primeiros 5 episódios", "date": "2025-10-10"},
      {"title": "Criar a identidade visual e as vinhetas", "date": "2025-10-17"},
      {"title": "Gravar o primeiro episódio piloto", "date": "2025-10-25"},
      {"title": "Planejar a estratégia de lançamento nas redes sociais", "date": "2025-11-05"},
      {"title": "Publicar o primeiro episódio", "date": "2025-11-15"}
    ]
  `;

  try {
    const generativeModel = getModel();
    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Limpa a resposta para garantir que seja um JSON válido
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const suggestions = JSON.parse(text);
    
    return suggestions; // Agora retorna o array de objetos {title, date}

  } catch (error) {
    console.error("Erro ao gerar sugestões com datas:", error);
    console.error("Resposta recebida da IA que causou o erro:", text);
    
    if (error instanceof SyntaxError) {
      throw new Error("A IA retornou um formato inválido. Tente novamente.");
    }
    
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API Key inválida. Verifique sua chave no Google AI Studio.");
    } else if (error.message?.includes("QUOTA_EXCEEDED")) {
      throw new Error("Cota de uso da API excedida. Tente novamente mais tarde.");
    }
    
    throw new Error("Ocorreu um erro ao se comunicar com a IA.");
  }
};