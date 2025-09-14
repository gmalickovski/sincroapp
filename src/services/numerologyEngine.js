// /src/services/numerologyEngine.js

/* ==================================================================
    VERSÃO COMPLETA E CORRIGIDA - SUBSTITUA O CONTEÚDO DO SEU ARQUIVO
   ================================================================== */

// --- Funções de Cálculo Base ---
const tabelaConversao = { 'A': 1, 'I': 1, 'Q': 1, 'J': 1, 'Y': 1, 'B': 2, 'K': 2, 'R': 2, 'C': 3, 'G': 3, 'L': 3, 'S': 3, 'D': 4, 'M': 4, 'T': 4, 'X': 4, 'E': 5, 'H': 5, 'N': 5, 'U': 6, 'V': 6, 'W': 6, 'O': 7, 'Z': 7, 'F': 8, 'P': 8 };
const vogais = 'AEIOUY';
const consoantes = 'BCDFGHJKLMNPQRSTVWXYZÇ';

function calcularValor(letra) {
    const d = letra.normalize('NFD'), char = d.charAt(0).toUpperCase();
    if (char === 'Ç') return 6;
    let valor = tabelaConversao[char] || 0;
    if (d.length > 1) { const acento = d.charAt(1); if (acento === '´' || acento === '\u0301') valor += 2; if (acento === '˜' || acento === '\u0303') valor += 3; if (acento === '`' || acento === '\u0300') valor *= 3; }
    return valor;
}

function reduzirNumero(n, mestre = false) {
    if (n === undefined || n === null) return 0;
    n = parseInt(n, 10);
    while (n > 9 && !(mestre && (n === 11 || n === 22))) {
        n = String(n).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return n;
}

// --- Funções de Cálculo Detalhadas (Fiéis ao seu código) ---
function calcularIdade(dataNascimento) {
    const [dia, mes, ano] = dataNascimento.split('/').map(Number);
    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();
    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
        idade--;
    }
    return idade;
}

function calcularNumeroDestino(dataNascimento) {
    const [dia, mes, ano] = dataNascimento.split('/').map(Number);
    return reduzirNumero(dia + mes + ano, true);
}

function calcularCiclosDeVida(dataNascimento, numeroDestino) {
    const [diaNasc, mesNasc, anoNasc] = dataNascimento.split('/').map(Number);
    const formatarData = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    
    const idadeFimCiclo1 = 37 - numeroDestino;
    const anoFimCiclo1 = anoNasc + idadeFimCiclo1;
    const dataFim1 = new Date(anoFimCiclo1, mesNasc - 1, diaNasc - 1);
    
    const idadeInicioCiclo2 = idadeFimCiclo1;
    const idadeFimCiclo2 = idadeInicioCiclo2 + 27;
    const anoFimCiclo2 = anoNasc + idadeFimCiclo2;
    const dataInicio2 = new Date(anoNasc + idadeInicioCiclo2, mesNasc - 1, diaNasc);
    const dataFim2 = new Date(anoFimCiclo2, mesNasc - 1, diaNasc - 1);

    const idadeInicioCiclo3 = idadeFimCiclo2;
    const dataInicio3 = new Date(anoNasc + idadeInicioCiclo3, mesNasc - 1, diaNasc);

    return {
        ciclo1: { nome: "Primeiro Ciclo de Vida", regente: reduzirNumero(mesNasc), periodo: `Nascimento até ${formatarData(dataFim1)}`, idadeFim: idadeFimCiclo1 },
        ciclo2: { nome: "Segundo Ciclo de Vida", regente: reduzirNumero(diaNasc, true), periodo: `${formatarData(dataInicio2)} a ${formatarData(dataFim2)}`, idadeInicio: idadeInicioCiclo2, idadeFim: idadeFimCiclo2 },
        ciclo3: { nome: "Terceiro Ciclo de Vida", regente: reduzirNumero(anoNasc, true), periodo: `A partir de ${formatarData(dataInicio3)}`, idadeInicio: idadeInicioCiclo3 }
    };
}

