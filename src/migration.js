// /src/migration.js

import { db } from './services/firebase.js';
import { doc, setDoc } from "firebase/firestore";
// Importa TODOS os textos que queremos migrar
import { textosArcanos, textosDescritivos, bussolaAtividades, textosTooltips, textosCiclosDeVida } from './data/content.js';

export const runMigration = async () => {
    if (!window.confirm("Você tem certeza que deseja migrar TODOS os textos do 'content.js' para o Firestore? Esta ação irá sobrescrever os dados existentes.")) {
        return;
    }

    console.log("Iniciando migração completa de textos para o Firestore...");

    try {
        await setDoc(doc(db, "textos_sistema", "textosArcanos"), textosArcanos);
        console.log("Textos dos Arcanos migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "textosDiaPessoal"), textosDescritivos.diaPessoal);
        console.log("Textos do Dia Pessoal migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "bussolaAtividades"), bussolaAtividades);
        console.log("Textos da Bússola de Atividades migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "textosTooltips"), textosTooltips);
        console.log("Textos dos Tooltips migrados com sucesso!");
        
        await setDoc(doc(db, "textos_sistema", "textosCiclosDeVida"), textosCiclosDeVida);
        console.log("Textos dos Ciclos de Vida migrados com sucesso!");

        console.log("MIGRAÇÃO COMPLETA E FINALIZADA!");
        alert("Migração de TODOS os textos para o Firestore concluída com sucesso! Você já pode remover o botão e o código de migração.");

    } catch (error) {
        console.error("ERRO DURANTE A MIGRAÇÃO:", error);
        alert("Ocorreu um erro durante a migração. Verifique o console.");
    }
};