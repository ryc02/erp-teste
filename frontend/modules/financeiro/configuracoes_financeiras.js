const FinanceiroConfig = {
    modals: {},
    
    async init() {
        // modais are now managed by native ui.js openModal/closeModal
        
        await this.loadCategorias();
        await this.loadContasBancarias();
        await this.loadFechamento();
    },

    switchTab(tabName) {
        // Atualiza UI das tabs
        const btns = document.querySelectorAll('#config-fin-tabs-container .tab-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = Array.from(btns).find(b => b.dataset.tab === tabName);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Hide all tabs
        document.getElementById('tab-categorias').style.display = 'none';
        document.getElementById('tab-contas').style.display = 'none';
        document.getElementById('tab-fechamento').style.display = 'none';
        
        // Show target tab
        const target = document.getElementById(`tab-${tabName}`);
        if (target) target.style.display = 'block';
    },

    // ponytail: html escape helper
    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    async loadFechamento() {
        try {
            const res = await window.apiFetch('/financeiro/fechamentos');
            const statusDiv = document.getElementById('fechamentoStatus');
            const btnRemover = document.getElementById('btnRemoverFechamento');
            const inputData = document.getElementById('dataFechamentoInput');
            
            if (res.ok) {
                const f = await res.json();
                if (f) {
                    const dataFormatada = new Date(f.data_fechamento).toLocaleDateString('pt-BR');
                    const dataRegFormatada = new Date(f.data_registro).toLocaleString('pt-BR');
                    
                    document.getElementById('lblDataFechamento').textContent = dataFormatada;
                    document.getElementById('lblDataRegistroFechamento').textContent = dataRegFormatada;
                    
                    statusDiv.style.display = 'block';
                    btnRemover.style.display = 'block';
                    // pre-fill input with current format YYYY-MM-DD
                    inputData.value = f.data_fechamento.split('T')[0];
                } else {
                    statusDiv.style.display = 'none';
                    btnRemover.style.display = 'none';
                    inputData.value = '';
                }
            }
        } catch (error) {
            console.error('Erro ao carregar fechamento:', error);
        }
    },

    async salvarFechamento() {
        const input = document.getElementById('dataFechamentoInput');
        if (!input.value) {
            window.showNotify('Selecione uma data para o fechamento', 'error');
            return;
        }

        const btn = document.querySelector('#fechamento .btn-primary');
        window.btnLoading(btn, true);

        try {
            // we must send as ISO datetime
            const dataIso = new Date(input.value + "T00:00:00").toISOString();
            const res = await window.apiFetch('/financeiro/fechamentos', {
                method: 'POST',
                body: JSON.stringify({ data_fechamento: dataIso })
            });

            if (res.ok) {
                window.showNotify('Período fechado com sucesso!', 'success');
                await this.loadFechamento();
            } else {
                throw new Error('Falha ao salvar fechamento');
            }
        } catch (error) {
            window.showNotify('Erro ao salvar fechamento', 'error');
        } finally {
            window.btnLoading(btn, false);
        }
    },

    async removerFechamento() {
        if (!confirm('Tem certeza que deseja remover o fechamento atual? Isso permitirá lançamentos retroativos.')) {
            return;
        }

        const btn = document.getElementById('btnRemoverFechamento');
        window.btnLoading(btn, true);

        try {
            const res = await window.apiFetch('/financeiro/fechamentos', {
                method: 'DELETE'
            });

            if (res.ok) {
                window.showNotify('Restrição de fechamento removida!', 'success');
                await this.loadFechamento();
            } else {
                throw new Error('Falha ao remover');
            }
        } catch (error) {
            window.showNotify('Erro ao remover fechamento', 'error');
        } finally {
            window.btnLoading(btn, false);
        }
    },

    async loadCategorias() {
        try {
            const res = await window.apiFetch('/financeiro/categorias');
            if (res.ok) {
                const categorias = await res.json();
                this.renderCategorias(categorias);
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            window.showNotify('Erro ao carregar categorias financeiras', 'error');
        }
    },

    renderCategorias(categorias) {
        const tbody = document.getElementById('categoriasTableBody');
        if (categorias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = categorias.map(cat => `
            <tr>
                <td style="font-weight: 600; color: #fff;">${this._esc(cat.descricao)}</td>
                <td><span class="status-badge rascunho">${this._esc(cat.grupo) || 'Sem grupo'}</span></td>
                <td>${this._esc(cat.considera_dre) || '-'}</td>
                <td style="text-align: center;">
                    ${cat.padrao_venda ? '<i class="ph-fill ph-check-circle" style="color: var(--success); font-size: 18px;"></i>' : '-'}
                </td>
            </tr>
        `).join('');
    },

    async loadContasBancarias() {
        try {
            const res = await window.apiFetch('/financeiro/contas-bancarias');
            if (res.ok) {
                const contas = await res.json();
                this.renderContasBancarias(contas);
            }
        } catch (error) {
            console.error('Erro ao carregar contas bancárias:', error);
            window.showNotify('Erro ao carregar contas bancárias', 'error');
        }
    },

    renderContasBancarias(contas) {
        const tbody = document.getElementById('contasBancariasTableBody');
        if (contas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhuma conta bancária cadastrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = contas.map(cb => `
            <tr>
                <td style="font-weight: 600; color: #fff;">
                    <div style="display: flex; align-items: center;">
                        <i class="ph ph-bank" style="font-size: 20px; color: var(--info); margin-right: 12px;"></i>
                        ${this._esc(cb.descricao)}
                    </div>
                </td>
                <td>${this._esc(cb.banco) || '-'}</td>
                <td>${this._esc(cb.agencia) ? this._esc(cb.agencia) + ' / ' : ''}${this._esc(cb.conta) || '-'}</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(cb.saldo_inicial || 0)}</td>
            </tr>
        `).join('');
    },

    openCategoriaModal() {
        document.getElementById('categoriaForm').reset();
        window.openModal('categoriaModal');
    },

    async saveCategoria() {
        const form = document.getElementById('categoriaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {
            descricao: formData.get('descricao'),
            grupo: formData.get('grupo'),
            considera_dre: formData.get('considera_dre'),
            padrao_venda: formData.get('padrao_venda') === 'on'
        };

        const btn = document.querySelector('#categoriaModal .btn-primary');
        window.btnLoading(btn, true);

        try {
            const res = await window.apiFetch('/financeiro/categorias', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                window.showNotify('Categoria salva com sucesso!', 'success');
                window.closeModal('categoriaModal');
                this.loadCategorias();
            } else {
                throw new Error('Falha ao salvar');
            }
        } catch (error) {
            window.showNotify('Erro ao salvar categoria', 'error');
        } finally {
            window.btnLoading(btn, false);
        }
    },

    openContaBancariaModal() {
        document.getElementById('contaBancariaForm').reset();
        window.openModal('contaBancariaModal');
    },

    async saveContaBancaria() {
        const form = document.getElementById('contaBancariaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {
            descricao: formData.get('descricao'),
            banco: formData.get('banco'),
            agencia: formData.get('agencia'),
            conta: formData.get('conta'),
            saldo_inicial: parseFloat(formData.get('saldo_inicial') || 0)
        };

        const btn = document.querySelector('#contaBancariaModal .btn-primary');
        window.btnLoading(btn, true);

        try {
            const res = await window.apiFetch('/financeiro/contas-bancarias', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                window.showNotify('Conta Bancária salva com sucesso!', 'success');
                window.closeModal('contaBancariaModal');
                this.loadContasBancarias();
            } else {
                throw new Error('Falha ao salvar');
            }
        } catch (error) {
            window.showNotify('Erro ao salvar conta bancária', 'error');
        } finally {
            window.btnLoading(btn, false);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FinanceiroConfig.init();
});
