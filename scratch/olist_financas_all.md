# Olist Finance Articles

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/banco-inter

Banco Inter
MO
Por Monique  O.
Atualizado em 25/11/2025
Com a integração do Banco Inter para Pessoa Jurídica, é possível emitir, imprimir e conciliar automaticamente os boletos cadastrados pelo ERP.
Pré-requisitos
Para geração de boletos é necessário ter a extensão
Cobranças Bancárias
instalada em sua conta.
Como configurar a integração com o Banco Inter
Para a integração, é necessário um certificado digital criado diretamente no ambiente do Banco Inter. O certificado tem validade de 1 ano, sendo necessário registrar um novo próximo ao período de expiração.
Para configurar as informações da sua conta e dos boletos, siga os passos:
No ERP, acesse
configurações > finanças > Cadastro de contas bancárias
e selecione
Banco Inter
na lista de bancos.
Preencha o
Número de Conta
e as
Instruções
que serão impressas nos boletos (exemplo: Cobrar juros e multa após o vencimento).
Na seção
Dados adicionais
, preencha as informações desejadas, como juros e multa.
Ao final, clique em
conectar com o banco
.
Conectando com o banco
Para gerar os dados de conexão, o primeiro passo é criar uma aplicação no portal do Banco Inter.
No Banco Inter
Acesse sua área de cliente no banco e siga o caminho:
Conta digital > Aplicações > Nova aplicação
.
Informe um nome para a aplicação e clique em
Próximo
.
Nas opções referentes à
API de boletos de cobrança
, marque ambas opções exibidas e clique em
Criar aplicação
.
Após a criação, baixe e compartilhe sua
chave de aplicação
e seu
certificado
com o desenvolvedor responsável. Mais informações em como cadastrar uma API no banco Inter
aqui
.
Observação:
as informações
Client ID
e
Client Secret
podem ser encontradas no painel do banco, no ícone de expansão
(^)
.
No ERP
Ao clicar em
conectar com o banco
, uma janela será exibido para finalizar a integração.
Preencha os campos
Client ID
e
Client Secret
.
Anexe o arquivo
.zip
baixado do Banco Inter.
Informe os dados e clique em
conectar com o banco
.
Sua configuração está completa.
Emissão e impressão de boletos
A geração de boletos do Banco Inter pode ser feita no ERP a partir de:
Contas a receber
, no caminho
finanças > Contas a receber > incluir conta a receber
.
Pedidos de venda.
Notas fiscais.
Como funciona a impressão
Ao imprimir, o ERP busca um arquivo PDF diretamente no Banco Inter.
Cada boleto gera um arquivo PDF separado.
Para pedidos com múltiplas parcelas, o botão
Imprimir
cria uma fila, exibindo um boleto de cada vez.
Conciliação automática de boletos
O ERP busca e concilia os boletos diariamente, às 6h da manhã, realizando a baixa automática das contas conforme a situação no Banco Inter.
Para que a conciliação funcione, você precisa ativá-la:
Acesse
configurações > finanças > Cadastro de contas bancárias
e selecione o
Banco Inter
.
Habilite o parâmetro
receber atualizações dos boletos automaticamente
.
Dica:
abaixo deste parâmetro, você pode informar um endereço de e-mail para receber um resumo diário das sincronizações realizadas.
banco online
fintech
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/categorias-de-receitas-e-despesas

Categorias de Receitas e Despesas
MO
Por Monique  O.
Atualizado em 10/12/2025
As categorias de receitas e despesas servem para organizar os lançamentos financeiros da sua empresa. Elas são essenciais para gerar relatórios no ERP, como o DRE, facilitando a análise do seu negócio e a tomada de decisões.
Como criar as categorias de receitas e despesas
Você verá as categorias padrão do sistema e terá as opções para criar novos grupos, novas categorias, organizar, importar e exportar. Confira abaixo:
Acesse o
menu > configurações > finanças
.
Clique em
Categorias de receitas e despesas > incluir categoria
.
Descrição:
escreva o nome da categoria.
Grupo:
se desejar, vincule a categoria a um grupo já criado.
Considera no DRE:
se você utiliza o relatório DRE, defina como esta categoria será classificada. Esta configuração afeta apenas a apresentação dos valores no relatório.
Como deduções ou despesas operacionais:
apenas lançamentos de saída (contas a pagar) são considerados.
Como outras receitas ou despesas:
lançamentos de entrada são agrupados como
Outras receitas
e os de saída como
Outras despesas
.
Como tributos:
apenas lançamentos de saída são considerados e agrupados como
Tributos
.
Como taxas e tarifas:
apenas lançamentos de saída são considerados. Todos os valores são somados e apresentados na categoria
Taxas e tarifas
do DRE.
Competência padrão:
escolha o mês de referência que a categoria terá no DRE (mês do vencimento, da emissão, etc.).
3. Clique em
salvar
.
Observação:
você encontra mais informações sobre os campos do DRE no artigo
Demonstração do Resultado do Exercício (DRE)
.
Como criar grupos de categorias
Os grupos servem para organizar melhor suas contas (ex: Despesas Fixas, Despesas Operacionais).
Para criar um grupo
Clique em
grupos
e depois em
incluir grupo de categorias
.
Preencha a
Descrição
do grupo.
Clique em
salvar
.
Para alterar ou excluir um grupo
Alterar:
clique sobre o nome do grupo, edite a descrição e salve.
Excluir:
marque o grupo desejado e clique em
excluir grupos
.
Importante:
ao excluir um grupo que possui categorias vinculadas, as categorias não serão apagadas, mas passarão a ser da classificação
Sem grupo
.
Como gerenciar suas categorias
Veja como realizar ajustes nas categorias já criadas.
Alterar a descrição
Clique sobre a categoria que deseja editar.
Altere o nome no campo
Descrição
.
Clique em
salvar
.
Alterar o grupo da categoria
Clique sobre a categoria que será movida.
No campo
Grupo
, selecione a nova opção desejada.
Clique em
salvar
.
Excluir uma categoria
Marque a caixa de seleção ao lado da categoria que você quer apagar.
Clique no botão
excluir categorias
.
Agrupar categorias
Esta função permite que você mova diversas categorias para um mesmo grupo de uma só vez.
Marque a caixa de seleção ao lado das categorias que deseja agrupar.
Clique no botão
agrupar categorias
.
Na janela que se abre, selecione o grupo de destino.
Clique em
agrupar
para confirmar.
Categorias padrão
Você pode definir uma categoria como padrão para operações específicas (venda, compra, PDV, etc.). Com isso, sempre que uma nova operação for realizada, a categoria será atribuída automaticamente.
Para definir como padrão:
clique no menu de contexto
(...)
ao lado da categoria e marque a opção desejada (ex:
padrão venda
).
Para remover o padrão:
clique no menu de contexto
(...)
ao lado da categoria e escolha a opção
remover padrão
.
Importar categorias de receitas e despesas
Esta função permite que você cadastre ou atualize suas categorias em massa, utilizando uma planilha. O processo é dividido em três etapas: baixar o modelo, preencher os dados e importar o arquivo.
Baixar a planilha modelo
Acesse o menu
início > Ferramentas
.
Na aba
importações
, dentro da seção
Finanças
, clique em
Categorias de receitas e despesa
.
Clique em
download da planilha de exemplo
para baixar o arquivo com o layout padrão do sistema.
Preencher a planilha
Ao preencher a planilha, siga as orientações abaixo:
Descrição
e
Grupo:
preencha estes campos para criar novas categorias. Para atualizar uma categoria que já existe, a combinação de descrição e grupo na planilha deve ser idêntica à cadastrada no ERP.
Considera no DRE
e
Competência padrão
: os valores preenchidos aqui devem ser exatamente iguais às opções disponíveis no ERP para que a importação funcione corretamente.
Importar o arquivo
Antes de importar, verifique os requisitos do arquivo:
Formato:
excel (.xls, .xlsx) ou Texto (.csv).
Tamanho:
máximo de 2MB.
Layout:
deve seguir o modelo da planilha de exemplo.
Com a planilha pronta, siga os passos para a importação:
Na mesma tela onde baixou o exemplo, clique em
carregar planilha de categorias
e selecione o arquivo em seu computador.
O sistema fará uma pré-visualização dos dados. Verifique se as informações estão corretas.
Se tudo estiver certo, clique em
os dados estão corretos
e confirme a importação.
As categorias importadas estarão disponíveis na tela de configurações de finanças.
Importante:
itens com advertências ou erros podem não ser importados. Revise-os antes de continuar.
Atalho para importação
Se você já tem a planilha preenchida, pode importá-la por outro caminho:
Acesse
menu > configurações > finanças > Categorias de receitas e despesa
.
Clique em
mais ações > importar categorias de uma planilha
.
Exportar categorias para planilha
Você pode exportar as categorias de receitas e despesas cadastradas no ERP para um arquivo nos formatos Excel (.xls) ou Texto (.csv).
Siga os passos abaixo:
Acesse
menu > configurações
, vá para a aba
finanças
e clique em
Categorias de receitas e despesa
.
Clique no menu
mais ações
e escolha a opção
exportar categorias para planilha
.
Na janela que abrir, selecione o formato do arquivo desejado e clique em
exportar
.
Categorias por marketplace, e-commerce ou canal de venda
Você pode definir uma categoria financeira padrão para cada plataforma de venda integrada ao ERP. Assim, os pedidos importados já serão classificados automaticamente.
Para isso, você precisa ter as categorias previamente cadastradas.
Para marketplaces e e-commerces
Acesse
início > Integrações
.
Localize a integração desejada e clique em
gerenciar
.
Vá para a aba
mapeamentos > formas de recebimento
.
No campo
categoria financeira padrão dos pedidos
, selecione a categoria desejada e salve a alteração.
Para canais de venda
Dentro da tela de gerenciamento da integração (mesmo caminho do item anterior), acesse a aba
canais de Venda
.
Clique em
editar
no canal de venda correspondente.
Selecione a categoria financeira padrão para aquele canal e salve.
Ordem de prioridade
O ERP atribui a categoria a um pedido importado seguindo esta ordem de prioridade:
Categoria do Canal de Venda
(prioridade mais alta).
Categoria da Integração
(se não houver uma específica para o canal).
Categoria Padrão para Vendas
(prioridade mais baixa).
Como utilizar as categorias
As categorias são usadas para organizar seus lançamentos em relatórios como o DRE. Veja alguns exemplos de uso:
Contas a Pagar e a Receber
Ao registrar uma conta a pagar ou a receber, informe a categoria à qual o lançamento pertence. Isso garante que os valores sejam exibidos corretamente nos relatórios, de acordo com o mês de competência e a configuração da categoria.
Pedidos de Venda
Lançamento manual:
ao criar um pedido de venda, você pode escolher a categoria ao informar a forma de recebimento. Ao lançar as contas, a categoria definida será levada para a conta a receber.
Lançamento automático:
se uma categoria estiver definida como
Padrão para vendas
, ela será atribuída a todos os novos pedidos. Para pedidos de integrações, a categoria definida para o
Canal de Venda
ou
Integração
terá prioridade. Em todos os casos, a categoria pode ser alterada manualmente no pedido, se necessário.
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/como-integrar-sua-maquininha-de-cartao

Como integrar sua maquininha de cartão ao ERP
A.
Por A .
Atualizado em 13/04/2026
Este artigo orienta você no passo a passo para configurar sua maquininha de cartão e integrá-la ao ERP.
Com a integração, as cobranças feitas no seu PDV são enviadas diretamente para a maquininha.
Importante:
Para a integração, é necessário ter uma maquininha de cartão do tipo
smart
, que possui uma loja de aplicativos.
É necessário ter o módulo PDV instalado para acessar as configurações da maquininha. Sem este módulo, não irá aparecer a configuração.
O aplicativo Smart TEF precisa estar sempre aberto na maquininha para garantir a comunicação com o ERP durante as vendas.
Maquininhas homologadas pela Smart TEF
Observação:
para máquinas Stone, acesse o artigo:
Como utilizar a Stone POS no PDV
.
Maquininhas por plano
Plano
Maquininhas gratuitas
Avance
Não possui
Construa, Impulsione e Domine
1
Protagonize
2
Para informações sobre maquininhas no Plano PDV, acesse:
Como integrar sua maquininha de cartão ao Plano PDV.
Atenção:
em planos antigos, as maquininhas não estão disponíveis.
Para utilizá-las, você pode
fazer o upgrade do plano
ou
contratar a maquininha como extensão
.
A contratação de
maquininha adicional
tem custo de
R$ 50,00 por mês, por maquininha
, e é válida
exclusivamente para integrações POS Controle
.
Passo a passo para configurar
Instalação do aplicativo
Antes de iniciar a configuração, siga o passo a passo para instalar o aplicativo Smart TEF.
Na sua maquininha, abra a loja de aplicativos (App Market).
Procure pelo aplicativo
Smart TEF
.
Clique em
Instalar
.
Depois de instalado, volte para a tela do ERP e clique em
já instalei o aplicativo
.
Configuração da maquininha
Acesse
menu > configurações >
aba
finanças
.
Clique na opção
Configurações das maquininhas de cartão.
Selecione a marca e o modelo do seu equipamento.
Clique em
já instalei o aplicativo.
Abra o aplicativo
Smart TEF
na maquininha, insira o token exibido no ERP e clique em
ATIVAR.
Confirme o número do
Terminal
que aparece no Smart TEF abaixo do nome da empresa.
Preencha o
Nome
da maquininha
. Isso ajudará você a identificá-la no ERP.
Insira a senha exibida no ERP na sua maquininha e clique em
ENTRAR
.
No ERP, clique em
avançar
.
Teste a conexão
Clique em
testar conexão
para confirmar se a conexão foi bem-sucedida.
Uma cobrança de teste aparecerá na sua maquininha. Você pode cancelá-la no próprio equipamento.
Para finalizar, clique em
concluir configuração
na tela do ERP.
Pronto! Sua maquininha está configurada e pronta para ser usada com o sistema.
Configurar o gateway
Após concluir a instalação da maquininha, configure o gateway.
Cadastre as taxas de cada maquininha, cartão e condição de pagamento.
Gateways já cadastrados como "outros" não são vinculados automaticamente. É necessário cadastrá-los novamente, seguindo o passo a passo na tela.
Se possuir duas maquininhas iguais, elas serão vinculadas ao mesmo gateway.
Para maiores informações, acesse o artigo
Gateway Financeiro
.
erp
integrar
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/contas-bancarias

