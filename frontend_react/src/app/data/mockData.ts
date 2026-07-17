import { CheckCircle, Truck, Clock, XCircle, Package, FileText } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

export const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export const clientesData = [
  { id: "CLI-0091", nome: "Mariana Oliveira", tipo: "PF", doc: "428.991.023-14", email: "mariana@email.com", telefone: "(11) 98721-4432", cidade: "São Paulo", uf: "SP", situacao: "ativo", compras: 8, total: "R$ 3.240,00" },
  { id: "CLI-0090", nome: "Tech Distribuidora Ltda", tipo: "PJ", doc: "12.345.678/0001-99", email: "compras@techd.com.br", telefone: "(21) 3421-8800", cidade: "Rio de Janeiro", uf: "RJ", situacao: "ativo", compras: 24, total: "R$ 78.900,00" },
  { id: "CLI-0089", nome: "Carlos Mendes", tipo: "PF", doc: "311.002.771-88", email: "carlos.m@gmail.com", telefone: "(31) 99214-5510", cidade: "Belo Horizonte", uf: "MG", situacao: "ativo", compras: 3, total: "R$ 1.870,00" },
  { id: "CLI-0088", nome: "Fernanda Costa", tipo: "PF", doc: "502.887.312-41", email: "fe.costa@hotmail.com", telefone: "(41) 98533-2211", cidade: "Curitiba", uf: "PR", situacao: "inativo", compras: 1, total: "R$ 2.890,00" },
  { id: "CLI-0087", nome: "Global Atacado S.A.", tipo: "PJ", doc: "98.765.432/0001-10", email: "financeiro@globalatacado.com", telefone: "(11) 3200-4411", cidade: "Guarulhos", uf: "SP", situacao: "ativo", compras: 51, total: "R$ 214.500,00" },
  { id: "CLI-0086", nome: "Rafael Souza", tipo: "PF", doc: "188.221.049-02", email: "r.souza@yahoo.com", telefone: "(85) 99001-7733", cidade: "Fortaleza", uf: "CE", situacao: "ativo", compras: 6, total: "R$ 2.112,00" },
];

export const produtosData = [
  { id: "PRD-4421", nome: "Kit Organizador Escritório", categoria: "Escritório", ncm: "3926.10.00", unidade: "UN", custo: 62.00, preco: 189.90, margem: 67.5, estoque: 142, situacao: "ativo" },
  { id: "PRD-4422", nome: "Cadeira Gamer Pro X", categoria: "Mobiliário", ncm: "9401.30.00", unidade: "UN", custo: 430.00, preco: 1249.00, margem: 65.6, estoque: 18, situacao: "ativo" },
  { id: "PRD-4423", nome: 'Monitor 27" IPS 144Hz', categoria: "Eletrônicos", ncm: "8528.52.20", unidade: "UN", custo: 980.00, preco: 2890.00, margem: 66.1, estoque: 7, situacao: "ativo" },
  { id: "PRD-4424", nome: "Teclado Mecânico HyperX", categoria: "Periféricos", ncm: "8471.60.54", unidade: "UN", custo: 148.00, preco: 459.90, margem: 67.8, estoque: 89, situacao: "ativo" },
  { id: "PRD-4425", nome: "Fone Bluetooth ANC Pro", categoria: "Áudio", ncm: "8518.30.00", unidade: "UN", custo: 122.00, preco: 379.00, margem: 67.8, estoque: 56, situacao: "ativo" },
  { id: "PRD-4426", nome: "Webcam Full HD 1080p", categoria: "Periféricos", ncm: "8525.89.90", unidade: "UN", custo: 71.00, preco: 219.90, margem: 67.7, estoque: 4, situacao: "inativo" },
];

