import React from "react";

interface Props {
  data: any;
}

export function PrintableProposal({ data }: Props) {
  if (!data) return null;

  const isPedido = data.tipo === "PEDIDO";
  const title = isPedido ? `Pedido de Venda Nº ${data.id}` : `Proposta Comercial Nº ${data.id}`;

  const cliente = data.cliente || {};
  const endereco = data.endereco_entrega || data.cliente?.endereco || "";
  const numero = data.numero_entrega || data.cliente?.numero || "";
  const bairro = data.bairro_entrega || data.cliente?.bairro || "";
  const cidade = data.cidade_entrega || data.cliente?.cidade || "";
  const uf = data.uf_entrega || data.cliente?.estado || "";
  const cep = data.cep_entrega || data.cliente?.cep || "";
  
  const addressLine1 = `${endereco}${numero ? `, Nº ${numero}` : ''}${bairro ? `, ${bairro}` : ''}`;
  const addressLine2 = `${cidade} - ${cep}, ${uf}`;

  const telefone = cliente.telefone || "";
  const email = cliente.email || "";
  
  const vendedorNome = data.vendedor_interno?.nome_completo || data.representante?.nome || "";

  // Calculating totals based on items
  const itens = data.itens || [];
  const qtyTotal = itens.reduce((acc: number, cur: any) => acc + (cur.quantidade || 0), 0);
  const sumItems = itens.reduce((acc: number, cur: any) => acc + (cur.preco_unitario * cur.quantidade || 0), 0);

  return (
    <div id="printable-area" className="hidden font-sans text-sm p-8 max-w-[210mm] mx-auto bg-white text-black min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="font-bold text-2xl tracking-tighter text-black flex items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M10 10L20 30L30 10" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            VENNER
          </div>
        </div>
        <div className="text-right text-xs uppercase text-gray-800">
          <div className="font-bold">VENNER INDUSTRIA E COMERCIO LTDA</div>
          <div>48.085.200/0001-10</div>
          <div>(11) 5610-0160</div>
          <div>FLORIANO PEIXOTO, 555, GALPÃO</div>
          <div>VILA ROMANOPOLIS, Ferraz de Vasconcelos - SP</div>
          <div>08.529-030</div>
        </div>
      </div>

      <div className="text-center font-bold text-xl mb-6">{title}</div>

      {/* Customer block */}
      <div className="mb-4">
        <div>Para</div>
        <div className="uppercase">{cliente.nome_razao_social || data.cliente_nome}</div>
      </div>

      <div className="border border-black p-2 mb-4 text-sm leading-relaxed">
        <div className="font-bold">Endereço do Cliente</div>
        <div>{cliente.cpf_cnpj || ""}</div>
        <div>{addressLine1}</div>
        <div>{addressLine2}</div>
        <div>Fone: {telefone}{email ? `, E-mail: ${email}` : ''}</div>
      </div>

      <div className="mb-6">Vendedor(a): <span className="uppercase">{vendedorNome}</span></div>

      <div className="font-bold mb-2">Itens de produto ou serviço</div>
      <table className="w-full text-sm border-collapse mb-8 border border-black text-left">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="p-2 border-r border-black font-bold">Nº</th>
            <th className="p-2 border-r border-black font-bold">Item</th>
            <th className="p-2 border-r border-black font-bold">SKU</th>
            <th className="p-2 border-r border-black font-bold text-right">Qtd</th>
            <th className="p-2 border-r border-black font-bold text-center">Un</th>
            <th className="p-2 border-r border-black font-bold text-right">Preço lista</th>
            <th className="p-2 border-r border-black font-bold text-right">Desconto %</th>
            <th className="p-2 border-r border-black font-bold text-right">Preço un</th>
            <th className="p-2 font-bold text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item: any, i: number) => {
            const qtd = item.quantidade || 0;
            const precoUn = item.preco_unitario || 0;
            const total = qtd * precoUn;
            // Trying to extract list price and discount if available, otherwise assume 0 discount
            const precoLista = item.preco_lista || precoUn;
            const descPerc = precoLista > 0 ? (1 - precoUn / precoLista) * 100 : 0;

            return (
              <tr key={i} className="border-b border-black">
                <td className="p-2 border-r border-black">{i + 1}</td>
                <td className="p-2 border-r border-black">{item.produto?.nome || "-"}</td>
                <td className="p-2 border-r border-black">{item.produto?.sku || "-"}</td>
                <td className="p-2 border-r border-black text-right">{qtd.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                <td className="p-2 border-r border-black text-center">UN</td>
                <td className="p-2 border-r border-black text-right">{precoLista.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                <td className="p-2 border-r border-black text-right">{descPerc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 border-r border-black text-right">{precoUn.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                <td className="p-2 text-right">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer totals */}
      <div className="flex justify-between border border-black p-2 mb-8 bg-gray-50">
        <div>Número de itens: {itens.length}</div>
        <div>Soma das quantidades: {qtyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
        <div className="font-bold">Total dos itens {sumItems.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <table className="w-full text-sm border-collapse mb-8 border border-black">
        <thead>
          <tr className="bg-gray-100 border-b border-black text-center">
            <th className="p-2 border-r border-black font-bold">Data</th>
            <th className="p-2 border-r border-black font-bold">Total dos itens</th>
            <th className="p-2 border-r border-black font-bold">Valor IPI</th>
            <th className="p-2 font-bold">Total da proposta</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="p-2 border-r border-black">{new Date(data.criado_em).toLocaleDateString('pt-BR')}</td>
            <td className="p-2 border-r border-black">{sumItems.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 border-r border-black">{(data.valor_ipi || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 font-bold">{(data.valor_total || sumItems).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <div className="font-bold mb-2">Condições gerais</div>
      <table className="w-full text-sm border-collapse mb-8 border border-black text-left">
        <tbody>
          <tr>
            <td className="p-2 border-r border-black font-bold bg-gray-50 w-3/4">Validade da proposta</td>
            <td className="p-2">0 dias</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-4">Atenciosamente, {vendedorNome || "Vendedor"}</div>
      <div>Departamento de vendas</div>

    </div>
  );
}
