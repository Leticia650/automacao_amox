  const materiais = [
        { id: 'frascos', label: 'Frascos', tol: 5.00 }, { id: 'tampas', label: 'Tampas', tol: 5.00 },
        { id: 'seringa', label: 'Seringa', tol: 2.00 }, { id: 'copo', label: 'Copo', tol: 2.00 },
        { id: 'rotulo', label: 'Rótulo', tol: 5.00 }, { id: 'cartucho', label: 'Cartucho', tol: 2.00 },
        { id: 'bula', label: 'Bula', tol: 2.00 }, { id: 'caixa', label: 'Caixa', tol: 2.00 },
        { id: 'fita', label: 'Fita', tol: 5.00 }, { id: 'cola', label: 'Cola', tol: 0.00 },
        { id: 'pallet', label: 'Pallet', tol: 0.00 }, { id: 'etiqueta_90x130', label: 'Etiqueta 90x130mm', tol: 2.00 },
        { id: 'etiqueta_70x10', label: 'Etiqueta 70x10mm', tol: 2.00 }, { id: 'filme', label: 'Filme', tol: 0.00 },
        { id: 'cantoneira_100', label: 'Cantoneira 1,00mt', tol: 0.00 }, { id: 'cantoneira_120', label: 'Cantoneira 1,20mt', tol: 0.00 }
    ];

    const atributos = [
        { id: 'A', label: 'A: quantidade recebida', type: 'number' },
        { id: 'A1', label: 'A1: requisição de material', type: 'number' },
        { id: 'A2', label: 'A2: quantidade recebida (transferência, lote anterior)', type: 'number' },
        { id: 'ordem_transf_ant', label: 'Nº da ordem da transferência(lote anterior)', type: 'text' },
        { id: 'A3', label: 'A3: quantidade total recebida(A+A1+A2)', type: 'calc' },
        { id: 'qtd_transf_prox', label: 'Quantidade para transferir (prox lote)', type: 'number' },
        { id: 'ordem_receber_transf', label: 'Nº da ordem a receber a transferência', type: 'text' },
        { id: 'lote_transf', label: 'Lote do material a ser transferido', type: 'text' },
        { id: 'devolvido', label: 'Devolvido', type: 'number' },
        { id: 'total_utilizado', label: 'Total utilizado(consumo)', type: 'number' },
        { id: 'B', label: 'B: refugo', type: 'calc' },
        { id: 'calc_refugo', label: 'Cálculo do refugo (B : A3) x 100', type: 'pct' }
    ];

    function roundToTwo(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    function switchTab(tabId, event) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const currentEvent = event || window.event;
        if(currentEvent && currentEvent.currentTarget) {
            currentEvent.currentTarget.classList.add('active');
        }
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }

    function renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        atributos.forEach(attr => {
            const tr = document.createElement('tr');
            const tdLabel = document.createElement('td');
            tdLabel.textContent = attr.label;
            tr.appendChild(tdLabel);

            materiais.forEach(mat => {
                const td = document.createElement('td');
                td.setAttribute('data-mat', mat.id);

                if (attr.type === 'number') {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = `${mat.id}_${attr.id}`;
                    input.placeholder = 'Digite...';
                    input.oninput = calculateValues;
                    td.appendChild(input);
                } else if (attr.type === 'text') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `${mat.id}_${attr.id}`;
                    input.placeholder = 'Digite...';
                    td.appendChild(input);
                } else if (attr.type === 'calc') {
                    td.innerHTML = `<span id="${mat.id}_${attr.id}" class="calculated-value">0</span>`;
                } else if (attr.type === 'pct') {
                    td.innerHTML = `<span id="${mat.id}_${attr.id}" class="status-ok">0,00%</span>`;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        materiais.forEach(mat => {
            const cb = document.getElementById(`toggle-${mat.id}`);
            if (cb && !cb.checked) toggleColumn(mat.id);
        });
    }

    function clearCurrentTable() {
        if (confirm('Deseja realmente limpar todos os dados preenchidos na tabela atual?')) {
            materiais.forEach(mat => {
                atributos.forEach(attr => {
                    const el = document.getElementById(`${mat.id}_${attr.id}`);
                    if (el) {
                        if (el.tagName === 'INPUT') el.value = '';
                        else if (attr.type === 'calc') el.textContent = '0';
                        else if (attr.type === 'pct') {
                            el.textContent = '0,00%';
                            el.className = 'status-ok';
                        }
                    }
                });
            });
            alert('Tabela limpa com sucesso!');
        }
    }

    function calculateValues() {
        materiais.forEach(mat => {
            const valA = parseFloat(document.getElementById(`${mat.id}_A`).value) || 0;
            const valA1 = parseFloat(document.getElementById(`${mat.id}_A1`).value) || 0;
            const valA2 = parseFloat(document.getElementById(`${mat.id}_A2`).value) || 0;
            
            const valDevolvido = parseFloat(document.getElementById(`${mat.id}_devolvido`).value) || 0;
            const valTransfProx = parseFloat(document.getElementById(`${mat.id}_qtd_transf_prox`).value) || 0;
            const valUtilizado = parseFloat(document.getElementById(`${mat.id}_total_utilizado`).value) || 0;

            const totalA3 = valA + valA1 + valA2;
            document.getElementById(`${mat.id}_A3`).textContent = totalA3;

            const refugoAutomaticoB = Math.max(0, totalA3 - valTransfProx - valDevolvido - valUtilizado);
            document.getElementById(`${mat.id}_B`).textContent = refugoAutomaticoB;

            const pctElement = document.getElementById(`${mat.id}_calc_refugo`);
            
            if (totalA3 === 0) {
                pctElement.textContent = "0,00%";
                pctElement.className = "status-ok"; 
            } else {
                const rawPct = (refugoAutomaticoB / totalA3) * 100;
                const roundedPct = roundToTwo(rawPct);
                
                pctElement.textContent = roundedPct.toFixed(2).replace('.', ',') + '%';

                if (roundedPct <= mat.tol) {
                    pctElement.className = "status-ok";
                } else {
                    pctElement.className = "status-error";
                }
            }
        });
    }

    function toggleColumn(matId) {
        const checkbox = document.getElementById(`toggle-${matId}`);
        document.querySelectorAll(`[data-mat="${matId}"]`).forEach(el => {
            if (!checkbox || checkbox.checked) el.classList.remove('hidden-col');
            else el.classList.add('hidden-col');
        });
    }

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
        
        fieldLote.value = '';
        fieldOrdem.value = '';
        renderTable();
        calculateValues();
        fieldLote.focus();
    }

    function loadHistory() {
        const container = document.getElementById('history-container');
        const historico = JSON.parse(localStorage.getItem('historico_reconciliacao')) || [];

        if (historico.length === 0) {
            container.innerHTML = '<div class="empty-history">Nenhum lote finalizado foi encontrado neste navegador.</div>';
            return;
        }

        const grupos = {};
        historico.forEach(reg => {
            if (!grupos[reg.mesAno]) {
                grupos[reg.mesAno] = [];
            }
            grupos[reg.mesAno].push(reg);
        });

        container.innerHTML = '';

        for (const mesAno in grupos) {
            const secao = document.createElement('div');
            secao.className = 'month-section';

            const tituloMes = document.createElement('div');
            tituloMes.className = 'month-title';
            tituloMes.innerHTML = `<span>${mesAno}</span> <span style="font-size:12px; font-weight:normal;">(${grupos[mesAno].length} lote(s))</span>`;
            secao.appendChild(tituloMes);

            grupos[mesAno].forEach(reg => {
                const card = document.createElement('div');
                card.className = 'history-card';

                let badgeEnviadosHTML = '';
                let badgeRecebidosHTML = '';
                let panelRecebidosHTML = '';
                let panelEnviadosHTML = '';

                if (reg.transferencias && reg.transferencias.length > 0) {
                    badgeEnviadosHTML = `<span class="transfer-status-badge has-transfer" onclick="toggleTransferPanel(${reg.id}, 'envio')">📤 Enviou (${reg.transferencias.length})</span>`;
                    
                    let tabelaEnvioRows = '';
                    reg.transferencias.forEach(t => {
                        tabelaEnvioRows += `<tr><td><strong>${t.material}</strong></td><td>${t.ordemDestino}</td><td>${t.loteMaterial}</td><td><strong>${t.quantidade}</strong></td></tr>`;
                    });

                    panelEnviadosHTML = `
                        <div id="panel-envio-${reg.id}" class="transfer-details-box" style="background-color: #fffbeb; border: 1px solid #fcd34d;">
                            <strong style="color:#92400e;">📤 Transferências Enviadas (Para Próximo Lote):</strong>
                            <table class="transfer-table">
                                <thead style="background-color:#fef3c7; color:#92400e;">
                                    <tr>
                                        <th>Material</th>
                                        <th>Ordem de Destino</th>
                                        <th>Lote do Mat.</th>
                                        <th>Quantidade Enviada</th>
                                    </tr>
                                </thead>
                                <tbody>${tabelaEnvioRows}</tbody>
                            </table>
                        </div>
                    `;
                } else {
                    badgeEnviadosHTML = `<span class="transfer-status-badge no-transfer">⚪ Sem Envios</span>`;
                }

                if (reg.recebidos && reg.recebidos.length > 0) {
                    badgeRecebidosHTML = `<span class="transfer-status-badge received-transfer" onclick="toggleTransferPanel(${reg.id}, 'recebido')">📥 Recebeu (${reg.recebidos.length})</span>`;
                    
                    let tabelaRecebidosRows = '';
                    reg.recebidos.forEach(r => {
                        tabelaRecebidosRows += `<tr><td><strong>${r.material}</strong></td><td>${r.ordemOrigem}</td><td><strong>${r.quantidade}</strong></td></tr>`;
                    });

                    panelRecebidosHTML = `
                        <div id="panel-recebido-${reg.id}" class="transfer-details-box" style="background-color: #f0f9ff; border: 1px solid #bae6fd;">
                            <strong style="color:#0369a1;">📥 Transferências Recebidas (Do Lote Anterior):</strong>
                            <table class="transfer-table">
                                <thead style="background-color:#e0f2fe; color:#0369a1;">
                                    <tr>
                                        <th>Material</th>
                                        <th>Ordem de Origem</th>
                                        <th>Quantidade Recebida</th>
                                    </tr>
                                </thead>
                                <tbody>${tabelaRecebidosRows}</tbody>
                            </table>
                        </div>
                    `;
                } else {
                    badgeRecebidosHTML = `<span class="transfer-status-badge no-transfer">⚪ Sem Recebimentos</span>`;
                }

                let tabelaHtml = `
                    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:11px;">
                        <thead>
                            <tr style="background-color:#f8fafc;">
                                <th style="padding:6px; color:var(--text-dark); background:#f1f5f9; font-size:11px; min-width:120px;">Material</th>
                                <th style="padding:6px; color:var(--text-dark); background:#f1f5f9; font-size:11px; min-width:80px;">Total Rec. (A3)</th>
                                <th style="padding:6px; color:var(--text-dark); background:#f1f5f9; font-size:11px; min-width:80px;">Refugo (B)</th>
                                <th style="padding:6px; color:var(--text-dark); background:#f1f5f9; font-size:11px; min-width:80px;">% Refugo</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                for (const matId in reg.materiais) {
                    const m = reg.materiais[matId];
                    const badgeClass = m.statusClass === 'status-ok' ? 'background-color:#d1fae5; color:#065f46; font-weight:bold; text-align:center;' : 'background-color:#fee2e2; color:#cb0404; font-weight:bold; text-align:center;';
                    tabelaHtml += `
                        <tr>
                            <td style="padding:5px; background:white; font-weight:bold;">${m.label}</td>
                            <td style="padding:5px; text-align:center; background:white;">${m.totalA3}</td>
                            <td style="padding:5px; text-align:center; background:white;">${m.refugoB}</td>
                            <td style="padding:5px; ${badgeClass}">${m.pct}</td>
                        </tr>
                    `;
                }
                tabelaHtml += '</tbody></table>';

                card.innerHTML = `
                    <div class="history-header">
                        <div>
                            <span style="font-weight:bold; color:var(--primary); font-size:14px;">Lote: ${reg.lote}</span>
                            <span style="margin-left:15px; color:#475569;">Ordem: ${reg.ordem}</span>
                        </div>
                        <div style="font-size:11px; color:#64748b;">
                            <span>⏱ ${reg.dataHora}</span>
                        </div>
                        <div style="width:100%; margin-top:5px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
                            <div>
                                ${badgeRecebidosHTML}
                                ${badgeEnviadosHTML}
                            </div>
                            <button class="btn-delete-item" onclick="deleteHistoryItem(${reg.id})">🗑 Excluir Registro</button>
                        </div>
                    </div>
                    ${panelRecebidosHTML}
                    ${panelEnviadosHTML}
                    <div style="overflow-x:auto;">
                        ${tabelaHtml}
                    </div>
                `;
                secao.appendChild(card);
            });
            container.appendChild(secao);
        }
    }

    function toggleTransferPanel(id, tipo) {
        const panel = document.getElementById(`panel-${tipo}-${id}`);
        if(panel) {
            panel.classList.toggle('show');
        }
    }

    function deleteHistoryItem(id) {
        if (confirm('Deseja realmente excluir permanentemente este registro de lote do seu histórico?')) {
            let historico = JSON.parse(localStorage.getItem('historico_reconciliacao')) || [];
            historico = historico.filter(reg => reg.id !== id);
            localStorage.setItem('historico_reconciliacao', JSON.stringify(historico));
            loadHistory();
        }
    }

    function clearAllHistory() {
        if (confirm('ATENÇÃO: Deseja realmente apagar TODO o histórico de lotes salvos neste navegador? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('historico_reconciliacao');
            loadHistory();
            alert('Todo o histórico foi apagado.');
        }
    }

    window.onload = function() {
        renderTable();
        calculateValues();
    };