export const fornecedoresData = [
  { id: "FOR-0021", nome: "Eletrônicos Prime Ltda", doc: "45.678.901/0001-23", email: "comercial@eprime.com.br", telefone: "(11) 3344-9900", cidade: "São Paulo", uf: "SP", situacao: "ativo" },
  { id: "FOR-0020", nome: "Distribuidora Nacional S.A.", doc: "23.456.789/0001-45", email: "vendas@disnac.com", telefone: "(21) 2200-8811", cidade: "Rio de Janeiro", uf: "RJ", situacao: "ativo" },
  { id: "FOR-0019", nome: "Importadora TechBR", doc: "67.890.123/0001-67", email: "import@techbr.com.br", telefone: "(11) 4444-3322", cidade: "São Bernardo do Campo", uf: "SP", situacao: "ativo" },
];

export const ordersData = [
  { id: "#PED-8821", cliente: "Mariana Oliveira", produto: "Kit Organizador Escritório", canal: "Mercado Livre", valor: 189.90, status: "entregue", data: "13/07/2026", pagamento: "Pix" },
  { id: "#PED-8820", cliente: "Carlos Mendes", produto: "Cadeira Gamer Pro X", canal: "Amazon", valor: 1249.00, status: "transito", data: "13/07/2026", pagamento: "Cartão Crédito" },
  { id: "#PED-8819", cliente: "Fernanda Costa", produto: 'Monitor 27" IPS 144Hz', canal: "Shopee", valor: 2890.00, status: "processando", data: "12/07/2026", pagamento: "Boleto" },
  { id: "#PED-8818", cliente: "Rafael Souza", produto: "Teclado Mecânico HyperX", canal: "Loja própria", valor: 459.90, status: "entregue", data: "12/07/2026", pagamento: "Pix" },
  { id: "#PED-8817", cliente: "Amanda Lima", produto: "Fone Bluetooth ANC Pro", canal: "Mercado Livre", valor: 379.00, status: "cancelado", data: "11/07/2026", pagamento: "Cartão Crédito" },
  { id: "#PED-8816", cliente: "Bruno Alves", produto: "Webcam Full HD 1080p", canal: "Shopee", valor: 219.90, status: "entregue", data: "11/07/2026", pagamento: "Pix" },
  { id: "#PED-8815", cliente: "Juliana Ramos", produto: "Mesa Ajustável Standing", canal: "Amazon", valor: 1890.00, status: "transito", data: "10/07/2026", pagamento: "Boleto" },
  { id: "#PED-8814", cliente: "Diego Ferreira", produto: "Suporte Monitor Duplo", canal: "Mercado Livre", valor: 329.90, status: "processando", data: "10/07/2026", pagamento: "Pix" },
];

export const contasPagarData = [
  { id: "CP-0041", descricao: "Frete Correios — Lote 44", fornecedor: "Correios", vencimento: "15/07/2026", valor: 847.20, categoria: "Logística", status: "aberto", pagamento: "Boleto" },
  { id: "CP-0040", descricao: "Reposição estoque — Monitor 27\"", fornecedor: "Eletrônicos Prime", vencimento: "14/07/2026", valor: 9800.00, categoria: "Estoque", status: "vencido", pagamento: "Transferência" },
  { id: "CP-0039", descricao: "Taxa marketplace Shopee — Jun", fornecedor: "Shopee", vencimento: "20/07/2026", valor: 1247.40, categoria: "Taxas", status: "aberto", pagamento: "Débito Auto" },
  { id: "CP-0038", descricao: "Aluguel galpão logístico", fornecedor: "Imob. Central", vencimento: "10/07/2026", valor: 4500.00, categoria: "Infraestrutura", status: "pago", pagamento: "TED" },
  { id: "CP-0037", descricao: "Embalagens e insumos", fornecedor: "Embal Pack", vencimento: "25/07/2026", valor: 1320.00, categoria: "Suprimentos", status: "aberto", pagamento: "Boleto" },
];

