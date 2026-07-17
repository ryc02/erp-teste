const Modulo_propostas = {
    propostas: [],
    currentStatus: 'TODAS',
    clientes: [],
    produtos: [],
    vendedores: [],
    itemCount: 0,
    currentPropostaId: null,

    async init() {
        await this.loadDependencies();
        await this.loadPropostas();
    },

    async loadDependencies() {
        try {
            const [resCli, resProd, resVend] = await Promise.all([
                apiFetch('/comercial/clientes'),
                apiFetch('/produtos'),
                apiFetch('/usuarios/me') // Assuming we only assign to ourselves for now, or fetch all users if admin
            ]);
            
            if (resCli.ok) this.clientes = await resCli.json();
            if (resProd.ok) this.produtos = await resProd.json();
            // Simplify vendedores list
            if (resVend.ok) {
                const me = await resVend.json();
                this.vendedores = [me];
            }
        } catch (e) {
            console.error("Erro ao carregar dependencias de propostas", e);
        }
    },

    async loadPropostas() {
        try {
            const qs = this.currentStatus === 'TODAS' ? '' : `?status=${this.currentStatus}`;
            const res = await apiFetch(`/propostas/${qs}`);
            if (res.ok) {
                this.propostas = await res.json();
                this.render();
            }
        } catch (e) {
            console.error("Erro ao carregar propostas", e);
            showNotify("Erro ao carregar propostas", "error");
        }
    },

    refresh() {
        this.loadPropostas();
    },

    filtrarStatus(status) {
        this.currentStatus = status;
        
        // Atualiza abas
        const btns = document.querySelectorAll('#view-propostas .tabs .tab-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(`'${status}'`));
        if (activeBtn) activeBtn.classList.add('active');
        
        this.loadPropostas();
    },

    render() {
        const tbody = document.getElementById('tbody-propostas');
        if (this.propostas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">Nenhuma proposta encontrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.propostas.map(p => {
            const dataStr = new Date(p.data_proposta).toLocaleDateString('pt-BR');
            const proxStr = p.prox_contato ? new Date(p.prox_contato).toLocaleDateString('pt-BR') : '-';
            
            let statusColor = 'var(--text-color)';
            if(p.status === 'APROVADA') statusColor = 'var(--success)';
            if(p.status === 'NAO_APROVADA') statusColor = 'var(--danger)';
            if(p.status === 'AGUARDANDO') statusColor = 'var(--warning)';

            const tagsBadge = p.tags_csv ? `<span style="font-size: 0.8em; padding: 2px 5px; background: #333; border-radius: 4px; color: #fff;"><i class="ph ph-tag"></i> ${p.tags_csv}</span>` : '-';

            return `
                <tr>
                    <td>
                        <button class="table-action-icon" onclick="Modulo_propostas.abrirModalProposta(${p.id})">
                            <i class="ph ph-magnifying-glass"></i>
                        </button>
                    </td>
                    <td><strong>${p.numero}</strong></td>
                    <td>${dataStr}</td>
                    <td>${proxStr}</td>
                    <td>${p.cliente_nome || '-'}</td>
                    <td style="font-weight: bold;">R$ ${p.valor_total.toFixed(2).replace('.',',')}</td>
                    <td>${tagsBadge}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${p.status}</td>
                </tr>
            `;
        }).join('');
    },

    abrirModalProposta(id = null) {
        this.currentPropostaId = id;
        document.getElementById('form-proposta').reset();
        this.itemCount = 0;
        document.getElementById('tbody-prop-itens').innerHTML = '';
        document.getElementById('prop-total-itens').innerText = '0,00';
        document.getElementById('prop-total-geral').innerText = '0,00';
        
        // Popular selects
        const cliSelect = document.getElementById('prop-cliente');
        cliSelect.innerHTML = '<option value="">Selecione...</option>' + this.clientes.map(c => `<option value="${c.id}">${c.razao_social}</option>`).join('');
        
        const vendSelect = document.getElementById('prop-vendedor');
        vendSelect.innerHTML = '<option value="">Selecione...</option>' + this.vendedores.map(v => `<option value="${v.id}">${v.nome}</option>`).join('');

        if (id) {
            // Edit mode / View mode
            document.getElementById('proposta-modal-title').innerText = `Proposta Comercial #${id}`;
            document.getElementById('btn-salvar-prop').style.display = 'none'; // read-only basically unless we implement full edit
            document.getElementById('prop-acoes-avancadas').style.display = 'flex';
            this.carregarDadosProposta(id);
        } else {
            // Create mode
            document.getElementById('proposta-modal-title').innerText = `Nova Proposta Comercial`;
            document.getElementById('proposta-status-badge').innerText = 'RASCUNHO';
            document.getElementById('btn-salvar-prop').style.display = 'inline-block';
            document.getElementById('prop-acoes-avancadas').style.display = 'none';
            this.adicionarItemRow(); // start with 1 item
        }

        openModal('modal-proposta');
    },

    async carregarDadosProposta(id) {
        try {
            const res = await apiFetch(`/propostas/${id}`);
            if (res.ok) {
                const data = await res.json();
                
                document.getElementById('proposta-status-badge').innerText = data.status;
                document.getElementById('prop-natureza').value = data.natureza_operacao;
                document.getElementById('prop-cliente').value = data.cliente_id || '';
                document.getElementById('prop-vendedor').value = data.vendedor_interno_id || '';
                
                document.getElementById('prop-frete').value = data.valor_frete.toFixed(2);
                document.getElementById('prop-desconto').value = data.desconto_valor.toFixed(2);
                document.getElementById('prop-validade').value = data.validade_dias;
                document.getElementById('prop-tags').value = data.tags_csv || '';
                document.getElementById('prop-observacoes').value = data.observacoes || '';
                
                // Tratar botão gerar venda
                if (data.status === 'APROVADA') {
                    document.getElementById('btn-gerar-venda').style.display = 'inline-block';
                } else {
                    document.getElementById('btn-gerar-venda').style.display = 'none';
                }
                
                // Itens
                data.itens.forEach(it => {
                    this.adicionarItemRow(it);
                });
                
                this.calcularTotais();
            }
        } catch (e) {
            console.error("Erro", e);
        }
    },

    adicionarItemRow(dados = null) {
        this.itemCount++;
        const tr = document.createElement('tr');
        tr.id = `prop-item-row-${this.itemCount}`;
        
        let prodOptions = '<option value="">Selecione...</option>';
        this.produtos.forEach(p => {
            const sel = (dados && dados.produto_id === p.id) ? 'selected' : '';
            prodOptions += `<option value="${p.id}" data-preco="${p.preco_venda}" ${sel}>${p.descricao}</option>`;
        });

        tr.innerHTML = `
            <td>
                <select class="form-select prop-item-prod" onchange="Modulo_propostas.onProdutoChange(this, ${this.itemCount})" required>
                    ${prodOptions}
                </select>
            </td>
            <td>
                <input type="number" class="prop-item-qtd" value="${dados ? dados.quantidade : 1}" min="0.01" step="0.01" onchange="Modulo_propostas.calcularTotais()" required>
            </td>
            <td>
                <input type="number" class="prop-item-preco" value="${dados ? dados.preco_unitario : 0}" min="0" step="0.01" onchange="Modulo_propostas.calcularTotais()" required>
            </td>
            <td>
                <input type="number" class="prop-item-desc" value="${dados ? dados.desconto_percentual : 0}" min="0" max="100" step="0.01" onchange="Modulo_propostas.calcularTotais()">
            </td>
            <td>
                <input type="text" class="prop-item-total" readonly value="0.00" style="background: transparent; border: none; color: var(--text-color); font-weight: bold; width: 100%;">
            </td>
            <td>
                <button type="button" class="table-action-icon text-danger" onclick="Modulo_propostas.removerItemRow(${this.itemCount})" style="border:none; padding:4px;">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        `;
        document.getElementById('tbody-prop-itens').appendChild(tr);
        if (dados) this.calcularTotais();
    },

    removerItemRow(id) {
        const tr = document.getElementById(`prop-item-row-${id}`);
        if (tr) {
            tr.remove();
            this.calcularTotais();
        }
    },

    onProdutoChange(selectEl, rowId) {
        const opt = selectEl.options[selectEl.selectedIndex];
        if (opt && opt.dataset.preco) {
            const row = document.getElementById(`prop-item-row-${rowId}`);
            const inputPreco = row.querySelector('.prop-item-preco');
            inputPreco.value = parseFloat(opt.dataset.preco).toFixed(2);
            this.calcularTotais();
        }
    },

    calcularTotais() {
        let somaItens = 0;
        const rows = document.querySelectorAll('#tbody-prop-itens tr');
        rows.forEach(r => {
            const qtd = parseFloat(r.querySelector('.prop-item-qtd').value) || 0;
            const preco = parseFloat(r.querySelector('.prop-item-preco').value) || 0;
            const desc = parseFloat(r.querySelector('.prop-item-desc').value) || 0;
            
            const base = qtd * preco;
            const valorDesc = base * (desc / 100);
            const total = base - valorDesc;
            
            r.querySelector('.prop-item-total').value = total.toFixed(2);
            somaItens += total;
        });
        
        document.getElementById('prop-total-itens').innerText = somaItens.toFixed(2).replace('.',',');
        
        const frete = parseFloat(document.getElementById('prop-frete').value) || 0;
        const descExtra = parseFloat(document.getElementById('prop-desconto').value) || 0;
        
        const totalGeral = somaItens + frete - descExtra;
        document.getElementById('prop-total-geral').innerText = totalGeral.toFixed(2).replace('.',',');
    },

    async salvarProposta() {
        // Coletar itens
        const itens = [];
        const rows = document.querySelectorAll('#tbody-prop-itens tr');
        for (let r of rows) {
            const prodId = r.querySelector('.prop-item-prod').value;
            if (!prodId) continue;
            itens.push({
                produto_id: parseInt(prodId),
                quantidade: parseFloat(r.querySelector('.prop-item-qtd').value),
                preco_unitario: parseFloat(r.querySelector('.prop-item-preco').value),
                desconto_percentual: parseFloat(r.querySelector('.prop-item-desc').value)
            });
        }

        if (itens.length === 0) {
            showNotify("Adicione pelo menos um item.", "warning");
            return;
        }

        const payload = {
            cliente_id: parseInt(document.getElementById('prop-cliente').value) || null,
            vendedor_interno_id: parseInt(document.getElementById('prop-vendedor').value) || null,
            natureza_operacao: document.getElementById('prop-natureza').value,
            validade_dias: parseInt(document.getElementById('prop-validade').value) || 7,
            status: "RASCUNHO",
            valor_frete: parseFloat(document.getElementById('prop-frete').value) || 0,
            desconto_valor: parseFloat(document.getElementById('prop-desconto').value) || 0,
            tags_csv: document.getElementById('prop-tags').value.trim(),
            observacoes: document.getElementById('prop-observacoes').value.trim(),
            itens: itens
        };

        try {
            btnLoading('btn-salvar-prop', true);
            const res = await apiFetch('/propostas/', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                showNotify("Proposta criada com sucesso!", "success");
                closeModal('modal-proposta');
                this.refresh();
            } else {
                showNotify("Erro ao criar proposta", "error");
            }
        } catch(e) {
            console.error(e);
            showNotify("Falha na conexão", "error");
        } finally {
            btnLoading('btn-salvar-prop', false);
        }
    },

    async alterarStatusProposta(novoStatus) {
        if (!novoStatus || !this.currentPropostaId) return;
        
        try {
            const res = await apiFetch(`/propostas/${this.currentPropostaId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: novoStatus })
            });
            if (res.ok) {
                showNotify(`Status alterado para ${novoStatus}`, "success");
                document.getElementById('proposta-status-badge').innerText = novoStatus;
                this.refresh();
                
                if(novoStatus === 'APROVADA') {
                    document.getElementById('btn-gerar-venda').style.display = 'inline-block';
                } else {
                    document.getElementById('btn-gerar-venda').style.display = 'none';
                }
            }
        } catch(e) {
            console.error(e);
        }
    },

    async gerarVenda() {
        if (!this.currentPropostaId) return;
        
        try {
            const res = await apiFetch(`/propostas/${this.currentPropostaId}/gerar-venda`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                showNotify("Pedido gerado com sucesso!", "success");
                closeModal('modal-proposta');
                this.refresh();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao gerar venda", "error");
            }
        } catch(e) {
            console.error(e);
        }
    }
};

window.Modulo_propostas = Modulo_propostas;
