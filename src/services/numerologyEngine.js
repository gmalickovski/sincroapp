// --- Funções Auxiliares (Internas) ---
const tabelaConversao = { 'A': 1, 'I': 1, 'Q': 1, 'J': 1, 'Y': 1, 'B': 2, 'K': 2, 'R': 2, 'C': 3, 'G': 3, 'L': 3, 'S': 3, 'D': 4, 'M': 4, 'T': 4, 'X': 4, 'E': 5, 'H': 5, 'N': 5, 'U': 6, 'V': 6, 'W': 6, 'O': 7, 'Z': 7, 'F': 8, 'P': 8 };
const calcularValor = (l) => { const d = l.normalize('NFD'), e = d.charAt(0).toUpperCase(); if (e === 'Ç') return 6; let t = tabelaConversao[e] || 0; if (d.length > 1) { const a = d.charAt(1); switch (a) { case '´': case '\u0301': t += 2; break; case '˜': case '\u0303': t += 3; break; case '`': case '\u0300': t *= 3 } } return t };
const reduzirNumero = (n, p = !1) => { if (n === undefined || n === null) return 0; n = parseInt(n); while (n > 9 && !(p && (n === 11 || n === 22))) { n = String(n).split('').reduce((c, d) => c + parseInt(d, 10), 0) } return n };

// --- Funções Principais de Cálculo ---
const calcularIdade = (d) => { const [a, t, o] = d.split('/').map(Number), n = new Date; let i = n.getFullYear() - o; const r = n.getMonth() + 1, e = n.getDate(); if (r < t || r === t && e < a) i--; return i };

const calcularTrianguloDaVidaCompleto = (n) => {
    const nomeLimpo = n.replace(/\s+/g, "").toUpperCase();
    if (!nomeLimpo) return { arcanoRegente: null, sequenciaCompletaArcanos: [] };
    let valoresNumericos = nomeLimpo.split('').map(l => calcularValor(l));
    const sequenciaCompletaArcanos = [];
    for (let i = 0; i < valoresNumericos.length - 1; i++) { sequenciaCompletaArcanos.push(parseInt(`${valoresNumericos[i]}${valoresNumericos[i + 1]}`)); }
    let linhaAtual = valoresNumericos;
    while (linhaAtual.length > 1) {
        const proximaLinha = [];
        for (let j = 0; j < linhaAtual.length - 1; j++) { const soma = reduzirNumero(linhaAtual[j] + linhaAtual[j + 1]); proximaLinha.push(soma); }
        linhaAtual = proximaLinha;
    }
    return { arcanoRegente: linhaAtual[0] || null, sequenciaCompletaArcanos };
};

const calcularArcanoAtual = (idade, dataNascimento, sequenciaCompletaArcanos) => {
    const numArcanos = sequenciaCompletaArcanos.length;
    if (numArcanos === 0) return null;
    const duracaoCicloArcano = 90 / numArcanos;
    const indiceArcano = Math.floor(idade / duracaoCicloArcano);
    return { numero: sequenciaCompletaArcanos[indiceArcano] || null };
};

// Função principal que calcula tudo para o dashboard
const numerologyEngine = (nomeCompleto, dataNascimento) => {
    if (!nomeCompleto || !dataNascimento) return null;
    const idade = calcularIdade(dataNascimento);
    const trianguloCompleto = calcularTrianguloDaVidaCompleto(nomeCompleto);
    const arcanoAtual = calcularArcanoAtual(idade, dataNascimento, trianguloCompleto.sequenciaCompletaArcanos);
    const hoje = new Date();
    const [diaNasc, mesNasc] = dataNascimento.split('/').map(Number);
    const aniversarioJaPassou = hoje.getMonth() + 1 > mesNasc || (hoje.getMonth() + 1 === mesNasc && hoje.getDate() >= diaNasc);
    const anoParaCalculo = aniversarioJaPassou ? hoje.getFullYear() : hoje.getFullYear() - 1;
    const anoPessoal = reduzirNumero(diaNasc + mesNasc + anoParaCalculo);
    const mesPessoal = reduzirNumero(anoPessoal + hoje.getMonth() + 1);
    const diaAtualReduzido = reduzirNumero(hoje.getDate(), true);
    const diaPessoal = reduzirNumero(mesPessoal + diaAtualReduzido, true);

    return {
        idade: idade,
        numeros: { diaPessoal },
        estruturas: {
            arcanoRegente: trianguloCompleto.arcanoRegente,
            arcanoAtual: arcanoAtual,
        }
    };
};

// ========================================================================
// |                     FUNÇÃO DO CALENDÁRIO CORRIGIDA                  |
// ========================================================================
numerologyEngine.calculatePersonalDayForDate = (date, birthDate) => {
    if (!birthDate) return null;
    const [diaNasc, mesNasc] = birthDate.split('/').map(Number);
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const ano = date.getFullYear();

    const aniversarioJaPassou = mes > mesNasc || (mes === mesNasc && dia >= diaNasc);
    const anoParaCalculo = aniversarioJaPassou ? ano : ano - 1;

    const anoPessoal = reduzirNumero(diaNasc + mesNasc + anoParaCalculo, true);
    const mesPessoal = reduzirNumero(anoPessoal + mes, true);
    const diaReduzido = reduzirNumero(dia, true);
    
    // CORREÇÃO: A lógica agora espelha a função original, reduzindo o dia antes de somar.
    return reduzirNumero(mesPessoal + diaReduzido, true);
};

numerologyEngine.calculatePersonalMonthForDate = (date, birthDate) => {
    if (!birthDate) return null;
    const [diaNasc, mesNasc] = birthDate.split('/').map(Number);
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const ano = date.getFullYear();
    const aniversarioJaPassou = mes > mesNasc || (mes === mesNasc && dia >= diaNasc);
    const anoParaCalculo = aniversarioJaPassou ? ano : ano - 1;
    const anoPessoal = reduzirNumero(diaNasc + mesNasc + anoParaCalculo, true);
    return reduzirNumero(anoPessoal + mes, true);
};

export default numerologyEngine;

