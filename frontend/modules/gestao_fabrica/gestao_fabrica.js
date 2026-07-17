window.Modulo_gestao_fabrica = {
    data: {
        maquinas: [],
        ordensServico: [],
        ordensProducao: []
    },

    async init() {
        console.log("Modulo Gestão Fábrica inicializado");
        await this.loadCockpit();
    },

    refresh() {
        this.loadCockpit();
    },

    async loadCockpit() {
        try {
            const [maqsRes, osRes, opsRes] = await Promise.all([
                apiFetch('/manutencao/maquinas'),
                apiFetch('/manutencao/os'),
                apiFetch('/pcp/ordens')
            ]);

            if (!maqsRes.ok || !osRes.ok || !opsRes.ok) {
                throw new Error('Falha ao carregar os dados operacionais da fábrica.');
            }

            const [maquinas, ordensServico, ordensProducao] = await Promise.all([
                maqsRes.json(),
                osRes.json(),
                opsRes.json()
            ]);

            this.data = { maquinas, ordensServico, ordensProducao };
            this.renderCockpit();
        } catch (error) {
            console.error("Erro ao carregar Gestão Fábrica", error);
            this.renderErrorState(error.message);
        }
    },

    renderCockpit() {
        const openOSByMachine = this.getOpenOSByMachine(this.data.ordensServico);
        const maquinasOperacao = this.data.maquinas
            .filter(maquina => maquina.status === 'OPERANTE' && !openOSByMachine.has(maquina.id))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        const maquinasParadas = this.data.maquinas
            .filter(maquina => maquina.status !== 'OPERANTE' || openOSByMachine.has(maquina.id))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        const ordensEmAndamento = this.data.ordensProducao
            .filter(op => op.status === 'EM_ANDAMENTO')
            .sort((a, b) => this.compareDatesDesc(a.data_inicio || a.created_at, b.data_inicio || b.created_at));

        const ordensPlanejadas = this.data.ordensProducao
            .filter(op => op.status === 'PLANEJADA')
            .sort((a, b) => this.compareDatesDesc(a.created_at, b.created_at));

        this.updateCount('gf-count-operacao', maquinasOperacao.length);
        this.updateCount('gf-count-paradas', maquinasParadas.length);
        this.updateCount('gf-count-andamento', ordensEmAndamento.length);
        this.updateCount('gf-count-planejadas', ordensPlanejadas.length);

        this.updateMeta(
            'gf-meta-operacao',
            maquinasOperacao.length
                ? this.pluralize(maquinasOperacao.length, 'máquina pronta para operar.', 'máquinas prontas para operar.')
                : 'Nenhuma máquina pronta para operar no momento.'
        );
        this.updateMeta(
            'gf-meta-paradas',
            maquinasParadas.length
                ? this.pluralize(maquinasParadas.length, 'máquina exigindo atenção.', 'máquinas exigindo atenção.')
                : 'Nenhuma máquina parada no momento.'
        );
        this.updateMeta(
            'gf-meta-andamento',
            ordensEmAndamento.length
                ? this.pluralize(ordensEmAndamento.length, 'ordem com produção iniciada.', 'ordens com produção iniciada.')
                : 'Nenhuma OP com apontamento iniciado.'
        );
        this.updateMeta(
            'gf-meta-planejadas',
            ordensPlanejadas.length
                ? this.pluralize(ordensPlanejadas.length, 'ordem aguardando início.', 'ordens aguardando início.')
                : 'Nenhuma OP aguardando início.'
        );

        this.renderMaquinasOperacao(maquinasOperacao);
        this.renderMaquinasParadas(maquinasParadas, openOSByMachine);
        this.renderOrdensEmAndamento(ordensEmAndamento);
        this.renderOrdensPlanejadas(ordensPlanejadas);
    },

    renderErrorState(message) {
        this.updateMeta('gf-meta-operacao', 'Falha ao carregar dados');
        this.updateMeta('gf-meta-paradas', 'Falha ao carregar dados');
        this.updateMeta('gf-meta-andamento', 'Falha ao carregar dados');
        this.updateMeta('gf-meta-planejadas', 'Falha ao carregar dados');

        this.renderTableMessage('#gf-table-operacao tbody', 5, message);
        this.renderTableMessage('#gf-table-paradas tbody', 5, message);
        this.renderTableMessage('#gf-table-andamento tbody', 6, message);
        this.renderTableMessage('#gf-table-planejadas tbody', 6, message);
    },

    updateMeta(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) element.innerText = message;
    },

    updateCount(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) element.innerText = String(count);
    },

    pluralize(count, singularText, pluralText) {
        return `${count} ${count === 1 ? singularText : pluralText}`;
    },

    renderTableMessage(selector, colSpan, message) {
        const tbody = document.querySelector(selector);
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="fabrica-empty">${message}</td></tr>`;
    },

    getOpenOSByMachine(ordensServico) {
        const map = new Map();

        ordensServico
            .filter(os => os.status === 'ABERTA')
            .sort((a, b) => this.compareDatesDesc(a.data_abertura, b.data_abertura))
            .forEach(os => {
                if (!map.has(os.maquina_id)) {
                    map.set(os.maquina_id, os);
                }
            });

        return map;
    },

    compareDatesDesc(left, right) {
        return new Date(right || 0).getTime() - new Date(left || 0).getTime();
    },

    getMachineBadge(status) {
        return status === 'OPERANTE' ? 'badge-success' : 'badge-danger';
    },

    getOPBadge(status) {
        if (status === 'EM_ANDAMENTO') return 'badge-warning';
        if (status === 'CONCLUIDA') return 'badge-success';
        if (status === 'PLANEJADA') return 'badge-info';
        return 'badge-danger';
    },

    renderMaquinasOperacao(maquinas) {
        const tbody = document.querySelector('#gf-table-operacao tbody');
        if (!tbody) return;

        if (!maquinas.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="fabrica-empty">Nenhuma máquina operando no momento.</td></tr>';
            return;
        }

        tbody.innerHTML = maquinas.map(maquina => `
            <tr>
                <td>
                    <strong>${maquina.nome}</strong>
                    <small>ID ${maquina.id}</small>
                </td>
                <td>${maquina.tipo || '-'}</td>
                <td>${maquina.capacidade || '-'}</td>
                <td><span class="badge ${this.getMachineBadge(maquina.status)}">${maquina.status}</span></td>
                <td>
                    <button class="table-action-icon" onclick="Modulo_gestao_fabrica.abrirMaquina(${maquina.id})">
                        <i class="ph ph-wrench"></i> Abrir OS
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderMaquinasParadas(maquinas, openOSByMachine) {
        const tbody = document.querySelector('#gf-table-paradas tbody');
        if (!tbody) return;

        if (!maquinas.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="fabrica-empty">Nenhuma máquina parada no momento.</td></tr>';
            return;
        }

        tbody.innerHTML = maquinas.map(maquina => {
            const osAberta = openOSByMachine.get(maquina.id);
            const motivo = osAberta
                ? `${osAberta.tipo} | OS #${osAberta.id}`
                : 'Status manual / indisponibilidade';
            const dataAbertura = osAberta?.data_abertura ? formatDate(osAberta.data_abertura) : '-';
            const actionButton = osAberta
                ? `<button class="btn btn-sm btn-primary" onclick="Modulo_gestao_fabrica.abrirOS(${osAberta.id})">
                        <i class="ph ph-gear"></i> Gerenciar OS
                   </button>`
                : `<button class="table-action-icon" onclick="Modulo_gestao_fabrica.abrirMaquinaDetalhe(${maquina.id})">
                        <i class="ph ph-arrow-square-out"></i> Ver máquina
                   </button>`;

            return `
                <tr>
                    <td>
                        <strong>${maquina.nome}</strong>
                        <small>${maquina.tipo || 'Sem tipo informado'}</small>
                    </td>
                    <td>${motivo}</td>
                    <td><span class="badge ${this.getMachineBadge(maquina.status)}">${maquina.status}</span></td>
                    <td>${dataAbertura}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }).join('');
    },

    renderOrdensEmAndamento(ordens) {
        const tbody = document.querySelector('#gf-table-andamento tbody');
        if (!tbody) return;

        if (!ordens.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="fabrica-empty">Nenhuma OP com apontamento iniciado.</td></tr>';
            return;
        }

        tbody.innerHTML = ordens.map(op => `
            <tr>
                <td>#${op.id}</td>
                <td>
                    <strong>${op.produto?.nome || `Produto #${op.produto_id}`}</strong>
                    <small>${op.produto?.sku || 'Sem SKU'}</small>
                </td>
                <td>${op.quantidade_planejada}</td>
                <td>${op.quantidade_produzida || 0}</td>
                <td>${op.data_inicio ? formatDate(op.data_inicio) : '-'}</td>
                <td>
                    <div class="flex-gap">
                        <button class="btn btn-sm btn-primary" onclick="Modulo_gestao_fabrica.concluirOPPrompt(${op.id}, ${op.quantidade_planejada})">
                            <i class="ph ph-check"></i> Concluir
                        </button>
                        <button class="table-action-icon" onclick="Modulo_gestao_fabrica.abrirOP(${op.id})">
                            <i class="ph ph-arrow-square-out"></i> PCP
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderOrdensPlanejadas(ordens) {
        const tbody = document.querySelector('#gf-table-planejadas tbody');
        if (!tbody) return;

        if (!ordens.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="fabrica-empty">Nenhuma OP pendente de início.</td></tr>';
            return;
        }

        tbody.innerHTML = ordens.map(op => `
            <tr>
                <td>#${op.id}</td>
                <td>
                    <strong>${op.produto?.nome || `Produto #${op.produto_id}`}</strong>
                    <small>${op.produto?.sku || 'Sem SKU'}</small>
                </td>
                <td>${op.quantidade_planejada}</td>
                <td>${formatDate(op.created_at)}</td>
                <td><span class="badge ${this.getOPBadge(op.status)}">${op.status}</span></td>
                <td>
                    <div class="flex-gap">
                        <button class="btn btn-sm btn-primary" onclick="Modulo_gestao_fabrica.iniciarOP(${op.id})">
                            <i class="ph ph-play"></i> Iniciar
                        </button>
                        <button class="table-action-icon" onclick="Modulo_gestao_fabrica.abrirOP(${op.id})">
                            <i class="ph ph-arrow-square-out"></i> PCP
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async abrirOS(osId) {
        await carregarModulo('manutencao');
        if (window.Modulo_manutencao?.abrirGerenciarOS) {
            await window.Modulo_manutencao.abrirGerenciarOS(osId);
        }
    },

    async abrirMaquinaDetalhe(maquinaId) {
        await carregarModulo('manutencao');
        if (window.Modulo_manutencao?.focusMaquina) {
            window.Modulo_manutencao.focusMaquina(maquinaId);
        }
    },

    async abrirMaquina(maquinaId) {
        await carregarModulo('manutencao');
        if (window.Modulo_manutencao?.abrirNovaOS) {
            window.Modulo_manutencao.abrirNovaOS(maquinaId);
        }
        if (window.Modulo_manutencao?.focusMaquina) {
            window.Modulo_manutencao.focusMaquina(maquinaId);
        }
    },

    async abrirOP(opId) {
        await carregarModulo('pcp');
        if (window.Modulo_pcp?.focusOP) {
            window.Modulo_pcp.focusOP(opId);
        }
    },

    async abrirCriacaoOP() {
        await carregarModulo('pcp');
        openModal('modal-nova-op');
    },

    async iniciarOP(opId) {
        if (!confirm("Deseja iniciar esta produção? O estoque das matérias-primas será baixado.")) return;

        try {
            const res = await apiFetch(`/pcp/ordens/${opId}/iniciar`, { method: 'POST' });
            if (res.ok) {
                showNotify("Produção iniciada!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                await this.loadCockpit();
                if (window.Modulo_dashboard?.loadStats) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao iniciar OP.", "error");
            }
        } catch (error) {
            console.error(error);
            showNotify("Falha ao iniciar a OP.", "error");
        }
    },

    concluirOPPrompt(opId, quantidadePlanejada) {
        const qtd = prompt("Quantidade produzida final:", quantidadePlanejada);
        if (qtd !== null) {
            this.concluirOP(opId, parseFloat(qtd));
        }
    },

    async concluirOP(opId, quantidadeProduzida) {
        if (!Number.isFinite(quantidadeProduzida)) {
            showNotify("Quantidade produzida inválida.", "warning");
            return;
        }

        try {
            const res = await apiFetch(`/pcp/ordens/${opId}/concluir?quantidade_produzida=${quantidadeProduzida}`, {
                method: 'POST'
            });

            if (res.ok) {
                showNotify("Produção concluída!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                await this.loadCockpit();
                if (window.Modulo_dashboard?.loadStats) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao concluir OP.", "error");
            }
        } catch (error) {
            console.error(error);
            showNotify("Falha ao concluir a OP.", "error");
        }
    }
};