Contas Bancárias
A.
Por A .
Atualizado em 12/03/2026
Gerencie suas contas bancárias para centralizar recebimentos e pagamentos, emitir boletos, e gerenciar remessas e retornos bancários.
Pré-requisitos
Para gerar boletos, você deve ter a extensão de
Cobranças Bancárias
instalada na sua conta.
Passo a passo: como incluir uma conta bancária
Acesse
menu
>
configurações
> aba
finanças
>
Cadastro de Contas Bancárias
.
Clique em
Incluir conta bancária
.
Selecione o seu banco e, no campo
Descrição da conta
, insira um nome para identificá-la.
Preencha os
Dados
da sua conta.
Em
Configurações do Pix
, selecione o tipo da chave (E-mail, CPF, CNPJ, Telefone ou Chave aleatória) e, em seguida, preencha o campo
Chave Pix
.
Na seção
Configuração para cobrança como meio de recebimento
, selecione o meio de recebimento para a conta.
Selecione a opção
Cobrança registrada (remessas e retornos)
para enviar remessas e ler retornos dos principais bancos.
Em
Configuração dos boletos
, insira as informações para a emissão de boletos.
Importante:
Os dados de configuração devem ser fornecidos pelo seu banco.
Nas seções
Primeira
e
Segunda instrução
, é possível adicionar informações sobre a remessa bancária. Para instruções que aparecem apenas no boleto, utilize o campo
Instruções para impressão no boleto
.
Exibir NF/Pedido:
para exibir o número da Nota Fiscal (NF) ou do pedido diretamente no boleto, utilize a nova variável disponível no campo
Instruções para impressão no boleto
. O sistema puxará automaticamente o número, conforme a configuração e a disponibilidade da informação.
Na seção
Dados Adicionais
, preencha os campos com os dados de cobrança conforme as orientações do seu gerente bancário.
Custo adicional de cobrança por título
Além dos dados solicitados pelo banco, a seção
Dados Adicionais
contém o campo
Custo adicional de cobrança por título
.
Como funciona:
o valor informado nesse campo será somado automaticamente ao valor total do boleto.
Por exemplo: se o boleto for de
R$ 2.000,00
e o campo
Custo adicional de cobrança por título
estiver preenchido com
R$ 10,00
, o valor total exibido no boleto será de
R$ 2.010,00
.
Esse valor adicional pode ser utilizado para cobrir taxas bancárias ou outros custos administrativos relacionados à emissão de boletos. Caso tenha dúvidas sobre o uso deste campo, consulte o seu gerente bancário.
Salvar
Validar
Atenção:
caso você configure sua conta bancária para gerar boletos, uma janela se abrirá ao salvar a configuração. Nela, você pode marcar a opção
Gerar boletos para homologação
para o sistema criar alguns boletos de forma automática para o processo de homologação.
Para isso, você deverá selecionar:
O cliente que será usado nos boletos.
O valor dos boletos.
A quantidade de boletos que seu banco exige para a homologação.
Bancos compatíveis com a emissão de boletos
O ERP da Olist permite a emissão de boletos com ou sem registro para os seguintes bancos:
Banco do Brasil
Banco do Nordeste
Banco Inter
Banco Safra
Banrisul
Bradesco
Caixa Econômica Federal
(SICOB e SIGCB)
HSBC
Itaú
Santander
Sicredi
Sicoob
Unicred
(Integração RS)
Observação:
Os dados para a configuração precisam ser obtidos diretamente com o banco.
A integração com o Unicred está disponível apenas para clientes com contas registradas na unidade Unicred Integração RS.
Gerar boleto de homologação
Siga estes passos:
Acesse
menu > configurações > aba finanças > Cadastro de contas bancárias
Clique em
Incluir
ou
Editar
uma conta bancária.
Localize a seção
Configuração para cobrança como meio de recebimento
Na opção
Emissão de boletos com registro (Cobrança registrada),
o sistema exibirá a sugestão para
gerar boletos em homologação
.
Ao
salvar as configurações da conta
, será exibido um aviso na tela.
Marque a opção
Gerar boletos para homologação
para que o sistema
crie os boletos de teste e a remessa
.
O sistema solicitará o nome do cliente, o valor e a quantidade de boletos necessários para o processo de homologação.
Clique em
baixar boletos e remessa
e envie o arquivo compactado para a validação do seu gerente de conta.
Dica:
os boletos gerados em homologação são utilizados apenas para
testes de integração com o banco
, antes da liberação para emissão em produção.
Gerar arquivo de remessa e importar o retorno
Para incluir os boletos na remessa bancária de homologação, siga estes passos:
Acesse
menu > finanças > Contas a Receber > incluir conta a receber
.
Acesse
finanças > cobranças bancárias > aba Remessas > incluir remessa
.
Escolha o banco
desejado. As contas a receber com o portador igual ao banco selecionado serão exibidas. Você pode incluir títulos sem portador marcando a opção
Incluir títulos sem portador
.
Selecione os títulos
que deseja incluir e clique em
salvar
.
Para gerar o arquivo da remessa, clique no menu
ações
ao lado da opção
editar
e selecione
Gerar remessa
.
Acesse o site do seu banco e
insira este arquivo de remessa
para registrar as contas.
Por fim, o banco fornecerá um arquivo de retorno.
Para lê-lo, acesse
finanças > cobranças bancárias > aba retornos bancários > Ler retorno
.
banco
finanças
contas bancárias
cnab
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/contas-financeiras

Contas Financeiras
MO
Por Monique  O.
Atualizado em 25/11/2025
As contas financeiras ajudam a organizar as movimentações da sua empresa, incluindo suas contas bancárias.
Por padrão, a conta "Caixa" já vem cadastrada no sistema.
Passo a passo: como incluir uma conta financeira
Para incluir uma nova conta, siga estes passos:
Vá em:
menu
>
configurações
> aba
finanças
>
Cadastro de contas financeiras
.
A conta
"Caixa"
já está cadastrada. Para adicionar novas contas, clique no botão: ''
Incluir conta
.''
No campo: ‘’
Nome da conta''
, digite a descrição da sua conta.
Se não quiser que as movimentações desta conta sejam consideradas no seu fluxo de caixa e no saldo inicial, marque a opção:
Não considerar esta conta no saldo para fluxo de caixa e no saldo inicial do caixa
.
Clique em
Salvar
para finalizar.
Importante:
Ao marcar a opção para não considerar a conta no fluxo de caixa, ela não aparecerá no saldo total quando você selecionar
Todas as contas
no módulo
Caixa
.
Dica:
Pelo ‘’
Menu de contexto (…)''
, você pode definir um número para as contas e escolher uma delas como preferencial para as movimentações.
Como excluir conta financeira
Para excluir uma conta, ela precisa ter sido incluída diretamente no cadastro de contas financeiras.
Siga este passo a passo:
Vá em
menu
>
finanças
>
configurações
> aba
finanças
>
Cadastro de contas financeiras
.
Marque a(s) conta(s) que você deseja excluir.
Clique em
Excluir contas
.
Como inativar conta financeira
Para inativar uma conta,
o saldo
dela precisa estar
zerado
e ela não pode estar vinculada a nenhuma conta bancária.
Vá em
menu
>
configurações
> aba
finanças
>
Cadastro de contas financeiras
.
No
menu de contexto (…)
ao lado da descrição da conta, clique em
Inativar conta
.
finanças
conta
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/financas-configuracoes-gerais

Finanças - Configurações gerais
MO
Por Monique  O.
Atualizado em 25/11/2025
Gerencie as configurações financeiras da sua empresa para definir como os lançamentos de contas serão registrados em diferentes módulos, como Finanças, Suprimentos, Vendas e Serviços.
Você também pode personalizar as configurações específicas do módulo de finanças neste local.
Acessar as configurações
Acesse o
menu
.
Clique em
configurações
.
Selecione a aba
finanças
.
Clique em
Configurações gerais
.
Explicação dos campos
Lançamento de contas a receber
Manual
: você lança as contas clicando em
Lançar contas
ao lado de cada pedido ou nota fiscal.
Automático
: o sistema lança as contas no momento da
autorização
,
salvamento da nota fiscal
ou
salvamento do pedido
.
Lançamento de contas a pagar
Manual
: lançamento feito manualmente.
Automático
: lançamento ocorre ao
autorizar
,
salvar a nota fiscal
ou
salvar a ordem de compra
.
Lançamento de contas nos serviços
Manual
: clique em
Lançar contas
ao lado da ordem de serviço ou nota fiscal de serviço.
Automático
: lançamento ao
autorizar
,
salvar a nota fiscal de serviço
,
salvar a ordem de serviço
ou
finalizar a ordem de serviço
.
Estorno de contas
Automático ao cancelar pedido
ou
Automático ao cancelar nota fiscal
.
Sempre que excluir uma nota fiscal, o estorno também será feito.
Forma de recebimento padrão
Define a forma de recebimento usada por padrão nos módulos de
Finanças
,
Suprimentos
,
Vendas
e
Serviços
.
Padrão data de recebimento
Escolha entre
Data de pagamento
ou
Data de crédito
para baixa de títulos via arquivos de retorno.
Baixa de títulos
Opções:
Agrupada
ou
Individual
.
Exibir histórico e logo na impressão dos boletos
Mostra o histórico da conta e o logo da empresa nos boletos.
Enviar linha digitável no histórico
Inclui a linha digitável no campo histórico.
Atualizar datas de vencimento das parcelas ao gerar notas fiscais
Desativado
: mantém a data de vencimento do pedido ou ordem de serviço.
Ativado
: recalcula as datas com base na emissão da nota fiscal.
Categoria padrão de lançamento nas liquidações do retorno
Define uma categoria padrão para leitura de retornos bancários.
Se não quiser padronizar, selecione
Sem categoria padrão
.
Lançar tarifas no caixa
Habilite para lançar tarifas de retorno bancário no
Caixa
e selecione a categoria dessas tarifas.
Marcar como cancelados os títulos baixados no banco
Ative para que títulos baixados no banco sejam marcados como
Cancelados
automaticamente ao ler o retorno bancário.
economia
ajustes
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/formas-de-recebimento

Formas de Recebimento
MO
Por Monique  O.
Atualizado em 09/12/2025
A
forma de recebimento
é a configuração do ERP onde você define quais métodos de pagamento sua empresa aceita, como cartão de crédito ou débito, PIX, dinheiro e outros.
Essa definição ajuda a organizar seu financeiro e permite gerar um lançamento automaticamente no módulo
Contas a Receber
a partir de um pedido ou nota fiscal emitida no ERP.
Como configurar no ERP
Nesta seção, você encontra as formas de recebimento e suas configurações no
ERP
.
Assista ao vídeo ou veja o passo a passo na sequência.
Como incluir uma forma de recebimento
Acesse
menu > configurações > aba finanças > Formas de Recebimento.
Veja as formas já
cadastradas
por padrão.
Clique em
Incluir forma de recebimento
.
Defina a
Descrição
.
No campo
Situação
, selecione
Habilitada
.
No campo
Validar limite de crédito
, selecione
Validar
.
No campo
Forma de Recebimento na NF-e
, selecione a forma exibida no XML.
Defina se o valor irá para
Contas a receber
ou
Conta financeira
.
Clique em
Salvar
.
Dica:
no campo Configurações adicionais, é possível configurar a Tarifação e Antecipação dos recebíveis.
Como Desabilitar ou Habilitar uma forma de recebimento
Se desejar desabilitar as formas de recebimento que não utiliza:
Clique sobre a forma e no campo
Situação
, selecione
Desabilitada
.
Clique em
Salvar
.
Após salvar, observe os marcadores:
Cinza
: desabilitada — não será exibida nas vendas ou contas a receber.
Verde
: habilitada — disponível como opção de recebimento.
Você também pode definir formas preferenciais em
Preferências
, selecionando os meios de recebimento e clicando em
Salvar
.
Formas de recebimento
Você pode configurar as formas de recebimento conforme sua necessidade. Para isso, clique na forma que deseja editar.
As formas disponíveis são:
Dinheiro
Cartão de crédito
Cartão de débito
Boleto
Cheque
Depósito
Crediário
PIX
Para mais informações sobre
gateways de pagamento
, consulte:
Gateways
.
Como incluir contas bancárias
Acesse
menu > Configurações > Aba Finanças > Cadastro de Contas Bancárias
.
Clique em
Incluir conta bancária
.
Selecione o banco e informe a
Descrição da conta
.
Preencha os
Dados
e selecione o
Meio de recebimento
para esta conta.
Configure os boletos com os dados obtidos junto ao banco.
Para cobrança registrada, configure as instruções de remessa e retorno conforme o banco.
Em
Dados Adicionais
, informe dados de cobrança conforme instruções do gerente bancário.
Clique em
Salvar
e realize a validação com o banco.
Como incluir contas financeiras
Acesse
menu > configurações > aba finanças > Cadastro de Contas Financeiras
.
Por padrão, a conta
Caixa
já vem cadastrada.
Para criar outra, clique em
Incluir conta
e defina o nome.
Clique em
Salvar
.
É possível atribuir um número para as contas e definir uma delas como preferencial para movimentações.
Importante:
ao marcar
''Não considerar esta conta no saldo para fluxo de caixa e no saldo inicial do caixa''
, ela será excluída desses cálculos.
Compatibilidade de tipos de pagamento e recebimento de NF-e
Conforme a Norma Técnica 2020 006 V1.0 – SINIEF 21/2020 e 22/2020 da SEFAZ
, é obrigatório mapear os tipos de pagamento e recebimento nas notas fiscais.
Notas fiscais de saída
:
Formas de recebimento nativas são mapeadas automaticamente.
Para personalizadas: acesse o menu de formas de recebimento, edite a forma e no campo
Forma de recebimento na NF-e
, selecione a opção correta.
Notas fiscais de entrada
:
Um novo campo foi adicionado nas parcelas para definir o meio de pagamento.
Ao alterar na primeira parcela, o sistema pergunta se deseja aplicar a todas.
Quando o meio for
Outros
, o campo
xPag
será criado no XML da NF-e com a descrição da conta financeira.
métodos
pagamentos
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/gateway-de-pagamento-tipo-outros

