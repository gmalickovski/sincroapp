// src/services/aiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { textosDescritivos } from '../data/content';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
let genAI;
let model;

if (!API_KEY) {
  console.error("❌ VITE_GOOGLE_AI_API_KEY não encontrada no arquivo .env");
}

const getModel = () => {
  if (!model) {
    if (!API_KEY) {
      throw new Error("API Key do Google AI não configurada. Adicione VITE_GOOGLE_AI_API_KEY no arquivo .env");
    }
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  }
  return model;
};

// ### ATUALIZADO: Remove 'userJournal' e adiciona 'existingMilestones' ###
export const generateSuggestionsWithDates = async (
    goalTitle, 
    goalDescription, 
    userBirthDate, 
    startDate,
    additionalInfo,
    userTasks = [],
    existingMilestones = [], // Novo
    numerologyData = {}
) => {

  const diaPessoalContext = Object.entries(textosDescritivos.diaPessoal)
    .filter(([key]) => !isNaN(key))
    .map(([day, { titulo, desc }]) => `Dia Pessoal ${day} (${titulo}): ${desc}`)
    .join('\n');

  const { anoPessoal, mesPessoal, cicloDeVida1, cicloDeVida2, cicloDeVida3 } = numerologyData.numeros || {};
  
  const getDesc = (type, number) => {
    if (!number || !textosDescritivos[type] || !textosDescritivos[type][number]) return "Não disponível.";
    return `${textosDescritivos[type][number].titulo}: ${textosDescritivos[type][number].desc}`;
  }

  const anoPessoalContext = `Ano Pessoal ${anoPessoal}: ${getDesc('anoPessoal', anoPessoal)}`;
  const mesPessoalContext = `Mês Pessoal ${mesPessoal}: ${getDesc('mesPessoal', mesPessoal)}`;
  const cicloDeVidaContext = `
    - Primeiro Ciclo de Vida (Formação, até ~28 anos): Vibração ${cicloDeVida1} - ${getDesc('ciclosDeVida', cicloDeVida1)}
    - Segundo Ciclo de Vida (Produção, até ~56 anos): Vibração ${cicloDeVida2} - ${getDesc('ciclosDeVida', cicloDeVida2)}
    - Terceiro Ciclo de Vida (Colheita, após 56 anos): Vibração ${cicloDeVida3} - ${getDesc('ciclosDeVida', cicloDeVida3)}
  `;

  const formattedStartDate = startDate.toLocaleDateString('pt-BR');

  const tasksContext = userTasks.length > 0
    ? userTasks.map(task => `- [${task.completed ? 'X' : ' '}] ${task.text} (Meta: ${task.goalTitle || 'N/A'})`).join('\n')
    : "Nenhuma tarefa recente.";

  // ### NOVO: Contexto dos marcos já existentes ###
  const milestonesContext = existingMilestones.length > 0
    ? existingMilestones.map(milestone => `- ${milestone.text}`).join('\n')
    : "Nenhum marco foi criado para esta meta ainda.";

  // ### PROMPT ATUALIZADO ###
  const prompt = `
    Você é um Coach de Produtividade e Estrategista Pessoal, com profundo conhecimento em numerologia.
    Sua missão é criar um plano de ação estratégico, quebrando uma meta principal em 5 a 7 marcos NOVOS e COMPLEMENTARES, atribuindo a data ideal para cada um.

    **DOSSIÊ DO USUÁRIO:**

    **1. A META:**
    - Meta Principal: "${goalTitle}"
    - Motivação/Descrição: "${goalDescription || "Não fornecida"}"
    - Informações Adicionais do Usuário: "${additionalInfo || "Nenhuma"}"

    **2. MARCOS JÁ EXISTENTES NA META (para evitar repetição):**
    ${milestonesContext}

    **3. CONTEXTO DE LONGO PRAZO (O CENÁRIO GERAL):**
    - ${anoPessoalContext}
    - ${mesPessoalContext}
    - Ciclos de Vida: ${cicloDeVidaContext}
    
    **4. CONTEXTO DE CURTO PRAZO (ATIVIDADES RECENTES):**
    - Últimas Tarefas do Usuário (em todas as metas): ${tasksContext}

    **5. FERRAMENTA PARA DATAS (A VIBRAÇÃO DO DIA):**
    - Data de Início do Planejamento: ${formattedStartDate}
    - Data de Nascimento do Usuário: ${userBirthDate} (use para calcular o dia pessoal de datas futuras)
    - Guia do Dia Pessoal: ${diaPessoalContext}

    ---
    **SUA TAREFA ESTRATÉGICA:**

    1.  **ANÁLISE:** Primeiro, leia os "MARCOS JÁ EXISTENTES". Sua principal prioridade é NÃO sugerir marcos que sejam redundantes ou muito similares aos que já estão listados. Suas sugestões devem ser os PRÓXIMOS PASSOS lógicos.

    2.  **SÍNTESE DO MOMENTO:** Analise o restante do dossiê (Ano Pessoal, Mês, Ciclos, Tarefas) para definir o **TEMA** do plano. O usuário está num ano de inícios? De finalizações? Use isso para guiar o tom das sugestões.

    3.  **CRIE MARCOS NOVOS E COMPLEMENTARES:** Crie de 5 a 7 marcos que continuem o trabalho já feito. Se os marcos existentes são sobre "planejamento", sugira marcos sobre "execução". Se já existem marcos de "criação", sugira sobre "divulgação" ou "análise".
    
    4.  **ATRIBUA DATAS INTELIGENTES:** Para cada novo marco, encontre a data futura ideal (a partir de ${formattedStartDate}) usando o **Dia Pessoal**. (Ex: Planejamento em Dia 4, Lançamento em Dia 1, Conclusão em Dia 9).

    5.  **FORMATO DA RESPOSTA:** Responda **APENAS** com um array de objetos JSON. Não inclua a palavra "json" ou marcadores de código \`\`\`. Cada objeto deve ter as chaves "title" e "date" (formato "YYYY-MM-DD").

    **Exemplo de Resposta Esperada:**
    [
      {"title": "Executar a primeira fase do plano de ação", "date": "2025-10-10"},
      {"title": "Analisar os resultados iniciais e ajustar a estratégia", "date": "2025-10-15"},
      {"title": "Iniciar a divulgação nas redes sociais (Dia 1)", "date": "2025-10-24"}
    ]
  `;

  try {
    const generativeModel = getModel();
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!text.startsWith('[') || !text.endsWith(']')) {
      throw new Error("A IA retornou um formato de texto inesperado.");
    }

    const suggestions = JSON.parse(text);
    return suggestions;

  } catch (error) {
    console.error("Erro ao gerar sugestões estratégicas:", error);
    let textForError = 'Resposta da IA não disponível';
    console.error("Resposta recebida da IA que causou o erro:", textForError);
    
    if (error instanceof SyntaxError) {
      throw new Error("A IA retornou um formato inválido. Tente novamente.");
    }
    
    throw new Error("Ocorreu um erro ao se comunicar com a IA.");
  }
};