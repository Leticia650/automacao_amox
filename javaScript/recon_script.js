


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

if(attr.id === 'total_utilizado'){

    // POPUP ORIGINAL -> FRASCOS E TAMPAS
    if(mat.id === 'frascos' || mat.id === 'tampas'){

        input.readOnly = true;
        input.style.cursor = 'pointer';

        input.onclick = () => abrirPopup(input.id);
    }

    // POPUP RÓTULO
    else if(mat.id === 'rotulo'){

        input.readOnly = true;
        input.style.cursor = 'pointer';

        input.onclick = () => abrirPopupRotulo(input.id);
    }

    // POPUP CARTUCHO E BULA
    else if(mat.id === 'cartucho'){

    input.readOnly = true;
    input.style.cursor = 'pointer';

    input.onclick = () => abrirPopupCartucho(input.id);
}

else if(mat.id === 'bula'){

    input.readOnly = true;
    input.style.cursor = 'pointer';

    input.onclick = () => abrirPopupBula(input.id);
}
}
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

    const fieldLote =
        document.getElementById('lote_atual');

    const fieldOrdem =
        document.getElementById('ordem_atual');

    const lote =
        fieldLote.value.trim();

    const ordem =
        fieldOrdem.value.trim();

    // VALIDA LOTE
    if (!lote) {

        alert(
            'Erro: O campo "Número do Lote Atual" é obrigatório.'
        );

        fieldLote.focus();

        return;
    }

    // VALIDA ORDEM
    if (!ordem) {

        alert(
            'Erro: O campo "Número da Ordem Atual" é obrigatório.'
        );

        fieldOrdem.focus();

        return;
    }

    const dadosMateriais = {};

    // VALIDA TODOS OS CAMPOS
    for (let i = 0; i < materiais.length; i++) {

        const mat = materiais[i];

        const isHidden =
            document.getElementById(`toggle-${mat.id}`)
            ? !document.getElementById(`toggle-${mat.id}`).checked
            : false;

        // IGNORA COLUNAS ESCONDIDAS
        if (isHidden) continue;

        dadosMateriais[mat.id] = {
            label: mat.label
        };

        for (let j = 0; j < atributos.length; j++) {

            const attr = atributos[j];

            const el =
                document.getElementById(
                    `${mat.id}_${attr.id}`
                );

            // INPUTS
            if (
                attr.type === 'number' ||
                attr.type === 'text'
            ) {

                // VALIDA CAMPO VAZIO
                if (!el || el.value.trim() === '') {

                    alert(
                        `Erro: O campo "${attr.label}" do material [ ${mat.label} ] está vazio.`
                    );

                    if (el) {
                        el.focus();
                    }

                    return;
                }

                dadosMateriais[mat.id][attr.id] =
                    el.value;
            }

            // CALCULADOS
            else {

                dadosMateriais[mat.id][attr.id] =
                    el
                    ? el.textContent
                    : '';
            }
        }
    }

    const agora = new Date();

    const meses = [
        "Janeiro","Fevereiro","Março","Abril",
        "Maio","Junho","Julho","Agosto",
        "Setembro","Outubro","Novembro","Dezembro"
    ];

    const novoRegistro = {

        id: Date.now(),

        lote: lote,

        ordem: ordem,

        dataHora:
            agora.toLocaleString('pt-BR'),

        mesAno:
            `${meses[agora.getMonth()]} de ${agora.getFullYear()}`,

        materiais: dadosMateriais
    };

    const historico =
        JSON.parse(
            localStorage.getItem(
                'historico_reconciliacao'
            )
        ) || [];

    historico.unshift(novoRegistro);

    localStorage.setItem(
        'historico_reconciliacao',
        JSON.stringify(historico)
    );

    alert('Lote finalizado com sucesso!');

    // LIMPA CAMPOS
    fieldLote.value = '';
    fieldOrdem.value = '';

    renderTable();

    calculateValues();

    fieldLote.focus();
}