Gateway de Pagamento Tipo "Outros"
MO
Por Monique  O.
Atualizado em 15/12/2025
O Gateway é uma interface utilizada por empresas de e-commerce para transmitir dados entre clientes, comerciantes e bancos.
O recurso está disponível para os planos Crescer, Evoluir e Potencializar.
Passo a passo
Adicionar extensão gateway de pagamento
Acesse
Menu > Início > Extensões do ERP
.
Na seção
Financeiro
, adicione a extensão
Gateway de Pagamento
.
Clique em
Instalar
e confirme a instalação.
Configurar um gateway
Acesse
Menu > Configurações > Aba Finanças > Cadastro de Gateways
.
Visualize os gateways já cadastrados em sua conta.
Clique em
Incluir gateway
.
No campo
Gateway
, selecione
Outro
. Informe a
Descrição do gateway
e defina a
Situação
como
Habilitado
. Assim, ele será exibido como opção de recebimento. Uma
Conta financeira
será criada automaticamente.
Observação:
gateways com marcador verde estão habilitados para uso e aparecerão como opções de recebimento em vendas ou contas.
Informações obrigatórias para clientes de Santa Catarina (PAF/NFCe)
Atenção:
essas informações são necessárias apenas para clientes que atuam no estado de Santa Catarina e que precisam cumprir os requisitos do PAF/NFCe da SEF-SC.
Para que o PAF-NFCe gere corretamente os arquivos exigidos pela Secretaria da Fazenda do Estado de Santa Catarina, ao cadastrar um meio de pagamento via gateway do tipo
“Outro”
, é necessário preencher os seguintes campos adicionais:
Nome Fantasia do meio de pagamento ou Intermediador de transação
— Nome público do prestador ou intermediador responsável pela transação.
CNPJ do Meio de Pagamento ou Intermediador de transação
— CNPJ válido do intermediador responsável pela intermediação das transações.
Identificador na plataforma de intermediação
— Código ou nome de usuário do estabelecimento na plataforma de pagamento/intermediação utilizada.
Configuração das tarifas
Na seção
Configurações das tarifas
, defina a tarifação do gateway:
Em dia específico
No dia da transação
Dia seguinte após a transação
No dia do pagamento (somada à taxa)
Observação:
na opção
No dia do pagamento
, a tarifa será rateada e somada às taxas das parcelas, sendo automaticamente descontada no momento da baixa.
Antecipação dos recebíveis
Caso o gateway possua antecipação, selecione
"Antecipado"
e defina o modelo de cálculo das taxas:
Juros Simples:
aplicado sobre o valor total da venda proporcional ao número de parcelas.
Exemplo:
Venda de R$500,00 em 4x com taxa de 2,99% ao mês.
Total da taxa: R$59,80
Valor líquido a receber: R$440,20
Valor Presente (juros compostos):
cada parcela futura é trazida ao valor presente considerando juros e prazo.
Exemplo:
Venda de R$500,00 em 4x de R$125,00:
Parcela 1 (1 mês): R$121,45
Parcela 2 (2 meses): R$117,91
Parcela 3 (3 meses): R$114,51
Parcela 4 (4 meses): R$111,23
Total líquido estimado:
R$464,10
Taxa total:
R$35,90
Qual modelo usar?
Juros Simples:
ideal para taxa fixa sobre o total da venda.
Valor Presente:
indicado para juros calculados por parcela.
Importante:
confirme com o gateway o modelo de cálculo utilizado, pois impacta o valor líquido recebido.
Configurações do Gateway
Selecione as bandeiras atendidas e a bandeira padrão do gateway.
Escolha o tipo de
Data das parcelas
e defina as
Tarifas
.
alternativo
método
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/gateway-financeiro-o-que-e-para-que-serve-e-como-instalar

Gateway Financeiro: o que é, para que serve e como instalar
A.
Por A .
Atualizado em 12/12/2025
Um gateway financeiro é o
intermediador tecnológico
que conecta seu negócio (loja física ou virtual) às instituições que processam os pagamentos (como bancos, adquirentes e intermediadores).
Sua função é garantir que o dinheiro da sua venda chegue até você, cuidando de todo o processo:
Processamento da transação:
recebe os dados de pagamento do cliente (cartão, Pix, boleto) e solicita a aprovação da transação à instituição bancária.
Aplicação de taxas e repasse:
aplica automaticamente as taxas, tarifas e gerencia o prazo para recebimento.
Segurança (Compliance):
garante a proteção dos dados sensíveis do cliente, atuando conforme as normas de segurança.
Confira abaixo os principais sistemas de pagamento (Adquirentes e Intermediadores) utilizados no mercado:
Categoria
Exemplos
Intermediadores / Gateways
Mercado Pago, Pagar.me, PagBank/PagSeguro, PayPal, Iugu
Adquirentes
Cielo, Rede, Getnet
Objetivo do gateway no ERP
O principal objetivo desta configuração no ERP é garantir o
controle financeiro automático
das suas vendas no módulo de Contas a Receber.
Ao configurar o gateway no ERP, o sistema registra automaticamente as taxas, tarifas e prazos de repasse definidos pelo seu intermediador (crédito, débito, pix, etc.).
Observação:
essa configuração
não interfere
no processamento real das transações de pagamento. Ela serve
exclusivamente
para registro e controle financeiro no ERP.
Quando configurar o gateway financeiro no ERP
A configuração é indicada para qualquer empresa que receba pagamentos via cartão de crédito/débito ou Pix processados por um intermediador, ou adquirente (ex: Mercado Pago, PagSeguro, Cielo, etc.).
Cenários mais comuns:
Vendas Online:
transações realizadas pelo seu site próprio (e-commerce).
Vendas Físicas:
pagamentos processados diretamente no Módulo PDV (Ponto de Venda) do sistema.
Embora seja
opcional
, a configuração é recomendada para empresas que buscam aumentar e otimizar o
controle financeiro
.
Orientações iniciais para cadastrar o gateway no ERP
Antes de iniciar o cadastro do gateway no ERP, siga as orientações abaixo para garantir que o registro e as configurações sejam feitos corretamente no sistema.
Confirmação das condições comerciais:
confirme os percentuais de taxas, tarifas e prazos de repasse diretamente com sua Adquirente/Intermediador.
Cadastro do gateway:
adicione no ERP o adquirente e/ou intermediador que você utiliza.
Definição das regras:
inclua as
bandeiras atendidas
e as
regras por parcelamento
(tarifa, taxas e prazos) aplicáveis ao seu gateway.
Tipos de gateways no ERP
No ERP, os gateways financeiros são classificados em duas categorias principais. Esta classificação é definida
exclusivamente
pela existência ou ausência de Integração via API com o nosso sistema.
Pagar.me / Pagar.me 2.0
A Pagar.me (do grupo Stone) é o gateway financeiro onde possuímos integração via API e, portanto, é possível gerar boletos diretamente no ERP e sincronizar recebíveis em algumas plataformas de e-commerce.
Antes de configurar, confirme a
verão da API
que você utiliza com o suporte do Pagar.me. Em seguida, siga as orientações específicas de cadastro no ERP.
Como configurar o gateway financeiro da Pagar.me 2.0
Como configurar o gateway financeiro da Pagar.me
Outros
Esta categoria é destinada aos adquirentes e intermediadores que
não possuem
integração via API com o ERP (Exemplos: Cielo, Mercado Pago, Getnet, etc.).
No campo
"Descrição do gateway"
, basta informar o nome do adquirente ou intermediador que você utiliza (ex:
Cielo
,
Mercado Pago
).
Para maiores informações, acesse o artigo:
Como configurar gateways financeiros do tipo "Outros"
portal financeiro
instalação
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/gateway-pagarme

Gateway Pagar.me
MO
Por Monique  O.
Atualizado em 25/11/2025
Centralize o gerenciamento de contas, transferências, taxas e tarifas diretamente no ERP — mais praticidade para o seu dia a dia.
Como configurar
No ERP, acesse
Menu > Configurações > Finanças > Cadastro de Gateways
.
Confira a lista de gateways já cadastrados.
Gateways com marcador verde estão
habilitados
e podem ser usados como forma de recebimento.
Clique em
Incluir gateway
.
No campo
Gateway
, selecione
Pagar.me
.
Em
Situação
, escolha
Habilitado
para ativar o uso nas vendas e contas.
Em
Categoria padrão para contas a receber
, defina a categoria para conciliação.
Em
Conta financeira para crédito
, escolha a conta que receberá os valores.
Descrição do gateway
Descreva como o gateway será identificado.
Conta financeira para o registro de lançamentos
O ERP gera automaticamente uma conta financeira para registrar créditos e débitos.
Categoria padrão para as contas a receber
Escolha a categoria que será usada automaticamente na conciliação.
Conta financeira para crédito
Selecione a conta onde os recebimentos serão depositados.
Data para baixa da conta a receber
Defina quando o ERP dará baixa nos títulos.
Data de liberação no gateway
: baixa ocorre quando o gateway libera o pagamento para crédito na sua conta.
Data de pagamento da conta a receber (beta)
: baixa ocorre na data em que o cliente pagou efetivamente o título.
Configurações das tarifas
Selecione a categoria que receberá os lançamentos de tarifas.
Configurações do gateway
Informe a
Chave da API
e a
Versão da API
do Pagar.me.
Como obter a chave e a versão da API
Acesse sua conta no Pagar.me.
Abra o
Dashboard
.
Vá em
Configurações > Chaves
.
Verifique a versão da API.
Copie a chave pública e cole no campo correspondente no ERP.
Salve as configurações do gateway.
Você também pode acessar a
central de ajuda da Pagar.me
.
Gerar boletos com o Pagar.me
Ao criar a conta a receber:
Em
Forma de recebimento
, selecione
Boleto
.
Em
Meio de pagamento
, escolha
Gateway
.
No campo
Gateway
, selecione
Pagar.me
.
Para emitir o boleto:
Acesse
Finanças > Contas a receber
.
Use o filtro para localizar as contas do
Pagar.me
.
Clique no
menu de contexto
(…) ao lado da conta desejada.
Selecione
Imprimir boleto
e confirme a ação.
Dica:
O ERP envia automaticamente a remessa para sua conta no Pagar.me ao imprimir.
Conciliar contas com o gateway
Para conciliar todas as contas:
Acesse
Menu > Finanças > Contas a receber > Mais ações > Conciliar contas com o gateway
.
No campo
Gateway
, selecione o desejado.
Clique em
Conciliar
.
Para conciliar as contas individualmente:
Acesse
Menu > Finanças > Contas a receber
.
Marque as contas que deseja conciliar.
Vá em
Mais ações > Conciliar contas com o gateway
.
Importante:
Para vendas com
Pagar.me
, não é necessário lançar contas manualmente em
Contas a receber
.
Se lançar contas manualmente e depois conciliá-las, haverá duplicidade de informações.
Em pedidos pagos via
Pagar.me
, não é possível registrar contas manualmente.
O ERP ainda não integra o
PIX
do Pagar.me.
portal
pagar.me
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/gateway-pagarme-20

