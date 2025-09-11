// /src/migration.js

import { db } from './services/firebase.js';
import { doc, setDoc } from "firebase/firestore";
// Importa TODOS os textos que queremos migrar
import { textosArcanos, textosDescritivos, bussolaAtividades, textosTooltips } from './data/content.js';

export const runMigration = async () => {
    if (!window.confirm("Você tem certeza que deseja migrar os textos do arquivo 'content.js' para o banco de dados Firestore? Esta ação irá sobrescrever quaisquer dados existentes nos documentos de texto.")) {
        return;
    }

    console.log("Iniciando migração de textos para o Firestore...");

    try {
        await setDoc(doc(db, "textos_sistema", "textosArcanos"), textosArcanos);
        console.log("Textos dos Arcanos migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "textosDiaPessoal"), textosDescritivos.diaPessoal);
        console.log("Textos do Dia Pessoal migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "bussolaAtividades"), bussolaAtividades);
        console.log("Textos da Bússola de Atividades migrados com sucesso!");

        // NOVO: Adiciona a migração dos textos dos tooltips
        await setDoc(doc(db, "textos_sistema", "textosTooltips"), textosTooltips);
        console.log("Textos dos Tooltips migrados com sucesso!"); // <-- NOVA LINHA

        console.log("MIGRAÇÃO COMPLETA!");
        alert("Migração de TODOS os textos para o Firestore concluída com sucesso!");

    } catch (error) {
        console.error("ERRO DURANTE A MIGRAÇÃO:", error);
        alert("Ocorreu um erro durante a migração. Verifique o console.");
    }
};