function loadHistory() {

    const container =
        document.getElementById('history-container');

    container.innerHTML = '';

    const historico =
        JSON.parse(
            localStorage.getItem('historico_reconciliacao')
        ) || [];

    if (historico.length === 0) {

        container.innerHTML = `
            <div class="empty-history">
                Nenhum lote encontrado.
            </div>
        `;

        return;
    }

    historico.forEach(reg => {

        const card =
            document.createElement('div');

        card.className = 'history-card';

        let tabelaHTML = `

            <div class="history-header">

                <div>

                    <strong style="
                        color:var(--primary);
                        font-size:15px;
                    ">
                        Lote: ${reg.lote}
                    </strong>

                    <span style="
                        margin-left:12px;
                        color:#475569;
                    ">
                        Ordem: ${reg.ordem}
                    </span>

                </div>

                <div style="
                    font-size:11px;
                    color:#64748b;
                ">
                    ⏱ ${reg.dataHora}
                </div>

                <button
                    class="btn-delete-item"
                    onclick="deleteHistoryItem(${reg.id})"
                >
                    🗑 Excluir Registro
                </button>

            </div>

            <div style="overflow-x:auto;">

                <table style="
                    width:100%;
                    border-collapse:collapse;
                    margin-top:10px;
                    font-size:11px;
                ">

                    <thead>

                        <tr style="background:#f1f5f9;">

                            <th style="
                                padding:8px;
                                min-width:260px;
                                text-align:left;
                            ">
                                Atributo
                            </th>
        `;

        // CABEÇALHO DOS MATERIAIS
        materiais.forEach(mat => {

            tabelaHTML += `
                <th style="
                    padding:8px;
                    min-width:130px;
                    text-align:center;
                ">
                    ${mat.label}
                </th>
            `;
        });

        tabelaHTML += `
                        </tr>
                    </thead>

                    <tbody>
        `;

        // TODAS AS LINHAS DOS ATRIBUTOS
        atributos.forEach(attr => {

            tabelaHTML += `
                <tr>

                    <td style="
                        padding:8px;
                        font-weight:bold;
                        background:#f8fafc;
                    ">
                        ${attr.label}
                    </td>
            `;

            materiais.forEach(mat => {

                const material =
                    reg.materiais?.[mat.id];

                let valor = '-';

                if (material) {

                    valor =
                        material[attr.id] ?? '-';
                }

                // STATUS DO %
                let estilo = `
                    padding:8px;
                    text-align:center;
                    background:white;
                `;

                if (attr.id === 'calc_refugo') {

                    const pct =
                        parseFloat(
                            String(valor)
                                .replace('%', '')
                                .replace(',', '.')
                        ) || 0;

                    estilo += pct <= mat.tol
                        ? `
                            background:#d1fae5;
                            color:#065f46;
                            font-weight:bold;
                        `
                        : `
                            background:#fee2e2;
                            color:#991b1b;
                            font-weight:bold;
                        `;
                }

                tabelaHTML += `
                    <td style="${estilo}">
                        ${valor || '-'}
                    </td>
                `;
            });

            tabelaHTML += `
                </tr>
            `;
        });

        tabelaHTML += `
                    </tbody>

                </table>

            </div>
        `;

        card.innerHTML = tabelaHTML;

        container.appendChild(card);
    });
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

    let campoAtualPopup = null;

function abrirPopup(inputId){
    campoAtualPopup = inputId;

    document.getElementById('popup-utilizacao').style.display = 'flex';

    document.querySelectorAll('#popup-utilizacao input[type="number"]').forEach(i=>{
        i.value = 0;
    });

    document.getElementById('enable_vazamento').checked = false;
    document.getElementById('popup_vazamento').disabled = true;

    calcularPopup();
}

function fecharPopup(){
    document.getElementById('popup-utilizacao').style.display = 'none';
}

function calcularPopup(){

    const fitas = (parseFloat(document.getElementById('popup_fitas').value) || 0) * 8;

    const testesPelatina = (parseFloat(document.getElementById('popup_pelatina').value) || 0) * 3;

    let vazamento = 0;

    if(document.getElementById('enable_vazamento').checked){
        vazamento = (parseFloat(document.getElementById('popup_vazamento').value) || 0) * 3;
    }

    const embalada = parseFloat(document.getElementById('popup_embalada').value) || 0;

    const vertopac = parseFloat(document.getElementById('popup_vertopac').value) || 0;

    const amostraPelatina = parseFloat(document.getElementById('popup_amostra_pelatina').value) || 0;

    const total =
        fitas +
        testesPelatina +
        vazamento +
        embalada +
        vertopac +
        amostraPelatina;

    document.getElementById('popup_total').textContent = total;
}

function salvarPopup(){

    if(campoAtualPopup){
        document.getElementById(campoAtualPopup).value =
            document.getElementById('popup_total').textContent;

        calculateValues();
    }

    fecharPopup();
}

document.getElementById('enable_vazamento').addEventListener('change', function(){
    document.getElementById('popup_vazamento').disabled = !this.checked;

    calcularPopup();
});

document.querySelectorAll('#popup-utilizacao input').forEach(el=>{
    el.addEventListener('input', calcularPopup);
});

    window.onload = function() {
        renderTable();
        calculateValues();
    };

    let campoAtualRotulo = null;

function abrirPopupRotulo(inputId){

    campoAtualRotulo = inputId;

    document.getElementById('popup-rotulo').style.display = 'flex';

    document.querySelectorAll('#popup-rotulo input').forEach(i=>{
        i.value = 0;
    });

    calcularPopupRotulo();
}

function fecharPopupRotulo(){
    document.getElementById('popup-rotulo').style.display = 'none';
}

function calcularPopupRotulo(){

    const embalado =
        parseFloat(document.getElementById('rot_embalado').value) || 0;

    const documento =
        parseFloat(document.getElementById('rot_documento').value) || 0;

    const pelatina =
        parseFloat(document.getElementById('rot_pelatina').value) || 0;

    const vertopac =
        parseFloat(document.getElementById('rot_vertopac').value) || 0;

    const total =
        embalado +
        documento +
        pelatina +
        vertopac;

    document.getElementById('rot_total').textContent = total;
}

function salvarPopupRotulo(){

    if(campoAtualRotulo){

        document.getElementById(campoAtualRotulo).value =
            document.getElementById('rot_total').textContent;

        calculateValues();
    }

    fecharPopupRotulo();
}

document.querySelectorAll('#popup-rotulo input').forEach(el=>{
    el.addEventListener('input', calcularPopupRotulo);
});
// =========================
// POPUP CARTUCHO
// =========================

let campoAtualCartucho = null;

function abrirPopupCartucho(inputId){

    campoAtualCartucho = inputId;

    document.getElementById('popup-cartucho').style.display = 'flex';

    document.querySelectorAll('#popup-cartucho input').forEach(i=>{
        i.value = 0;
    });

    calcularPopupCartucho();
}

function fecharPopupCartucho(){
    document.getElementById('popup-cartucho').style.display = 'none';
}

function calcularPopupCartucho(){

    const embalado =
        parseFloat(document.getElementById('cart_embalado').value) || 0;

    const documento =
        parseFloat(document.getElementById('cart_documento').value) || 0;

    const retidas =
        parseFloat(document.getElementById('cart_retidas').value) || 0;

    const total =
        embalado +
        documento +
        retidas;

    document.getElementById('cart_total').textContent = total;
}

function salvarPopupCartucho(){

    if(campoAtualCartucho){

        document.getElementById(campoAtualCartucho).value =
            document.getElementById('cart_total').textContent;

        calculateValues();
    }

    fecharPopupCartucho();
}

document.querySelectorAll('#popup-cartucho input').forEach(el=>{
    el.addEventListener('input', calcularPopupCartucho);
});


// =========================
// POPUP BULA
// =========================

let campoAtualBula = null;

function abrirPopupBula(inputId){

    campoAtualBula = inputId;

    document.getElementById('popup-bula').style.display = 'flex';

    document.querySelectorAll('#popup-bula input').forEach(i=>{
        i.value = 0;
    });

    calcularPopupBula();
}

function fecharPopupBula(){
    document.getElementById('popup-bula').style.display = 'none';
}

function calcularPopupBula(){

    const embalado =
        parseFloat(document.getElementById('bula_embalado').value) || 0;

    const documento =
        parseFloat(document.getElementById('bula_documento').value) || 0;

    const retidas =
        parseFloat(document.getElementById('bula_retidas').value) || 0;

    const total =
        embalado +
        documento +
        retidas;

    document.getElementById('bula_total').textContent = total;
}

function salvarPopupBula(){

    if(campoAtualBula){

        document.getElementById(campoAtualBula).value =
            document.getElementById('bula_total').textContent;

        calculateValues();
    }

    fecharPopupBula();
}

document.querySelectorAll('#popup-bula input').forEach(el=>{
    el.addEventListener('input', calcularPopupBula);
});