Gateway Pagar.me 2.0
MO
Por Monique  O.
Atualizado em 25/11/2025
Com a integração entre o
ERP
e o
Pagar.me 2.0
, você pode gerenciar contas, transferências, taxas e tarifas diretamente pelo sistema.
Configurar o gateway Pagar.me 2.0 (beta) no ERP
Com a extensão instalada, acesse:
Menu > Configurações > Aba Finanças > Cadastro de Gateways
.
Clique em
Incluir gateway
.
No campo
Gateway
, selecione
Pagar.me 2.0 (beta)
.
Preencha os campos de descrição e situação.
O campo
Conta financeira para lançamentos
será criado automaticamente.
Escolha a
Categoria padrão para contas a receber
.
No campo
Conta financeira para crédito
, selecione a conta que receberá os valores.
Configure as tarifas em
Categorias para as tarifas
.
Preencha os dados adicionais: taxa de juros, multa (%) e número de dias para multa.
Informe a
Chave da API
.
Como obter a chave privada da API do Pagar.me
Acesse o painel do Pagar.me.
No menu lateral, clique em
Configurações > Chaves
.
Clique em
Criar chave
e dê um nome.
Copie a chave gerada e salve em local seguro.
Importante: a chave não poderá ser visualizada novamente após fechar a janela.
Passo a passo de configuração
Configurar chave da API e testar a conexão.
Selecionar bandeiras atendidas.
Definir antecipação dos recebíveis.
Ativar ajuste para próximo dia útil.
Configurar conciliação automática via webhook.
Definir configurações comerciais: prazo, taxa e tarifa.
Salvar configurações e finalizar.
Dica: As condições exibidas variam conforme a bandeira do cartão. Use o botão 'Adicionar condição comercial' para criar novas regras.
Inativar ou excluir gateway
Para inativar, acesse o gateway e clique em
Inativar
.
Para excluir, acesse o gateway e clique em
Excluir
.
Confirme a ação.
Gerar boletos com Pagar.me
Selecione a venda no ERP.
Clique em
Gerar boleto
.
Confira os dados do boleto e clique em
Confirmar
.
Conciliar contas automaticamente
Ative a conciliação automática no cadastro do gateway.
Verifique se o webhook está configurado corretamente.
Confira os lançamentos automáticos gerados no ERP.
Configurar o webhook para conciliação automática
Salve o cadastro do gateway no ERP.
Clique em
Gerar link para conciliação automática de contas
.
Copie o link exibido no modal.
Acesse o painel do Pagar.me e vá em
Configurações > Webhooks
.
Clique em
+ Criar webhook
e cole o link copiado no campo URL.
No campo
Máximo de tentativas
, coloque 3.
Selecione os eventos conforme abaixo:
Cobrança:
charge.chargedback, charge.created, charge.overpaid, charge.paid, charge.refunded, charge.underpaid
Pedido:
order.canceled, order.created, order.paid
Transferência:
transfer.paid
Informe a
senha da conta
e clique em
Salvar
.
Importante: agora, o ERP receberá automaticamente as notificações e fará a conciliação das contas conforme os eventos disparados pelo Pagar.me.
artigo sem título
texto sem nome
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/integracao-stone-pos-configuracoes

Integração Stone POS - Configurações
A.
Por A .
Atualizado em 19/03/2026
Pré-requisitos
Disponível para os planos
Construa,
Impulsione, Domine e
Protagonize.
Plano PDV ( Mediante taxa mensal)
Extensões instaladas
Gateway de Pagamento
,
Integração Stone
e
PDV.
Possuir máquinas
Stone POS.
Ter o aplicativo do POS connect para funcionar.
Atenção:
Se encontrar qualquer problema na integração com a maquininha modelo Android, entre em contato com a equipe Stone para suporte e liberação correta do equipamento.
O que é?
O
Stone (POS)
é um gateway de pagamento
integrado ao ERP.
Ele conecta diretamente a máquina de cartão modelo POS da Stone, permitindo processar pagamentos por cartão de crédito, débito e PIX no PDV.
Ao finalizar uma venda no PDV:
O pagamento é enviado automaticamente para a maquininha.
Após o pagamento na maquininha, a venda é concluída no ERP.
Recursos disponíveis
Recurso
Disponível?
Integração com máquina POS
✓
Emissão de boletos
X
Cobranças no cartão (débito e crédito)
✓
Cobranças via PIX
✓
Controle de taxas e tarifas
✓
Antecipação
✓
Conciliação dos recebimentos
✓
Como adquirir a funcionalidade no ERP
No ERP, acesse:
Menu > Início > Loja de Extensões
.
Encontre a extensão
Integração Stone
e instale para ativar o gateway.
Se ainda não tem a maquininha Stone:
Acesse o painel da Stone para cadastro e compra do equipamento.
Se já possui a maquininha, siga os próximos passos para configurar a integração.
Como configurar a integração Stone no ERP
Atenção:
antes de começar, após adquirir sua maquininha e obter o
StoneCode
, você precisa
abrir um chamado
com o nosso suporte para ativar a integração em sua conta.
No chamado, informe:
Seu
StoneCode
O
CNPJ
da conta Stone
Nosso time fará o cadastro do gateway e responderá no mesmo chamado.
Depois, você poderá acessar e editar as configurações:
Menu > Configurações > Aba Finanças > Cadastro de Gateways
Configurações do gateway Stone
Descrição do gateway:
Nome que identifica esta integração no sistema. Será exibido em todos os menus para seleção do gateway.
Situação:
Defina se o gateway está
Habilitado
ou
Desabilitado
.
Conta financeira para lançamentos:
Criada automaticamente pelo sistema.
Para visualizar:
Menu > Finanças > Caixa
.
Categoria padrão para contas a receber:
Selecione a categoria padrão que será aplicada nos lançamentos.
Conta financeira para crédito:
Escolha a conta financeira que receberá os valores resgatados.
Data em que será baixada a conta a receber:
Escolha entre
Data de liberação no gateway
ou
Data de pagamento da conta a receber
.
Configurações das Tarifas
Categoria para as tarifas:
Selecione a categoria padrão de receitas e despesas.
Configurações do SPED:
Importante:
esta configuração aparece somente se sua conta tiver o módulo
SPED Fiscal
instalado.
CNPJ da instituição
Endereço da instituição
Município da instituição
Configurações do Gateway
Bandeiras atendidas:
Selecione as bandeiras de cartão disponíveis.
Bandeira padrão:
Escolha a bandeira padrão nas operações.
Antecipação dos recebíveis:
Sem antecipação:
Lançamentos conforme parcelas.
Antecipado:
Um único lançamento total.
Preencha também a
Forma de cálculo das taxas
e consulte imagens com fórmulas.
Considerar próximo dia útil para parcelas e tarifas:
Ajusta vencimento de finais de semana ou feriados.
Condições comerciais das formas selecionadas
Defina regras para taxas e tarifas conforme forma de recebimento, bandeiras e número de parcelas.
Cadastro das máquinas POS para integração
Para cadastrar uma máquina, clique em "Adicionar POS" e insira o número de série. Caso deseje, ative a impressão de NFC-e.
integração
configurações
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/stone-pos-minha-cobranca-gerada-no-pdv-nao-aparece-na-maquina

Stone POS – Minha cobrança gerada no PDV não aparece na máquina
MO
Por Monique  O.
Atualizado em 25/11/2025
Se isso acontecer, siga os passos abaixo:
1. Acesse o ERP
Acesse no ERP:
menu > Configurações > Aba Finanças > Cadastro de Gateways
.
Localize o gateway Stone e clique em
Testar conexão
para verificar se a comunicação com sua conta Stone está funcionando corretamente.
Ainda na tela de configuração do gateway, vá até a seção
POS
e confira se o campo
Serial Number
está preenchido corretamente com o número de série da sua maquininha.
Atenção:
não altere os campos
Account ID - Stone
e
Chave da API
.
2. Localize o número de série
Você encontra o número de série:
No app ou site da Stone.
No adesivo “S/N” na parte traseira da maquininha (use apenas o código após os dois pontos).
No terminal da maquininha em:
Menu > Ajuda > Detalhes da máquina
.
3. Contato com suporte
Se o problema persistir, abra um
chamado
com nosso time de suporte. Sempre que possível, envie um vídeo mostrando o processo para facilitar a análise.
pdv
máquina
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/configuracoes-financeiras/visao-geral-do-modulo-de-financas

Visão geral do módulo de Finanças
BM
Por Bruna Miranda
Atualizado em 27/04/2026
Administrar as finanças da sua empresa exige processos claros e ferramentas eficientes.
No módulo de finanças do ERP da Olist , você tem à disposição todos os recursos necessários para gerenciar o seu caixa, automatizar cobranças e categorizar despesas e receitas.
Assista o vídeo abaixo e entenda o funcionamento geral do módulo e como ele pode simplificar a sua rotina e manter total controle sobre as finanças do seu negócio.
gestão
financeiro
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/ajuste-nos-lancamentos-do-extrato-bancario

Ajuste nos lançamentos do Extrato Bancário
MO
Por Monique  O.
Atualizado em 25/11/2025
Identificamos um problema na importação de extratos bancários realizada
hoje (1º de agosto/2025)
, que afetou seus lançamentos. Para que suas informações financeiras fiquem corretas, é necessário
estornar as contas impactadas e importar o arquivo de extrato novamente
.
Siga os passos abaixo para realizar o ajuste:
1. Excluir as contas lançadas
É preciso remover os lançamentos incorretos gerados pela importação.
No
menu lateral esquerdo
, clique em
finanças
.
Acesse o
Caixa
.
Localize as contas importadas que precisam ser ajustadas.
Selecione todas
as contas impactadas.
Clique em
mais ações
e, em seguida, em
Excluir lançamento.
2. Excluir o extrato do dia
Após excluir os lançamentos, remova o arquivo de extrato.
No
menu lateral esquerdo
, acesse
finanças
.
Clique em
Extratos Bancários
.
Selecione o extrato
do dia (1º de agosto) que você importou.
Clique em
excluir extratos
.
3. Importar o extrato bancário novamente
Agora que as informações antigas foram removidas, você pode importar o extrato correto.
No
menu lateral esquerdo
, clique em
finanças
.
Acesse
Extratos Bancários
.
No canto superior direito, clique em
importar extrato bancário
e faça a nova importação do seu arquivo.
Se precisar de ajuda ou tiver alguma dúvida durante o processo, nossa equipe de suporte está à disposição.
ajuste
lançamentos
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/caixa

