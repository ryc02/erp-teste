window.Modulo_financeiro = {
    currentTab: 'receber', // 'receber' ou 'pagar'
    contas: [],

    // ponytail: escape HTML to prevent XSS from user-generated descriptions/tags
    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    async init() {
        console.log("Módulo Financeiro inicializado.");
        await this.loadSelectOptions();
        await this.refresh();
    },

    async loadSelectOptions() {
        try {
            const [resCat, resCb] = await Promise.all([
                apiFetch('/financeiro/categorias'),
                apiFetch('/financeiro/contas-bancarias')
            ]);
            if (resCat.ok) {
                const categorias = await resCat.json();
                const selectCat = document.getElementById('fin-novo-categoria');
                if (selectCat) {
                    categorias.forEach(c => {
                        selectCat.innerHTML += `<option value="${c.id}">${c.descricao} (${c.grupo || 'Sem grupo'})</option>`;
                    });
                }
            }
            if (resCb.ok) {
                const contas = await resCb.json();
                const selectCb = document.getElementById('fin-novo-conta-bancaria');
                const selectCbOrig = document.getElementById('fin-transf-origem');
                const selectCbDest = document.getElementById('fin-transf-destino');
                
                if (selectCb) {
                    contas.forEach(c => {
                        const opt = `<option value="${c.id}">${c.descricao} - ${c.banco || ''}</option>`;
                        selectCb.innerHTML += opt;
                        if(selectCbOrig) selectCbOrig.innerHTML += opt;
                        if(selectCbDest) selectCbDest.innerHTML += opt;
                    });
                }
            }
        } catch (e) {
            console.error("Erro ao carregar opções financeiras:", e);
        }
    },

    async refresh() {
        await this.loadDashboard();
        await this.loadContas();
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Atualiza UI das tabs
        const btns = document.querySelectorAll('#view-financeiro .tab-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        
        // Pega o botão correspondente
        const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(tabName));
        if (activeBtn) activeBtn.classList.add('active');
        
        const cardContas = document.getElementById('card-tabela-contas');
        const cardConcil = document.getElementById('card-conciliacao');
        
        if (tabName === 'conciliacao') {
            cardContas.style.display = 'none';
            cardConcil.style.display = 'block';
        } else {
            cardContas.style.display = 'block';
            cardConcil.style.display = 'none';
            this.loadContas();
        }
    },

    async loadDashboard() {
        try {
            const res = await apiFetch('/financeiro/dashboard');
            if (res.ok) {
                const data = await res.json();
                document.getElementById('fin-a-receber').innerText = formatCurrency(data.a_receber);
                document.getElementById('fin-a-pagar').innerText = formatCurrency(data.a_pagar);
                document.getElementById('fin-saldo').innerText = formatCurrency(data.saldo_caixa);
                
                if (data.saldo_caixa < 0) {
                    document.getElementById('fin-saldo').style.color = 'var(--danger)';
                } else {
                    document.getElementById('fin-saldo').style.color = 'var(--success)';
                }
            }
        } catch (e) {
            console.error("Erro ao carregar dashboard financeiro:", e);
        }
    },

    async loadContas() {
        try {
            const tipoStr = this.currentTab === 'receber' ? 'RECEBER' : 'PAGAR';
            const res = await apiFetch(`/financeiro/contas?tipo=${tipoStr}`);
            if (res.ok) {
                this.contas = await res.json();
                this.renderTable();
            }
        } catch (e) {
            console.error("Erro ao carregar contas:", e);
        }
    },

    renderTable() {
        const tbody = document.querySelector('#table-financeiro tbody');
        if (!this.contas || this.contas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;">Nenhuma conta a ${this.currentTab} encontrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.contas.map(c => {
            const dataVenc = c.data_vencimento ? new Date(c.data_vencimento).toLocaleDateString('pt-BR') : '-';
            
            let statusBadge = '';
            if (c.status === 'PENDENTE') {
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const dtVenc = new Date(c.data_vencimento);
                if (dtVenc < hoje) {
                    statusBadge = `<span class="status-badge atrasado">ATRASADO</span>`;
                } else {
                    statusBadge = `<span class="status-badge pendente">PENDENTE</span>`;
                }
            } else if (c.status === 'PAGO') {
                statusBadge = `<span class="status-badge pago">PAGO</span>`;
            } else {
                statusBadge = `<span class="status-badge rascunho">${this._esc(c.status)}</span>`;
            }

            const btnBaixa = c.status === 'PENDENTE' 
                ? `<button class="table-action-icon" onclick="Modulo_financeiro.darBaixa(${c.id})" title="Dar Baixa"><i class="ph ph-check-circle" style="color: var(--success)"></i></button>`
                : `<span style="color: #666; font-size: 0.9em;">Pago em ${new Date(c.data_pagamento).toLocaleDateString('pt-BR')}</span>`;

            return `
                <tr>
                    <td style="text-align: center;">
                        <i class="ph ${c.tipo === 'RECEBER' ? 'ph-arrow-circle-down' : 'ph-arrow-circle-up'}" style="font-size: 18px; color: ${c.tipo === 'RECEBER' ? '#52c41a' : '#ff4d4f'}"></i>
                    </td>
                    <td style="font-weight: 600; color: #fff;">
                        ${this._esc(c.descricao)}
                        ${c.tags_csv ? `<br><small style="color: #0052cc"><i class="ph ph-tag"></i> ${this._esc(c.tags_csv)}</small>` : ''}
                        ${c.pedido_id ? `<br><small style="color: #52c41a">Ref: Pedido #${parseInt(c.pedido_id)}</small>` : ''}
                    </td>
                    <td>${c.cliente_nome || '-'}</td>
                    <td>${dataVenc}</td>
                    <td>
                        <div style="font-size: 11px;">
                            <div><i class="ph ph-tag"></i> ${c.categoria_nome || 'Sem Categoria'}</div>
                            <div style="margin-top: 2px;"><i class="ph ph-bank"></i> ${c.conta_bancaria_nome || 'Caixa Padrão'}</div>
                        </div>
                    </td>
                    <td>${statusBadge}</td>
                    <td style="font-weight: 700; text-align: right; color: #fff;">${formatCurrency(c.valor)}</td>
                    <td style="text-align: center;">${btnBaixa}</td>
                </tr>
            `;
        }).join('');
    },

    abrirModalNovaConta() {
        document.getElementById('form-nova-conta').reset();
        
        // Define data default para hoje
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('fin-novo-vencimento').value = hoje;
        
        // Seta o dropdown de acordo com a aba atual
        document.getElementById('fin-novo-tipo').value = this.currentTab === 'receber' ? 'RECEBER' : 'PAGAR';
        
        document.getElementById('fin-novo-recorrencia').value = '';
        document.getElementById('div-parcelas').style.display = 'none';
        
        openModal('modal-nova-conta');
    },

    async salvarNovaConta() {
        try {
            const catId = document.getElementById('fin-novo-categoria').value;
            const cbId = document.getElementById('fin-novo-conta-bancaria').value;
            
            const rec = document.getElementById('fin-novo-recorrencia').value;
            const par = document.getElementById('fin-novo-parcelas').value;
            const tags = document.getElementById('fin-novo-tags').value;
            
            const payload = {
                tipo: document.getElementById('fin-novo-tipo').value,
                descricao: document.getElementById('fin-novo-descricao').value.trim(),
                valor: parseFloat(document.getElementById('fin-novo-valor').value),
                data_vencimento: document.getElementById('fin-novo-vencimento').value + "T00:00:00Z",
                status: "PENDENTE",
                categoria_id: catId ? parseInt(catId) : null,
                conta_bancaria_id: cbId ? parseInt(cbId) : null,
                recorrencia: rec || null,
                total_parcelas: rec ? parseInt(par) : 1,
                tags_csv: tags ? tags.trim() : null
            };

            const res = await apiFetch('/financeiro/contas', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showNotify("Lançamento salvo com sucesso!", "success");
                closeModal('modal-nova-conta');
                this.refresh();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar", "error");
            }
        } catch (e) {
            console.error("Erro ao salvar conta", e);
            showNotify("Erro de conexão", "error");
        }
    },

    abrirModalTransferencia() {
        document.getElementById('form-transferencia').reset();
        document.getElementById('fin-transf-data').value = new Date().toISOString().split('T')[0];
        openModal('modal-transferencia');
    },

    async salvarTransferencia() {
        try {
            const payload = {
                origem_id: parseInt(document.getElementById('fin-transf-origem').value),
                destino_id: parseInt(document.getElementById('fin-transf-destino').value),
                valor: parseFloat(document.getElementById('fin-transf-valor').value),
                data: document.getElementById('fin-transf-data').value + "T00:00:00Z",
                descricao: document.getElementById('fin-transf-descricao').value.trim()
            };

            if (payload.origem_id === payload.destino_id) {
                showNotify("Contas de origem e destino devem ser diferentes", "error");
                return;
            }

            const res = await apiFetch('/financeiro/caixa/transferencia', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showNotify("Transferência realizada!", "success");
                closeModal('modal-transferencia');
                this.refresh();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao transferir", "error");
            }
        } catch (e) {
            console.error("Erro na transferência", e);
            showNotify("Erro de conexão", "error");
        }
    },

    darBaixa(id) {
        const conta = this.contas.find(c => c.id === id);
        if (!conta) return;
        
        document.getElementById('fin-baixa-id').value = id;
        document.getElementById('fin-baixa-descricao').innerText = conta.descricao;
        document.getElementById('fin-baixa-total').innerText = formatCurrency(conta.valor);
        
        document.getElementById('fin-baixa-valor').value = conta.valor.toFixed(2);
        document.getElementById('fin-baixa-data').value = new Date().toISOString().split('T')[0];
        
        openModal('modal-baixa-conta');
    },

    async confirmarBaixa() {
        const id = document.getElementById('fin-baixa-id').value;
        const valorPago = parseFloat(document.getElementById('fin-baixa-valor').value);
        const dataPagamento = document.getElementById('fin-baixa-data').value + "T00:00:00Z";
        
        try {
            showNotify("Processando baixa...", "info");
            const res = await apiFetch(`/financeiro/contas/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'PAGO',
                    valor_pago: valorPago,
                    data_pagamento: dataPagamento
                })
            });

            if (res.ok) {
                showNotify("Conta baixada com sucesso!", "success");
                closeModal('modal-baixa-conta');
                this.refresh();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao baixar", "error");
            }
        } catch (e) {
            console.error("Erro ao baixar conta", e);
            showNotify("Erro ao registrar pagamento", "error");
        }
    },

    async importarOFX(file) {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            showNotify("Importando OFX...", "info");
            // ponytail: apiFetch handles FormData fine — it skips Content-Type for FormData bodies
            const res = await apiFetch('/financeiro/ofx/importar', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                this.renderOFX(data.transacoes);
                showNotify(`${data.transacoes.length} transações encontradas!`, "success");
            } else {
                showNotify("Erro ao processar arquivo OFX", "error");
            }
        } catch (e) {
            console.error("Erro no OFX", e);
            showNotify("Erro de conexão", "error");
        }
        
        // Reset file input
        document.getElementById('fin-ofx-file').value = '';
    },
    
    renderOFX(transacoes) {
        const tbody = document.getElementById('tbody-ofx');
        if (!transacoes || transacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px;">Nenhuma transação válida encontrada no arquivo.</td></tr>`;
            return;
        }
        
        // Save to global to use when creating a new account from it
        this.transacoesOFX = transacoes;
        
        tbody.innerHTML = transacoes.map((t, idx) => {
            const valColor = t.tipo_erp === 'RECEBER' ? '#52c41a' : '#ff4d4f';
            return `
                <tr>
                    <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td style="color: #fff; font-weight: 600;">${this._esc(t.descricao)}</td>
                    <td><span class="status-badge rascunho">${this._esc(t.tipo_ofx)}</span></td>
                    <td style="text-align: right; font-weight: 700; color: ${valColor};">${formatCurrency(Math.abs(t.valor))}</td>
                    <td style="text-align: center;">
                        <button class="table-action-icon" onclick="Modulo_financeiro.criarViaOFX(${idx})" title="Lançar Nova Conta">
                            <i class="ph ph-plus"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    criarViaOFX(index) {
        if (!this.transacoesOFX || !this.transacoesOFX[index]) return;
        const t = this.transacoesOFX[index];
        
        // Open modal pre-filled
        this.abrirModalNovaConta();
        
        document.getElementById('fin-novo-tipo').value = t.tipo_erp;
        document.getElementById('fin-novo-descricao').value = t.descricao;
        document.getElementById('fin-novo-valor').value = Math.abs(t.valor).toFixed(2);
        document.getElementById('fin-novo-vencimento').value = t.data.split('T')[0];
    }
};