export const contasReceberData = [
  { id: "CR-0071", descricao: "Pedido #PED-8819 — Shopee", cliente: "Fernanda Costa", vencimento: "19/07/2026", valor: 2890.00, categoria: "Vendas", status: "aberto" },
  { id: "CR-0070", descricao: "Pedido #PED-8815 — Amazon", cliente: "Juliana Ramos", vencimento: "17/07/2026", valor: 1890.00, categoria: "Vendas", status: "aberto" },
  { id: "CR-0069", descricao: "Contrato Global Atacado — Julho", cliente: "Global Atacado S.A.", vencimento: "30/07/2026", valor: 18400.00, categoria: "Atacado", status: "aberto" },
  { id: "CR-0068", descricao: "Pedido #PED-8821 — Mercado Livre", cliente: "Mariana Oliveira", vencimento: "13/07/2026", valor: 189.90, categoria: "Vendas", status: "recebido" },
  { id: "CR-0067", descricao: "Pedido #PED-8818 — Loja própria", cliente: "Rafael Souza", vencimento: "12/07/2026", valor: 459.90, categoria: "Vendas", status: "recebido" },
];

export const caixaData = [
  { hora: "09:14", descricao: "Abertura de caixa", tipo: "abertura", valor: 500.00 },
  { hora: "10:22", descricao: "Venda PDV — Teclado Mecânico", tipo: "entrada", valor: 459.90 },
  { hora: "11:05", descricao: "Venda PDV — Fone Bluetooth", tipo: "entrada", valor: 379.00 },
  { hora: "11:47", descricao: "Troco devolução cliente", tipo: "saida", valor: 42.10 },
  { hora: "13:30", descricao: "Venda PDV — Webcam HD", tipo: "entrada", valor: 219.90 },
  { hora: "14:18", descricao: "Sangria caixa", tipo: "saida", valor: 800.00 },
  { hora: "15:02", descricao: "Venda PDV — Kit Organizador", tipo: "entrada", valor: 189.90 },
];

