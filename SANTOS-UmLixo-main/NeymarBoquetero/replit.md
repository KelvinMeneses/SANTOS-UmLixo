# GRAGAS Barbearia - Sistema de Gerenciamento

## Visão Geral
Sistema completo de gerenciamento para barbearias desenvolvido com Node.js, Express e SQLite. Permite gerenciar agendamentos, clientes, barbeiros, serviços e relatórios financeiros.

## Tecnologias Utilizadas
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript
- **Ícones**: Font Awesome 6.0

## Estrutura do Projeto
```
.
├── index.js              # Servidor Express principal
├── package.json          # Dependências e scripts NPM
├── database.db           # Banco de dados SQLite (gerado automaticamente)
├── public/               # Arquivos frontend estáticos
│   ├── index.html        # Dashboard principal
│   ├── style.css         # Estilos globais
│   ├── cadastro-agendamento.html/.js
│   ├── cadastro-cliente.html/.js
│   ├── cadastro-barbeiro.html/.js
│   ├── cadastro-cerviço.html/.js
│   ├── financeiro.html/.js
│   └── historico.html/.js
└── .gitignore           # Arquivos ignorados pelo Git
```

## Configuração do Ambiente Replit

### Workflow Configurado
- **Nome**: Server
- **Comando**: `npm start`
- **Porta**: 5000
- **Tipo**: Webview (frontend)

### Deployment
- **Tipo**: Autoscale (aplicação web stateless)
- **Comando**: `node index.js`

## Banco de Dados

### Tabelas Criadas Automaticamente
1. **clientes**: Gerenciamento de clientes
   - id, nome, cpf, email, telefone, endereco

2. **barbeiros**: Gerenciamento de barbeiros
   - id, nome, cpf, email, telefone, especialidade, endereco

3. **servicos**: Catálogo de serviços
   - id, nome, preco, duracao, descricao

4. **agendamentos**: Controle de agendamentos
   - id, data, horario, cpf_cliente, id_barbeiro, id_servico

## API Endpoints

### Clientes
- `GET /clientes` - Lista todos os clientes (com filtro opcional por CPF)
- `POST /clientes` - Cadastra novo cliente
- `PUT /clientes/cpf/:cpf` - Atualiza cliente por CPF

### Barbeiros
- `GET /barbeiros` - Lista todos os barbeiros (com filtro opcional por CPF)
- `POST /barbeiros` - Cadastra novo barbeiro
- `PUT /barbeiros/cpf/:cpf` - Atualiza barbeiro por CPF

### Serviços
- `GET /servicos` - Lista todos os serviços (com filtro opcional por nome)
- `POST /servicos` - Cadastra novo serviço
- `PUT /servicos/nome/:nome` - Atualiza serviço por nome

### Agendamentos
- `GET /agendamentos` - Lista agendamentos com dados de cliente e serviço
  - Filtros opcionais (query params):
    - `date` - Filtra por data (busca parcial)
    - `cpf_cliente` - Filtra por CPF do cliente
    - `servico` - Filtra por nome do serviço (busca parcial)
    - `dataInicio` e `dataFim` - Filtra por intervalo de datas
  - Retorna: id, cliente_nome, cliente_cpf, servico_nome, horario, data
- `POST /cadastrar-agendamento` - Cria novo agendamento
  - Campos: data, horario, cpf_cliente, id_barbeiro, id_servico
- `GET /horarios-disponiveis` - Retorna horários disponíveis por data e serviço
  - Query params: `data`, `id` (id do serviço)
- `GET /buscar-servicos` - Lista serviços para agendamento (id e nome)
- `GET /buscar-barbeiros` - Lista barbeiros para agendamento (id e nome)

## Como Executar

### Desenvolvimento
1. O servidor inicia automaticamente na porta 5000
2. Acesse via preview do Replit
3. O banco de dados é criado automaticamente na primeira execução

### Comandos NPM
- `npm start` - Inicia o servidor
- `npm run dev` - Inicia o servidor (mesmo que start)

## Funcionalidades Principais

### Dashboard
- Visualização de agendamentos do dia
- Total de clientes cadastrados
- Faturamento mensal

### Gestão de Agendamentos
- Criação de novos agendamentos
- Filtros por data, barbeiro e status
- Verificação de horários disponíveis

### Gestão de Clientes
- Cadastro completo de clientes
- Busca por CPF
- Atualização de dados

### Gestão de Barbeiros
- Cadastro de barbeiros e especialidades
- Gestão de disponibilidade

### Gestão de Serviços
- Catálogo de serviços
- Definição de preços e duração

### Financeiro
- Relatórios mensais
- Exportação para CSV
- Análise de serviços mais populares
- Barbeiro mais ativo

### Histórico
- Histórico completo de atendimentos por cliente
- Busca por nome, CPF ou RG

## Observações Importantes
- O servidor já está configurado para aceitar requisições de todos os hosts (0.0.0.0)
- O banco de dados SQLite é criado automaticamente na primeira execução
- Arquivos de banco de dados estão no .gitignore por segurança
- A aplicação está pronta para deploy via Replit Deployments

## Data de Configuração
Projeto configurado em: 06 de outubro de 2025