Caixa
MO
Por Monique  O.
Atualizado em 25/11/2025
No
Caixa
, você encontra todos os lançamentos financeiros da empresa em um só lugar.
Aqui é possível:
Visualizar e gerenciar lançamentos por conta;
Consultar registros vindos de pedidos de venda, notas fiscais, ordens de compra, contas a receber, contas a pagar e comissões;
Incluir movimentações financeiras e transferências entre contas diretamente no módulo.
Como incluir contas bancárias
Acesse:
menu > configurações > aba finanças > Cadastro de contas bancárias
.
A conta
Caixa
já vem cadastrada por padrão. Para adicionar uma nova, clique em
incluir conta bancária
.
Selecione o banco que deseja configurar.
No campo
Descrição da conta
, informe um nome para identificar essa conta.
Preencha os dados bancários solicitados.
Os demais campos são
Configurações adicionais não obrigatórias.
Pix
: escolha o tipo de chave (E-mail, CPF, CNPJ, Telefone ou Chave aleatória) e informe a chave correspondente.
Meio de recebimento
: defina como essa conta será usada para cobranças.
Cobrança registrada (remessas e retornos)
: ao marcar essa opção, você poderá enviar remessas e processar retornos dos principais bancos. Consulte a lista de bancos disponíveis e veja em
Remessas e Retornos Bancários
como configurar.
Boletos
: informe os dados necessários para emissão.
Os dados devem ser obtidos diretamente com o banco.
Em
Primeira instrução
e
Segunda instrução
, insira informações para a remessa bancária.
Para mensagens que aparecerão apenas no boleto, use o campo
Instruções para impressão no boleto
.
Dados adicionais
: campos referentes à cobrança com o banco. Preencha conforme orientação do seu gerente bancário.
Clique em
Salvar
e depois faça a
Validação com o banco
.
Atenção:
ao marcar
Cobrança registrada (remessas e retornos)
, você poderá enviar remessas e processar retornos dos principais bancos. Confira os
bancos
disponíveis e veja como gerar em
Remessas Bancárias
e
Retornos Bancários
.
Se configurar a conta para emissão de boletos, ao salvar será exibida a opção
Gerar boletos para homologação
.
Com ela, é possível criar automaticamente os boletos de teste exigidos pelo banco. Basta selecionar o cliente, definir o valor e a quantidade solicitada para a homologação.
Como incluir Contas financeiras
Acesse:
menu > configurações > aba finanças > Cadastro de contas financeiras
.
A conta
Caixa
já vem cadastrada por padrão. Para adicionar uma nova, clique em
incluir conta bancária
.
No campo
Descrição da conta
, informe um nome para identificar essa conta.
Se desejar que as movimentações dessa conta não sejam consideradas no fluxo de caixa, marque a opção
Não considerar esta conta no saldo para fluxo de caixa e no saldo inicial do caixa
.
Clique em
Salvar
.
Observação:
Ao marcar essa opção, o saldo da conta não será exibido ao acessar o módulo
Caixa
com o filtro
Todas as contas financeiras.
Dica:
no
Menu de contexto(…)
, você pode:
Atribuir um número às contas;
Definir uma conta como
preferencial
para as movimentações.
Realizar lançamentos no caixa
Acesse:
menu > finanças > caixa > incluir lançamento
.
Na aba
Dados do lançamento
, preencha os dados:
Categoria, Tipo,
Data, Valor, Histórico e Cliente ou Fornecedor.
Na aba
competência
escolha o mês de lançamento.
Na aba
anexos
você poderá inserir um arquivo de até 2Mb
Na aba
marcadores
insira o nome separados por vírgula ou tab.
Clique em
Salvar
.
Consultar lançamentos no caixa
Acesse:
menu > finanças > caixa.
Utilize o campo de pesquisa para refinar a busca por
Histórico
Selecione ao lado esquerdo a
Conta,
no qual irá buscar os lançamentos.
Na
busca por período
você poderá buscar por emissão (data) ou por competência.
Ao clicar em
filtros
poderá localizar os lançamentos por:
Categoria
e
Marcador
.
Após selecionar as opções de pesquisa, clique em
Aplicar
.
Logo abaixo você terá todas as contas conforme filtros.
Como configurar e usar marcadores no Caixa
Criar marcadores
Acesse:
menu > configurações > aba finanças > Configurações dos marcadores no caixa
.
Clique em
Incluir marcador
.
Usar marcadores nos lançamentos
Para adicionar em um lançamento existente:
menu > finanças > caixa > Menu de contexto (…) (ao lado da data do lançamento) > Marcadores
.
Para adicionar ao criar um lançamento:
menu > finanças > caixa > incluir lançamento > aba marcadores
.
Para incluir em lote:
menu > finanças > caixa > selecione os lançamentos > alterar marcadores > clique em Incluir marcadores
.
Dica:
após adicionar, você pode
filtrar lançamentos por marcadores
usando a opção
filtros.
Remover marcadores
Para remover de um lançamento:
menu > finanças > caixa > selecione os lançamentos > alterar marcadores > clique em Remover > salvar.
Para excluir definitivamente um marcador:
menu > configurações > aba finanças > Configurações dos marcadores no caixa> selecione o marcador > excluir marcadores.
Imprimir o recibo
Acesse
menu > finanças > caixa
Selecione ao lado esquerdo a
Conta,
que deseja
imprimir o recibo.
Clique
no menu de contexto (…),
ao lado da data do lançamento
e selecione i
mprimir recibo.
Observação:
Se quiser salvar este documento em PDF, usar a opção de salvar em PDF no passo em que é selecionada a impressora.
Como excluir um registro
menu > finanças > caixa > selecione os registros que deseja excluir > mais ações (…)
e clique em e
xcluir lançamentos
.
Observações:
Após realizar a exclusão de registros, os mesmos não poderão ser restaurados.
Não é permitida a exclusão de registros de baixas de contas a receber ou contas a pagar. Esses registros são identificados com o marcador verde com a letra B, indicando tratar-se de uma baixa de conta. Para excluir esses registros, deve-se excluir o registro de recebimento ou pagamento que deu origem ao mesmo.
Ao excluir um recebimento/pagamento, as contas baixadas pelo registro excluído retornarão à situação anterior à baixa. (Terão sua situação alterada para em aberto ou paga parcial e o saldo da conta atualizado, desconsiderando o valor baixado).
Alterar a conta de um lançamento
Para realizar a alteração de conta financeira individualmente a partir dos registros, acesse :
menu > finanças > caixa > Selecione
todos os lançamentos
que deseja excluir > mais ações (…)
e clique em
alterar conta financeira
.
Se deseja alterar a conta financeira em lote, no mesmo local citado anteriormente:
Selecione todos os lançamentos
que deseja alterar
> mais ações (…)
e clique em
alterar conta financeira.
Alterar a categoria de um lançamento
Acesse
menu > finanças > caixa > Selecione os lançamentos > mais ações (…)
e clique em
alterar categoria.
A seguir, selecione a
Nova conta
e clique em
alterar conta.
Como imprimir no módulo de caixa
Acesse
menu > finanças > caixa
e clique no botão
Imprimir
.
Observação:
ao selecionar a opção de impressão, serão impressos todos os lançamentos que correspondem aos critérios aplicados, não somente aqueles que foram selecionados.
Exportar lançamentos do caixa para uma planilha
Acesse
menu > finanças > caixa> mais ações (…) > exportar lançamentos para planilha
.
Observação:
a exportação pode ser realizada no formato Excel (.xls) ou texto (.csv).
Realizar transferência entre contas
Acesse
menu > finanças > caixa
e clique no botão
Transferir
.
A seguir informe os dados da transferência:
Data, Valor, Conta de origem, Conta de destino e Histórico
.
Clique em
Salvar
.
Na listagem dos lançamentos do caixa, a transferência é identificada através do marcador correspondente a transferência entre contas.
Como inserir anexos
Acesse
menu > finanças > caixa
Clique em
incluir lançamento >
aba
anexos
.
Observações:
Para inserir anexos nos lançamentos já inclusos, clique sobre o lançamento, e acesse a aba
anexos
.
Para remover anexos inseridos em lançamentos, vá até a aba
anexos
no próprio lançamento e clique em
remover anexo.
Os arquivos anexados em contas a receber e/ou contas a pagar não são transferidos para o lançamento de caixa, quando a conta for baixada.
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/cobrancas-bancarias

Cobranças Bancárias
MO
Por Monique  O.
Atualizado em 19/03/2026
O módulo de cobranças bancárias gera remessas para os principais bancos do país e, ao ler os retornos, realiza a baixa automática das contas a receber.
Pré-requisitos
Para usar cobranças bancárias, você precisa:
Ter a extensão
Cobranças Bancárias
instalada na sua conta.
Configurar sua conta bancária para cobrança registrada.
Estar em um dos planos:
Construa, Impulsione, Domine ou Protagonize.
Como adicionar a extensão Cobranças Bancárias
Acesse
menu > início > Loja de extensões.
Na seção
Financeiro
, localize a extensão
Cobranças Bancárias
.
Clique em
Instalar
.
Confirme a instalação da extensão.
Como trabalhar com cobranças registradas
Acesse
menu > finanças > Cobranças Bancárias.
Utilize as opções disponíveis:
Remessas bancárias
: para enviar arquivos de cobrança ao banco.
Retornos bancários
: para importar os arquivos de retorno e processar as baixas.
Use os
Filtros
ao lado para localizar arquivos específicos.
Como incluir uma remessa bancária
Acesse:
menu > finanças > Cobranças Bancárias > aba Remessas bancárias.
Clique em
Incluir remessa
.
Escolha o banco desejado.
Serão exibidas as contas a receber vinculadas a esse banco.
(Opcional) Marque:
Atenção:
Incluir títulos sem portador para incluir contas sem banco vinculado.
Atenção:
Incluir títulos cancelados para enviar títulos cancelados para o banco.
Selecione os títulos desejados para a remessa.
Clique em
Salvar
.
Para gerar o arquivo da remessa: após salvar, clique no
menu de contexto
ao lado da remessa e selecione
Gerar remessa
.
Acesse o site do banco e envie o arquivo gerado para registrar suas contas.
Observação:
Se incluir títulos cancelados, a confirmação do cancelamento será importada ao processar o retorno.
Como ler retornos bancários
Acesse
menu > finanças > Cobranças Bancárias > aba Retornos bancários.
Clique em
Ler retorno
.
Selecione o banco.
Encontre e selecione o arquivo de retorno fornecido pelo banco.
Em
Mais opções
, configure parâmetros para as baixas das contas, se necessário.
Como gerar boletos com o Pagar.me
Acesse
menu > finanças > Cobranças Bancárias > aba Remessas bancárias.
Clique em
Incluir remessa
.
No campo
Banco ou gateway
, selecione
Pagar.me
.
Na seção
Títulos da remessa
, marque os títulos que deseja enviar para o Pagar.me.
Clique em
Salvar
para registrar a remessa.
Dica:
Use o
menu de contexto
ao lado do botão
Editar
na remessa para enviar os boletos para o gateway.
Como enviar boletos por e-mail em remessas bancárias
Acesse
menu > finanças > Cobranças Bancárias > aba Remessas bancárias.
Clique no
menu de contexto (…)
ao lado da remessa salva.
Selecione
Enviar boletos por e-mail
.
(Opcional) Marque a opção
Enviar apenas boletos registrados
para enviar somente os boletos que já foram registrados no banco.
Boletos com status "Taxadas ( )" não serão enviados.
Como imprimir boletos em remessas bancárias
Acesse
menu > finanças > Cobranças Bancárias > aba Remessas bancárias.
Clique no
menu de contexto (…)
ao lado da remessa salva.
Selecione
Imprimir boletos
.
Como excluir remessas bancárias
Acesse
menu > finanças > Cobranças Bancárias > aba Remessas bancárias.
Selecione a remessa que deseja excluir.
Clique em
Excluir remessas
.
Atenção:
após excluir uma remessa, os boletos pertencentes a ela poderão ser incluídos em uma nova remessa, se desejar.
Como configurar retornos bancários
Acesse
menu > configurações > aba finanças > Configurações Gerais.
Na seção
Retorno Bancário
, configure os campos disponíveis:
Categoria padrão de lançamento das liquidações do retorno
: escolha a categoria padrão para os lançamentos das liquidações do retorno.
Lançar tarifas no caixa
: marque essa opção para habilitar o lançamento automático das tarifas no caixa. Em seguida, selecione a categoria para esses lançamentos.
Marcar como cancelados os títulos baixados no banco
: selecione
Sim
para que os títulos baixados via arquivo de retorno sejam automaticamente marcados como cancelados.
Clique em
Salvar
para aplicar as configurações.
Como excluir retornos bancários
Acesse
menu > finanças > Cobranças Bancárias > aba Retornos bancários.
Selecione os retornos que deseja excluir.
Clique em
Excluir retornos
.
Atenção:
após excluir um retorno bancário, as contas que tiveram baixas feitas por ele
não serão estornadas automaticamente
.
Para estornar essas baixas, acesse:
Finanças > Contas a Receber
e realize o estorno manualmente.
Veja como
estornar recebimentos
.
tarifas
custos
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/contas-a-pagar

Contas a Pagar
MO
Por Monique  O.
Atualizado em 25/11/2025
Gerencie todas as contas a pagar da sua empresa, incluindo o pagamento e a baixa no módulo Caixa.
As contas podem ser originadas por ordens de compra, notas fiscais de compra ou lançadas manualmente.
Como incluir uma conta a pagar
Acesse
menu > finanças > Contas a Pagar > incluir conta a pagar
.
Na aba
dados da conta
, informe:
Forma Pagamento;
Chave PIX;
Fornecedor (pode pesquisar pela lupa);
Vencimento, valor, data de emissão, número do documento;
Histórico: descrição da conta (opcional);
Categoria: vincule a uma categoria;
Ocorrência: escolha a frequência (única, semanal, mensal, trimestral, semestral, anual ou parcelada);
Na aba
competência
, selecione o mês referente para o DRE.
mês do vencimento, mês anterior ao vencimento ou mês da emissão.
Na aba
anexos
, adicione arquivos de até 2 MB.
Na aba
marcadores
, insira identificadores para facilitar filtros e buscas.
Clique em
Salvar
.
Observações:
A busca por fornecedor pode ser feita pelo telefone com DDD.
Para recorrência semanal, o sistema cria 52 ocorrências para 1 ano.
Como consultar contas a pagar
Acesse
menu > finanças > Contas a Pagar.
Na opção
filtros
você poderá buscar por
período, Categorias, Forma de pagamento, marcador ou situação do pagamento.
Situações das contas:
Todas
: contas pagas e em aberto
Em aberto
: contas ainda não pagas
Emitidas
: todas as contas, inclusive canceladas
Pagas
: somente contas pagas
Atrasadas
: contas vencidas e não pagas
Canceladas
: contas canceladas
Lançar contas a pagar por ordens de compra ou notas fiscais
Ordens de compra:
Acesse
menu > suprimentos > Ordens de Compra.
Clique no
menu de contexto (…)
e selecione
lançar contas
.
Notas de entrada:
Acesse
menu > suprimentos > Notas de Entrada
,
Clique no
menu de contexto (…)
e selecione
lançar contas
.
Configurar marcadores em contas a pagar
Acesse:
menu > configurações > aba finanças > Configurações dos marcadores nas contas a pagar.
Clique em
Incluir marcador
.
Para editar ou incluir em lote:
menu > aba finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) alterar marcadores > clique em Incluir marcadores
.
Remover marcadores
Para remover de uma conta:
menu > finanças > Contas a Pagar > selecione os lançamentos > alterar marcadores > clique em Remover > salvar.
Gerenciar categorias de receitas e despesas
Para criar grupos:
Acesse
menu > configurações > aba finanças > Categorias de receita e despesa
,
Clique em
grupos > incluir grupo de categorias
.
Para criar categorias:
Acesse
menu > configurações > aba finanças > Categorias de receita e despesa
,
Clique em
incluir categorias
.
Preencha os campos
Descrição, Grupo
, se será
considerada no DRE
e a
Competência padrão.
Para alterar categorias em lote:
Acesse
menu > configurações > aba finanças > Categorias de receita e despesa
,
Selecione as contas > agrupar categorias >
escolha a nova categoria.
Clique em
agrupar.
Dica:
é possível selecionar uma categoria diferente para cada conta, diretamente na tela de pagamento, no campo
Categoria
.
Como pagar contas
Para pagar uma conta:
menu > finanças > Contas a Pagar > Menu de contexto (…) (ao lado de Fornecedor) >
pagar (baixar conta)
.
Para pagar várias contas:
menu > finanças > Contas a Pagar.
Selecione as contas > C
lique em
pagar (baixar conta)
.
Confirme os dados e clique em
pagar.
Para agrupar contas:
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) > agrupar categorias contas
.
As contas agrupadas serão canceladas e um novo registro será criado.
Observações:
Se preencher a categoria ao pagar, ela será atualizada no documento de origem.
Só é possível agrupar contas do mesmo fornecedor.
Contas agrupadas recebem o marcador "agrupadas".
Pagar contas parcialmente
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) > pagar (baixar conta)
.
Clique em
mais opções
e informe o
Valor pago.
Clique em
Pagar
.
A conta aparecerá como
Parcial
e continuará em aberto para pagamentos futuros.
Cancelar conta a pagar
Para cancelar uma conta:
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) > cancelar conta
.
Para cancelar várias:
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) > cancelar contas
.
Atenção:
se a conta tiver recorrência ou parcelas, o sistema solicitará o que fazer com as contas vinculadas.
Excluir conta a pagar
Para excluir uma conta:
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) >
excluir conta.
Para excluir várias contas não recorrentes:
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) >
excluir contas
.
Atenção:
se a conta tiver recorrência ou parcelas, será solicitado o destino das contas vinculadas.
Para excluir todas as Contas a Pagar de uma só vez, acesse:
Menu
>
início
.
Selecione
Ferramentas
.
Clique em
Exclusão de registros
>
incluir tarefa de exclusão
.
Escolha a opção que corresponde ao que deseja excluir:
Pagamentos e Contas a Pagar vinculadas ao pagamento
: para excluir contas já pagas;
Contas a Pagar sem pagamento
: para excluir contas que não têm pagamento vinculado.
Clique em
salvar
.
Clonar conta a pagar
menu > finanças > Contas a Pagar.
Selecione as contas > Menu de contexto (…) >
Clonar conta
.
Você pode editar os dados da nova conta antes de salvar.
Imprimir contas a pagar
Acesse
menu > finanças > Contas a Pagar >
clique em
Imprimir
.
Para impressão agrupada por fornecedor:
menu > finanças > Contas a Pagar > mais ações > imprimir agrupado por fornecedor
.
Configurar envio de e-mail para contas a pagar
Acesse
menu > configurações > aba finanças > Configurações do contas a Pagar.
Informe o e-mail
e clique em
salvar.
Atenção:
será enviado aviso de contas a pagar vencendo para o e-mail configurado.
Inserir e editar anexos
Para inserir ou editar anexos:
Acesse
menu > finanças > Contas a Pagar.
Selecione a conta > Menu de contexto (…) >
editar anexos
.
É possível adicionar e remover arquivos a qualquer momento.
Observação:
anexos em contas a pagar não aparecem em Caixa e Bancos.
Estornar pagamentos
Acesse
menu > finanças > Contas a Pagar.
Acesse a aba
pagas
em
Selecione a conta > Menu de contexto (…) > estornar pagamento
.
Para excluir um pagamento:
Acesse
menu > finanças > Contas a Pagar > gerenciar pagamentos.
As contas estornadas voltam para a situação anterior.
Visualizar pagamentos
Acesse
menu > finanças > Contas a Pagar.
Acesse a aba
pagas
em
Selecione a conta > Menu de contexto (…) >
exibir pagamentos
.
pagamentos
despesas
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/contas-a-receber

