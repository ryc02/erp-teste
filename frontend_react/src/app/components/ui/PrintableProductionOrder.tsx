import React from "react";

interface Props {
  data: any;
}

export function PrintableProductionOrder({ data }: Props) {
  if (!data) return null;

  const itens = data.itens || [];
  const qtyTotal = itens.reduce((acc: number, cur: any) => acc + (cur.quantidade || 0), 0);

  return (
    <div id="printable-production-area" className="hidden font-sans text-xs p-8 max-w-[210mm] mx-auto bg-white text-black min-h-screen relative border-2 border-black">
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider">ORDEM DE PRODUÇÃO / FABRICAÇÃO</h1>
          <p className="text-xs text-gray-700">Setor PCP & Operação Industrial</p>
        </div>
        <div className="text-right font-mono">
          <div className="text-lg font-bold">OP #OP-{data.id}</div>
          <div className="text-xs text-gray-600">Pedido Ref: #{data.id}</div>
          <div className="text-xs">Data Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
        </div>
      </div>

      {/* Info Block */}
      <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 bg-gray-50">
        <div>
          <p className="font-bold text-gray-800 uppercase">Cliente / Destino:</p>
          <p className="font-medium">{data.cliente_nome || data.cliente?.nome_razao_social || "Cliente Padrão"}</p>
        </div>
        <div>
          <p className="font-bold text-gray-800 uppercase">Data Prevista de Entrega:</p>
          <p className="font-medium">{data.data_prevista ? new Date(data.data_prevista).toLocaleDateString('pt-BR') : "Imediata / A Definir"}</p>
        </div>
      </div>

      {/* Technical Items Table */}
      <div className="mb-4">
        <h2 className="font-bold text-sm uppercase mb-2">Itens para Fabricação / Separação</h2>
        <table className="w-full border-collapse border border-black text-left">
          <thead>
            <tr className="bg-gray-200 border-b border-black font-bold text-center">
              <th className="p-2 border-r border-black w-12">Seq</th>
              <th className="p-2 border-r border-black w-32">SKU</th>
              <th className="p-2 border-r border-black">Descrição do Item / Produto</th>
              <th className="p-2 border-r border-black w-24">Qtd Solicitada</th>
              <th className="p-2 border-r border-black w-20">Concluído</th>
              <th className="p-2 w-24">Visto Op.</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item: any, i: number) => (
              <tr key={i} className="border-b border-black">
                <td className="p-2 border-r border-black text-center font-mono">{i + 1}</td>
                <td className="p-2 border-r border-black font-mono font-bold">{item.produto?.sku || item.sku || "—"}</td>
                <td className="p-2 border-r border-black font-semibold">{item.produto?.nome || item.nome || "Produto sem nome"}</td>
                <td className="p-2 border-r border-black text-center font-bold text-sm">{item.quantidade} UN</td>
                <td className="p-2 border-r border-black text-center text-gray-400">[ &nbsp; ]</td>
                <td className="p-2 text-center text-gray-400">______</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      <div className="flex justify-between border border-black p-2 mb-6 bg-gray-100 font-bold">
        <span>Total de Itens Distintos: {itens.length}</span>
        <span>Quantidade Total de Peças: {qtyTotal} UN</span>
      </div>

      {/* Technical Observations */}
      <div className="border border-black p-3 mb-6">
        <p className="font-bold mb-1">Instruções Técnicas e Observações:</p>
        <p className="text-gray-700 whitespace-pre-line">{data.observacoes || "Nenhuma observação técnica cadastrada para este pedido."}</p>
      </div>

      {/* Signatures & Quality Control */}
      <div className="grid grid-cols-3 gap-4 pt-12 text-center">
        <div className="border-t border-black pt-2">
          <p className="font-bold">Responsável PCP</p>
          <p className="text-[10px] text-gray-500">Emissão da OP</p>
        </div>
        <div className="border-t border-black pt-2">
          <p className="font-bold">Operador da Fábrica</p>
          <p className="text-[10px] text-gray-500">Execução / Corte / Montagem</p>
        </div>
        <div className="border-t border-black pt-2">
          <p className="font-bold">Controle de Qualidade</p>
          <p className="text-[10px] text-gray-500">Inspeção Final & Conferência</p>
        </div>
      </div>
    </div>
  );
}
