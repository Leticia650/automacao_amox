const materiais = [
    { id: 'frascos', label: 'Frascos' }, { id: 'tampas', label: 'Tampas' },
    { id: 'seringa', label: 'Seringa' }, { id: 'copo', label: 'Copo' },
    { id: 'rotulo', label: 'Rótulo' }, { id: 'cartucho', label: 'Cartucho' },
    { id: 'bula', label: 'Bula' }, { id: 'caixa', label: 'Caixa' },
    { id: 'cola', label: 'Cola' }, { id: 'pallet', label: 'Pallet' }
];

function switchTab(tabId, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const currentEvent = event || window.event;
    if(currentEvent && currentEvent.currentTarget) {
        currentEvent.currentTarget.classList.add('active');
    }
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

function getActiveMaterials() {
    const useSeringa = document.getElementById('use_seringa')?.checked;
    const useCopo = document.getElementById('use_copo')?.checked;

    return materiais.filter(mat => {
        if (mat.id === 'seringa' && !useSeringa) return false;
        if (mat.id === 'copo' && !useCopo) return false;
        return true;
    });
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const materiaisAtivos = getActiveMaterials();

    materiaisAtivos.forEach(mat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${mat.label}</strong></td>
            <td><input type="text" id="${mat.id}_ordem_origem" placeholder="..."></td>
            <td><input type="number" id="${mat.id}_qtd_recebida" placeholder="0"></td>
            <td><input type="text" id="${mat.id}_ordem_destino" placeholder="..."></td>
            <td><input type="text" id="${mat.id}_lote_mat" placeholder="..."></td>
            <td><input type="number" id="${mat.id}_qtd_transferida" placeholder="0"></td>
        `;
        tbody.appendChild(tr);
    });
}

function clearCurrentTable() {
    if (confirm('Deseja limpar todos os campos da tabela atual?')) {
        const materiaisAtivos = getActiveMaterials();
        materiaisAtivos.forEach(mat => {
            const ids = ['ordem_origem', 'qtd_recebida', 'ordem_destino', 'lote_mat', 'qtd_transferida'];
            ids.forEach(suffix => {
                const el = document.getElementById(`${mat.id}_${suffix}`);
                if (el) el.value = '';
            });
        });
    }
}

function deleteHistoryItem(id) {
    if(confirm('Remover este registro de movimentação do histórico?')) {
        let historico = JSON.parse(localStorage.getItem('historico_transferencias')) || [];
        historico = historico.filter(reg => reg.id !== id);
        localStorage.setItem('historico_transferencias', JSON.stringify(historico));
        loadHistory();
    }
}

function finalizeTransfers() {
    const fieldLote = document.getElementById('lote_atual');
    const fieldOrdem = document.getElementById('ordem_atual');
    
    if (!fieldLote.value.trim() || !fieldOrdem.value.trim()) {
        alert('Atenção: É obrigatório preencher "Lote de Trabalho" e "Ordem de Trabalho"!');
        return;
    }

    const entradas = [];
    const saidas = [];
    getActiveMaterials().forEach(mat => {
        const qtdRecebida = parseFloat(document.getElementById(`${mat.id}_qtd_recebida`).value) || 0;
        const qtdTransferida = parseFloat(document.getElementById(`${mat.id}_qtd_transferida`).value) || 0;

        if (qtdRecebida > 0) {
            entradas.push({ 
                material: mat.label, 
                ordemOrigem: document.getElementById(`${mat.id}_ordem_origem`).value.trim() || "N/A", 
                quantidade: qtdRecebida 
            });
        }
        if (qtdTransferida > 0) {
            saidas.push({ 
                material: mat.label, 
                ordemDestino: document.getElementById(`${mat.id}_ordem_destino`).value.trim() || "N/A", 
                loteMaterial: document.getElementById(`${mat.id}_lote_mat`).value.trim() || "N/A", 
                quantidade: qtdTransferida 
            });
        }
    });

    if (entradas.length === 0 && saidas.length === 0) {
        alert('Insira ao menos uma quantidade de entrada ou saída.');
        return;
    }

    const agora = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    const novoRegistro = {
        id: Date.now(),
        loteContexto: fieldLote.value.trim(),
        ordemContexto: fieldOrdem.value.trim(),
        dataHora: agora.toLocaleString('pt-BR'),
        mesAno: `${meses[agora.getMonth()]} de ${agora.getFullYear()}`,
        entradas,
        saidas
    };

    const historico = JSON.parse(localStorage.getItem('historico_transferencias')) || [];
    historico.unshift(novoRegistro);
    localStorage.setItem('historico_transferencias', JSON.stringify(historico));

    // Reset da interface
    fieldLote.value = '';
    fieldOrdem.value = '';
    renderTable();
    loadHistory();

    // Scroll para o topo e foco no início
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => fieldLote.focus(), 500); 

    alert('Movimentações salvas com sucesso!');
}

function loadHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;
    const historico = JSON.parse(localStorage.getItem('historico_transferencias')) || [];

    if (historico.length === 0) {
        container.innerHTML = '<div class="empty-history">Nenhuma transferência registrada.</div>';
        return;
    }

    const grupos = historico.reduce((acc, reg) => {
        (acc[reg.mesAno] = acc[reg.mesAno] || []).push(reg);
        return acc;
    }, {});

    container.innerHTML = '';
    for (const mesAno in grupos) {
        const secao = document.createElement('div');
        secao.className = 'month-section';
        secao.innerHTML = `<div class="month-title"><span>${mesAno}</span></div>`;

        grupos[mesAno].forEach(reg => {
            const card = document.createElement('div');
            card.className = 'history-card';
            
            let linhasEntrada = reg.entradas.map(e => `<tr><td><strong>${e.material}</strong></td><td>${e.ordemOrigem}</td><td>${e.quantidade}</td></tr>`).join('') || '<tr><td colspan="3">Nenhuma</td></tr>';
            let linhasSaida = reg.saidas.map(s => `<tr><td><strong>${s.material}</strong></td><td>${s.ordemDestino}</td><td>${s.loteMaterial}</td><td>${s.quantidade}</td></tr>`).join('') || '<tr><td colspan="4">Nenhuma</td></tr>';

            card.innerHTML = `
                <div class="history-header">
                    <div><strong>Lote:</strong> ${reg.loteContexto} | <strong>Ordem:</strong> ${reg.ordemContexto} | <small>${reg.dataHora}</small></div>
                    <button class="btn-delete-item" onclick="deleteHistoryItem(${reg.id})">Excluir</button>
                </div>
                <div class="history-tables-wrapper">
                    <div class="history-table-box"><h4>📥 Entradas</h4><table class="mini-table"><thead><tr><th>Mat.</th><th>Origem</th><th>Qtd</th></tr></thead><tbody>${linhasEntrada}</tbody></table></div>
                    <div class="history-table-box"><h4>📤 Saídas</h4><table class="mini-table"><thead><tr><th>Mat.</th><th>Destino</th><th>Lote</th><th>Qtd</th></tr></thead><tbody>${linhasSaida}</tbody></table></div>
                </div>
            `;
            secao.appendChild(card);
        });
        container.appendChild(secao);
    }
}

window.onload = function() {
    renderTable();
    loadHistory();
};