Contas a Receber
A.
Por A .
Atualizado em 29/04/2026
O módulo
Contas a Receber
permite gerenciar todos os recebimentos no ERP— desde lançamentos feitos manualmente até contas criadas a partir de pedidos ou notas de venda.
Quando um recebimento é baixado, ele é automaticamente lançado no
Caixa
, facilitando o controle financeiro.
Como incluir uma conta a receber
No menu inicial do ERP, acesse menu > finanças > Contas a Receber
> i
ncluir conta a receber
.
Na aba
dados da conta informe
:
Cliente
ou localize-o pela lupa.
Preencha:
Vencimento
,
Valor
,
Data de emissão
,
Número do documento
.
No campo
Histórico
, adicione uma descrição da conta.
Em
Categoria
, vincule a conta a uma categoria.
Informe a
Forma de recebimento
defina a
Ocorrência.
No campo
Competência
, selecione a que mês essa conta pertence para geração do DRE.
Na aba
anexos
você poderá inserir um arquivo de até 2Mb
Na aba
marcadores
insira o nome separados por vírgula ou tab.
Clique em
Salvar
.
Consultar contas a receber
Tipos de consulta
Em aberto
→ contas pendentes de pagamento.
Emitidas
→ todas as contas já lançadas.
Previstas
.
Recebidas
→ contas já pagas.
Atrasadas
→ contas vencidas e não pagas.
Canceladas
→ todas as contas canceladas.
Filtros disponíveis
Use os
Filtros
para localizar rapidamente suas contas a receber.
Acesse:
menu > contas a receber.
Utilize o campo de pesquisa para refinar a busca por
Histórico
Por meio de recebimento;
Por período mês
→ escolha o período desejado.
Por vencimento
→ pesquisa pela data de vencimento.
Por competência
→ pesquisa pela data de competência informada no lançamento.
Por categoria, Forma de recebimento, Marcador, Vendedor
→ use as informações cadastradas no momento da inclusão da conta.
O marcador pode indicar, por exemplo, quando um boleto teve a entrada confirmada no banco via remessa bancária.
Lançar contas a receber pelo pedido de venda ou NF
Pelo pedido de venda
Ao preencher o pedido, informe a
condição de pagamento
.
Acesse
menu >
vendas
>
Pedidos de Venda
.
Clique no
Menu de contexto (…)
ao lado do número do pedido.
Selecione
lançar contas
.
Lançamento automático de contas a receber
O ERP permite configurar em qual momento o contas a receber será gerado automaticamente a partir dos pedidos de venda.
Por padrão, o lançamento pode ocorrer ao salvar o pedido. No entanto, também é possível configurar para que ocorra apenas quando o pedido for aprovado.
Opções disponíveis:
Ao salvar o pedido:
O lançamento é realizado imediatamente após o cadastro do pedido.
Ao aprovar o pedido (recomendado para integrações)
O lançamento ocorre quando o pedido muda para o status
Aprovado.
Indicado para integrações com marketplaces, onde os pedidos podem chegar incompletos inicialmente.
Por que usar “Ao aprovar o pedido”?
Evita falhas no lançamento por falta de dados.
Garante que todas as informações do pedido estejam completas.
Mantém o processo automático sem necessidade de lançar pela nota fiscal.
Como configurar:
Acesse:
menu > configurações > aba finanças > Configurações gerais > Lançamento de contas a receber
Selecione a opção:
Automático ao aprovar o pedido.
Pela nota fiscal
Ao preencher a nota, informe a
condição de pagamento
.
Acesse
menu >
vendas
>
Notas Fiscais
.
Clique no
Menu de contexto (…)
ao lado do número da nota fiscal.
Selecione
lançar contas
.
Configurar marcadores em contas a receber
Acesse:
menu > configurações > aba finanças > Configurações dos marcadores nas contas a receber.
Clique em
incluir marcador
.
Para adicionar ou remover um marcador:
Acesse
menu > finanças > Contas a Receber
.
Selecione uma ou mais notas clique em
mais ações (…) > alterar marcadores
.
Clique em
salvar.
Para excluir um marcador:
Acesse
menu > configurações > aba finanças > Configurações dos marcadores nas contas a receber.
Selecione o marcador desejado e clique em
excluir marcadores
.
Incluir grupos para categorias de receitas e despesas
Acesse
menu > configurações > aba finanças > Categorias de receitas e despesas.
Clique em
grupos
>
incluir grupo de categorias
.
Informe a
Descrição
do grupo.
Clique em
salvar
.
Adicionar categorias de receitas e despesas:
Acesse
menu > configurações > aba finanças > Categorias de receita e despesa
,
Clique em
incluir categorias
.
Preencha os campos
Descrição, Grupo
, se será
considerada no DRE
e a
Competência padrão.
Para alterar categorias em lote:
Acesse
menu > configurações > aba finanças > Categorias de receita e despesa
,
Selecione as contas > agrupar categorias >
escolha a nova categoria.
Clique em
agrupar.
Dica:
é possível selecionar uma categoria diferente para cada conta, diretamente na tela de pagamento, no campo
Categoria
.
Receber contas
Para receber individualmente:
Acesse
menu > finanças > Contas a Receber
.
Selecione a conta clique em
mais ações (…) > receber (baixar conta)
.
Para receber em lote:
Acesse
menu > finanças > Contas a Receber
.
Selecione as contas, clique em
> receber.
Confirme o recebimento e, se desejar
imprimir o recibo
, marque a opção antes de concluir.
Receber contas parcialmente
menu > finanças > Contas a receber
.
No
menu de contexto (...)
, clique em
Receber (baixar conta)
.
Clique em
Mais opções
.
No campo
Valor recebido
, informe o valor realmente pago.
Clique em
Receber
.
Na listagem, a conta aparecerá com a situação
Parcial
e seguirá
Em aberto
, permitindo baixar o restante depois.
Visualizar remessa em contas a receber
menu > finanças > Contas a receber
.
No
menu de contexto (...)
, clique
visualizar remessa
.
Excluir uma conta a receber
menu > finanças > Contas a receber
.
No
menu de contexto (...)
, clique em
Excluir conta
.
Para excluir todas as Contas a Receber de uma só vez, acesse:
Menu
>
início
.
Selecione
Ferramentas
.
Clique em
Exclusão de registros
>
incluir tarefa de exclusão
.
Escolha a opção que corresponde ao que deseja excluir:
Recebimentos e Contas a Receber vinculadas ao recebimento
: para excluir contas já recebidas;
Contas a Receber sem recebimento
: para excluir contas que não têm recebimento vinculado.
Clique em
salvar
.
Cancelar uma conta a receber
Para cancelar uma conta:
menu > finanças> Contas a Receber
.
Selecione a conta > Menu de contexto (…) > cancelar conta
.
Para cancelar várias:
menu > finanças> Contas a Receber
.
Selecione a conta > Menu de contexto (…) >
cancelar contas
.
Clique em
confirmar.
Atenção:
se a conta tiver boleto emitido, contate o banco para cancelar.
Configurar envio de boletos por e-mail
Acesse
menu > configurações > aba finanças > Configurações do envio de documentos
.
Configure:
Assunto padrão
: texto que será usado no assunto do e-mail.
Mensagem padrão
: texto exibido no corpo do e-mail.
Para personalizar, clique em
Exibir variáveis disponíveis
e escolha as que deseja incluir na mensagem.
Em
Enviar boletos por e-mail junto com as notas fiscais, notas de serviço e os pedidos de venda
, escolha:
Habilitar
: envia o boleto com as notas/pedidos. Opção de envio:
Link do boleto
ou
PDF do boleto
.
Desabilitar
: não envia boleto com notas/pedidos.
Clique em
Salvar.
Enviar aviso de contas a receber para o e-mail do cliente
Acesse
menu > configurações > aba finanças > Configurações do Contas a Receber
.
Em
Avisar cliente por e-mail sobre contas a receber em aberto
, escolha quando enviar o aviso:
Não avisar
No dia do vencimento
No dia anterior ao vencimento
2 dias antes do vencimento
5 dias antes do vencimento
Em
Emissão automática de boletos,
selecione
Manual ou Automático.
Clique em
salvar.
Emitir cobranças em Contas a receber
menu > finanças> Contas a Receber
.
Selecione a conta > Menu de contexto (…) >
emitir cobrança
.
Caso a conta esteja configurada para recebimento em
PIX, o QR code
aparecerá à direita da tela.
Observação:
para que a linha digitável apareça no boleto, veja o passo na seção abaixo.
Logo após o
Boleto
será emitido e caso deseje você poderá
imprimir.
Clique em
Imprimir boleto
.
Atenção:
Boletos de bancos diferentes (ex.: Itaú e Santander) não podem ser impressos no mesmo lote.
Boletos sem banco definido serão emitidos com o banco padrão configurado para emissão.
Adicionar linha digitável no envio de boletos por e-mail
Acesse
menu > configurações > aba finanças > Configurações Gerais.
Ative,
Sim,
nos campos:
Exibe histórico e logo na impressão dos boletos
.
Enviar linha digitável no histórico.
Observação:
a linha digitável será exibida no campo histórico do boleto.
Compartilhar boleto
menu > finanças> Contas a Receber
.
Selecione a conta > Menu de contexto (…) >
Compartilhar
.
Escolha as opções:
enviar por e-mail ou whatsapp.
Você também poderá
Gerar link compartilhável,
basta
clicar no botão,
deixando ele
azul.
Caso deseje
enviar para mais de um e-mail
, digite os endereços separados por vírgula, sem espaços.
Exemplo:
Clonar conta a receber
Acesse
menu > finanças> Contas a Receber
.
Selecione a conta > Menu de contexto (…) >
Clonar conta
.
Revise as informações, caso deseje é possível editar a conta clonada.
Clique em
salvar.
Estornar recebimentos
Opção 1:
Acesse
menu > finanças> Contas a Receber >
aba
recebidas
.
Selecione a conta > Menu de contexto (…) >
estornar recebimento
.
Opção 2:
Acesse
Menu > Finanças > Contas a Receber > Gerenciar recebimentos
(ao lado do botão
imprimir
).
Selecione a conta
e clique em
excluir recebimentos
.
Observação:
as contas estornadas voltam à situação anterior ao recebimento.
Exibir Recebimentos
Acesse
menu > finanças> Contas a Receber >
aba
recebidas
.
Selecione a conta > Menu de contexto (…) >
clique em
exibir recebimentos
.
Tipos de impressão
Recibo
Acesse
menu > finanças> Contas a Receber
Selecione a conta > Menu de contexto (…) >
clique em
Imprimir recibo
.
Duplicata
Acesse
menu > finanças> Contas a Receber
Selecione a conta > Menu de contexto (…) >
clique em
Imprimir duplicata
.
Todas as contas a receber
Acesse
menu > finanças> Contas a Receber
e clique em
Imprimir
(ao lado do botão gerenciar recebimentos).
Agrupadas por cliente
Acesse
menu > finanças> Contas a Receber > mais ações > imprimir agrupado por cliente
.
Para imprimir de um cliente específico, use a busca pelo nome e depois selecione
mais ações > imprimir agrupado por cliente
.
faturas pendentes
cobranças
contas a receber
conta
receber
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/extratos-bancarios

