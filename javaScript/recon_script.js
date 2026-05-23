// ... (mantenha seus arrays 'materiais' e 'atributos' como estão)

// Adicione esta função auxiliar para o scroll suave
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ... (mantenha switchTab, renderTable, clearCurrentTable, calculateValues, toggleColumn como estão)

function finalizeBatch() {
    const fieldLote = document.getElementById('lote_atual');
    const fieldOrdem = document.getElementById('ordem_atual');
    const lote = fieldLote.value.trim();
    const ordem = fieldOrdem.value.trim();

    if (!lote) {
        alert('Erro: O campo "Número do Lote Atual" é obrigatório.');
        fieldLote.focus();
        return;
    }
    if (!ordem) {
        alert('Erro: O campo "Número da Ordem Atual" é obrigatório.');
        fieldOrdem.focus();
        return;
    }

    const dadosMateriais = {};
    const transferenciasEnviadas = []; 
    const transferenciasRecebidas = [];

    for (let i = 0; i < materiais.length; i++) {
        const mat = materiais[i];
        const isHidden = document.getElementById(`toggle-${mat.id}`) ? !document.getElementById(`toggle-${mat.id}`).checked : false;
        
        if (!isHidden) {
            for (let j = 0; j < atributos.length; j++) {
                const attr = atributos[j];
                if (attr.type === 'number' || attr.type === 'text') {
                    const inputEl = document.getElementById(`${mat.id}_${attr.id}`);
                    if (inputEl && inputEl.value.trim() === "") {
                        alert(`Erro: O campo "${attr.label}" do material [ ${mat.label} ] está vazio. Por favor, preencha-o antes de finalizar.`);
                        inputEl.focus();
                        return;
                    }
                }
            }

            const textRefugo = document.getElementById(`${mat.id}_B`).textContent;
            dadosMateriais[mat.id] = {
                label: mat.label,
                totalA3: document.getElementById(`${mat.id}_A3`).textContent,
                refugoB: textRefugo,
                pct: document.getElementById(`${mat.id}_calc_refugo`).textContent,
                statusClass: document.getElementById(`${mat.id}_calc_refugo`).className
            };

            const qtdTransf = parseFloat(document.getElementById(`${mat.id}_qtd_transf_prox`).value) || 0;
            if (qtdTransf > 0) {
                const ordemDestino = document.getElementById(`${mat.id}_ordem_receber_transf`).value.trim();
                const loteMaterial = document.getElementById(`${mat.id}_lote_transf`).value.trim();
                
                transferenciasEnviadas.push({
                    material: mat.label,
                    quantidade: qtdTransf,
                    ordemDestino: ordemDestino,
                    loteMaterial: loteMaterial
                });
            }

            const qtdRecebidaAnt = parseFloat(document.getElementById(`${mat.id}_A2`).value) || 0;
            if (qtdRecebidaAnt > 0) {
                const ordemOrigem = document.getElementById(`${mat.id}_ordem_transf_ant`).value.trim();
                transferenciasRecebidas.push({
                    material: mat.label,
                    quantidade: qtdRecebidaAnt,
                    ordemOrigem: ordemOrigem
                });
            }
        }
    }

    const agora = new Date();
    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesAnoChave = `${mesesNomes[agora.getMonth()]} de ${agora.getFullYear()}`;

    const novoRegistro = {
        id: Date.now(),
        lote: lote,
        ordem: ordem,
        dataHora: agora.toLocaleString('pt-BR'),
        mesAno: mesAnoChave, 
        materiais: dadosMateriais,
        transferencias: transferenciasEnviadas, 
        recebidos: transferenciasRecebidas 
    };

    const historicoExistente = JSON.parse(localStorage.getItem('historico_reconciliacao')) || [];
    historicoExistente.unshift(novoRegistro);
    localStorage.setItem('historico_reconciliacao', JSON.stringify(historicoExistente));

    alert('Lote finalizado e gravado com sucesso!');
    
    // Reset da interface
    fieldLote.value = '';
    fieldOrdem.value = '';
    renderTable();
    calculateValues();
    loadHistory(); // Atualiza o histórico na tela

    // Efeito de retorno ao topo e foco
    scrollToTop();
    setTimeout(() => fieldLote.focus(), 500);
}

// ... (mantenha loadHistory, toggleTransferPanel, deleteHistoryItem, clearAllHistory como estão)

window.onload = function() {
    renderTable();
    calculateValues();
    loadHistory(); // Carrega o histórico ao abrir a página
};