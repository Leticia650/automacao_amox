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
        const useSeringa = document.getElementById('use_seringa').checked;
        const useCopo = document.getElementById('use_copo').checked;

        return materiais.filter(mat => {
            if (mat.id === 'seringa' && !useSeringa) return false;
            if (mat.id === 'copo' && !useCopo) return false;
            return true;
        });
    }

    function renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        const materiaisAtivos = getActiveMaterials();

        materiaisAtivos.forEach(mat => {
            const tr = document.createElement('tr');
            
            const tdLabel = document.createElement('td');
            tdLabel.innerHTML = `<strong>${mat.label}</strong>`;
            tr.appendChild(tdLabel);

            const tdOrdemOrigem = document.createElement('td');
            tdOrdemOrigem.innerHTML = `<input type="text" id="${mat.id}_ordem_origem" placeholder="...">`;
            tr.appendChild(tdOrdemOrigem);

            const tdQtdRecebida = document.createElement('td');
            tdQtdRecebida.innerHTML = `<input type="number" id="${mat.id}_qtd_recebida" placeholder="0">`;
            tr.appendChild(tdQtdRecebida);

            const tdOrdemDestino = document.createElement('td');
            tdOrdemDestino.innerHTML = `<input type="text" id="${mat.id}_ordem_destino" placeholder="...">`;
            tr.appendChild(tdOrdemDestino);

            const tdLoteMat = document.createElement('td');
            tdLoteMat.innerHTML = `<input type="text" id="${mat.id}_lote_mat" placeholder="...">`;
            tr.appendChild(tdLoteMat);

            const tdQtdTransferida = document.createElement('td');
            tdQtdTransferida.innerHTML = `<input type="number" id="${mat.id}_qtd_transferida" placeholder="0">`;
            tr.appendChild(tdQtdTransferida);

            tbody.appendChild(tr);
        });
    }

    function clearCurrentTable() {
        if (confirm('Deseja limpar todos os campos da tabela atual?')) {
            const materiaisAtivos = getActiveMaterials();
            materiaisAtivos.forEach(mat => {
                document.getElementById(`${mat.id}_ordem_origem`).value = '';
                document.getElementById(`${mat.id}_qtd_recebida`).value = '';
                document.getElementById(`${mat.id}_ordem_destino`).value = '';
                document.getElementById(`${mat.id}_lote_mat`).value = '';
                document.getElementById(`${mat.id}_qtd_transferida`).value = '';
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

    function clearAllHistory() {
        if (confirm('Deseja realmente apagar TODO o histórico de transferências?')) {
            localStorage.removeItem('historico_transferencias');
            loadHistory();
            alert('Histórico totalmente apagado!');
        }
    }

    function finalizeTransfers() {
        const fieldLote = document.getElementById('lote_atual');
        const fieldOrdem = document.getElementById('ordem_atual');
        
        const loteAtual = fieldLote.value.trim();
        const ordemAtual = fieldOrdem.value.trim();

        if (!loteAtual || !ordemAtual) {
            alert('Atenção: É obrigatório preencher o "Lote de Trabalho Atual" e a "Ordem de Trabalho Atual" antes de salvar.');
            return;
        }

        const entradas = [];
        const saidas = [];
        const materiaisAtivos = getActiveMaterials();

        materiaisAtivos.forEach(mat => {
            const ordemOrigem = document.getElementById(`${mat.id}_ordem_origem`).value.trim();
            const qtdRecebida = parseFloat(document.getElementById(`${mat.id}_qtd_recebida`).value) || 0;
            
            const ordemDestino = document.getElementById(`${mat.id}_ordem_destino`).value.trim();
            const loteMat = document.getElementById(`${mat.id}_lote_mat`).value.trim();
            const qtdTransferida = parseFloat(document.getElementById(`${mat.id}_qtd_transferida`).value) || 0;

            if (qtdRecebida > 0) {
                entradas.push({
                    material: mat.label,
                    ordemOrigem: ordemOrigem || "Não Informada",
                    quantidade: qtdRecebida
                });
            }

            if (qtdTransferida > 0) {
                saidas.push({
                    material: mat.label,
                    ordemDestino: ordemDestino || "Não Informada",
                    loteMaterial: loteMat || "Não Informado",
                    quantidade: qtdTransferida
                });
            }
        });

        if (entradas.length === 0 && saidas.length === 0) {
            alert('Insira ao menos uma quantidade de entrada ou saída para registrar a movimentação.');
            return;
        }

        const agora = new Date();
        const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const mesAnoChave = `${mesesNomes[agora.getMonth()]} de ${agora.getFullYear()}`;

        const novoRegistro = {
            id: Date.now(),
            loteContexto: loteAtual,
            ordemContexto: ordemAtual,
            dataHora: agora.toLocaleString('pt-BR'),
            mesAno: mesAnoChave,
            entradas: entradas,
            saidas: saidas
        };

        const historicoExistente = JSON.parse(localStorage.getItem('historico_transferencias')) || [];
        historicoExistente.unshift(novoRegistro);
        localStorage.setItem('historico_transferencias', JSON.stringify(historicoExistente));

        alert('Movimentações salvas e enviadas ao histórico com sucesso!');
        
        fieldLote.value = '';
        fieldOrdem.value = '';
        renderTable();
    }

    function loadHistory() {
        const container = document.getElementById('history-container');
        const historico = JSON.parse(localStorage.getItem('historico_transferencias')) || [];

        if (historico.length === 0) {
            container.innerHTML = '<div class="empty-history">Nenhuma transferência registrada neste navegador.</div>';
            return;
        }

        const grupos = {};
        historico.forEach(reg => {
            if (!grupos[reg.mesAno]) grupos[reg.mesAno] = [];
            grupos[reg.mesAno].push(reg);
        });

        container.innerHTML = '';

        for (const mesAno in grupos) {
            const secao = document.createElement('div');
            secao.className = 'month-section';

            const tituloMes = document.createElement('div');
            tituloMes.className = 'month-title';
            tituloMes.innerHTML = `<span>${mesAno}</span> <span style="font-size:12px; font-weight:normal;">(${grupos[mesAno].length} registro(s))</span>`;
            secao.appendChild(tituloMes);

            grupos[mesAno].forEach(reg => {
                const card = document.createElement('div');
                card.className = 'history-card';

                let linhasEntrada = '';
                if(reg.entradas.length === 0) {
                    linhasEntrada = `<tr><td colspan="3" style="color:#94a3b8; font-style:italic; text-align:center;">Nenhuma entrada registrada</td></tr>`;
                } else {
                    reg.entradas.forEach(e => {
                        linhasEntrada += `<tr><td><strong>${e.material}</strong></td><td>${e.ordemOrigem}</td><td>${e.quantidade}</td></tr>`;
                    });
                }

                let líneasSaida = '';
                if(reg.saidas.length === 0) {
                    linhasSaida = `<tr><td colspan="4" style="color:#94a3b8; font-style:italic; text-align:center;">Nenhuma saída registrada</td></tr>`;
                } else {
                    reg.saidas.forEach(s => {
                        linhasSaida += `<tr><td><strong>${s.material}</strong></td><td>${s.ordemDestino}</td><td>${s.loteMaterial}</td><td>${s.quantidade}</td></tr>`;
                    });
                }

                card.innerHTML = `
                    <div class="history-header">
                        <div>
                            <strong>Ref. Lote:</strong> ${reg.loteContexto} | 
                            <strong>Ref. Ordem:</strong> ${reg.ordemContexto} | 
                            <small style="color:#64748b;">${reg.dataHora}</small>
                        </div>
                        <div>
                            <button class="btn-delete-item" onclick="deleteHistoryItem(${reg.id})">Excluir Registro</button>
                        </div>
                    </div>
                    
                    <div class="history-tables-wrapper">
                        <div class="history-table-box">
                            <h4 style="color:var(--accent);">📥 Entradas (Recebidas do Lote Anterior)</h4>
                            <table class="mini-table">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Ordem de Origem</th>
                                        <th>Qtd Recebida</th>
                                    </tr>
                                </thead>
                                <tbody>${linhasEntrada}</tbody>
                            </table>
                        </div>

                        <div class="history-table-box">
                            <h4 style="color:var(--primary);">📤 Saídas (Transferidas p/ Próximo Lote)</h4>
                            <table class="mini-table">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Ordem Destino</th>
                                        <th>Lote Mat.</th>
                                        <th>Qtd Transf.</th>
                                    </tr>
                                </thead>
                                <tbody>${linhasSaida}</tbody>
                            </table>
                        </div>
                    </div>
                `;
                secao.appendChild(card);
            });
            container.appendChild(secao);
        }
    }

    window.onload = function() {
        renderTable();
    };