Extratos Bancários
MO
Por Monique  O.
Atualizado em 18/12/2025
Antes de importar um extrato bancário, é necessário ter o cadastro de uma
conta bancária
no ERP. Caso ainda não tenha, acesse o menu
Finanças > Contas bancárias
e adicione as informações da conta que será utilizada na conciliação.
1. Adicionar a extensão Extrato Bancário
Acesse
menu > início > Loja de extensões
.
Na seção
Financeiro
, clique sobre a extensão
Extrato Bancário
.
Clique em
Instalar
e, em seguida, confirme a instalação.
2. Importar extrato bancário (.ofx)
O arquivo do extrato bancário precisa estar no formato
.ofx
para ser importado no ERP.
Acesse
menu > Finanças > Extratos Bancários > Importar extrato bancário
.
Observação:
ao importar, o lançamento presente no extrato será incluído na conta bancária correspondente no ERP. Nesse momento, também é possível complementar informações como histórico, categoria e indicar cliente ou fornecedor.
Como conciliar os extratos bancários
Após importar o extrato bancário no ERP, o sistema disponibiliza opções para manutenção dos lançamentos.
Primeiro, é feita uma busca com base no valor do lançamento e no contato vinculado. Se for encontrado um lançamento compatível, o vínculo será feito automaticamente.
Na tela de manutenção de lançamentos, é possível verificar data, histórico, categoria e contato. Caso nenhum registro seja localizado automaticamente, preencha ou altere todos os dados e clique em
Incluir
.
Se algum dado estiver incorreto, clique em
Estornar
e refaça o lançamento com as informações corretas.
menu de contexto — opções disponíveis para cada lançamento
Incluir este lançamento:
Cria um lançamento com o valor identificado no extrato, na conta financeira selecionada durante a importação do arquivo .OFX.
Ignorar / já foi lançado:
Use quando o lançamento já existir no ERP (ex.: lançamentos manuais ou retornos bancários já registrados).
Lançar e receber conta correspondente (crédito):
Abre uma janela para pesquisar lançamentos por data, histórico ou nome. Após selecionar as contas que deseja receber, clique em
Conciliar lançamento
. Se houver diferença entre os valores, campos para taxa, juros, desconto e acréscimo serão exibidos.
Observação:
a conciliação só será concluída se o valor dos títulos for compatível com o valor do lançamento no banco. Se o valor for menor, a conta ficará registrada como paga parcialmente.
Lançar e pagar conta correspondente (débito):
Abre uma janela para pesquisar lançamentos por data, histórico ou nome. Após selecionar as contas que deseja pagar, clique em
Conciliar lançamento
. Se houver diferença entre os valores, campos para taxa, juros, desconto e acréscimo serão exibidos.
Observação:
a conciliação só será concluída se o valor dos títulos for compatível com o valor do lançamento no banco. Se o valor for menor, a conta ficará registrada como paga parcialmente.
Consultar lançamentos existentes:
Exibe lançamentos já realizados na data do extrato, permitindo verificar se o lançamento já está registrado. Nessa tela, também é possível incluir um lançamento inexistente ou marcá-lo como já realizado.
Excluir extrato bancário
Acesse
menu > Finanças > Extratos Bancários
.
Selecione o extrato que deseja excluir e clique em
Excluir extratos
.
Atenção:
após deletar os extratos bancários, as conciliações efetuadas a partir destes não serão estornadas.
declarações financeiras
relatórios bancários
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/gestao-financeira/fechamento-financeiro

Fechamento Financeiro
MO
Por Monique  O.
Atualizado em 19/03/2026
O módulo de
Fechamento Financeiro
foi criado para garantir maior assertividade e segurança nos registros financeiros do seu ERP, bloqueando lançamentos retroativos a uma data definida.
Pré-requisitos
Ter a extensão
Fechamento do período financeiro
instalada em sua conta.
Ser assinante dos planos
Construa
,
Impulsione,
Domine ou Protagonize.
Como adicionar a extensão de fechamento financeiro
Acesse
menu > início > Loja de extensões.
Na seção
Financeiro
, localize e adicione a extensão
Fechamento do período financeiro
.
Clique em
Instalar
e confirme a instalação.
Como gerenciar o fechamento financeiro
Acesse
Finanças > Caixa
.
Clique em
Mais ações > Gerenciar fechamento financeiro
.
Se não houver um fechamento vigente, clique em
Informar data de fechamento
.
Informe a data limite para bloqueio dos lançamentos retroativos e clique em
Fechar período financeiro
.
Importante:
Se já houver uma data ativa, será possível apenas alterar ou remover essa data, liberando os lançamentos retroativos.
Como verificar o histórico de fechamento financeiro
Acesse
Finanças > Caixa
.
Clique em
Mais ações > Gerenciar fechamento financeiro
.
Selecione a opção
Ver histórico de fechamento
para visualizar todos os registros de abertura e fechamento, com a data e o usuário responsável.
Como verificar movimentações financeiras bloqueadas
Acesse
Finanças > Caixa
.
Clique em
Mais ações > Movimentações financeiras bloqueadas
.
Visualize os lançamentos que não foram concluídos devido ao fechamento financeiro ativo.
Dica:
Esses lançamentos não exigem nenhuma ação, pois não foram realizados.
Se precisar de ajuda para configurar ou utilizar o fechamento financeiro, entre em contato com nosso suporte.
encerramento
orçamento
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/relatorios-de-financas/balancete

Balancete
MO
Por Monique  O.
Atualizado em 19/03/2026
O balancete é o demonstrativo que permite verificar o resultado do seu negócio a curto prazo, apresentando os saldos de débito e crédito da sua empresa.
No ERP, este relatório ajuda você a acompanhar os resultados da empresa mês a mês. Isso possibilita uma visão ampla das suas finanças e auxilia na adoção das medidas necessárias para o bom andamento do seu negócio.
Os dados do relatório são baseados nos lançamentos de
caixa, contas a pagar, contas a receber e contas financeiras
.
Pré-requisitos
Disponível nos planos: Construa, Impulsione,Domine ou Protagonize.
Para gerar o relatório, siga estes passos:
Acesse
menu > finanças > Relatórios
.
Na aba
geral
, clique em
Balancete
.
Escolha o Período, a Conta, a Categoria, q Visualização (que define como os registros serão agrupados) e o Tipo do gráfico. Defina também se deseja considerar as transferências.
Clique em
gerar
.
O relatório gerado está disponível para
download, compartilhamento e impressão.
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/relatorios-de-financas/como-funciona-o-relatorio-dre

Como funciona o relatório DRE?
A.
Por A .
Atualizado em 19/02/2026
Este artigo detalha cada campo do Relatório de DRE.
Para mais informações sobre o relatório, acesse o
artigo
sobre a Demonstração do Resultado do Exercício.
Baseado em Notas Fiscais
RECEITA BRUTA
Compreende todas as vendas realizadas pela empresa, sem considerar as deduções e os impostos incidentes.
Notas Fiscais
É a soma do campo total faturado das notas fiscais, com data do mês, nas situações (EMITIDA/AUTORIZADA)
Notas Fiscais de Serviço
Notas de serviço, com data da autorização na situação EMITIDA/AUTORIZADA
Quantidade
É a quantidade total de notas emitidas no mês e, que foram consideradas no relatório.
Ticket médio
É um indicador de performance de vendas, o cálculo do ticket médio é, dividir o faturamento total pelo número de notas do período.
(-) DEDUÇÕES
Inclui os abatimentos de impostos que incidem diretamente sobre as notas e devoluções.
Devoluções
É a soma das notas de devolução, baseado na data de autorização, vinculadas a naturezas de operação configuradas como devolução, serão consideradas somente notas emitidas pelo ERP
Impostos ↓
É a soma de todos os impostos pagos de acordo com a categoria e segmento de operação que estão destacados nas notas emitidas pelo ERP.
ICMS/SIMPLES
Imposto com data do mês, nas situações (EMITIDA,AUTORIZADA, EMITIDA DANFE)
IPI
É a soma do campo IPI das notas fiscais, com data do mês, nas situações (EMITIDA, AUTORIZADA,EMITIDA DANFE)
ISS
É a soma do campo ISS das notas fiscais, com data do mês, nas situações (EMITIDA, AUTORIZADA,EMITIDA DANFE) + Soma do campo ISS das notas de serviço, com data de emissão do mês, na situação
PIS
É a soma do campo PIS das notas fiscais, com data do mês, nas situações (EMITIDA, AUTORIZADA,EMITIDA DANFE)
COFINS
É a soma do campo COFINS das notas fiscais, com data do mês, nas situações (EMITIDA,AUTORIZADA, EMITIDA DANFE)
Estorno de impostos de devoluções
Compreende o retorno do valor pago em impostos sobre as devoluções de venda. Para o estorno ser considerado, a natureza de operação vinculada a nota deverá ter a finalidade de devolução e a chave de acesso da nota deverá estar referenciada.
(=) RECEITA LÍQUIDA
Este é um dos primeiros indicadores que o DRE fornece. É o resultado da receita bruta menos as deduções.
(-) CUSTOS
São os gastos relativos à fabricação de um produto, compra de uma mercadoria ou preparação de um serviço, por exemplo valores despendidos com matéria-prima, distribuição, logística etc.
CMV
O Custo de Mercadorias Vendidas compreende a quantidade de cada item das notas fiscais marcada com a opção de gerar faturas, nas situações (EMITIDA,AUTORIZADA, EMITIDA DANFE), multiplicado pelo preço de custo (custo da compra ou custo médio) que o item possuía na data de Autorização da NF.
Estorno de CMV de devoluções
Apenas será considerada como estorno de CMV de devolução no DRE, caso a nota de devolução tenha a chave de acesso referenciada e a natureza de operação tenha a finalidade de devolução. Apenas notas fiscais de devolução emitidas pelo ERP serão consideradas nesse local.
(=) LUCRO BRUTO
Compreende a diferença entre a receita líquida e o custo de produção/operação. É também um indicador muito importante no DRE, pois mostra o quanto a empresa está gerando de lucro, considerando apenas os custos diretamente ligados à geração da Receita Bruta.
(-) DESPESAS OERACIONAIS
São gastos ligados à operação da empresa e que ocorrem independentemente de ela ter gerado ou não receitas no período.
Comissões emitidas
É a soma de todos os registros lançados no módulo de comissões, considerando a data do registro, independente de pagamento.
Taxas e tarifas
É a soma das taxas e tarifas de todas as contas a receber não canceladas, considerando a data de competência. E lançamentos no caixa, considerando a data de competência e categoria vinculada.
(=) RESULTADO OPERACIONAL
É a diferença entre o Lucro Bruto obtido no mês de operação com as Despesas Operacionais.
(+) OUTRAS RECEITAS
Corresponde ao resultado positivo alcançado nas operações que não estão ligadas diretamente a operação da empresa, como por exemplo ativos imobilizados e acréscimos recebidos em venda. Apenas serão considerados documentos que não tem vínculos com nota fiscal, pedido de venda e nota fiscal de serviço.
Juros recebidos
Esse campo só será exibido caso uma conta a receber tenha juros.
Acréscimos recebidos
Esse campo só será exibido caso uma conta a receber tenha acréscimo.
Desconto em recebimentos
Esse campo só será exibido caso uma conta a receber tenha desconto.
(-) OUTRAS DESPESAS
Corresponde ao resultado negativo alcançado nas operações que não estão ligadas diretamente a operação da empresa, como por exemplo doações, dividendos e acréscimos em títulos pagos.
Juros pagos
Esse campo só será exibido caso uma conta a pagar tenha juros.
Acréscimos pagos
Esse campo só será exibido caso uma conta a pagar tenha acréscimo.
Desconto em pagamentos
Esse campo só será exibido caso uma conta a pagar tenha desconto.
(-) TRIBUTOS
Refere-se aos impostos que não estão ligados diretamente as vendas, como IRRF, CSL, etc.
(=) RESULTADO LÍQUIDO
É obtido a partir da soma do Resultado Operacional com Outras Receitas, subtraindo os tributos e Outras Despesas. Este valor corresponde ao resultado final da empresa, considerando os ganhos e perdas do período.
(=) RESULTADO/LUCRO BRUTO (%)
É um indicador do percentual da receita líquida sobre o lucro bruto.
Baseado em Pedidos de Venda
RECEITA BRUTA
Compreende todas as vendas e prestação de serviços realizadas pela empresa, sem considerar as deduções e os impostos incidentes.
Vendas
É a soma dos pedidos de venda, com data do mês nas situações (APROVADO, PREPARANDO ENVIO, FATURADO, PRONTO PARA ENVIO, ENVIADA, ENTREGUE, NÃO ENTREGUE)
Notas Fiscais de Serviço
Notas de serviço, com data da autorização na situação EMITIDA/AUTORIZADA
Quantidade
É a quantidade total de pedidos e notas de serviço emitidos no mês e, que foram consideradas no relatório.
Ticket médio
É um indicador de performance de vendas, o cálculo do ticket médio é, dividir o faturamento total pelo número de vendas do período.
(-) DEDUÇÕES
Inclui os abatimentos de impostos que incidem diretamente sobre as vendas, serviços e devoluções.
Devoluções
É a soma das notas de devolução, baseado na data de autorização, vinculadas a naturezas de operação configuradas como devolução, serão consideradas somente notas emitidas pelo ERP, não serão consideradas devoluções de venda sem nota gerada.
Impostos ↓
É a soma de todos os impostos pagos de acordo com a categoria e segmento de operação que estão destacados nos pedidos e notas de serviço emitidas pelo ERP.
ICMS/ST
ICMS ST - Soma do campo ICMS ST dos pedidos de venda, com data do mês, nas situações (APROVADO, PREPARANDO ENVIO, FATURADO, PRONTO PARA ENVIO, ENVIADA, ENTREGUE, NÃO ENTREGUE)
IPI
É a soma do campo IPI dos pedidos de venda, com data do mês, nas situações (APROVADO, PREPARANDO ENVIO, FATURADO, PRONTO PARA ENVIO, ENVIADA, ENTREGUE, NÃO ENTREGUE)
ISS
É a soma do campo ISS das notas de serviço, com data de emissão do mês, na situação EMITIDA/AUTORIZADA
Estorno de impostos de devoluções
Compreende o retorno do valor pago em impostos sobre as devoluções de venda. Para o estorno ser considerado, a natureza de operação vinculada a nota deverá ter a finalidade de devolução e a chave de acesso da nota deverá estar referenciada.
(=) RECEITA LÍQUIDA
Este é um dos primeiros indicadores que o DRE fornece. É o resultado da receita bruta menos as deduções.
(-) CUSTOS
São os gastos relativos à fabricação de um produto, compra de uma mercadoria ou preparação de um serviço, por exemplo valores despendidos com matéria-prima, distribuição, logística etc.
CMV
O Custo de Mercadorias Vendidas compreende a quantidade de cada item dos pedidos de venda, nas situações (APROVADO, PREPARANDO ENVIO, FATURADO, PRONTO PARA ENVIO, ENVIADA, ENTREGUE, NÃO ENTREGUE), multiplicado pelo preço de custo (custo da compra ou custo médio) que o item possuía na data da venda.
Estorno de CMV de devoluções
Apenas será considerada como estorno de CMV de devolução no DRE, caso a nota de devolução tenha a chave de acesso referenciada e a natureza de operação tenha a finalidade de devolução. Apenas notas fiscais de devolução emitidas pelo ERP serão consideradas nesse local.
(=) LUCRO BRUTO
Compreende a diferença entre a receita líquida e o custo de produção/operação. É também um indicador muito importante no DRE, pois mostra o quanto a empresa está gerando de lucro, considerando apenas os custos diretamente ligados à geração da Receita Bruta.
(-) DESPESAS OERACIONAIS
São gastos ligados à operação da empresa e que ocorrem independentemente de ela ter gerado ou não receitas no período.
Comissões emitidas
É a soma de todos os registros lançados no módulo de comissões, considerando a data do registro, independente de pagamento.
Taxas e tarifas
É a soma das taxas e tarifas de todas as contas a receber não canceladas, considerando a data de competência. E lançamentos no caixa, considerando a data de competência e categoria vinculada.
(=) RESULTADO OPERACIONAL
É a diferença entre o Lucro Bruto obtido no mês de operação com as Despesas Operacionais.
(+) OUTRAS RECEITAS
Corresponde ao resultado positivo alcançado nas operações que não estão ligadas diretamente a operação da empresa, como por exemplo ativos imobilizados e acréscimos recebidos em venda. Apenas serão considerados documentos que não tem vínculos com nota fiscal, pedido de venda e nota fiscal de serviço.
Juros recebidos
Esse campo só será exibido caso uma conta a receber tenha juros.
Acréscimos recebidos
Esse campo só será exibido caso uma conta a receber tenha acréscimo.
Desconto em recebimentos
Esse campo só será exibido caso uma conta a receber tenha desconto.
(-) OUTRAS DESPESAS
Corresponde ao resultado negativo alcançado nas operações que não estão ligadas diretamente a operação da empresa, como por exemplo doações, dividendos e acréscimos em títulos pagos.
Juros pagos
Esse campo só será exibido caso uma conta a pagar tenha juros.
Acréscimos pagos
Esse campo só será exibido caso uma conta a pagar tenha acréscimo.
Desconto em pagamentos
Esse campo só será exibido caso uma conta a pagar tenha desconto.
(-) TRIBUTOS
Refere-se aos impostos que não estão ligados diretamente as vendas, como IRRF, CSL, etc.
(=) RESULTADO LÍQUIDO
É obtido a partir da soma do Resultado Operacional com Outras Receitas, subtraindo os tributos e Outras Despesas. Este valor corresponde ao resultado final da empresa, considerando os ganhos e perdas do período.
(=) RESULTADO/LUCRO BRUTO (%)
É um indicador do percentual da receita líquida sobre o lucro bruto.
demonstrativo
resultado
drre
dre
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/relatorios-de-financas/demonstracao-do-resultado-do-exercicio-dre

