window.Modulo_produtividade = {
    dashboard: null,
    sectors: [],
    collaborators: [],
    selectedSector: 'TODOS',

    async init() {
        this.dashboard = null;
        this.sectors = [];
        this.collaborators = [];
        this.selectedSector = 'TODOS';
        this.setDefaultPeriod();
        this.setDefaultEntryDate();
        this.bindEvents();
        await this.loadPainel({ silent: true });
    },

    refresh() {
        return this.loadPainel({ silent: true });
    },

    bindEvents() {
        const reloadButton = document.getElementById('prod-btn-reload');
        const periodInput = document.getElementById('prod-period');
        const sectorFilter = document.getElementById('prod-sector-filter');
        const sectorForm = document.getElementById('prod-sector-form');
        const collaboratorForm = document.getElementById('prod-collaborator-form');
        const entryForm = document.getElementById('prod-entry-form');
        const entrySectorSelect = document.getElementById('prod-entry-sector');

        if (reloadButton && !reloadButton.dataset.bound) {
            reloadButton.dataset.bound = 'true';
            reloadButton.addEventListener('click', () => this.loadPainel());
        }

        if (periodInput && !periodInput.dataset.bound) {
            periodInput.dataset.bound = 'true';
            periodInput.addEventListener('change', () => this.loadPainel());
        }

        if (sectorFilter && !sectorFilter.dataset.bound) {
            sectorFilter.dataset.bound = 'true';
            sectorFilter.addEventListener('change', () => {
                this.selectedSector = sectorFilter.value || 'TODOS';
                this.renderDynamicSections();
            });
        }

        if (sectorForm && !sectorForm.dataset.bound) {
            sectorForm.dataset.bound = 'true';
            sectorForm.addEventListener('submit', (event) => this.saveSector(event));
        }

        if (collaboratorForm && !collaboratorForm.dataset.bound) {
            collaboratorForm.dataset.bound = 'true';
            collaboratorForm.addEventListener('submit', (event) => this.saveCollaborator(event));
        }

        if (entryForm && !entryForm.dataset.bound) {
            entryForm.dataset.bound = 'true';
            entryForm.addEventListener('submit', (event) => this.saveEntry(event));
        }

        if (entrySectorSelect && !entrySectorSelect.dataset.bound) {
            entrySectorSelect.dataset.bound = 'true';
            entrySectorSelect.addEventListener('change', () => this.populateCollaboratorSelect());
        }
    },

    setDefaultPeriod() {
        const periodInput = document.getElementById('prod-period');
        if (!periodInput || periodInput.value) return;
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        periodInput.value = `${now.getFullYear()}-${month}`;
    },

    setDefaultEntryDate() {
        const input = document.getElementById('prod-entry-date');
        if (!input || input.value) return;
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        input.value = `${now.getFullYear()}-${month}-${day}`;
    },

    getPeriodParts() {
        const periodInput = document.getElementById('prod-period');
        const period = periodInput?.value || '';
        const [yearText, monthText] = period.split('-');
        const year = parseInt(yearText, 10);
        const month = parseInt(monthText, 10);

        if (!Number.isFinite(year) || !Number.isFinite(month)) {
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() + 1 };
        }

        return { year, month };
    },

    async loadPainel({ silent = false } = {}) {
        this.renderLoadingState();

        const { year, month } = this.getPeriodParts();
        const params = new URLSearchParams({
            ano: String(year),
            mes: String(month),
        });

        try {
            const [dashboardRes, sectorsRes, collaboratorsRes] = await Promise.all([
                apiFetch(`/produtividade/dashboard?${params.toString()}`),
                apiFetch('/produtividade/setores'),
                apiFetch('/produtividade/colaboradores'),
            ]);

            if (!dashboardRes.ok) {
                const message = await this.readError(dashboardRes, 'Não foi possível carregar o painel de produtividade.');
                this.renderErrorState(message);
                return;
            }
            if (!sectorsRes.ok) {
                const message = await this.readError(sectorsRes, 'Não foi possível carregar os setores de produtividade.');
                this.renderErrorState(message);
                return;
            }
            if (!collaboratorsRes.ok) {
                const message = await this.readError(collaboratorsRes, 'Não foi possível carregar o cadastro de colaboradores.');
                this.renderErrorState(message);
                return;
            }

            this.dashboard = await dashboardRes.json();
            this.sectors = await sectorsRes.json();
            this.collaborators = await collaboratorsRes.json();

            this.renderMeta();
            this.populateSectorSelects();
            this.renderSectorTable();
            this.renderCollaboratorRegistry();
            this.renderDynamicSections();

            if (!silent) {
                showNotify('Painel de produtividade atualizado.', 'success');
            }
        } catch (error) {
            console.error('Erro ao carregar produtividade', error);
            this.renderErrorState(error.message || 'Falha inesperada ao carregar os dados.');
        }
    },

    async saveSector(event) {
        event.preventDefault();

        const id = document.getElementById('prod-sector-id')?.value;
        const nome = document.getElementById('prod-sector-name')?.value.trim() || '';
        const meta = parseFloat(document.getElementById('prod-sector-meta')?.value || '0');
        const metaColaborador = parseFloat(document.getElementById('prod-sector-collaborator-meta')?.value || '0');

        const payload = {
            nome,
            meta_diaria: meta,
            meta_colaborador_diaria: metaColaborador,
            ativo: true,
        };

        try {
            const url = id ? `/produtividade/setores/${id}` : '/produtividade/setores';
            const method = id ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                showNotify(await this.readError(response, 'Não foi possível salvar o setor.'), 'error');
                return;
            }

            showNotify(id ? 'Setor atualizado com sucesso.' : 'Setor salvo com sucesso.', 'success');
            this.cancelEditSector();
            await this.loadPainel({ silent: true });
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar o setor.', 'error');
        }
    },

    editSector(id) {
        const item = this.sectors.find(s => s.id === id);
        if (!item) return;
        document.getElementById('prod-sector-id').value = item.id;
        document.getElementById('prod-sector-name').value = item.nome;
        document.getElementById('prod-sector-meta').value = item.meta_diaria;
        document.getElementById('prod-sector-collaborator-meta').value = item.meta_colaborador_diaria || 0;
        
        document.getElementById('prod-btn-save-sector').innerHTML = '<i class="ph ph-check"></i> Atualizar Setor';
        document.getElementById('prod-btn-cancel-sector').style.display = 'inline-block';
        document.getElementById('prod-sector-name').focus();
    },

    cancelEditSector() {
        document.getElementById('prod-sector-form').reset();
        document.getElementById('prod-sector-id').value = '';
        document.getElementById('prod-btn-save-sector').innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar Setor';
        document.getElementById('prod-btn-cancel-sector').style.display = 'none';
    },

    async saveCollaborator(event) {
        event.preventDefault();

        const id = document.getElementById('prod-collaborator-id')?.value;
        const setorId = parseInt(document.getElementById('prod-collaborator-sector')?.value || '0', 10);
        const nome = document.getElementById('prod-collaborator-name')?.value.trim() || '';

        if (!Number.isFinite(setorId) || setorId <= 0) {
            showNotify('Selecione o setor do colaborador.', 'error');
            return;
        }

        const payload = {
            nome,
            setor_id: setorId,
            ativo: true,
        };

        try {
            const url = id ? `/produtividade/colaboradores/${id}` : '/produtividade/colaboradores';
            const method = id ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                showNotify(await this.readError(response, 'Não foi possível salvar o colaborador.'), 'error');
                return;
            }

            showNotify(id ? 'Colaborador atualizado com sucesso.' : 'Colaborador salvo com sucesso.', 'success');
            this.cancelEditCollaborator();
            await this.loadPainel({ silent: true });
            
            const sectorSelect = document.getElementById('prod-collaborator-sector');
            if (sectorSelect && !id) { // maintain sector if creating multiple
                sectorSelect.value = String(setorId);
            }
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar o colaborador.', 'error');
        }
    },

    editCollaborator(id) {
        const item = this.collaborators.find(c => c.id === id);
        if (!item) return;
        document.getElementById('prod-collaborator-id').value = item.id;
        document.getElementById('prod-collaborator-sector').value = item.setor_id;
        document.getElementById('prod-collaborator-name').value = item.nome;
        
        document.getElementById('prod-btn-save-collaborator').innerHTML = '<i class="ph ph-check"></i> Atualizar Colaborador';
        document.getElementById('prod-btn-cancel-collaborator').style.display = 'inline-block';
        document.getElementById('prod-collaborator-name').focus();
    },

    cancelEditCollaborator() {
        document.getElementById('prod-collaborator-form').reset();
        document.getElementById('prod-collaborator-id').value = '';
        document.getElementById('prod-btn-save-collaborator').innerHTML = '<i class="ph ph-user-plus"></i> Salvar Colaborador';
        document.getElementById('prod-btn-cancel-collaborator').style.display = 'none';
    },

    async saveEntry(event) {
        event.preventDefault();

        const id = document.getElementById('prod-entry-id')?.value;
        const setorId = parseInt(document.getElementById('prod-entry-sector')?.value || '0', 10);
        const colaboradorId = parseInt(document.getElementById('prod-entry-collaborator')?.value || '0', 10);

        if (!Number.isFinite(setorId) || setorId <= 0) {
            showNotify('Selecione o setor do apontamento.', 'error');
            return;
        }

        if (!Number.isFinite(colaboradorId) || colaboradorId <= 0) {
            showNotify('Selecione um colaborador cadastrado.', 'error');
            return;
        }

        const payload = {
            data_referencia: document.getElementById('prod-entry-date')?.value,
            setor_id: setorId,
            colaborador_id: colaboradorId,
            quantidade: parseFloat(document.getElementById('prod-entry-quantity')?.value || '0'),
            ocorrencia: document.getElementById('prod-entry-occurrence')?.value || 'PRODUCAO',
            observacao: document.getElementById('prod-entry-note')?.value.trim() || null,
        };

        try {
            const url = id ? `/produtividade/apontamentos/${id}` : '/produtividade/apontamentos';
            const method = id ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                showNotify(await this.readError(response, 'Não foi possível salvar o apontamento.'), 'error');
                return;
            }

            showNotify(id ? 'Apontamento atualizado com sucesso.' : 'Apontamento salvo com sucesso.', 'success');
            this.cancelEditEntry();
            await this.loadPainel({ silent: true });
            this.populateCollaboratorSelect('');
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar o apontamento.', 'error');
        }
    },

    editEntry(id) {
        const entries = this.dashboard?.recent_entries || [];
        const item = entries.find(e => e.id === id);
        if (!item) return;

        document.getElementById('prod-entry-id').value = item.id;
        document.getElementById('prod-entry-date').value = item.data_referencia;
        document.getElementById('prod-entry-sector').value = item.setor_id;
        this.populateCollaboratorSelect(String(item.colaborador_id));
        document.getElementById('prod-entry-quantity').value = item.quantidade;
        document.getElementById('prod-entry-occurrence').value = item.ocorrencia || 'PRODUCAO';
        document.getElementById('prod-entry-note').value = item.observacao || '';
        
        document.getElementById('prod-btn-save-entry').innerHTML = '<i class="ph ph-check"></i> Atualizar Apontamento';
        document.getElementById('prod-btn-cancel-entry').style.display = 'inline-block';
        document.getElementById('prod-entry-quantity').focus();
    },

    cancelEditEntry() {
        document.getElementById('prod-entry-form').reset();
        document.getElementById('prod-entry-id').value = '';
        document.getElementById('prod-btn-save-entry').innerHTML = '<i class="ph ph-check-circle"></i> Salvar Apontamento';
        document.getElementById('prod-btn-cancel-entry').style.display = 'none';
        this.setDefaultEntryDate();
    },

    async deleteEntry(entryId) {
        const confirmed = await confirmAction(
            'Excluir apontamento?',
            'Esta ação remove o lançamento selecionado do período atual.',
            { icon: 'ph ph-trash', color: '#ef4444' }
        );
        if (!confirmed) return;

        try {
            const response = await apiFetch(`/produtividade/apontamentos/${entryId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                showNotify(await this.readError(response, 'Não foi possível excluir o apontamento.'), 'error');
                return;
            }

            showNotify('Apontamento removido com sucesso.', 'success');
            await this.loadPainel({ silent: true });
        } catch (error) {
            console.error(error);
            showNotify('Falha ao excluir o apontamento.', 'error');
        }
    },

    renderLoadingState() {
        this.setText('prod-meta-periodo', '...');
        this.setText('prod-meta-files', '...');
        this.setText('prod-meta-updated', '...');
        this.setText('prod-source-note', 'Carregando dados da produtividade direto do banco...');
        this.setText('prod-stat-eficiencia', '--');
        this.setText('prod-stat-eficiencia-meta', 'Consolidando indicadores...');
        this.setText('prod-stat-real', '--');
        this.setText('prod-stat-real-meta', 'Processando produção real...');
        this.setText('prod-stat-gap', '--');
        this.setText('prod-stat-gap-meta', 'Comparando com as metas...');
        this.setText('prod-stat-issues', '--');
        this.setText('prod-stat-issues-meta', 'Lendo apontamentos do período...');

        this.renderTableMessage('prod-sectors-body', 4, 'Carregando...');
        this.renderTableMessage('prod-collaborators-registry-body', 3, 'Carregando...');
        this.renderTableMessage('prod-top-days-body', 4, 'Carregando...');
        this.renderTableMessage('prod-bottom-days-body', 4, 'Carregando...');
        this.renderTableMessage('prod-collaborators-body', 8, 'Carregando...');
        this.renderTableMessage('prod-entries-body', 6, 'Carregando...');

        const sectorList = document.getElementById('prod-sector-list');
        if (sectorList) {
            sectorList.innerHTML = '<div class="prod-empty">Carregando setores...</div>';
        }
    },

    renderErrorState(message) {
        this.setText('prod-source-note', message);
        this.setText('prod-stat-eficiencia-meta', 'Falha na análise');
        this.setText('prod-stat-real-meta', 'Falha na análise');
        this.setText('prod-stat-gap-meta', 'Falha na análise');
        this.setText('prod-stat-issues-meta', 'Falha na análise');

        this.renderTableMessage('prod-sectors-body', 4, message);
        this.renderTableMessage('prod-collaborators-registry-body', 3, message);
        this.renderTableMessage('prod-top-days-body', 4, message);
        this.renderTableMessage('prod-bottom-days-body', 4, message);
        this.renderTableMessage('prod-collaborators-body', 8, message);
        this.renderTableMessage('prod-entries-body', 6, message);

        const sectorList = document.getElementById('prod-sector-list');
        if (sectorList) {
            sectorList.innerHTML = `<div class="prod-empty">${this.escapeHtml(message)}</div>`;
        }
    },

    renderMeta() {
        if (!this.dashboard) return;

        this.setText('prod-meta-periodo', this.dashboard.periodo || '-');
        this.setText('prod-meta-files', `${this.sectors.length} setor(es)`);
        this.setText('prod-meta-updated', `${this.dashboard.overview?.entries_total || 0} apontamento(s)`);
        this.setText('prod-source-note', 'Painel conectado ao banco de dados do ERP.');
    },

    populateSectorSelects() {
        const filterSelect = document.getElementById('prod-sector-filter');
        const entrySelect = document.getElementById('prod-entry-sector');
        const collaboratorSectorSelect = document.getElementById('prod-collaborator-sector');
        const occurrenceSelect = document.getElementById('prod-entry-occurrence');

        const currentEntrySector = entrySelect?.value || '';
        const currentCollaboratorSector = collaboratorSectorSelect?.value || '';
        const currentEntryCollaborator = document.getElementById('prod-entry-collaborator')?.value || '';

        const filterOptions = ['TODOS', ...this.sectors.map(item => item.nome)];
        const uniqueFilterOptions = [...new Set(filterOptions)];
        if (!uniqueFilterOptions.includes(this.selectedSector)) {
            this.selectedSector = 'TODOS';
        }

        if (filterSelect) {
            filterSelect.innerHTML = uniqueFilterOptions.map(option => `
                <option value="${this.escapeHtml(option)}" ${option === this.selectedSector ? 'selected' : ''}>
                    ${this.escapeHtml(option === 'TODOS' ? 'Todos os setores' : option)}
                </option>
            `).join('');
        }

        const sectorOptions = this.sectors.length
            ? this.sectors.map(item => `
                <option value="${item.id}">${this.escapeHtml(item.nome)}</option>
            `).join('')
            : '<option value="">Cadastre um setor primeiro</option>';

        if (entrySelect) {
            entrySelect.innerHTML = sectorOptions;
            if (this.sectors.some(item => String(item.id) === currentEntrySector)) {
                entrySelect.value = currentEntrySector;
            }
        }

        if (collaboratorSectorSelect) {
            collaboratorSectorSelect.innerHTML = sectorOptions;
            if (this.sectors.some(item => String(item.id) === currentCollaboratorSector)) {
                collaboratorSectorSelect.value = currentCollaboratorSector;
            }
        }

        const occurrenceOptions = this.dashboard?.occurrence_options?.length
            ? this.dashboard.occurrence_options
            : [
                { value: 'PRODUCAO', label: 'Produção' },
                { value: 'FALTA', label: 'Falta' },
                { value: 'OUTRAS_ATIVIDADES', label: 'Outras atividades' },
                { value: 'SEPAROU_PEDIDO', label: 'Separou pedido' },
            ];

        if (occurrenceSelect) {
            occurrenceSelect.innerHTML = occurrenceOptions.map(option => `
                <option value="${this.escapeHtml(option.value)}">${this.escapeHtml(option.label)}</option>
            `).join('');
        }

        this.populateCollaboratorSelect(currentEntryCollaborator);
    },

    populateCollaboratorSelect(preferredValue = null) {
        const collaboratorSelect = document.getElementById('prod-entry-collaborator');
        const sectorSelect = document.getElementById('prod-entry-sector');
        if (!collaboratorSelect || !sectorSelect) return;

        const setorId = parseInt(sectorSelect.value || '0', 10);
        const rows = this.getCollaboratorsBySectorId(setorId);

        if (!Number.isFinite(setorId) || setorId <= 0) {
            collaboratorSelect.innerHTML = '<option value="">Selecione um setor primeiro</option>';
            return;
        }

        if (!rows.length) {
            collaboratorSelect.innerHTML = '<option value="">Cadastre colaboradores para este setor</option>';
            return;
        }

        collaboratorSelect.innerHTML = [
            '<option value="">Selecione um colaborador</option>',
            ...rows.map(item => `<option value="${item.id}">${this.escapeHtml(item.nome)}</option>`),
        ].join('');

        const valueToApply = preferredValue === null ? collaboratorSelect.dataset.pendingValue || '' : preferredValue;
        if (rows.some(item => String(item.id) === valueToApply)) {
            collaboratorSelect.value = valueToApply;
        } else {
            collaboratorSelect.value = '';
        }
    },

    getCollaboratorsBySectorId(setorId) {
        if (!Number.isFinite(setorId) || setorId <= 0) return [];
        return this.collaborators.filter(item => item.setor_id === setorId && item.ativo !== false);
    },

    getSectorNameById(setorId) {
        return this.sectors.find(item => item.id === setorId)?.nome || `Setor #${setorId}`;
    },

    renderSectorTable() {
        const tbody = document.getElementById('prod-sectors-body');
        if (!tbody) return;

        if (!this.sectors.length) {
            this.renderTableMessage('prod-sectors-body', 4, 'Nenhum setor cadastrado ainda.');
            return;
        }

        tbody.innerHTML = this.sectors.map(item => `
            <tr>
                <td><strong>${this.escapeHtml(item.nome)}</strong></td>
                <td>${this.formatNumber(item.meta_diaria)}</td>
                <td>${this.formatNumber(item.meta_colaborador_diaria || 0)}</td>
                <td><span class="badge ${item.ativo ? 'badge-success' : 'badge-danger'}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <button class="table-action-icon text-primary" onclick="Modulo_produtividade.editSector(${item.id})">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderCollaboratorRegistry() {
        const tbody = document.getElementById('prod-collaborators-registry-body');
        if (!tbody) return;

        if (!this.collaborators.length) {
            this.renderTableMessage('prod-collaborators-registry-body', 3, 'Nenhum colaborador cadastrado ainda.');
            return;
        }

        tbody.innerHTML = this.collaborators.map(item => `
            <tr>
                <td>${this.escapeHtml(item.setor?.nome || this.getSectorNameById(item.setor_id))}</td>
                <td><strong>${this.escapeHtml(item.nome)}</strong></td>
                <td><span class="badge ${item.ativo ? 'badge-success' : 'badge-danger'}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <button class="table-action-icon text-primary" onclick="Modulo_produtividade.editCollaborator(${item.id})">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderDynamicSections() {
        this.renderOverview();
        this.renderSectorList();
        this.renderDaysTables();
        this.renderCollaborators();
        this.renderRecentEntries();
    },

    renderOverview() {
        const setores = this.getFilteredSetores();
        const recentEntries = this.getFilteredRecentEntries();
        const totalReal = setores.reduce((sum, item) => sum + (item.producao_real || 0), 0);
        const totalTheoretical = setores.reduce((sum, item) => sum + (item.producao_teorica || 0), 0);
        const percentual = totalTheoretical > 0 ? totalReal / totalTheoretical : 0;
        const gap = totalReal - totalTheoretical;
        const bestSector = setores[0];
        const worstSector = setores[setores.length - 1];

        this.setText('prod-stat-eficiencia', this.formatPercent(percentual));
        this.setText(
            'prod-stat-eficiencia-meta',
            bestSector
                ? `Melhor setor: ${bestSector.setor} (${this.formatPercent(bestSector.percentual)})`
                : 'Sem dados lançados no período.'
        );

        this.setText('prod-stat-real', this.formatNumber(totalReal));
        this.setText(
            'prod-stat-real-meta',
            `${this.formatNumber(totalTheoretical)} teórico para o período`
        );

        this.setText('prod-stat-gap', this.formatSignedNumber(gap));
        this.setText(
            'prod-stat-gap-meta',
            worstSector
                ? `Menor desempenho: ${worstSector.setor} (${this.formatPercent(worstSector.percentual)})`
                : 'Sem comparação disponível.'
        );

        this.setText('prod-stat-issues', String(recentEntries.length));
        this.setText('prod-stat-issues-meta', `${setores.length} setor(es) no filtro atual`);
    },

    renderSectorList() {
        const container = document.getElementById('prod-sector-list');
        if (!container) return;

        const setores = this.getFilteredSetores();
        if (!setores.length) {
            container.innerHTML = '<div class="prod-empty">Nenhum setor com dados no período atual.</div>';
            return;
        }

        container.innerHTML = setores.map(item => {
            const width = Math.max(4, Math.min(item.percentual * 100, 100));
            const badgeClass = this.getPercentBadgeClass(item.percentual);
            const ocorrencias = item.ocorrencias_relevantes || 'Sem ocorrências relevantes registradas.';

            return `
                <div class="prod-sector-item">
                    <div class="prod-sector-header">
                        <div>
                            <div class="prod-sector-name">${this.escapeHtml(item.setor)}</div>
                            <div class="prod-sector-meta">
                                Meta setor ${this.formatNumber(item.meta_diaria)} | Meta colaborador ${this.formatNumber(item.meta_colaborador_diaria || 0)} | ${item.dias_batendo_meta}/${item.dias_planejados} dia(s) batendo meta
                            </div>
                        </div>
                        <span class="badge ${badgeClass}">${this.formatPercent(item.percentual)}</span>
                    </div>
                    <div class="prod-meter">
                        <div class="prod-meter-fill ${badgeClass}" style="width: ${width}%;"></div>
                    </div>
                    <div class="prod-sector-stats">
                        <span>Real ${this.formatNumber(item.producao_real)}</span>
                        <span>Teórica ${this.formatNumber(item.producao_teorica)}</span>
                        <span>Sem produção ${item.dias_sem_producao} dia(s)</span>
                    </div>
                    <div class="prod-sector-occurrences">${this.escapeHtml(ocorrencias)}</div>
                </div>
            `;
        }).join('');
    },

    renderDaysTables() {
        const dailyRows = this.getFilteredDailyRows();
        const topDays = [...dailyRows].sort((left, right) => right.percentual - left.percentual).slice(0, 6);
        const bottomDays = [...dailyRows].sort((left, right) => left.percentual - right.percentual).slice(0, 6);

        this.renderDayRows('prod-top-days-body', topDays, 'Nenhum dia encontrado para o filtro atual.');
        this.renderDayRows('prod-bottom-days-body', bottomDays, 'Nenhum dia encontrado para o filtro atual.');
    },

    renderDayRows(targetId, rows, emptyMessage) {
        const tbody = document.getElementById(targetId);
        if (!tbody) return;

        if (!rows.length) {
            this.renderTableMessage(targetId, 4, emptyMessage);
            return;
        }

        tbody.innerHTML = rows.map(row => `
            <tr>
                <td>${this.escapeHtml(row.setor)}</td>
                <td>${this.formatDay(row.data)}</td>
                <td><span class="badge ${this.getPercentBadgeClass(row.percentual)}">${this.formatPercent(row.percentual)}</span></td>
                <td class="${row.gap >= 0 ? 'text-success' : 'text-danger'}">${this.formatSignedNumber(row.gap)}</td>
            </tr>
        `).join('');
    },

    renderCollaborators() {
        const tbody = document.getElementById('prod-collaborators-body');
        if (!tbody) return;

        const rows = this.getFilteredCollaborators();
        if (!rows.length) {
            this.renderTableMessage('prod-collaborators-body', 8, 'Nenhum colaborador encontrado no período.');
            return;
        }

        tbody.innerHTML = rows.map(row => `
            <tr>
                <td>${this.escapeHtml(row.setor)}</td>
                <td><strong>${this.escapeHtml(row.colaborador)}</strong></td>
                <td>${this.formatNumber(row.producao_total)}</td>
                <td>${row.dias_produtivos}</td>
                <td>${this.formatNumber(row.media_dia_produtivo)}</td>
                <td>${this.formatNumber(row.meta_colaborador_diaria || 0)}</td>
                <td><span class="badge ${this.getPercentBadgeClass(row.percentual_meta_colaborador || 0)}">${this.formatPercent(row.percentual_meta_colaborador || 0)}</span></td>
                <td>${this.escapeHtml(row.ocorrencias || '-')}</td>
            </tr>
        `).join('');
    },

    renderRecentEntries() {
        const tbody = document.getElementById('prod-entries-body');
        if (!tbody) return;

        const rows = this.getFilteredRecentEntries();
        if (!rows.length) {
            this.renderTableMessage('prod-entries-body', 6, 'Nenhum apontamento registrado no período.');
            return;
        }

        tbody.innerHTML = rows.map(row => `
            <tr>
                <td>${this.formatDay(row.data_referencia)}</td>
                <td>${this.escapeHtml(row.setor)}</td>
                <td>
                    <strong>${this.escapeHtml(row.colaborador_nome)}</strong>
                    <small class="prod-table-note">${this.escapeHtml(row.observacao || row.criado_por || '')}</small>
                </td>
                <td>${this.formatNumber(row.quantidade)}</td>
                <td><span class="badge ${this.getOccurrenceBadgeClass(row.ocorrencia)}">${this.escapeHtml(row.ocorrencia_label)}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="table-action-icon text-primary" onclick="Modulo_produtividade.editEntry(${row.id})">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="table-action-icon text-danger" onclick="Modulo_produtividade.deleteEntry(${row.id})">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getFilteredSetores() {
        const rows = this.dashboard?.setores || [];
        if (this.selectedSector === 'TODOS') return rows;
        return rows.filter(item => item.setor === this.selectedSector);
    },

    getFilteredDailyRows() {
        const rows = this.dashboard?.diario || [];
        if (this.selectedSector === 'TODOS') return rows;
        return rows.filter(item => item.setor === this.selectedSector);
    },

    getFilteredCollaborators() {
        const rows = this.dashboard?.colaboradores || [];
        const filtered = this.selectedSector === 'TODOS'
            ? rows
            : rows.filter(item => item.setor === this.selectedSector);
        return filtered.slice(0, 18);
    },

    getFilteredRecentEntries() {
        const rows = this.dashboard?.recent_entries || [];
        if (this.selectedSector === 'TODOS') return rows;
        return rows.filter(item => item.setor === this.selectedSector);
    },

    renderTableMessage(targetId, colSpan, message) {
        const tbody = document.getElementById(targetId);
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="prod-empty-cell">${this.escapeHtml(message)}</td></tr>`;
    },

    getPercentBadgeClass(percentual) {
        if (percentual >= 1) return 'badge-success';
        if (percentual >= 0.6) return 'badge-warning';
        return 'badge-danger';
    },

    getOccurrenceBadgeClass(occurrence) {
        const normalized = String(occurrence || 'PRODUCAO').toUpperCase();
        if (normalized === 'PRODUCAO') return 'badge-info';
        if (normalized === 'FALTA') return 'badge-danger';
        return 'badge-warning';
    },

    formatPercent(value) {
        return `${((value || 0) * 100).toFixed(1).replace('.', ',')}%`;
    },

    formatNumber(value) {
        return new Intl.NumberFormat('pt-BR', {
            maximumFractionDigits: 0,
        }).format(value || 0);
    },

    formatSignedNumber(value) {
        const signal = value >= 0 ? '+' : '-';
        return `${signal}${this.formatNumber(Math.abs(value || 0))}`;
    },

    formatDay(value) {
        if (!value) return '-';
        return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
    },

    setText(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = value;
        }
    },

    async readError(response, fallback) {
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const payload = await response.clone().json();
                return payload.detail || fallback;
            }
        } catch (error) {
            console.error('Erro ao ler falha da API de produtividade', error);
        }
        return fallback;
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
};