function calcularTrianguloDaVida(nomeCompleto) {
    const nomeLimpo = nomeCompleto.replace(/\s+/g, "").toUpperCase();
    if (!nomeLimpo) return { arcanoRegente: null, sequenciaCompletaArcanos: [] };
    let valoresNumericos = nomeLimpo.split('').map(l => calcularValor(l));
    const sequenciaCompletaArcanos = [];
    for (let i = 0; i < valoresNumericos.length - 1; i++) { sequenciaCompletaArcanos.push(parseInt(`${valoresNumericos[i]}${valoresNumericos[i + 1]}`)); }
    let linhaAtual = valoresNumericos;
    while (linhaAtual.length > 1) { const proximaLinha = []; for (let j = 0; j < linhaAtual.length - 1; j++) { proximaLinha.push(reduzirNumero(linhaAtual[j] + linhaAtual[j + 1])); } linhaAtual = proximaLinha; }
    return { arcanoRegente: linhaAtual[0] || null, sequenciaCompletaArcanos };
}

function calcularArcanoAtual(idade, sequenciaCompletaArcanos) {
    const numArcanos = sequenciaCompletaArcanos.length;
    if (numArcanos === 0) return null;
    const duracaoCicloArcano = 90 / numArcanos;
    const indiceArcano = Math.floor(idade / duracaoCicloArcano);
    return { numero: sequenciaCompletaArcanos[indiceArcano] || null };
}

// --- Função Principal do Motor Numerológico ---
const numerologyEngine = (nomeCompleto, dataNascimento) => {
    if (!nomeCompleto || !dataNascimento) return null;

    const idade = calcularIdade(dataNascimento);
    const destino = calcularNumeroDestino(dataNascimento);
    const ciclosDeVida = calcularCiclosDeVida(dataNascimento, destino);

    let cicloDeVidaAtual;
    if (idade < ciclosDeVida.ciclo1.idadeFim) { cicloDeVidaAtual = ciclosDeVida.ciclo1; }
    else if (idade < ciclosDeVida.ciclo2.idadeFim) { cicloDeVidaAtual = ciclosDeVida.ciclo2; }
    else { cicloDeVidaAtual = ciclosDeVida.ciclo3; }

    const { arcanoRegente, sequenciaCompletaArcanos } = calcularTrianguloDaVida(nomeCompleto);
    const arcanoAtual = calcularArcanoAtual(idade, sequenciaCompletaArcanos);

    const [diaNasc, mesNasc] = dataNascimento.split('/').map(Number);
    const hoje = new Date();
    const aniversarioJaPassou = hoje.getMonth() + 1 > mesNasc || (hoje.getMonth() + 1 === mesNasc && hoje.getDate() >= diaNasc);
    const anoParaCalculo = aniversarioJaPassou ? hoje.getFullYear() : hoje.getFullYear() - 1;
    const anoPessoal = reduzirNumero(diaNasc + mesNasc + anoParaCalculo);
    const mesPessoal = reduzirNumero(anoPessoal + hoje.getMonth() + 1);
    const diaPessoal = reduzirNumero(mesPessoal + reduzirNumero(hoje.getDate(), true), true);

    return {
        idade,
        numeros: { diaPessoal, mesPessoal, anoPessoal },
        estruturas: { ciclosDeVida, cicloDeVidaAtual, arcanoRegente, arcanoAtual }
    };
};

// --- Funções Auxiliares para o App (Exportadas para uso no Calendário, etc.) ---
numerologyEngine.calculatePersonalDayForDate = (date, birthDate) => {
    if (!birthDate) return null;
    const [diaNasc, mesNasc] = birthDate.split('/').map(Number);
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const ano = date.getFullYear();

    // Lógica correta para determinar o Ano Pessoal para a data específica
    const aniversarioNaqueleAno = new Date(ano, mesNasc - 1, diaNasc);
    const anoParaCalculo = date < aniversarioNaqueleAno ? ano - 1 : ano;

    const anoPessoal = reduzirNumero(diaNasc + mesNasc + anoParaCalculo, true);
    const mesPessoal = reduzirNumero(anoPessoal + mes, true);
    const diaReduzido = reduzirNumero(dia, true);
    return reduzirNumero(mesPessoal + diaReduzido, true);
};

export default numerologyEngine;