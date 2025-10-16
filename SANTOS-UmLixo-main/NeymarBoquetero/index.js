const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 5000;

// Serve os arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Configura o body-parser para ler JSON
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite.");
    }
});

// Criação das tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT NOT NULL UNIQUE,
            email TEXT,
            telefone TEXT,
            endereco TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS barbeiros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT NOT NULL UNIQUE,
            email TEXT,
            telefone TEXT,
            especialidade TEXT,
            endereco TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            preco TEXT NOT NULL,
            duracao TEXT,
            descricao TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            cpf_cliente VARCHAR(11) NOT NULL,
            id_barbeiro INTEGER NOT NULL,
            id_servico INTEGER NOT NULL,
            FOREIGN KEY (cpf_cliente) REFERENCES clientes (cpf),
            FOREIGN KEY (id_barbeiro) REFERENCES barbeiros (id),
            FOREIGN KEY (id_servico) REFERENCES servicos (id)
        )
    `);

    console.log("Tabelas criadas com sucesso.");
});

///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente
app.post("/clientes", (req, res) => {
    const { nome, cpf, email, telefone, endereco } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nome, cpf, email, telefone, endereco], function (err) {
        if (err) {
            return res.status(500).send("Erro ao cadastrar cliente.");
        }
        res.status(201).send({
            id: this.lastID,
            message: "Cliente cadastrado com sucesso.",
        });
    });
});

// Listar clientes - COM ORDER BY
app.get("/clientes", (req, res) => {
    const cpf = req.query.cpf || "";

    if (cpf) {
        const query = `SELECT * FROM clientes WHERE cpf LIKE ? ORDER BY id DESC`;
        db.all(query, [`%${cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows);
        });
    } else {
        const query = `SELECT * FROM clientes ORDER BY id DESC`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows);
        });
    }
});

// Atualizar cliente
app.put("/clientes/cpf/:cpf", (req, res) => {
    const { cpf } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    const query = `UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE cpf = ?`;
    db.run(
        query,
        [nome, email, telefone, endereco, cpf],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao atualizar cliente.");
            }
            if (this.changes === 0) {
                return res.status(404).send("Cliente não encontrado.");
            }
            res.send("Cliente atualizado com sucesso.");
        },
    );
});

///////////////////////////// Rotas para Barbeiros /////////////////////////////

// Cadastrar barbeiros
app.post("/barbeiros", (req, res) => {
    const { nome, cpf, email, telefone, especialidade, endereco } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO barbeiros (nome, cpf, email, telefone, especialidade, endereco) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [nome, cpf, email, telefone, especialidade, endereco],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar barbeiro.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Barbeiro cadastrado com sucesso.",
            });
        },
    );
});

// Listar barbeiros - COM ORDER BY
app.get("/barbeiros", (req, res) => {
    const cpf = req.query.cpf || "";

    if (cpf) {
        const query = `SELECT * FROM barbeiros WHERE cpf LIKE ? ORDER BY id DESC`;
        db.all(query, [`%${cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar barbeiros." });
            }
            res.json(rows);
        });
    } else {
        const query = `SELECT * FROM barbeiros ORDER BY id DESC`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar barbeiros." });
            }
            res.json(rows);
        });
    }
});

// Atualizar barbeiros
app.put("/barbeiros/cpf/:cpf", (req, res) => {
    const { cpf } = req.params;
    const { nome, email, telefone, especialidade, endereco } = req.body;

    const query = `UPDATE barbeiros SET nome = ?, email = ?, telefone = ?, especialidade = ?, endereco = ? WHERE cpf = ?`;
    db.run(
        query,
        [nome, email, telefone, especialidade, endereco, cpf],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao atualizar barbeiro.");
            }
            if (this.changes === 0) {
                return res.status(404).send("Barbeiro não encontrado.");
            }
            res.send("Barbeiro atualizado com sucesso.");
        },
    );
});

///////////////////////////// Rotas para Serviços /////////////////////////////

// Cadastrar serviços
app.post("/servicos", (req, res) => {
    const { nome, preco, duracao, descricao } = req.body;

    if (!preco || !nome) {
        return res.status(400).send("Nome e Preço são obrigatórios.");
    }

    const query = `INSERT INTO servicos (nome, preco, duracao, descricao) VALUES (?, ?, ?, ?)`;
    db.run(query, [nome, preco, duracao, descricao], function (err) {
        if (err) {
            return res.status(500).send("Erro ao cadastrar serviço.");
        }
        res.status(201).send({
            id: this.lastID,
            message: "Serviço cadastrado com sucesso.",
        });
    });
});

// Listar serviços - COM ORDER BY
app.get("/servicos", (req, res) => {
    const nome = req.query.nome || "";

    if (nome) {
        const query = `SELECT * FROM servicos WHERE nome LIKE ? ORDER BY id DESC`;
        db.all(query, [`%${nome}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar serviços." });
            }
            res.json(rows);
        });
    } else {
        const query = `SELECT * FROM servicos ORDER BY id DESC`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar serviços." });
            }
            res.json(rows);
        });
    }
});

