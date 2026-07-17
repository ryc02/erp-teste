// === RELATÓRIOS E BI ===

async function loadRelatorios() {
    try {
        if (state.products.length === 0) await loadProducts();
        
        let valorTotal = 0;
        let abaixoMinimo = [];
        
        state.products.forEach(p => {
            valorTotal += (p.estoque_atual * (p.preco_venda * 0.6));
            if (p.estoque_atual <= p.estoque_minimo) abaixoMinimo.push(p);
        });
        
        document.getElementById('stat-valor-estoque').innerText = formatCurrency(valorTotal);
        document.getElementById('stat-sugestoes').innerText = abaixoMinimo.length;
        
        const tbodySug = document.querySelector('#table-sugestoes tbody');
        if (tbodySug) {
            tbodySug.innerHTML = abaixoMinimo.map(p => `
                <tr>
                    <td><strong>${p.nome}</strong></td>
                    <td>${p.estoque_atual} ${p.unidade_medida}</td>
                    <td>${p.estoque_minimo}</td>
                    <td><span class="text-danger">Comprar ${p.estoque_maximo - p.estoque_atual} ${p.unidade_medida}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center">Tudo em dia! Nenhum produto abaixo do mínimo.</td></tr>';
        }

        const resEfi = await fetch(`${API_URL}/relatorios/eficiencia_producao`);
        const efiData = await resEfi.json();
        const tbodyEfi = document.querySelector('#table-rel-eficiencia tbody');
        
        if (tbodyEfi) {
            tbodyEfi.innerHTML = efiData.map(item => `
                <tr>
                    <td>#${item.op_id}</td>
                    <td>${item.produto}</td>
                    <td>${item.tempo_horas}h</td>
                    <td>
                        <div style="width: 100%; background: rgba(255,255,255,0.05); border-radius: 4px; height: 8px;">
                            <div style="width: ${Math.min(item.eficiencia_qtd, 100)}%; background: ${item.eficiencia_qtd >= 90 ? 'var(--success)' : 'var(--warning)'}; height: 100%; border-radius: 4px;"></div>
                        </div>
                        <small>${item.eficiencia_qtd.toFixed(1)}%</small>
                    </td>
                    <td>${formatDate(item.data_fim)}</td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center">Nenhuma OP concluída para análise.</td></tr>';
        }

        const resCustos = await fetch(`${API_URL}/relatorios/custos_producao`);
        const custoData = await resCustos.json();
        const tbodyCusto = document.querySelector('#table-rel-custos tbody');
        
        if (tbodyCusto) {
            tbodyCusto.innerHTML = custoData.map(item => `
                <tr>
                    <td><strong>${item.produto}</strong></td>
                    <td>${item.quantidade}</td>
                    <td>${formatCurrency(item.custo_unitario)}</td>
                    <td>${formatCurrency(item.custo_total)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="window.openDocumentViaAgent('${API_URL}/relatorios/ordem_producao/${item.op_id}/pdf?token=' + sessionStorage.getItem('token'), { preferAppMode: true, width: 1280, height: 900, documentKind: 'pdf' })" title="Ver OP">
                            <i class="ph ph-file-pdf"></i>
                        </button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center">Dados de custo insuficientes.</td></tr>';
        }

        showNotify("Relatórios atualizados com sucesso!", "success");

    } catch (e) { console.error("Erro ao carregar relatórios", e); }
}
