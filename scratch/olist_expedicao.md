# Articles for https://ajuda.olist.com/expedicao

### SOURCE: https://ajuda.olist.com/expedicao/expedicao-configuracoes

Configurações da expedição
DR
Por Daiane Rocha
Atualizado em 26/05/2026
O módulo de Expedição ajuda você a organizar pedidos e notas fiscais para envio via transportadora ou Correios.
Com ele, você pode:
Criar agrupamentos de envio.
Acompanhar cada etapa conforme a forma de envio escolhida.
Automatizar o envio de pedidos para a expedição.
Antes de começar, configure o módulo para garantir que tudo funcione conforme o seu processo.
Se você já concluiu as configurações, consulte o artigo
expedição
para aprender como usar o recurso na prática.
Como configurar a expedição
Acesse
menu > configurações
.
Na aba
vendas
, encontre a seção
Expedição e Logística
.
Clique em
Configurações da expedição
.
4. Ajuste cada parâmetro conforme o seu modelo de operação:
Envio para a expedição
Defina se os pedidos serão enviados para a expedição
manualmente
ou
de forma automática
:
Manual:
o envio é feito pelo usuário, no pedido de venda ou na nota fiscal.
Automático ao salvar o pedido:
todo pedido salvo no ERP da Olist é enviado para a expedição.
Automático ao aprovar o pedido:
ao aprovar o pedido no ERP da Olist, ele segue automaticamente para a expedição.
Automático ao salvar a nota fiscal:
o envio ocorre ao salvar a nota fiscal.
Automático ao autorizar a nota fiscal:
o envio ocorre quando a NF é autorizada pela Sefaz.
Valor declarado na expedição
Escolha como o valor das mercadorias será tratado:
Sem valor declarado:
o agrupamento será gerado sem valor declarado.
Valor declarado da venda ou total dos produtos:
Se houver valor declarado informado na cotação de frete, ele será usado.
Se não houver, será considerada a soma dos valores dos produtos da venda.
O campo de valor declarado pode ser preenchido manualmente durante a cotação de frete.
Imprimir valor declarado nas etiquetas
Exibe o valor declarado nas etiquetas de expedição.
Válido somente para etiquetas
personalizadas
e
Correios
, pois são emitidas pelo ERP da Olist.
Mostrar valor das mercadorias:
Exibe o valor das mercadorias ao criar agrupamentos no módulo de Expedição.
Enviar código de rastreio por e-mail
Quando habilitado:
Um e-mail é enviado automaticamente ao concluir a expedição.
O pedido tem sua situação atualizada para
enviado
.
O e-mail vai para o endereço cadastrado no cliente.
Habilitar conferência de pedidos
Ativa a conferência de pedidos na visão por agrupamentos da expedição.
Imprimir pedidos cancelados na lista de coleta:
Quando ativado:
Pedidos cancelados que já estavam no agrupamento são identificados e exibidos na lista de coleta.
Isso evita que itens cancelados sejam separados por engano.
Disponível apenas quando a
conferência de pedidos
estiver habilitada.
Envio de e-mail do código de rastreio
Personalize o conteúdo dos e-mails enviados automaticamente (ou manualmente pelo menu de contexto):
Caminho
: Menu > configurações > aba “vendas” > Configurações da expedição > “
Enviar código de rastreio por e-mail ao concluir a expedição
”.
Assunto padrão:
título do e-mail (não inclua variáveis).
Mensagem padrão:
corpo do e-mail, com possibilidade de incluir variáveis do pedido.
Clique em
Exibir variáveis disponíveis
para ver as opções.
Copie e cole as variáveis no formato [VARIAVEL], como [NOME_CLIENTE].
Envio de e-mail de confirmação de entrega
Funciona da mesma forma:
Defina o
assunto padrão
(sem variáveis).
Personalize a
mensagem padrão
usando as variáveis listadas.
Exemplo de variável comum: [IDENTIFICACAO].
Envio de XML para transportadora:
Configure o e-mail que envia o XML da nota fiscal para a transportadora:
Assunto padrão
Mensagem padrão
, onde você pode usar variáveis para identificar o pedido.
Mantenha a variável [IDENTIFICACAO] para facilitar a identificação do XML.
5. Não esqueça de
salvar
as configurações.
viagem
ajustes
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/expedicao-utilizacao

