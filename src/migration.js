// src/migration.js

import { db } from './services/firebase.js';
import { doc, setDoc } from "firebase/firestore";
import { 
    textosArcanos, 
    textosDescritivos, 
    bussolaAtividades, 
    textosCiclosDeVida,
    textosExplicativos,
    textosVibracoes,
    journalPrompts
} from './data/content.js';

export const runMigration = async () => {
    // 1. Confirmação para evitar execução acidental (ótima prática, mantida)
    if (!window.confirm("Você tem certeza que deseja migrar TODOS os textos do 'content.js' para o Firestore? Esta ação irá sobrescrever os dados existentes na coleção 'textos_sistema'.")) {
        console.log("Migração cancelada pelo usuário.");
        return;
    }

    console.log("Iniciando migração de textos para o Firestore...");

    try {
        // Mapeamento dos dados a serem migrados
        const migrations = {
            "textosArcanos": textosArcanos,
            "bussolaAtividades": bussolaAtividades,
            "textosCiclosDeVida": textosCiclosDeVida,
            "textosDiaPessoal": textosDescritivos.diaPessoal,
            "textosMesPessoal": textosDescritivos.mesPessoal,
            "textosAnoPessoal": textosDescritivos.anoPessoal,
            "textosExplicativos": textosExplicativos,
            "textosVibracoes": textosVibracoes,
            "journalPrompts": journalPrompts
        };

        // MELHORIA 1: Validação de dados antes da migração
        // Verifica se algum dos objetos importados está indefinido, prevenindo erros.
        for (const [docId, data] of Object.entries(migrations)) {
            if (typeof data === 'undefined' || data === null) {
                // Lança um erro claro se um dado essencial estiver faltando.
                throw new Error(`Os dados para '${docId}' não foram encontrados. Verifique a importação ou o arquivo 'content.js'.`);
            }
        }

        let totalItemsMigrated = 0;
        const totalDocs = Object.keys(migrations).length;

        // Itera e executa cada migração com logs detalhados
        for (const [index, [docId, data]] of Object.entries(Object.entries(migrations))) {
            const itemCount = Object.keys(data).length;
            
            // MELHORIA 2: Log de progresso detalhado
            console.log(`[${parseInt(index) + 1}/${totalDocs}] Migrando documento '${docId}' com ${itemCount} itens...`);
            
            await setDoc(doc(db, "textos_sistema", docId), data);
            
            console.log(` -> Documento '${docId}' migrado com sucesso!`);
            totalItemsMigrated += itemCount;
        }

        // MELHORIA 3: Mensagem de sucesso mais completa
        console.log("%cMIGRAÇÃO COMPLETA!", "color: #4ade80; font-weight: bold; font-size: 16px;");
        console.log(`Total de ${totalDocs} documentos na coleção 'textos_sistema' foram atualizados.`);
        console.log(`Total de ${totalItemsMigrated} itens individuais foram salvos.`);
        alert("Migração de TODOS os textos para o Firestore concluída com sucesso!");

    } catch (error) {
        // MELHORIA 4: Mensagem de erro mais informativa
        console.error("❌ ERRO DURANTE A MIGRAÇÃO:", error);
        alert(`Ocorreu um erro durante a migração: ${error.message}. Verifique o console para mais detalhes.`);
    }
};