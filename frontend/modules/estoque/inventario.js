// === GESTÃO DE INVENTÁRIO (MODULAR) ===

window.Modulo_inventario = {
    async init() {
        console.log("Modulo de Inventário inicializado");
        try {
            await ensureProductCatalog();
        } catch (e) {
            console.error("Erro ao carregar produtos para o inventário", e);
        }

        this.loadInventario();
    },

    getProductById(produtoId) {
        return state.productCatalog.find(product => product.id === produtoId) || null;
    },

    formatQuantity(value) {
        const num = Number(value ?? 0);
        if (!Number.isFinite(num)) return '0';
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
    },

    formatDifference(value) {
        const num = Number(value ?? 0);
        if (!Number.isFinite(num)) return '0';

        const formatted = this.formatQuantity(Math.abs(num));
        if (num > 0) return `+${formatted}`;
        if (num < 0) return `-${formatted}`;
        return formatted;
    },

    async loadInventario() {
        const tbody = document.querySelector('#table-inventario tbody');
        const controls = document.getElementById('inventario-controls');
        const aviso = document.getElementById('inventario-aberto-aviso');

        try {
            const res = await apiFetch('/inventario/atual');
            if (!res.ok) {
                throw new Error(`Falha ao carregar inventário (${res.status})`);
            }

            const data = await res.json();
            if (!tbody) return;

            const sessaoAberta = (data && data.id) ? data : null;
            const itens = Array.isArray(sessaoAberta?.itens) ? sessaoAberta.itens : [];

            if (controls) {
                if (sessaoAberta) {
                    controls.innerHTML = `
                        <button class="btn btn-outline" onclick="Modulo_inventario.loadInventario()">
                            <i class="ph ph-arrows-clockwise"></i> Atualizar
                        </button>
                        <button class="btn btn-warning" onclick="Modulo_inventario.finalizarInventario()">
                            <i class="ph ph-check-circle"></i> Finalizar Inventário (#${sessaoAberta.id})
                        </button>
                    `;
                } else {
                    controls.innerHTML = `
                        <button class="btn btn-primary" onclick="Modulo_inventario.abrirNovoInventario()">
                            <i class="ph ph-plus"></i> Iniciar Novo Inventário
                        </button>
                    `;
                }
            }

            if (aviso) {
                aviso.style.display = sessaoAberta ? 'block' : 'none';
            }

            if (!sessaoAberta) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum inventário em andamento. Clique em "Iniciar Novo Inventário".</td></tr>';
                return;
            }

            const sortedItems = [...itens].sort((a, b) => {
                const labelA = (a.nome || `Produto #${a.produto_id}`).toLowerCase();
                const labelB = (b.nome || `Produto #${b.produto_id}`).toLowerCase();
                return labelA.localeCompare(labelB, 'pt-BR');
            });

            tbody.innerHTML = sortedItems.map(item => {
                const unidade = item.unidade_medida ? ` ${item.unidade_medida}` : '';
                const location = `${item.corredor || ''}/${item.prateleira || ''}/${item.posicao || ''}`;
                const counted = item.quantidade_fisica !== null && item.quantidade_fisica !== undefined;
                const difference = counted
                    ? Number(item.diferenca ?? (item.quantidade_fisica - item.quantidade_sistema))
                    : null;
                const differenceBadge = difference === null
                    ? '<span style="color: var(--text-secondary);">---</span>'
                    : `<span class="badge ${difference === 0 ? 'badge-success' : (difference > 0 ? 'badge-info' : 'badge-danger')}">${this.formatDifference(difference)}</span>`;
                const statusBadge = counted
                    ? `<span class="badge ${difference === 0 ? 'badge-success' : 'badge-warning'}">${difference === 0 ? 'Conciliado' : 'Divergente'}</span>`
                    : '<span class="badge badge-warning">Pendente</span>';
                const inputValue = counted ? String(item.quantidade_fisica) : '';

                return `
                    <tr>
                        <td>
                            <strong>${item.sku || `#${item.produto_id}`}</strong>
                            <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">
                                ${item.nome || `Produto #${item.produto_id}`}
                            </div>
                        </td>
                        <td style="font-family: monospace; font-size: 0.85rem; color: var(--accent);">${location}</td>
                        <td>${this.formatQuantity(item.quantidade_sistema)}${unidade}</td>
                        <td>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <input
                                    type="text"
                                    inputmode="decimal"
                                    id="inv-qtd-${item.produto_id}"
                                    value="${inputValue}"
                                    step="any"
                                    placeholder="0"
                                    style="max-width: 110px;"
                                    onkeydown="if (event.key === 'Enter') { event.preventDefault(); Modulo_inventario.salvarContagem(${item.produto_id}); }"
                                >
                                <button type="button" class="btn btn-sm btn-primary" onclick="Modulo_inventario.salvarContagem(${item.produto_id})">
                                    Salvar
                                </button>
                            </div>
                        </td>
                        <td>${differenceBadge}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.error(e);
            if (aviso) aviso.style.display = 'none';
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--danger);">Erro ao carregar o inventário.</td></tr>';
            }
            showNotify("Erro ao carregar o inventário.", "error");
        }
    },

    async abrirNovoInventario() {
        console.log("Iniciando novo inventário...");
        const confirmed = await confirmAction("Abrir Inventário?", "Deseja iniciar uma nova sessão de inventário? Isso fará um snapshot de todo o estoque atual.", { icon: 'ph ph-plus-circle' });
        if (!confirmed) return;

        try {
            const res = await apiFetch('/inventario/iniciar', {
                method: 'POST',
                body: JSON.stringify({ usuario_abertura: state.user?.username || 'Sistema' })
            });

            if (res.ok) {
                showNotify("Novo inventário iniciado com sucesso!", "success");
                await this.loadInventario();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao iniciar inventário.", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao iniciar inventário.", "error");
        }
    },

    async salvarContagem(produtoId) {
        const input = document.getElementById(`inv-qtd-${produtoId}`);
        if (!input) return;

        const normalizedValue = String(input.value).trim().replace(',', '.');
        if (normalizedValue === '') {
            showNotify("Informe a contagem física antes de salvar.", "error");
            input.focus();
            return;
        }

        const quantidade = Number(normalizedValue);
        if (!Number.isFinite(quantidade)) {
            showNotify("A contagem física informada é inválida.", "error");
            input.focus();
            return;
        }

        try {
            const res = await apiFetch('/inventario/contar', {
                method: 'POST',
                body: JSON.stringify({
                    produto_id: produtoId,
                    quantidade_fisica: quantidade
                })
            });

            if (res.ok) {
                showNotify("Contagem registrada com sucesso!", "success");
                await this.loadInventario();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao registrar contagem.", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao registrar contagem.", "error");
        }
    },

    async finalizarInventario() {
        const confirmed = await confirmAction("Finalizar Inventário?", "Deseja finalizar o inventário e aplicar os ajustes de estoque? Esta ação é irreversível.", { color: 'var(--warning)', icon: 'ph ph-check-square-offset' });
        if (!confirmed) return;

        try {
            const res = await apiFetch('/inventario/finalizar', {
                method: 'POST'
            });

            if (res.ok) {
                showNotify("Inventário finalizado com sucesso!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                await this.loadInventario();

                if (window.Modulo_produtos) window.Modulo_produtos.loadProducts();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao finalizar inventário.", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao finalizar inventário.", "error");
        }
    }
}