Expedição - Utilização
A.
Por A .
Atualizado em 19/03/2026
O módulo de
Expedição
permite gerenciar pedidos e notas fiscais para envio através de
transportadoras
e
Correios
.
A expedição organiza os pedidos em
agrupamentos
, formando coletas que podem ser enviadas para os Correios ou transportadoras.
Com o módulo, você pode:
Orçar preços e prazos online para escolher a melhor forma de envio.
Definir o tipo de embalagem utilizada.
Atenção:
antes de começar, configure a expedição no módulo. Consulte o artigo
Expedição - Configurações
para mais detalhes.
Pré-requisitos
Disponível para todos os
planos exceto Plano PDV.
Utilização
Acessando o módulo
Ao abrir o módulo
Expedição
, você verá as expedições cadastradas nas abas:
Todas
Pendentes
Concluídas
Use os
filtros
para visualizar expedições por:
Agrupamentos
ou
Pedidos
Forma de envio
Mês de cadastro
As formas de envio disponíveis dependem das cadastradas na sua conta. Veja mais no artigo
Formas de Envio
.
Colunas da expedição
Número:
número sequencial da expedição.
Data de Emissão:
data de cadastro da expedição.
Forma de Envio:
tipo de envio utilizado.
Número de Objetos:
quantidade de itens na expedição.
Peso Bruto:
peso total da expedição.
Situação:
status atual da expedição.
Modos de visualização
Você pode visualizar as vendas de duas maneiras:
Visão por agrupamentos
Mostra as
coletas
geradas, com todos os pedidos e notas agrupados.
Visão por pedidos
Mostra os
objetos
(pedidos e notas) individualmente, permitindo:
Selecionar
lotes de registros
e marcá-los como
entregues no e-commerce
.
Acessar
Mais ações
para:
Enviar código de rastreio ao e-commerce
Enviar código de rastreio por e-mail
Marcar como entregue
Marcar como enviado no ERP
Imprimir DANFEs
Passo a passo para incluir uma expedição
Acesse
menu > vendas > Expedição > incluir expedição
.
Defina a forma de envio que você cadastrou.
Atenção!
Ao marcar a opção
Incluir pedidos e notas sem forma de envio
, serão listados todos os pedidos e notas fiscais que estão marcados com
Sim
no campo
Enviar para expedição
e que não têm uma forma de envio definida na venda.
Na seção
Pedidos da expedição
, selecione a opção
Pedidos disponíveis
para listar os pedidos que ainda não estão vinculados a nenhuma expedição. Ou, se preferir, busque
Pedidos específicos
usando o número ou a chave de acesso.
Agora, os pedidos e as notas fiscais serão listados para serem incluídos na expedição.
Pedidos com o marcador
Amarelo
ou Vermelho têm dados incompletos, ou
incorretos
, e por isso a expedição não pode ser gerada. Para editar, clique no pedido ou na nota e depois clique em
Editar
.
Em
Informações visíveis (↑↓↑)
, você pode habilitar as colunas que serão exibidas na tela.
Na tela seguinte, você verá os campos que devem ser preenchidos ou corrigidos. Após fazer as correções, clique em
Salvar
.
Agora,
Selecione
os pedidos e as notas fiscais e clique em
Salvar
.
Com a expedição salva, é possível
Concluir a expedição
ou
Imprimir as etiquetas dos correios
para os envios que serão despachados via
Correios
. Caso precise fazer alguma alteração nos pedidos ou na expedição antes de concluí-la, clique sobre o item e depois em
Editar
.
Na visão por
agrupamento
, você pode
Iniciar conferência de pedidos
. Para isso, clique no
menu de contexto (...)
de cada agrupamento identificado com o ícone de
conferência pendente
. Dentro do agrupamento, em
Mais ações
, você pode conferir os pedidos manualmente ou com bipagem.
Outra opção é marcar todos os agrupamentos que possuem a mesma forma de envio e clicar em
Conferir agrupamentos
.
Observações:
A conferência de pedidos estará disponível apenas para agrupamentos finalizados após a ativação da opção
Iniciar conferência de pedidos
. Veja como ativá-la no guia
como configurar a expedição
.
Com o parâmetro ativado, os pedidos cancelados em um agrupamento terão a linha destacada.
Pedidos cancelados não são removidos do agrupamento. Se forem lidos, um aviso informará que o pedido foi cancelado e não deve seguir para a expedição.
Se forem lidos mais pedidos do que a quantidade de volumes do agrupamento, um aviso informará que todos os pedidos já foram conferidos.
Incluindo uma expedição com envio aos Correios
No campo de
Filtro
, selecione a forma de envio
Correios
e depois clique em
Incluir expedição
.
Na seção
Pedidos da expedição
, selecione a opção
Pedidos disponíveis
para ver os pedidos que ainda não estão vinculados a nenhuma expedição. Ou, se preferir, busque
Pedidos específicos
usando o número ou a chave de acesso.
Se os seus pedidos de venda não tiverem a forma de frete definida (PAC, Sedex, etc.), selecione-os e, em seguida, clique em
Ações > Definir forma de frete
.
Selecione a forma de frete desejada e clique em
Definir forma de frete
para confirmar.
Clique em
salvar
para salvar a expedição com os objetos selecionados.
Pronto, sua expedição está criada! No cabeçalho, você verá a
Forma de envio
e o número da
Expedição
.
Na área
Objetos da expedição
, você encontra os itens que serão enviados nesse agrupamento, além da quantidade de
Pedidos e Notas
,
Peso
e
Objetos da expedição
.
Se precisar editar as informações de algum item, clique sobre ele e depois no botão
Editar
.
Observação:
a impressão das etiquetas segue a ordem crescente: primeiro as notas fiscais e depois os pedidos de venda.
Incluindo uma expedição com envio para Transportadora
No campo de
Filtro
, selecione a forma de envio
Transportadora
e, em seguida, clique em
Incluir expedição
.
Na seção
Pedidos da expedição
, selecione a opção
Pedidos disponíveis
para listar os pedidos que ainda não estão vinculados a nenhuma expedição. Ou, se preferir, busque
Pedidos específicos
usando o número ou a chave de acesso.
Se os seus pedidos de venda não tiverem a transportadora definida, selecione-os e, em seguida, clique em
Ações > Definir transportadora
.
Selecione a transportadora desejada e clique em
Definir transportadora
para confirmar.
Clique em
Salvar
para salvar a expedição com os objetos selecionados.
Pronto, sua expedição está criada! No cabeçalho, você verá a
Forma de envio
, a
Transportadora
definida e o número da
Expedição
.
Na área
Objetos da expedição
, você encontra os itens que serão enviados nesse agrupamento, além da
Quantidade de Pedidos e Notas
,
Peso
e
Objetos da expedição
. Se precisar editar as informações de algum item, clique sobre ele e depois no botão
Editar
.
Com a expedição já criada, na mesma tela é possível
Concluir expedição
,
Imprimir coleta
e
Imprimir etiquetas de transportadora
.
Observação:
a impressão das etiquetas e ordens de coleta segue a ordem crescente: primeiro as notas fiscais e depois os pedidos de venda.
Para enviar o XML das notas para a transportadora, acesse o menu
Mais ações
ao lado do botão
Imprimir Coleta
e clique em
Enviar XML das notas para transportadora
.
Atenção:
o envio do XML só será concluído se as
Notas Fiscais
dos pedidos estiverem autorizadas na SEFAZ.
Incluindo uma expedição com envio para o Mercado Envios
Observação:
o serviço do Mercado Envios está disponível para clientes que têm integração com Mercado Livre, Mercado Shops, Americanas Marketplace, AnyMarket, Tray (REST), Tray Corp e Plugg.To. Ao importar os pedidos do e-commerce, você pode gerenciar as vendas do Mercado Envios na Expedição.
Acesse o módulo de expedição, selecione a forma de envio
Mercado Envios
no filtro e clique em
Incluir expedição
.
Serão exibidos apenas os pedidos importados do e-commerce que foram enviados para a expedição.
Clique em
Salvar
para salvar a expedição com os objetos selecionados.
Depois, para gerar as etiquetas do Mercado Envios, clique em
Imprimir etiquetas Mercado Envios
.
Observações:
A impressão das etiquetas segue a ordem crescente: primeiro as notas fiscais e depois os pedidos de venda.
A escolha do modo de impressão (ZPL ou PDF) é feita diretamente no Mercado Livre. Para configurar, acesse
Vendas > Preferência de vendas
e, na seção
Mercado Envios
, escolha o modelo de impressão de etiquetas que você preferir.
Exemplo impressão etiquetas Mercado Envios:
Sua expedição foi gerada. No cabeçalho, você verá a
Forma de envio
e o número da
Expedição
.
Na seção
Objetos da expedição
, você encontra a lista de itens que serão enviados nesse agrupamento, a
Quantidade de Pedidos e Notas
,
Peso
e
Objetos da expedição
. Se precisar editar as informações, clique no item desejado e depois no botão
Editar
.
Observação:
O agrupamento da expedição é concluído de forma automática ao imprimir as etiquetas. Se você imprimir as etiquetas diretamente na plataforma, clique na opção
Marcar como concluída
no ERP para que a expedição não fique pendente na sua conta.
Editando pedidos na expedição
Acesse a expedição que você quer editar na aba
Pendentes
. Use a opção de
Filtro
para selecionar a forma de envio.
Clique no pedido ou nota fiscal que você quer editar e depois clique em
Editar
. Uma nova tela será aberta com os detalhes da venda.
Se você precisar mudar o endereço do cliente somente na expedição, clique no link
Editar endereço
. Essa alteração não afetará o cadastro do cliente.
Você também pode
Editar
as informações das
Embalagens
na área
Volumes
.
As informações da área
Logística
serão alteradas automaticamente no pedido de venda ou nota fiscal. Nesta seção, é possível mudar a forma de frete para expedições dos
Correios
.
Para definir as embalagens,
selecione
um ou mais itens, clique no menu
Ações
e depois em
Definir embalagens
. Defina o tipo de embalagem e as dimensões. Se você marcar a opção
Aplicar a todas as encomendas
, a embalagem será aplicada a todos os itens da expedição, inclusive aos que já tinham uma embalagem definida. Depois, clique em
Salvar
.
Ao finalizar, clique em
Salvar
para confirmar as alterações.
Para as expedições pendentes, você também pode
Incluir
um
Objeto avulso
e
Adicionar Pedidos de Venda ou Notas Fiscais
. Para isso, clique em
Incluir Pedido de Venda
ou
Incluir Nota Fiscal
, e informe o número do seu pedido para adicioná-lo à expedição.
Incluir objetos avulsos
Para incluir objetos avulsos, a expedição precisa estar na situação
Pendentes
.
Acesse a expedição que você quer editar na aba
Pendentes
. Use a opção de
Filtro
para selecionar a forma de envio.
Clique no botão
Editar
.
Em seguida, a opção para incluir o objeto será liberada.
Preencha os campos necessários:
Dados
,
Volumes
e
Logística
.
Depois de preencher, clique em
Salvar
.
Com o objeto já incluído na expedição, clique em
Fechar edição
.
Definir embalagens aos objetos
É possível definir as embalagens para os objetos no módulo de expedição.
Ao incluir uma expedição,
selecione
um ou mais itens.
Clique no menu
Ações
e depois em
Definir embalagens
.
Defina o tipo de embalagem e as dimensões que serão aplicadas aos itens selecionados.
Selecione a opção
Aplicar a todas as encomendas
para a embalagem ser aplicada a todos os itens da expedição, inclusive aos que já tinham uma embalagem definida.
Clique em
Salvar
.
Observação:
você também pode definir as embalagens em uma expedição que já existe. Para isso, acesse a aba
Pendentes
, clique na expedição que você quer,
selecione
os objetos e, no menu
Ações
, clique em
Definir embalagens
.
Como orçar preços e prazos, online com os Correios
Esta ferramenta busca preços e prazos de entrega diretamente nos Correios, além de verificar a disponibilidade de serviços para o CEP de destino dos seus pedidos ou notas. O cálculo pode ser feito para registros de expedição com situação
Pendente
e sem forma de frete definida.
Selecione
um ou mais pedidos, ou notas.
Clique em
Ações > Calcular preços e prazos
.
Na tela seguinte, você verá as opções disponíveis.
O botão
Marcar as formas de envio mais baratas
seleciona automaticamente as opções de menor valor, mas você também pode selecionar a que preferir manualmente.
Ao clicar em
Salvar alterações
, as formas de frete serão definidas para os registros da sua expedição.
Atenção:
o
marcador
vermelho
indica que o tipo de serviço não está disponível para a combinação de CEP de origem e destino, conforme as informações dos Correios.
Imprimir aviso de recebimento - AR
O Aviso de Recebimento (AR) é um formulário dos Correios que serve para comprovar a entrega de um pedido ao remetente.
Você pode imprimir o AR no ERP seguindo estes passos:
Acesse
menu > vendas > Expedição
.
Selecione a forma de envio
Correios
e clique na expedição que você quer.
Clique no
menu de contexto (...)
ao lado do pedido e depois em
imprimir AR
.
Atenção:
para conseguir o “Aviso de Recebimento”, o código de rastreamento deve estar cadastrado na nota fiscal.
Suspender entrega dos Correios
Observação:
você pode suspender a entrega de um pedido com os Correios se a nota fiscal estiver com a situação
Emitida DANFE
.
O serviço está disponível para pedidos e notas fiscais com a forma de envio
Correios
, que estão em expedições
Concluídas
e que ainda não têm a situação
Entregue
no ERP. Ao fazer isso, a entrega da mercadoria será cancelada pela integração com os Correios e o produto retornará para você.
Acesse
menu > vendas > Expedição > concluídas > Correios
.
Clique na expedição que você quer.
Clique no
menu de contexto (...)
ao lado do número de identificação do pedido e depois em
Suspender entrega nos correios
.
Imprimir declaração de conteúdo dos Correios
Ao incluir uma expedição, você pode imprimir a declaração de conteúdo. Para isso, clique no
menu de contexto (...)
ao lado do número do pedido ou da nota fiscal e depois em
Imprimir declaração de conteúdo
.
Também é possível imprimir a declaração de todos os itens da expedição de uma vez. Para isso, salve a expedição, acesse o
menu de contexto (...)
ao lado do botão
Editar
e clique em
Imprimir declaração de conteúdo
.
Logística Reversa Correios
Acesse
menu > vendas > Expedição > Correios > concluídas
.
Clique na expedição que você quer.
Com a expedição aberta, clique no
menu de contexto (...)
ao lado do número do item e selecione
Solicitar código de logística reversa
.
Em seguida, selecione o
Código do serviço da logística reserva
. Se precisar, altere o
Valor declarado
.
Marque a opção
Enviar e-mail com o código de logística reversa retornado pelos correios
para o cliente receber os dados por e-mail.
Clique em
Solicitar
.
Após fazer a solicitação, um aviso com o
Código da logística reversa
será exibido.
Após gerar o código, o item na expedição será identificado com um marcador.
Marcar pedidos como entregues
Ao marcar um pedido como
Entregue
, a situação é atualizada no e-commerce de origem e, em seguida, no ERP. Se a expedição foi criada a partir de um pedido de venda no ERP, ele será marcado como
Entregue
somente no sistema.
Acesse
menu > vendas > Expedição > Correios > concluídas
.
Clique no
menu de contexto (...)
ao lado da expedição e, depois, clique em
Marcar pedido como entregue
Marcar pedidos como enviados no ERP
Atenção:
pedidos com a situação
Entregue
no ERP não podem ser atualizados para o status
Enviado
.
o marcar um pedido como
Enviado
, sua situação será atualizada de forma automática.
Você pode marcar os pedidos como
Enviados
individualmente ou todos de uma vez:
Para marcar individualmente:
Acesse
Vendas > Expedição > Visão por pedidos
, clique no
menu de contexto (...)
ao lado do número da expedição e clique em
Marcar pedido como enviado no ERP
.
Para marcar todos os pedidos de uma vez:
Acesse
Vendas > Expedição > Visão por agrupamentos
, clique no
menu de contexto (...)
ao lado do número da expedição e clique em
Marcar pedidos como enviados no ERP
.
Imprimir ordem de coleta
Você pode imprimir a ordem de coleta no módulo de expedição para envios por
Transportadora
ou outros integradores, como Americanas Entregas, Magalu Entregas, Olist e outros.
Acesse
menu > vendas > Expedição
.
Selecione a forma de envio desejada.
Encontre a expedição para a qual você quer imprimir a coleta e clique no
menu de contexto (...)
e depois em
Imprimir coleta
.
Observação:
ao concluir a conferência de vários agrupamentos, a lista de coleta será impressa com todos os pedidos e notas fiscais de cada um dos agrupamentos conferidos.
Impressão da DANFE em lote
Você pode imprimir as DANFEs em lote no módulo de expedição, tanto na visão por
Agrupamentos
quanto por
Pedidos
.
Para imprimir por agrupamento:
Acesse
Vendas > Expedição > Visão por agrupamentos > Concluídas
.
Selecione a expedição e clique em
Imprimir DANFEs
.
Para imprimir por pedidos:
Acesse
Vendas > Expedição > Visão por pedidos > Concluídas
.
Marque os pedidos.
Clique em
Mais ações > Imprimir DANFEs
.
Relatório de expedição
Este relatório mostra todas as expedições que foram enviadas pelo ERP. Você pode usar filtros por período, forma de envio, forma de frete (quando uma forma de envio é selecionada) e situação, além de ordenar por data ou cliente.
Acesse
menu > vendas > Relatórios
.
Na aba
Expedição
, clique em
Relatório de expedição
.
Defina os filtros que você quer e clique em
Gerar
.
O relatório gerado pode ser impresso ou baixado.
Observação:
se você quiser, pode informar a forma de envio (Correios ou Transportadora) na seção
Transportador/Volumes
da nota ou pedido. Se você não fizer isso, eles aparecerão ao criar uma
Expedição
, desde que a opção
Incluir pedidos e notas sem forma de envio
esteja marcada.
Configurar formas de envio
As instruções para configurar as formas de envio na sua conta constam no artigo
Formas de Envio
.
Como configurar integração com a Intelipost
As instruções para usar o serviço de cotação da Intelipost constam no artigo
Integrar com a Intelipost
.
Etiquetas
Configurar etiquetas dos Correios (impressão por página)
Acesse
menu > Configurações
.
Clique na aba
Geral
e, depois, em
Configurações das Etiquetas
.
No campo
Etiqueta padrão para correios
, escolha entre
Página
ou
Bobina oficial
no
Modo de impressão
.
No campo
Modelo de etiqueta por impressão
, selecione
4 por página
ou
2 por página
.
Se você quiser que o nome impresso na etiqueta seja o nome fantasia do contato, escolha
Sim
no campo
Utilizar nome fantasia
.
Configurar etiquetas dos correios (impressão por bobina)
Acesse
menu > configurações
.
Clique na aba
geral
e, depois, em
Configurações das etiquetas
.
No campo
Etiqueta padrão para correios
, selecione o
Modo de impressão
como
Bobina oficial
.
A única configuração possível é a opção de exibir o nome fantasia na etiqueta.
Observação:
o modelo de impressão
Bobina (compatibilidade)
é mais simples, sem o logo da empresa e informações adicionais.
Etiquetas dos correios (impressão térmica ZPL)
A impressão no formato ZPL no ERP foi feita para facilitar e agilizar a impressão de etiquetas em impressoras térmicas.
Para usar esta funcionalidade, você deve abrir um chamado no ERP e solicitar a liberação do módulo
Etiquetas Impressão Térmica
na sua conta.
Configuração:
Acesse
menu > configurações > geral > Configurações das etiquetas
.
No campo
Etiqueta padrão para correios
, selecione a opção
Impressora térmica ZPL
em
Modo de impressão
.
Em seguida, escolha
Sim
ou
Não
no campo
Utilizar nome fantasia na impressão das etiquetas
.
Clique em
Salvar
.
Logo alternativo para impressão ZPL
Você pode adicionar a versão em preto e branco do logo da sua empresa para melhorar a qualidade de impressão das etiquetas ZPL.
Acesse
menu > configurações > geral > Configurações das etiquetas
.
Clique no botão
Procurar arquivo
para adicionar a versão em preto e branco do seu logo.
Clique em
Salvar
.
Impressão do arquivo ZPL no Windows
O primeiro modo de impressão é via
Zebra Setup Utilities
.
Você pode fazer o download do programa no site da Zebra.
Para imprimir no ERP, siga os passos do GIF abaixo:
Observação:
você pode imprimir as etiquetas dos Correios diretamente na
Expedição
, nos
Pedidos de Venda
ou nas
Notas Fiscais
.
Outra forma de imprimir o arquivo .txt é usando a linha de comando.
Exemplo: copy caminho\da\label\nome-da-label.txt \\nome-do-host\share-name-da-impressora.
Realizar a configuração das etiquetas para transportadora (impressão por página)
Acesse
menu > configurações
.
Clique na aba
Geral
e, depois, em
Configurações das etiquetas
.
No campo
Etiqueta padrão para transportadora
, você pode fazer as seguintes configurações:
Modo de impressão:
selecione
Página
.
Layout da etiqueta:
selecione o modelo de impressão que você quer usar:
4 por página
,
2 por página
ou
4 por página (compatibilidade)
.
Código de barras:
defina como o código de barras será impresso. As opções são
Com base no CEP
,
Conforme forma de envio
ou
Não imprimir
.
Informações em destaque:
selecione a informação que você quer destacar na etiqueta, como
Número do documento
e
Peso e Volumes
.
Utilizar nome fantasia:
se você quiser usar o nome fantasia do cliente na etiqueta, selecione
Sim
.
Realizar a configuração das etiquetas para transportadora (impressão por bobina)
Acesse
menu > configurações
.
Clique na aba
geral
e, depois, em
Configurações das etiquetas
.
No campo
Etiqueta padrão para transportadora
, você pode fazer as seguintes configurações:
Modo de impressão:
selecione
Bobina
.
Orientação:
selecione entre
Retrato
ou
Paisagem
.
Layout da etiqueta:
escolha o modelo de etiqueta que você quer usar:
4 por página
,
2 por página
ou
4 por página (compatibilidade)
.
Incluir modelo:
se você precisa de um modelo de etiqueta personalizado, clique em
Incluir modelo
.
Código de barras:
defina como o código de barras será impresso. As opções são
Com base no CEP
,
Conforme forma de envio
ou
Não imprimir
.
Informações em destaque:
selecione a informação que você quer destacar na etiqueta, como
Número do documento
e
Peso e Volumes
.
Utilizar nome fantasia:
se você quiser usar o nome fantasia do cliente na etiqueta, selecione
Sim
.
Observações:
Ao escolher a opção
Conforme forma de envio
no campo
Código de barras
, você pode definir como ele será gerado nas configurações da forma de envio.
O modelo de impressão
Bobina (compatibilidade)
é mais simples, sem informações adicionais.
Se você quiser usar o novo formato de etiquetas para transportadoras, acesse o guia
Utilizar novo layout de etiquetas para transportadoras
.
Envios
A funcionalidade do envio de dados da chave de acesso está disponível para as seguintes integrações:
Magento
.
Americanas Marketplace
.
AnyMarket
.
Tray (SOAP e REST)
.
Plugg.To
.
VTEX
.
IntegraCommerce
.
Mercado Livre
.
iSET
.
Enviar os pedidos ou notas para expedição
Acesse
menu > configurações
.
Clique na aba
vendas
e, depois, em
Naturezas de operação
.
Escolha a natureza de operação que você quer editar.
Na seção
Configurações avançadas
, selecione
Sim
no campo
Enviar para expedição
para que os itens sejam enviados de forma automática.
Se você estiver emitindo uma nota fiscal ou criando um pedido de venda, e a natureza de operação não estiver configurada, verifique se o campo
Enviar para expedição
está marcado como
Sim
.
Observação:
você pode informar a forma de envio (Correios ou Transportadora) na seção
Transportador/Volumes
da nota ou pedido. Caso você não faça isso, os pedidos e notas aparecerão ao criar uma
Expedição
, desde que a opção
Incluir pedidos e notas sem forma de envio
esteja marcada.
Enviar e acompanhar código de rastreio
Correios
Acesse
menu > vendas > Expedição
.
Selecione a forma de envio
Correios
.
Clique na aba
Concluídas
.
Clique no
menu de contexto (...)
ao lado do número da expedição e, depois, em
Enviar códigos de rastreio por e-mail
.
Transportadora
Acesse
menu > vendas > Expedição
.
Selecione a forma de envio
Transportadora
.
Clique na aba
Concluídas
.
Clique no
menu de contexto (...)
ao lado do número da expedição e, depois, em
Enviar códigos de rastreio por e-mail
.
Observação:
você pode preencher apenas o campo
URL de rastreio
para envios por transportadoras. O link será incluído no corpo do e-mail enviado ao cliente.
Enviar XML para Transportadora
Acesse
menu > vendas > Expedição
.
Selecione a forma de envio
Transportadora
.
Clique na aba
Concluídas
.
Clique no
menu de contexto (...)
ao lado do número da expedição e, depois, em
Enviar XML das notas para Transportadora
.
viagem
uso
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/modo-de-impressao-das-etiquetas-pdf-ou-zpl