Demonstração do resultado do exercício (DRE)
MO
Por Monique  O.
Atualizado em 19/03/2026
A Demonstração do Resultado do Exercício (DRE) é uma demonstração contábil essencial no cotidiano da sua empresa.
Sua finalidade é evidenciar a formação do resultado líquido do exercício, por meio do confronto entre receitas, custos e despesas, segundo o princípio contábil do regime de competência.
No ERP, este relatório é uma ferramenta que ajuda a empresa na criação de estratégias financeiras.
Pré-requisitos
Disponível para os planos Construa, Impulsione, Domine, Protagonize e Plano PDV.
Adicionar a extensão DRE
Para utilizar o relatório de Demonstração do Resultado do Exercício (DRE), é necessário adicionar a extensão.
Para isso, siga os passos:
Acesse
menu > início > Loja de extensões
.
Busque pela extensão
DRE
e clique
instalar
.
Como configurar o DRE
Antes de começar, é necessário configurar as categorias de receitas e despesas. Veja o passo a passo no artigo
Categorias de receita e despesas
.
Após a configuração inicial, siga as etapas abaixo para as vendas serem consideradas no DRE.
Observações:
Nas configurações da sua categoria de receita ou despesa, o campo
Considera no DRE
deve estar definido como
Outras receitas ou despesas
.
O campo
Considerar CMV no DRE
deve estar configurado como
Sim
.
Para ajustar, acesse
configurações > suprimentos >
Naturezas de operação (tributação)
> incluir natureza de operação.
Na seção
Configurações avançadas
da natureza de operação, faça a alteração.
Depois, inicie o histórico de custos dos produtos.
Acesse
Menu > cadastros > Produtos > ações > iniciar histórico de custos
.
Clique em
continuar
para adicionar os registros de custos aos produtos.
Essa ação inclui o primeiro registro de custo nos itens que ainda não o possuem, garantindo que eles sejam considerados corretamente no DRE.
Como gerar o relatório DRE
Para gerar a Demonstração do Resultado do Exercício, acesse:
menu > finanças > Relatórios > aba geral > DRE
Filtros do relatório
Preencha os filtros para definir as informações que serão exibidas.
Ano:
selecione o período que deseja analisar.
Baseado em:
indica a origem dos dados, que pode ser
Notas Fiscais
ou
Pedidos de Venda
.
Custo baseado em:
define se o relatório deve considerar o
Custo de compra
ou o
Custo médio
dos seus produtos.
Agrupamento:
esta opção aparece apenas para contas multiempresa. Selecione
Empresas do grupo
para exibir os dados de todas as empresas em um único relatório.
Após preencher os filtros, clique em
gerar
.
Importante:
Relatório baseado em Notas Fiscais
: considera apenas notas autorizadas pelo Sefaz e os impostos ICMS, IPI, ISS, COFINS e PIS.
Relatório baseado em Pedidos de Venda:
considera os pedidos com status Atendido e Aprovado e os impostos ICMS ST, IPI e ISS.
Opções do relatório gerado
Ao gerar o DRE, você pode usar as seguintes opções:
Imprimir:
gera uma versão para impressão do relatório.
Recalcular:
use esta opção para incluir lançamentos feitos com datas passadas, que não foram considerados no relatório original.
Observações:
Algumas informações no DRE são preenchidas automaticamente pelo ERP (pedidos de venda, notas fiscais, devoluções, impostos, CMV e comissões).
As demais informações dependem da configuração correta das categorias de receitas e despesas. O DRE é gerado com base nas contas lançadas no Caixa (exceto as canceladas).
Para saber mais sobre os campos do relatório, acesse o artigo:
Como funciona o relatório DRE?
Para ver exemplos de configuração, acesse:
Categorias de Receitas e Despesas
.
Histórico de custo dos produtos
Para verificar o histórico de custo de um item, siga os passos:
Acesse
menu > cadastros > Produtos
.
Clique sobre o produto que deseja consultar e selecione
editar
.
Acesse a aba
custos
.
Para adicionar um novo valor, utilize a opção
informar novo preço de custo
.
Nesta tela, você poderá verificar cada mudança de custo que o produto teve.
Importante:
as alterações de custos podem ocorrer de forma manual ou através da formação de preços, assim mantendo o histórico dos custos em cada período.
O
Preço de custo
, quando alterado pela formação de preços (em entradas de nota fiscal ou ordens de compra), é formado pelo seguinte cálculo:
O
Custo médio
, quando efetuado através da formação de preços nas entradas de nota fiscal ou em ordens de compra, o seu cálculo é:
sem título
artigo
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/relatorios-de-financas/faq-%E2%80%93-painel-de-contadores-olist

FAQ – Painel de Contadores Olist
A.
Por A .
Atualizado em 25/06/2026
1. O que é o Painel de Contadores da Olist?
É uma solução centralizada que permite que o seu contador, mediante sua autorização, acesse diretamente relatórios da sua empresa. O objetivo é facilitar o fechamento contábil mensal tanto para você quanto para a sua contabilidade.
2. Quais informações o meu contador poderá visualizar?
O acesso é restrito aos seguintes relatórios:
Notas fiscais de entrada e saída;
NFC-e;
Numeração de notas fiscais;
Contas a pagar e a receber;
Movimentações de caixa.
3. Meu contador terá acesso aos meus dados sem minha autorização?
Não. O contador só terá acesso aos relatórios após você enviar um convite pelo Sistema ERP da Olist ou autorizar o acesso através da plataforma.
4. Como faço para liberar o acesso da minha contabilidade?
O processo é simples e feito diretamente no seu ERP:
Acesse o módulo de
Finanças;
Clique em
Painel de Contadores;
Insira os dados do seu contador e clique em Enviar Convite.
Também é possível que o contador solicite o acesso diretamente pelo painel seguindo o seguinte passo a passo:
No painel, o contador deve informar os seguintes dados.
CNPJ
E-mail
Telefone
Em seguida, é só clicar em Solicitar Acesso.
Após isso, você pode logar no painel e aceitar a solicitação diretamente pelo sistema.
5. Existe algum custo adicional para utilizar o Painel de Contadores?
Não. Esta funcionalidade é totalmente gratuita para clientes Olist e também para os escritórios de contabilidade.
6. Posso liberar o acesso para mais de um profissional?
Sim. Caso sua empresa seja atendida por mais de um contador ou por uma equipe, você pode enviar convites individuais para cada profissional necessário.
7. Como posso revogar o acesso de um contador?
Para revogar o acesso de um contador no sistema, siga esses passos:
No módulo de finanças, acesse a aba Contadores.
Clique em Remover Contador.
Pronto! O contador foi removido do sistema.
8. Painel de Contadores está disponível para todos os clientes?
Atualmente, o acesso é exclusivo para clientes que possuem o Módulo Financeiro ativo, uma vez que o painel é alimentado pelas informações geradas por esse módulo.
9. Em quais formatos os relatórios são exportados?
Dentro do Painel, os relatórios de notas de entrada, notas de saída e NFC-e podem ser exportados em formato XML. Já os demais relatórios (numeração de notas fiscais, contas a pagar, contas a receber e relatório de caixa) são gerados em formato CSV.
10. Tem mais de uma loja? Envie um convite por vez.
Se você gerencia múltiplas empresas, siga este passo a passo para evitar erros de visualização do seu contador:
Envie o convite de
apenas uma
de suas lojas.
Aguarde o contador aceitar e criar a conta dele.
Após a confirmação do cadastro dele, envie os convites das demais lojas.
lista
painel
te
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/relatorios-de-financas/fluxo-de-caixa

Fluxo de Caixa
MO
Por Monique  O.
Atualizado em 19/03/2026
O fluxo de caixa registra o movimento financeiro da sua empresa, permitindo o acompanhamento das suas entradas e saídas futuras.
No ERP, o relatório de fluxo de caixa apresenta as previsões de receitas e despesas, ajudando você a programar e organizar as finanças da sua empresa.
É importante saber que os dados do relatório são baseados nos lançamentos de
contas a pagar
e a
receber
.
Pré-requisitos
Disponível nos planos
Construa, Impulsione, Domine e Protagonize.
Para gerar o relatório, siga os passos:
Acesse
menu > finanças > Relatórios
.
Na aba
geral
, clique em
Fluxo de Caixa
.
Escolha o
Período
, a
Visualização
(que define como os registros serão agrupados), o
Tipo do gráfico
e como
considerar as contas atrasadas
.
Clique em
gerar
.
O relatório gerado mostra os valores a receber por cliente e está disponível para
download, compartilhamento e impressão.
movimento financeiro
gestão financeira
Este artigo foi útil para você?
Sim
Não



Done.