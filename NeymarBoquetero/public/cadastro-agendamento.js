async function buscarBarbeiro() {
    fetch("/buscar-barbeiros")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar barbeiros");
            }
            return response.json();
        })
        .then((barbeiros) => {
            const select = document.getElementById("barbeiroSelecionado");
            select.innerHTML = '<option value="">Selecione o Barbeiro</option>';
            barbeiros.forEach((barbeiro) => {
                const option = document.createElement("option");
                option.value = barbeiro.id;
                option.textContent = barbeiro.nome;
                select.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar os barbeiros:", error);
        });
}

async function buscarServico() {
    fetch("/buscar-servicos")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar serviços");
            }
            return response.json();
        })
        .then((servicos) => {
            const select = document.getElementById("servicoSelecionado");
            select.innerHTML = '<option value="">Selecione o Serviço</option>';
            servicos.forEach((servico) => {
                const option = document.createElement("option");
                option.value = servico.id;
                option.textContent = servico.nome;
                select.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar os serviços:", error);
        });
}

async function buscaHorariosDisponiveis() {
    const data = document.getElementById("data").value;
    const id = document.getElementById("servicoSelecionado").value;

    if (!data || !id) {
        document.getElementById("horaSelecionada").innerHTML = '<option value="">Selecione o Horário</option>';
        return;
    }

    fetch(`/horarios-disponiveis?data=${data}&id=${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar horários disponíveis");
            }
            return response.json();
        })
        .then((horariosDisponiveis) => {
            const selectHorario = document.getElementById("horaSelecionada");
            selectHorario.innerHTML = '<option value="">Selecione o Horário</option>';

            if (horariosDisponiveis.length > 0) {
                horariosDisponiveis.forEach((horario) => {
                    const option = document.createElement("option");
                    option.value = horario;
                    option.textContent = horario;
                    selectHorario.appendChild(option);
                });
            } else {
                alert("Não há horários disponíveis para esta data e serviço.");
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar horários disponíveis:", error);
        });
}

async function cadastrarAgendamento(event) {
    event.preventDefault();

    const data = document.getElementById("data").value;
    const horario = document.getElementById("horaSelecionada").value;
    const cpf_cliente = document.getElementById("cpf_cli").value;
    const id_barbeiro = document.getElementById("barbeiroSelecionado").value;
    const id_servico = document.getElementById("servicoSelecionado").value;

    if (!data || !horario || !cpf_cliente || !id_barbeiro || !id_servico) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const resp = await fetch("/cadastrar-agendamento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data,
                horario,
                cpf_cliente,
                id_barbeiro,
                id_servico,
            }),
        });

        const texto = await resp.text();

        if (!resp.ok) {
            console.error("Falha no cadastro:", texto);
            alert(`Erro ao cadastrar: ${texto}`);
            return;
        }

        alert("Agendamento cadastrado com sucesso!");
        document.getElementById("filters").reset();
        document.getElementById("horaSelecionada").innerHTML = '<option value="">Selecione o Horário</option>';

        // Atualiza a lista de agendamentos após cadastro
        listarAgendamentos();
    } catch (e) {
        console.error("Erro ao cadastrar agendamento:", e);
        alert("Erro de rede ao cadastrar.");
    }
}

// PASSO 2: Função para listar todos os agendamentos ou buscar por data (ATUALIZADA)
async function listarAgendamentos() {
    const data = document.getElementById("data").value.trim();

    let url = "/agendamentos";
    if (data) {
        url += `?date=${data}`;
    }

    try {
        const response = await fetch(url);
        const agendamentos = await response.json();

        const tabela = document.getElementById("tabela-agendamentos");
        tabela.innerHTML = "";

        if (agendamentos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="7">Nenhum agendamento encontrado.</td></tr>';
        } else {
            agendamentos.forEach(agendamento => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${agendamento.id}</td>
                    <td>${agendamento.data}</td>
                    <td>${agendamento.horario}</td>
                    <td>${agendamento.cliente_nome || agendamento.cpf_cliente}</td>
                    <td>${agendamento.barbeiro_nome || agendamento.id_barbeiro}</td>
                    <td>${agendamento.servico_nome || agendamento.id_servico}</td>
                    <td>
                        <button type="button" class="btn-excluir" onclick="excluirAgendamento(${agendamento.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
    }
}

// PASSO 2: Função para excluir agendamento (NOVA FUNÇÃO)
async function excluirAgendamento(id) {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
        return;
    }

    try {
        const resp = await fetch(`/excluir-agendamento/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) {
            const texto = await resp.text();
            console.error("Falha na exclusão:", texto);
            alert(`Erro ao excluir: ${texto}`);
            return;
        }

        alert("Agendamento excluído com sucesso!");
        listarAgendamentos(); // Atualiza a lista após exclusão
    } catch (e) {
        console.error("Erro ao excluir agendamento:", e);
        alert("Erro de rede ao excluir.");
    }
}

// Carregar barbeiros e serviços ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    buscarBarbeiro();
    buscarServico();
    listarAgendamentos(); // Carrega agendamentos automaticamente
});