Modo de impressão das etiquetas (PDF ou ZPL)
A.
Por A .
Atualizado em 09/12/2025
Aprenda a selecionar o modo de impressão ideal para suas etiquetas entre PDF ou ZPL.
Correios
Para a integração dos
Correios Sigep Web
, acesse
menu > configurações > aba geral > Configurações das etiquetas
e clique na opção
Etiqueta padrão para correios
.
No campo
Modo de impressão
, selecione a opção desejada:
Página:
se aplica para impressoras padrões com impressão no tamanho de folha A4;
Bobina (Oficial e compatibilidade):
se aplica para impressoras térmicas com impressão no tamanho 10 x 15 cm;
Impressora Térmica (ZPL)
: se aplica para impressoras térmicas que precisam do arquivo em ZPL para impressão no tamanho 10 x 15 cm.
Caso a modalidade escolhida seja Página ou Bobina (Oficial e compatibilidade), será possível incluir informações da nota fiscal na etiqueta. Para isso, marque a opção
Incluir DANFE Simplificada
. Para exibir o valor da NF na etiqueta, selecione
Exibir valor total da nota fiscal
.
Observação
: esse modelo de etiqueta unificada está disponível apenas para PDF (ZPL ainda não contempla).
Total Express
Nesta transportadora, escolha o formato da etiqueta no momento da expedição. Clique em
Download da etiqueta ZPL
para baixar o arquivo da Total Express em ZPL (.txt) ou em
Imprimir etiquetas de transportadora
para gerar no modelo padrão da forma de envio.
Jadlog, Transportadora e Customizado
Para essas formas de envio, não há configuração padrão para escolher o formato das etiquetas, impossibilitando a geração em ZPL. Durante a impressão, as etiquetas seguirão o modelo definido nas configurações da forma de envio.
Integrações
Acesse
menu > início > Integrações
e abra edição a integração desejada.
Para as integrações da
Americanas Marketplace
e
Netshoes,
acesse a aba
Outros
, seção
Configurações Adicionais
e selecione a opção desejada no campo
Método de impressão de etiquetas.
Para as integrações
Anymarket, Casas Bahia Marketplace, Tray e Olist
acesse a aba
Outros,
seção
Configurações Adicionais
e selecione a opção desejada no campo
Tipo da impressão de etiqueta.
Para as integrações
Amazon e Magalu Marketplace
, acesse a aba
pedidos
, seção
Fluxo de Pedidos
e selecione a opção desejada no campo
Método de impressão de etiquetas
.
Para o
Mercado Livre
a configuração é feita no painel da plataforma.
Acesse
menu > vendas > preferências de venda,
na seção
Configurações de impressão de etiquetas e arquivos de envio
e selecione a opção desejada no campo
Tipo de Impressora.
Selecionando
Impressora normal
, a etiqueta será gerada em PDF, podendo escolher o tamanho entre A4 e 10 x 15 cm.
E selecionando
Impressora térmica
a etiqueta será gerada em tamanho 10 x 15 cm, podendo escolher entre os formatos PDF ou ZPL (.txt).
Para a
Shopee
a configuração também é feita no painel da plataforma.
Na central do vendedor da Shopee, acesse
menu lateral > envio > configurações de envio
e no parâmetro
Impressora Térmica
poderá escolher deixar o mesmo ativado ou não.
Desativado
, a Shopee gera as etiquetas em modelo A4 PDF,
ativado
a Shopee gera a etiqueta em modelo ZPL tamanho de 10 x 15 cm.
Gateways
Para o gateway
Frete Rápido
, poderá escolher o tamanho de impressão das etiquetas através do campo
Modelo da etiqueta para impressão
encontrado nas configurações do gateway no ERP. Mas o formado de geração do arquivo não poderá ser escolhido, impossibilitando a geração das etiquetas em ZPL.
E os demais gateways
Datafrete, Flixlog, Frenet, Kangu, Loggi e Melhor Envio
, as configurações de formato da impressão das etiquetas deve ser verificada nos painéis administrativos dos mesmos. No ERP, apenas recebemos o arquivo disponibilizado pelo gateway e executamos a impressão do mesmo conforme dados recebidos.
Após realizar as configurações mencionadas, as próximas etiquetas geradas serão conforme ajuste realizado.
impressão etiquetas
pdf zpl
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/declaracao-de-conteudo-eletronica-dc-e

