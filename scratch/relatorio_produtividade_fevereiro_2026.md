# Produtividade Real x Teórica - Fevereiro 2026

## Consolidado

| Setor | Real | Teórica | % real x teórica | Dias batendo meta | Dias sem produção |
| --- | ---: | ---: | ---: | ---: | ---: |
| LOGÍSTICA | 30.725 | 40.000 | 76.8% | 6 | 4 |
| MONTAGEM | 38.640 | 80.000 | 48.3% | 1 | 1 |
| REVESTIMENTO CRISTAL | 26.999 | 60.000 | 45.0% | 0 | 0 |
| REVESTIMENTO POLYWOOD | 25.100 | 160.000 | 15.7% | 0 | 14 |
| CORTE | 24.143 | 160.000 | 15.1% | 0 | 0 |

## Pontos de atenção

- VENNER LOGÍSTICA FEVEREIRO 2026.xlsx / ANÁLISE PRODUÇÃO LOGÍSTICA / B11:U11: Os percentuais diários estão calculando desvio contra a meta (subtraindo 100%), não o percentual entregue. (encontrado: `Fórmulas do tipo =(real/teórico)-100%` | esperado: `Fórmulas do tipo =real/teórico`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - CORTE.xlsx / ANÁLISE PRODUÇÃO CORTE / B10:U10: As fórmulas de produção total do dia em 20 coluna(s) não somam todas as linhas de colaboradores. (encontrado: `Exemplo: B10 =SUM(B9:B9)` | esperado: `Exemplo: B10 =SUM(B8:B9)`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - CORTE.xlsx / ANÁLISE PRODUÇÃO CORTE / B12:U12: Os percentuais diários estão calculando desvio contra a meta (subtraindo 100%), não o percentual entregue. (encontrado: `Fórmulas do tipo =(real/teórico)-100%` | esperado: `Fórmulas do tipo =real/teórico`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - CRISTAL.xlsx / ANÁLISE PRODUÇÃO CRISTAL / B12:U12: Os percentuais diários estão calculando desvio contra a meta (subtraindo 100%), não o percentual entregue. (encontrado: `Fórmulas do tipo =(real/teórico)-100%` | esperado: `Fórmulas do tipo =real/teórico`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - MONTAGEM.xlsx / ANÁLISE PRODUÇÃO MONTAGEM / W14: O total mensal de produção teórica não soma todos os dias da linha de meta. (encontrado: `'=SUM(B14:G14,I14:U14)` | esperado: `'=SUM(B14:U14)`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - MONTAGEM.xlsx / ANÁLISE PRODUÇÃO MONTAGEM / B15:U15: Os percentuais diários estão calculando desvio contra a meta (subtraindo 100%), não o percentual entregue. (encontrado: `Fórmulas do tipo =(real/teórico)-100%` | esperado: `Fórmulas do tipo =real/teórico`)
- VENNER PRODUÇÃO FEVEREIRO 2026 - POLYWOOD.xlsx / ANÁLISE PRODUÇÃO REVESTIMENTO / B11:U11: Os percentuais diários estão calculando desvio contra a meta (subtraindo 100%), não o percentual entregue. (encontrado: `Fórmulas do tipo =(real/teórico)-100%` | esperado: `Fórmulas do tipo =real/teórico`)