export const dreData = [
  { conta: "Receita Bruta de Vendas", valor: 241000, nivel: 0, tipo: "receita" },
  { conta: "(-) Devoluções e cancelamentos", valor: -4800, nivel: 1, tipo: "deducao" },
  { conta: "(-) Impostos sobre vendas (ICMS, PIS, COFINS)", valor: -21900, nivel: 1, tipo: "deducao" },
  { conta: "= Receita Líquida", valor: 214300, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Custo dos produtos vendidos (CPV)", valor: -83200, nivel: 1, tipo: "deducao" },
  { conta: "= Lucro Bruto", valor: 131100, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Despesas Operacionais", valor: -54900, nivel: 1, tipo: "deducao" },
  { conta: "  Logística e frete", valor: -12400, nivel: 2, tipo: "detalhe" },
  { conta: "  Taxas de marketplace", valor: -18700, nivel: 2, tipo: "detalhe" },
  { conta: "  Marketing e publicidade", valor: -9800, nivel: 2, tipo: "detalhe" },
  { conta: "  Pessoal e administrativo", valor: -14000, nivel: 2, tipo: "detalhe" },
  { conta: "= EBITDA", valor: 76200, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Depreciação e amortização", valor: -2100, nivel: 1, tipo: "deducao" },
  { conta: "(-) Resultado financeiro", valor: -1800, nivel: 1, tipo: "deducao" },
  { conta: "= Lucro Líquido", valor: 72300, nivel: 0, tipo: "total" },
];

export const revenueData = [
  { mes: "Jan", receita: 142000, despesas: 98000 },
  { mes: "Fev", receita: 158000, despesas: 104000 },
  { mes: "Mar", receita: 134000, despesas: 91000 },
  { mes: "Abr", receita: 187000, despesas: 112000 },
  { mes: "Mai", receita: 213000, despesas: 127000 },
  { mes: "Jun", receita: 198000, despesas: 119000 },
  { mes: "Jul", receita: 241000, despesas: 138000 },
];

export const dailyOrdersData = [
  { dia: "Seg", pedidos: 34 }, { dia: "Ter", pedidos: 41 }, { dia: "Qua", pedidos: 29 },
  { dia: "Qui", pedidos: 52 }, { dia: "Sex", pedidos: 67 }, { dia: "Sáb", pedidos: 48 }, { dia: "Dom", pedidos: 31 },
];

export const channelData = [
  { name: "Mercado Livre", value: 38, color: "#F05A28" },
  { name: "Shopee", value: 24, color: "#3B82F6" },
  { name: "Amazon", value: 19, color: "#10B981" },
  { name: "Loja própria", value: 12, color: "#F59E0B" },
  { name: "Outros", value: 7, color: "#8B5CF6" },
];

export const statusConfig = {
  entregue: { label: "Entregue", icon: CheckCircle, variant: "success" as const },
  transito: { label: "Em trânsito", icon: Truck, variant: "info" as const },
  processando: { label: "Processando", icon: Clock, variant: "warning" as const },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "danger" as const },
  separacao: { label: "Em separação", icon: Package, variant: "neutral" as const },
  faturado: { label: "Faturado", icon: FileText, variant: "info" as const },
};



// --- NEW MOCK DATA ---
export const comprasData = [
  { id: "OC-1029", fornecedor: "Tech Supply Inc.", total: 15400.50, prazo: "15/08/2026", status: "Aprovado" },
  { id: "OC-1030", fornecedor: "Global Parts BR", total: 8200.00, prazo: "20/08/2026", status: "Em Cotação" },
  { id: "OC-1031", fornecedor: "Indústria de Plásticos", total: 4500.00, prazo: "10/08/2026", status: "Entregue" },
];

export const expedicaoData = [
  { id: "EXP-881", pedido: "PED-2001", cliente: "João Silva", transportadora: "Correios", status: "Em Trânsito" },
  { id: "EXP-882", pedido: "PED-2005", cliente: "Maria Souza", transportadora: "Jadlog", status: "Aguardando Coleta" },
  { id: "EXP-883", pedido: "PED-2010", cliente: "Empresa ABC", transportadora: "Azul Cargo", status: "Entregue" },
];

export const pcpData = [
  { id: "OP-401", produto: "Mesa de Escritório", qtd: 50, maquina: "Corte 01", status: "Em Produção" },
  { id: "OP-402", produto: "Cadeira Gamer", qtd: 100, maquina: "Montagem 02", status: "Aguardando Insumos" },
  { id: "OP-403", produto: "Estante de Aço", qtd: 20, maquina: "Pintura", status: "Finalizado" },
];

export const manutencaoData = [
  { id: "OS-901", maquina: "Torno CNC 01", tipo: "Preventiva", tecnico: "Carlos Mendes", status: "Agendado" },
  { id: "OS-902", maquina: "Corte a Laser 02", tipo: "Corretiva", tecnico: "Roberto Dias", status: "Em Andamento" },
  { id: "OS-903", maquina: "Injetora Plástica", tipo: "Preventiva", tecnico: "Carlos Mendes", status: "Concluído" },
];

export const auditoriaData = [
  { id: "LOG-9921", usuario: "admin@venner.com", acao: "Login no sistema", data: "13/07/2026 08:00" },
  { id: "LOG-9922", usuario: "vendas@venner.com", acao: "Criação de Pedido PED-2015", data: "13/07/2026 08:45" },
  { id: "LOG-9923", usuario: "admin@venner.com", acao: "Exclusão de Usuário (joao.silva)", data: "13/07/2026 09:12" },
];

export const usuariosData = [
  { id: "USR-01", nome: "Admin User", email: "admin@venner.com", role: "Administrador", status: "Ativo" },
  { id: "USR-02", nome: "Vendedor 1", email: "vendas@venner.com", role: "Vendas", status: "Ativo" },
  { id: "USR-03", nome: "Operador de Máquina", email: "fabrica@venner.com", role: "Produção", status: "Inativo" },
];