Declaração de Conteúdo Eletrônica (DC-e)
A.
Por A .
Atualizado em 16/04/2026
A
Declaração de Conteúdo Eletrônica (DC-e)
é o documento digital que substitui a declaração de conteúdo em papel para envios de mercadorias que não exigem Nota Fiscal. Ela formaliza o transporte de itens entre remetente e destinatário, integrando os dados diretamente aos órgãos fiscalizadores e transportadores.
Atenção: atualização importante (abril/2026)
A impressão da DACE passou por um ajuste técnico. Agora, para algumas logísticas, múltiplos documentos podem ser agrupados automaticamente em um único PDF para facilitar a impressão.
Não há mudanças no processo de expedição — apenas na forma como o arquivo é gerado.
O que muda com a obrigatoriedade da DC-e
Por determinação do CONFAZ, a partir de
06/04/2026
, a Declaração de Conteúdo em papel deixou de ser aceita.
A partir dessa data:
As encomendas devem estar acompanhadas de:
NF-e (DANFE)
, quando houver, ou
DC-e (DACE)
, quando não houver nota fiscal
A emissão da DC-e é feita pela
transportadora
, não pelo ERP
O ERP apenas realiza a solicitação e disponibiliza o documento para visualização e impressão
Como funciona por forma de envio
Correios
Ao utilizar o
ERP
, você não precisa realizar o preenchimento manual ou externo. O sistema está integrado aos Correios, permitindo que as informações do pedido sejam transmitidas eletronicamente no momento da expedição.
Para
emitir
DCe para pedidos sem notas no Correios:
Acesse menu
menu  > configurações > aba vendas
Selecione
Formas de envio > Correios
Na seção Configurações de adicionais marque a opção
Utiliza declaração de conteúdo:
Sim:
ao marcar como "Sim", expedições concluídas sem nota fiscal, emitem DC-e no Correios.
Não:
pedidos sem Nota fiscal, passam a exigir a informação da NFe obrigatoriamente. Não há como enviar pedidos sem nota para o Correios a partir de 06/04/2026.
Importante:
somente quando a opção de declaração estiver como
“sim”
que a requisição para emissão da DC-e vai acontecer
Atenção:
qualquer erro na emissão da DC-e, o correios deve enviar um e-mail com detalhes. Qualquer dúvida você, deverá falar diretamente com o Correios.
Exemplo de fluxo no sistema
O processo ocorre de forma automatizada após a configuração da sua conta de logística. Quando você gera a etiqueta de envio, o
ERP
comunica os dados do conteúdo (descrição, quantidade e valor) diretamente para a base de dados dos Correios.
O sistema vincula o número da DC-e ao código de rastreio, garantindo que a fiscalização tenha acesso às informações de forma digital durante todo o trajeto.
Ainda é necessário imprimir um documento para acompanhar o pacote. Embora os dados sejam eletrônicos, a legislação exige que uma representação física da declaração (ou a etiqueta com o código de acesso) esteja fixada na parte externa da embalagem.
Melhor Envio e Frenet
A DC-e é emitida automaticamente para pedidos sem nota
Não é necessário realizar configurações adicionais
O documento é retornado via API e pode ser impresso no ERP
Atenção:
no Melhor Envio, o retorno pode ser assíncrono, podendo levar mais tempo para disponibilização da DACE.
Logística reversa
Se o pedido possuir NF-e → a chave da nota será utilizada
Se não possuir → será solicitada a emissão da DC-e pelos Correios
A impressão da DACE deve ser realizada diretamente pelos Correios.
SuperFrete
A SuperFrete está se adequando às novas exigências dos Correios. Com isso, a
Declaração de Conteúdo em papel deixará de ser aceita
, assim como já ocorre com outros parceiros logísticos.
Confira como os envios passam a funcionar a partir de
06/04
:
O que muda na prática
1. Limite para envios com Declaração de Conteúdo (DC)
O valor máximo declarado será de
R$ 5.000,00
.
Para valores acima desse limite, o envio só poderá ser feito com
NF-e
, quando disponível para a transportadora.
2. Uso de NF-e nas transportadoras
No momento, envios com
NF-e estão disponíveis apenas pelos Correios
.
As transportadoras
Loggi e Jadlog ainda não suportam esse modelo
na SuperFrete.
3. Edição da Declaração de Conteúdo
Após o pagamento e emissão da etiqueta,
não será possível editar a DC
.
Revise todas as informações antes de finalizar o envio.
4. Tipo de documento para envios com DC
Envios com Declaração de Conteúdo (em qualquer transportadora) serão realizados
somente com CPF
.
Mesmo que sua conta esteja vinculada a um CNPJ, essa regra será aplicada.
O que você precisa fazer
Verifique o valor da mercadoria antes de escolher o tipo de envio.
Confirme se a transportadora selecionada aceita NF-e, caso necessário.
Revise os dados da DC com atenção antes de gerar a etiqueta.
Essas mudanças garantem mais conformidade com as exigências logísticas e evitam problemas no envio dos seus pedidos.
Atenção:
no momento a SuperFrete não retorna impressão de DACE dos pedidos, é necessário acessar a plataforma de logística para imprimir o documento.
Como funciona a emissão da DC-e
A solicitação da DC-e ocorre automaticamente ao concluir a expedição de pedidos sem nota fiscal.
Importante:
o ERP não realiza a emissão da DC-e. A transportadora é responsável por gerar o documento e retorná-lo via integração.
Como imprimir a DACE
Para imprimir o documento:
Vá até a
expedição concluída
clique em
“mais ações” > imprimir DACE.
Escolha entre os modelos:
Completa, Térmica ou Resumida.
Clique em
confirmar.
Essa opção também estará disponível nos pedidos de venda, e a
DACE é retornada pelo próprio Correios.
Importante:
para algumas logísticas, quando houver múltiplas DACE's, os documentos serão automaticamente agrupados em um único arquivo para facilitar a impressão.
Possíveis erros na emissão da DC-e
A emissão pode ser rejeitada pela transportadora. Os principais pontos de atenção são:
Presença de caracteres especiais na descrição do produto
Bairro não preenchido no endereço
CPF ou CNPJ do destinatário ausente
Valor total do pedido acima do limite permitido
Regra de valor total
A SEFAZ pode considerar o valor total multiplicado pela quantidade de itens.
Exemplo:
Pedido com 5 itens totalizando R$ 25.000,00
→ Considerado: R$ 125.000,00
→ Acima do limite → DC-e não será emitida
Atenção:
A emissão da DC-e é feita pela
transportadora.
O ERP apenas solicita e disponibiliza o documento.
Mesmo após revisar os dados,
em caso de erro, o suporte deve ser feito diretamente com a logística responsável.
declaração
conteúdo
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/printnode

