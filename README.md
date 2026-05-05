# Projeto Organização de Relatórios

Sistema interno para abertura e acompanhamento de solicitações de relatórios.

O projeto possui duas partes:

- `node/`: backend Node.js com Express, PostgreSQL, autenticação e cookies seguros.
- `react/`: frontend servido pelo Create React App. As telas atuais estão em `react/public`.

## Requisitos

- Node.js instalado
- npm instalado
- PostgreSQL instalado e rodando
- Um banco criado para o projeto

## Estrutura

```txt
projeto-organizacao-relatorios/
  node/
    server.js
    src/
      config/db.js
      controllers/
      middlewares/
      routes/
  react/
    public/
      index.html
      definirSenha.html
      css/
      js/
      assets/
  database/
    AlterTable_001.sql
```

## Banco de dados

O projeto usa PostgreSQL.

Execute o script:

```bash
psql -U seu_usuario -d seu_banco -f database/AlterTable_001.sql
```

O script cria/ajusta:

- tabela `tusuarios`
- constraints e indices basicos

O backend espera que a tabela `tusuarios` tenha pelo menos:

- `controle`
- `usuario`
- `nome`
- `nivel`
- `programador`
- `ativo`
- `senha`

Sua tabela original possui:

- `controle`
- `usuario`
- `nome`
- `programador`
- `nivel`
- `datahoracadastro`
- `ativo`
- `dataemissao`

O script de banco preserva esse formato e adiciona `senha`, porque o backend precisa dela para autenticar e salvar o hash bcrypt no primeiro acesso.

As tabelas de solicitacoes e historico ainda nao fazem parte do banco atual. Elas serao criadas depois, quando a tela do tecnico e o fluxo de kanban forem implementados.

## Variaveis de ambiente

Crie o arquivo `node/.env` baseado em `node/.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=projeto_organizacao_relatorios

JWT_SECRET=troque_por_um_segredo_forte
COOKIE_SECRET=troque_por_outro_segredo_forte
PORT=3001
FRONTEND_URL=http://localhost:3000
LOGIN_SUCCESS_REDIRECT=http://localhost:3000/
NODE_ENV=development
```

Nunca suba `.env` para o Git.

## Instalação em outro PC

Na raiz do projeto:

```bash
cd node
npm install
```

Depois:

```bash
cd ../react
npm install
```

## Rodar o backend

Em um terminal:

```bash
cd node
npm start
```

O backend roda em:

```txt
http://localhost:3001
```

## Rodar o frontend

Em outro terminal:

```bash
cd react
npm start
```

O frontend roda em:

```txt
http://localhost:3000
```

## Telas atuais

- Login: `http://localhost:3000/`
- Definir senha: `http://localhost:3000/definirSenha.html`

## Fluxo de login

1. O usuario envia o formulario de login para `POST /api/auth/`.
2. O backend valida o usuario no PostgreSQL.
3. Se a senha ainda estiver em texto puro, o sistema trata como primeiro acesso.
4. No primeiro acesso, o backend cria um cookie assinado temporario e redireciona para `definirSenha.html`.
5. Ao definir a senha, o backend salva o hash com `bcrypt`.
6. No login normal, o backend cria um JWT em cookie `HttpOnly`.

## Regras de seguranca ja aplicadas

- Login sem `fetch` no frontend.
- Token nao fica em `localStorage` nem `sessionStorage`.
- JWT fica em cookie `HttpOnly`.
- Primeiro acesso usa cookie assinado temporario.
- SQL usa parametros `$1`, `$2`, evitando SQL Injection.
- Campo `usuario` aceita apenas letras, numeros, `_` e `.`.
- Mensagens no frontend usam `textContent`, nao `innerHTML`.
- `helmet` ativo no backend.
- Rate limit no login: 5 tentativas a cada 15 minutos.

## Observacoes importantes

- A pasta `react/build/` e gerada pelo build e nao deve ser editada.
- A pasta `node_modules/` nao deve ser versionada.
- O desenvolvimento atual esta usando HTML/CSS/JS dentro de `react/public`.
- A migracao para componentes React pode ser feita depois, quando o fluxo principal estiver fechado.