// Atualizar serviços
app.put("/servicos/nome/:nome", (req, res) => {
    const { nome } = req.params;
    const { preco, duracao, descricao } = req.body;

    const query = `UPDATE servicos SET preco = ?, duracao = ?, descricao = ? WHERE nome = ?`;
    db.run(query, [preco, duracao, descricao, nome], function (err) {
        if (err) {
            return res.status(500).send("Erro ao atualizar serviço.");
        }
        if (this.changes === 0) {
            return res.status(404).send("Serviço não encontrado.");
        }
        res.send("Serviço atualizado com sucesso.");
    });
});

/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Rotas para Agendamentos /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS
app.get("/buscar-servicos", (req, res) => {
    db.all("SELECT id, nome FROM servicos ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar serviços:", err);
            res.status(500).send("Erro ao buscar serviços");
        } else {
            res.json(rows);
        }
    });
});

// ROTA PARA BUSCAR TODOS OS BARBEIROS
app.get("/buscar-barbeiros", (req, res) => {
    db.all("SELECT id, nome FROM barbeiros ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar barbeiros:", err);
            res.status(500).send("Erro ao buscar barbeiros");
        } else {
            res.json(rows);
        }
    });
});

// ROTA PARA BUSCAR HORÁRIOS DISPONÍVEIS
app.get("/horarios-disponiveis", (req, res) => {
    const { data, id } = req.query;

    const todosHorarios = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
    ];

    const sql = `SELECT horario FROM agendamentos WHERE data = ? AND id_servico = ?`;

    db.all(sql, [data, id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar horários ocupados:", err);
            return res.status(500).send("Erro ao buscar horários ocupados");
        }

        const ocupados = rows.map((r) => String(r.horario).slice(0, 5));
        const disponiveis = todosHorarios.filter((h) => !ocupados.includes(h));
        res.json(disponiveis);
    });
});

// ROTA PRA CADASTRAR UM AGENDAMENTO
app.post("/cadastrar-agendamento", (req, res) => {
    const { data, horario, cpf_cliente, id_barbeiro, id_servico } = req.body;
    db.run(
        "INSERT INTO agendamentos (data, horario, cpf_cliente, id_barbeiro, id_servico) VALUES (?, ?, ?, ?, ?)",
        [data, horario, cpf_cliente, id_barbeiro, id_servico],
        function (err) {
            if (err) {
                console.error("Erro ao cadastrar agendamento:", err);
                res.status(500).send("Erro ao cadastrar agendamento");
            } else {
                res.send("Agendamento cadastrado com sucesso!");
            }
        },
    );
});