PrintNode
MO
Por Monique  O.
Atualizado em 19/03/2026
O
PrintNode
nada mais é do que um facilitador para o processo de impressão. O uso dele pelo ERP se dá através da automatização de impressões de notas e etiquetas, realizados no módulo de
Separação
.
Pré-requisitos
Disponível para os plano
Impulsione,
Domine e Protagonize.
Ter um plano contratado junto à
PrintNode
.
Extensão
PrintNode
instalada na conta.
Para configurar o mesmo, instale a extensão
PrintNode
disponível em
Início > Loja de extensões
e depois, siga os passos abaixo
:
Conheça a integração do ERP com o PrintNode
Configurações
Para iniciar com a configuração do PrintNode, primeiramente, você deverá criar uma conta na
plataforma
e selecionar o seu plano.
Concluído este primeiro passo, realize o
download
do aplicativo que fará o gerenciamento de suas impressoras.
Realize a instalação do aplicativo e faça o login utilizando a conta criada anteriormente
Importante:
ao instalar o PrintNode no
Windows
, a opção "
install as a service
" deve permanecer
desmarcada
, de forma a se evitar problemas de compatibilidade ao realizar as impressões.
Na aba
Printers
de seu aplicativo, verifique se as impressoras que deseja utilizar estão sendo exibidas e desmarque aquelas que não deseja utilizar.
Para configurar a integração que será utilizada no ERP, primeiramente, acesse o
painel online do PrintNode
.
Feito este processo, acesse o menu
API Keys
e crie uma nova chave. Para isso, insira sua senha e a descrição da chave que deseja utilizar.
Em
API Key
, copie o código da chave recém criada e acesse o ERP.
No menu presente em
Início > Configurações > Geral > Impressão automática
, insira a
API Key
e clique em
Testar integração
.
Caso o processo tenha sido realizado, os campos
Impressão da DANFE
e
Impressão de etiquetas de envio
serão disponibilizados para seleção das impressoras instaladas na máquina que está rodando o aplicativo PrintNode.
Depois que a configuração for realizada, acesse:
Vendas > configurações > Configurações da separação
No campo
imprimir automaticamente, ao finalizar embalagem
, selecione se deseja imprimir a DANFE e as etiquetas de envio de forma automática.
Caso selecione para imprimir a DANFE automaticamente, verifique o campo
Layout para impressão automática da DANFE
e selecione o layout que deseja utilizar na impressão das notas.
Importante:
para que a impressão ocorra corretamente de forma automática, é necessário que as vendas já estejam dentro de um agrupamento do módulo de
Expedição
e já possuam as suas notas fiscais criadas no ERP e autorizadas no Sefaz.
Configurando o PrintNode no Mac OS
Para impressões com o PrintNode utilizando no sistema operacional Mac OS, é necessário configurar também a "
impressão raw
". O passo a passo você encontra em
configurando a impressão raw para Mac OS
, quando você deve configurar a impressora com o drive do fabricante raw.
Após configuração da impressora, é necessário configurá-la seguindo os passos disponíveis no
PrintNode
.
Formas de envio integradas pelo PrintNode
As formas de envio e gateways disponíveis para uso com o PrintNode são:
Amazon DBA
Americanas Entregas
Correios
Envios da Olist
Envvias
Frete rápido
Jadlog
Magalu Entregas
Magalu Entregas por Netshoes
Mercado Envios
Olist
Shopee Envios
Shein Envios
Total Express
Formas de envio do tipo Transportadora e Customizada.
As formas de envio que
não
costumam ter integração direta com o PrintNode são aquelas onde a etiqueta
não é gerada no ERP da Olist
, mas sim em um sistema externo (por exemplo, dentro do painel da transportadora ou do
marketplace
). Nesses casos, você precisa:
Acessar o sistema da transportadora/marketplace.
Gerar e baixar o PDF da etiqueta.
Imprimir o PDF manualmente.
Isso geralmente inclui algumas integrações diretas com transportadoras específicas ou
marketplaces
(como etiquetas do Mercado Livre ou Amazon geradas
apenas
nos painéis deles, e não via ERP da Olist).
Impressão automática de etiqueta de envio+nota fiscal com o ERP
Com o
PrintNode
, a rotina de separação e expedição no ERP torna-se ainda mais eficiente. Ao concluir a embalagem dos produtos, a plataforma integra-se perfeitamente para imprimir automaticamente a etiqueta de envio e a nota fiscal, simplificando todo o processo. Essa integração proporciona aos usuários uma experiência fluida e livre de complicações, garantindo maior agilidade e precisão nas operações de logística.
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/erro-ao-obter-etiquetas-de-envio

