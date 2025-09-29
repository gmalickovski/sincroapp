// src/migration.js

import { db } from './services/firebase.js';
import { doc, setDoc } from "firebase/firestore";
import { 
    textosArcanos, 
    textosDescritivos, 
    bussolaAtividades, 
    textosCiclosDeVida,
    textosExplicativos,
    textosVibracoes
} from './data/content.js';

export const runMigration = async () => {
    if (!window.confirm("Você tem certeza que deseja migrar TODOS os textos do 'content.js' para o Firestore? Esta ação irá sobrescrever os dados existentes na coleção 'textos_sistema'.")) {
        return;
    }

    console.log("Iniciando migração completa de textos para o Firestore...");

    try {
        // Mapeia os objetos para os nomes dos documentos no Firestore
        const migrations = {
            "textosArcanos": textosArcanos,
            "bussolaAtividades": bussolaAtividades,
            "textosCiclosDeVida": textosCiclosDeVida,
            "textosDiaPessoal": textosDescritivos.diaPessoal,
            "textosMesPessoal": textosDescritivos.mesPessoal,
            "textosAnoPessoal": textosDescritivos.anoPessoal,
            "textosExplicativos": textosExplicativos,
            "textosVibracoes": textosVibracoes
        };

        // Itera e executa cada migração
        for (const [docId, data] of Object.entries(migrations)) {
            await setDoc(doc(db, "textos_sistema", docId), data);
            console.log(`Documento '${docId}' migrado com sucesso!`);
        }

        console.log("%cMIGRAÇÃO COMPLETA E FINALIZADA!", "color: #4ade80; font-weight: bold;");
        alert("Migração de TODOS os textos para o Firestore concluída com sucesso! Você já pode remover o botão e o código de migração do seu app.");

    } catch (error) {
        console.error("ERRO DURANTE A MIGRAÇÃO:", error);
        alert("Ocorreu um erro durante a migração. Verifique o console para mais detalhes.");
    }
};