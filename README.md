# Loja Next.js + Shopify (headless)

Produtos, coleções, imagens, preços, estoque e pedidos continuam no **painel admin da Shopify**.
Este site lê o catálogo pela **Storefront API** e envia o cliente ao **checkout da Shopify**.

## 1. Token da Storefront API (Client ID/Secret não servem para o site)
1. Admin Shopify → Configurações → Apps e canais de vendas → instale **Headless**.
2. Crie um storefront e copie o **Token de acesso público**.
3. Em "Gerenciar escopos da Storefront API", marque: produtos/coleções, carrinho/checkout e **conteúdo** (páginas).
4. Publique produtos e coleções no canal **Headless**.

## 2. Rodar
```bash
cp .env.example .env.local   # preencha domínio e token
npm install
npm run dev                  # http://localhost:3000
```

## 3. Personalizar
- `site.config.js`: nome, faixa de anúncio, faixa colorida, hero, títulos e rodapé.
- **Menu e blocos da home vêm das coleções da Shopify.** A 1ª coleção vira o hero, as 2 seguintes os blocos grandes,
  as 3 seguintes os blocos verticais. A imagem de cada bloco é a da coleção (ou do 1º produto dela).
  Para escolher o hero, informe o handle da coleção em `hero.collection`.
- Links do rodapé e "Ajuda" abrem **Páginas da Shopify** (Loja virtual → Páginas) pelo handle:
  `duvidas`, `entregas`, `devolucoes`, `pagamentos`, `contato`, `sobre`, `privacidade`, `termos`.
  Crie as que quiser usar e remova as demais de `site.config.js`.

## Carrinho
As ações (`app/actions.js`) devolvem o carrinho atualizado da Shopify e a interface usa esse retorno
(`components/CartProvider.js`) para atualizar contador, itens e subtotal na hora. Erros da Shopify
(estoque, variante indisponível) aparecem na tela.

## Segurança
Nunca coloque o Client Secret (`shpss_...`) no código. Se ele foi exposto, rotacione no Dev Dashboard.

## Variantes (Cor / Tamanho) e checkout
O site lê as **opções do produto** direto da Shopify. Para o checkout mostrar exatamente o item certo:
1. No produto, em **Variantes**, crie as opções com os nomes `Cor` e `Tamanho`
   (o site reconhece "Cor" para exibir as miniaturas das cores).
2. **Associe uma imagem a cada variante**: abra a variante (ex.: Vermelha / M) → clique na miniatura da variante →
   escolha a mídia correspondente (a camiseta vermelha). Essa mesma imagem aparece na página, no carrinho e no checkout.
3. Defina preço e estoque de cada combinação. Combinações sem estoque aparecem riscadas.
4. O carrinho envia o **ID da variante** à Shopify, então o checkout lista nome, "Vermelha / M", quantidade e preço corretos.
Idioma e moeda do checkout: Configurações → Idiomas e Mercados (ative Português e Brasil).

## Comportamento do carrinho
- O botão "Adicionar ao carrinho" mostra a variante que será enviada (ex.: "Vermelha / M") e envia o ID dessa variante.
- Clicar numa foto da galeria seleciona a cor dela quando o site consegue identificá-la
  (foto associada à variante no painel, ou cor no texto alternativo/nome do arquivo).
- O número no ícone do carrinho conta **produtos diferentes**. Mudar a quantidade de um item não altera esse número.
  Para contar unidades, altere `cartBadge` para `"unidades"` em `site.config.js`.
- Cada combinação de cor/tamanho é uma linha própria; adicionar a mesma variante de novo soma na mesma linha.

## Categorias = coleções da Shopify
- O **título de cada coleção** é a **categoria** dos produtos que estão nela (Produtos → Coleções no painel).
- Onde aparece: menu do topo, filtro de categorias em `/loja`, cartões de produto, trilha de navegação
  (Início / Categoria / Produto), página `/categorias/[handle]` e blocos da home.
- Para um produto ter categoria, adicione-o a uma coleção (manual ou automática). Se estiver em várias, a 1ª é a exibida.
- Coleções sem produtos e as automáticas "Home page"/"All" não aparecem.
- Dê imagem à coleção no painel para ela ficar bonita nos blocos da home (senão usa a foto do 1º produto).
- Use o título com acento e maiúscula como quiser exibir (ex.: "Tênis"). O site só capitaliza a primeira letra.
- A coleção precisa estar publicada no canal **Headless**.
- A rota antiga `/colecoes/...` redireciona para `/categorias/...`.

## Atributos de categoria (Calçados): Cor, Tamanho, Material, Gênero alvo...
Na Shopify, os atributos da categoria funcionam de dois jeitos, e o site trata cada um:

**1. Opções de variante (o cliente escolhe)**: normalmente **Cor** e **Tamanho do calçado** (a Shopify permite até 3 opções por produto).
Qualquer opção criada em Variantes vira um seletor automaticamente: cor com miniatura, tamanho em botões, demais em botões.
Se quiser que outro atributo seja escolhível (ex.: Material do calçado), adicione-o como 3ª opção do produto.

**2. Atributos do produto (informativos)**: Material do calçado, Forro material, Solado material, Atividade, Grupo de idade,
Tipo de fechamento, Estilo de biqueira, Tipo de altura do salto, Tipo de suporte de calçado, Ajuste de calçado,
Características de calçados, Gênero alvo e Instruções de cuidados. Ao preencher no produto, aparecem em **Detalhes do produto**
(e Cuidados em seção própria). Gênero alvo aparece também ao lado da categoria, no topo.

Para funcionar:
1. No app **Headless**, marque também o escopo **Metaobjects** (`unauthenticated_read_metaobjects`).
2. Em Configurações → Dados personalizados → Produtos, abra cada metacampo de categoria e deixe o acesso à **Storefront API** ativado.
3. Confira em `http://localhost:3000/debug/<handle-do-produto>` (só em desenvolvimento): a tabela mostra, por atributo, se a Shopify entregou o valor.
4. As chaves ficam em `site.config.js` (`attributes`). Se algum atributo não aparecer, veja a chave real do metacampo no painel
   (namespace.chave) e acrescente em `keys`. Metacampos próprios: `namespace: "custom"`.

**Filtros nas categorias e na busca**: vêm do app **Search & Discovery** → Filtros. Adicione ali Cor, Tamanho, Material,
Gênero alvo etc. e eles aparecem sozinhos na lateral (checkboxes com contagem), combinando entre si e com a ordenação.

## Rodapé, políticas e Fale conosco (integrados à Shopify)
- **Menu do rodapé**: se existir o menu `footer` em Loja virtual → Navegação, ele define as colunas
  (itens com sub-itens viram colunas; links de /collections, /pages, /products, /policies são convertidos para as rotas do site).
  Sem esse menu, o site usa `footer.columns` do `site.config.js` e **só mostra links de Páginas que existem** na Shopify.
- **Páginas** (Ajuda, Entregas, Sobre...): Loja virtual → Páginas. O endereço é `/pagina/<handle>`.
- **Políticas** (privacidade, termos, devolução, envio): Configurações → Políticas. Aparecem sozinhas no rodapé (`/politicas/<handle>`).
- **Fale conosco**: a Shopify não oferece API para enviar formulário de contato. A página `contato` mostra o conteúdo da Shopify
  e, se você preencher `contact` no `site.config.js`, botões de e-mail e WhatsApp.
- Escopo necessário no Headless: **Content** (`unauthenticated_read_content`).
- Confira tudo em `http://localhost:3000/debug` (só em desenvolvimento).

## Login do cliente e pedidos (Customer Account API)
O ícone de usuário no topo leva ao login da Shopify (OAuth + PKCE). Depois do login, `/conta` mostra dados e pedidos do cliente.
1. Configurações → **Contas de clientes** → use as **contas de clientes novas**.
2. App **Headless** → seu storefront → **Customer Account API** → configurar. Copie o **Client ID** para `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`.
3. Nessa mesma tela, cadastre:
   - **Callback URI**: `http://localhost:3000/api/auth/callback` (e `https://SEU-DOMINIO/api/auth/callback` em produção)
   - **JavaScript origin**: `http://localhost:3000` (e o domínio de produção)
   - **Logout URI**: `http://localhost:3000` (e o domínio de produção)
4. Se a Shopify recusar `http://localhost`, rode `npm run dev -- --experimental-https` e use `https://localhost:3000`.
5. Sem o Client ID, o ícone abre `/conta`, que mostra como configurar (não envia mais o cliente ao tema da Shopify).
Observação: o checkout da Shopify pede o e-mail do cliente; o vínculo automático do carrinho com a sessão logada não está incluído.

### Erro "Divergência de redirect_uri" no login
O endereço que o site envia precisa ser **idêntico** ao cadastrado na Shopify (protocolo, porta e caminho; sem barra no final).
Abra `http://localhost:3000/debug`: a linha "Endereços que o site envia no login" mostra os valores exatos para copiar.
Acesse sempre por `localhost` (não por 127.0.0.1 nem pelo IP da rede). Com `--experimental-https`, defina `SITE_URL=https://localhost:3000` no `.env.local`.