Erro ao obter etiquetas de envio Shopee
A.
Por A .
Atualizado em 22/04/2026
Erro ao obter etiquetas de envio:
“Não foi possível obter as etiquetas em sua plataforma e-commerce. Problema nos parâmetros enviados. Wrong parameters, detail: order_list must contain at least 1 item.”
Esse erro ocorre quando o sistema tenta buscar etiquetas de envio, mas o pedido já está em um status que não permite mais essa ação na
Shopee
.
No cenário mais comum:
O pedido de venda está com a situação
“Shipped” (Enviada)
na Shopee
Quando o pedido já foi marcado como enviado, a própria Shopee
bloqueia a geração de etiquetas via integração
Por isso, o retorno indica que não há pedidos válidos para gerar etiquetas (
order_list must contain at least 1 item
)
Como resolver
Nesses casos, a geração da etiqueta
deve ser feita diretamente no painel da Shopee.
Siga este caminho:
Acesse o painel da Shopee.
Localize o pedido em questão.
Gere ou reimprima a etiqueta manualmente.
Importante:
essa não é uma falha do ERP, mas sim uma
validação da própria Shopee.
Após o pedido estar como
enviado
, não é mais possível obter etiquetas via integração. Para evitar esse cenário, o ideal é
gerar as etiquetas antes de alterar o status do pedido
falha
problema
Este artigo foi útil para você?
Sim
Não