// PASSO 1: ROTA PARA EXCLUIR AGENDAMENTO
app.delete("/excluir-agendamento/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send("ID do agendamento é obrigatório.");
    }

    const query = `DELETE FROM agendamentos WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            console.error("Erro ao excluir agendamento:", err);
            return res.status(500).send("Erro ao excluir agendamento.");
        }

        if (this.changes === 0) {
            return res.status(404).send("Agendamento não encontrado.");
        }

        res.send("Agendamento excluído com sucesso!");
    });
});

// ROTA UNIFICADA PARA AGENDAMENTOS - COM ORDER BY
app.get("/agendamentos", (req, res) => {
    const { cpf_cliente, servico, dataInicio, dataFim, date } = req.query;

    console.log("Parâmetros recebidos:", { cpf_cliente, servico, dataInicio, dataFim, date });

    // Se foi passado apenas 'date' (para a listagem simples do cadastro)
    if (date && !cpf_cliente && !servico && !dataInicio && !dataFim) {
        const query = `SELECT * FROM agendamentos WHERE data LIKE ? ORDER BY id DESC`;
        db.all(query, [`%${date}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar agendamentos." });
            }
            return res.json(rows);
        });
        return;
    }

    // Query para relatório completo com JOINs (para histórico e financeiro)
    let query = `
        SELECT
            agendamentos.id,
            clientes.nome AS cliente_nome,
            clientes.cpf AS cliente_cpf,
            barbeiros.nome AS barbeiro_nome,
            servicos.nome AS servico_nome,
            servicos.preco AS servico_preco,
            agendamentos.horario,
            agendamentos.data,
            agendamentos.cpf_cliente,
            agendamentos.id_barbeiro,
            agendamentos.id_servico
        FROM agendamentos
        LEFT JOIN clientes ON agendamentos.cpf_cliente = clientes.cpf
        LEFT JOIN barbeiros ON agendamentos.id_barbeiro = barbeiros.id
        LEFT JOIN servicos ON agendamentos.id_servico = servicos.id
        WHERE 1=1
    `;

    const params = [];

    if (cpf_cliente) {
        query += " AND agendamentos.cpf_cliente = ?";
        params.push(cpf_cliente);
    }

    if (servico) {
        query += " AND servicos.nome LIKE ?";
        params.push(`%${servico}%`);
    }

    if (dataInicio && dataFim) {
        query += " AND agendamentos.data BETWEEN ? AND ?";
        params.push(dataInicio, dataFim);
    } else if (dataInicio) {
        query += " AND agendamentos.data >= ?";
        params.push(dataInicio);
    } else if (dataFim) {
        query += " AND agendamentos.data <= ?";
        params.push(dataFim);
    }

    // ADICIONE ORDER BY para queries com filtros
    query += " ORDER BY agendamentos.id DESC";

    // Se não há filtros, retorna todos os agendamentos com JOIN
    if (!cpf_cliente && !servico && !dataInicio && !dataFim && !date) {
        query = `
            SELECT
                agendamentos.id,
                agendamentos.data,
                agendamentos.horario,
                agendamentos.cpf_cliente,
                agendamentos.id_barbeiro,
                agendamentos.id_servico,
                clientes.nome AS cliente_nome,
                barbeiros.nome AS barbeiro_nome,
                servicos.nome AS servico_nome,
                servicos.preco AS servico_preco
            FROM agendamentos
            LEFT JOIN clientes ON agendamentos.cpf_cliente = clientes.cpf
            LEFT JOIN barbeiros ON agendamentos.id_barbeiro = barbeiros.id
            LEFT JOIN servicos ON agendamentos.id_servico = servicos.id
            ORDER BY agendamentos.id DESC
        `;
    }

    console.log("Query executada:", query);
    console.log("Parâmetros:", params);

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar agendamentos:", err);
            return res.status(500).json({ 
                message: "Erro ao buscar agendamentos.",
                error: err.message 
            });
        }
        console.log("Agendamentos retornados:", rows.length);
        res.json(rows);
    });
});

// Teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
    res.send("Servidor está rodando e tabelas criadas!");
});

// Bind to all interfaces for Replit compatibility
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${port}`);
});