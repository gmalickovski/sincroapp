// /src/migration.js

import { db } from './services/firebase.js';
import { doc, setDoc } from "firebase/firestore";
// Importa TODOS os textos que queremos migrar
// Assumindo que seu content.js continua exportando os outros objetos também
import { textosArcanos, textosDescritivos, bussolaAtividades, textosTooltips, textosCiclosDeVida } from './data/content.js';

export const runMigration = async () => {
    if (!window.confirm("Você tem certeza que deseja migrar TODOS os textos do 'content.js' para o Firestore? Esta ação irá sobrescrever os dados existentes na coleção 'textos_sistema'.")) {
        return;
    }

    console.log("Iniciando migração completa de textos para o Firestore...");

    try {
        // --- Textos que já existiam ---
        await setDoc(doc(db, "textos_sistema", "textosArcanos"), textosArcanos);
        console.log("Textos dos Arcanos migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "bussolaAtividades"), bussolaAtividades);
        console.log("Textos da Bússola de Atividades migrados com sucesso!");

        await setDoc(doc(db, "textos_sistema", "textosTooltips"), textosTooltips);
        console.log("Textos dos Tooltips migrados com sucesso!");
        
        await setDoc(doc(db, "textos_sistema", "textosCiclosDeVida"), textosCiclosDeVida);
        console.log("Textos dos Ciclos de Vida migrados com sucesso!");

        // --- Migrando os textos padronizados do objeto 'textosDescritivos' ---
        
        // Dia Pessoal
        await setDoc(doc(db, "textos_sistema", "textosDiaPessoal"), textosDescritivos.diaPessoal);
        console.log("Textos do Dia Pessoal migrados com sucesso!");
        
        // Mês Pessoal (NOVO)
        await setDoc(doc(db, "textos_sistema", "textosMesPessoal"), textosDescritivos.mesPessoal);
        console.log("Textos do Mês Pessoal migrados com sucesso!");

        // Ano Pessoal (NOVO)
        await setDoc(doc(db, "textos_sistema", "textosAnoPessoal"), textosDescritivos.anoPessoal);
        console.log("Textos do Ano Pessoal migrados com sucesso!");

        console.log("%cMIGRAÇÃO COMPLETA E FINALIZADA!", "color: #4ade80; font-weight: bold;");
        alert("Migração de TODOS os textos para o Firestore concluída com sucesso! Você já pode remover o botão e o código de migração do seu app.");

    } catch (error) {
        console.error("ERRO DURANTE A MIGRAÇÃO:", error);
        alert("Ocorreu um erro durante a migração. Verifique o console para mais detalhes.");
    }
};