### SOURCE: https://ajuda.olist.com/expedicao/como-imprimir-etiquetas-do-mercado-envios

Como imprimir etiquetas do Mercado Envios
A.
Por A .
Atualizado em 27/04/2026
Se você utiliza o
Mercado Envios
(coleta ou agência), o ERP da Olist permite que você gerencie a impressão das etiquetas de envio diretamente pelo módulo de expedição, sem precisar acessar o painel do Mercado Livre para cada venda.
Pré-requisitos:
Antes de imprimir, certifique-se de que:
A integração com o Mercado Livre está ativa.
As ordens de venda ou notas fiscais já foram enviadas para o módulo de
Expedição
.
O pedido de venda no ERP está vinculado corretamente ao anúncio do Mercado Livre.
Passo a Passo para Impressão
Acesso ao Módulo
Vá ao menu principal e acesse
v
endas > Expedição
. No módulo de expedição, você visualizará os pedidos prontos para o envio.
Gerando o Agrupamento
Para o Mercado Envios, o ERP trabalha com o conceito de agrupamento por transportadora:
Selecione os pedidos que possuem a forma de envio
Mercado Envios
.
Clique em
Gerar agrupamentos
(ou organizar por transportadora).
O sistema irá validar as informações e preparar os documentos.
Impressão da Etiqueta
Com o agrupamento criado:
Clique sobre o agrupamento do Mercado Envios.
Selecione a opção
Imprimir Etiquetas
.
O ERP abrirá uma nova aba com o layout oficial do Mercado Livre (formato PDF ou ZPL para impressoras térmicas, dependendo da sua configuração).
Se ao clicar para imprimir a etiqueta não for gerada, verifique:
Nota Fiscal:
o Mercado Envios exige que a NF-e esteja emitida e autorizada para liberar a etiqueta.
Pop-ups:
verifique se o seu navegador não está bloqueando janelas pop-up, pois a etiqueta abre em uma nova aba.
Lembre-se que as etiquetas do Mercado Envios possuem
prazo de validade.
Evite imprimi-las com muita antecedência se não for despachar o produto no mesmo dia ou no dia seguinte.
Configuração Automática
Para ganhar tempo e evitar erros manuais, você pode ajustar o comportamento do sistema:
Impressão em Massa:
você pode selecionar múltiplos agrupamentos e imprimir todas as etiquetas de uma só vez.
Sincronização de Status:
ao imprimir a etiqueta e finalizar a expedição no ERP, o sistema comunica automaticamente ao Mercado Livre que o produto está "Pronto para envio", atualizando o status da venda na plataforma.
Configuração de Impressora:
se você usa impressoras térmicas (Zebra, Argox, Elgin), certifique-se de que o formato de impressão nas configurações de expedição do ERP está definido como
ZPL
ou o formato correspondente para etiquetas autocolantes.
etiquetas
impressão
Este artigo foi útil para você?
Sim
Não



Done.
