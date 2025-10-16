// Função para buscar o relatório com filtros
function buscarAgendamentos() {
    const cpf = document.getElementById("cpf").value;
    const servico = document.getElementById("servico").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    // Construir a URL com os parâmetros de filtro CORRETOS
    let url = `/agendamentos?`;
    if (cpf) url += `cpf_cliente=${encodeURIComponent(cpf)}&`;
    if (servico) url += `servico=${encodeURIComponent(servico)}&`;
    if (dataInicio) url += `dataInicio=${encodeURIComponent(dataInicio)}&`;
    if (dataFim) url += `dataFim=${encodeURIComponent(dataFim)}&`;
    url = url.replace(/[&?]$/, ''); // remove & ou ? final

    console.log("URL da requisição:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Resposta do servidor não OK: ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('Agendamentos recebidos:', data);
            const tabelaAgendamentos = document.getElementById("tabela-agendamentos");
            tabelaAgendamentos.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                const trEmpty = document.createElement('tr');
                trEmpty.innerHTML = `<td colspan="5">Nenhum agendamento encontrado.</td>`;
                tabelaAgendamentos.appendChild(trEmpty);
                return;
            }

            data.forEach(agendamento => {
                // Use os nomes exatos das colunas do JOIN
                const id = agendamento.id || '—';
                const clienteNome = agendamento.cliente_nome || '—';
                const clienteCpf = agendamento.cliente_cpf || agendamento.cpf_cliente || '';
                const servicoNome = agendamento.servico_nome || '—';
                const preco = agendamento.servico_preco || '—';
                const dataStr = agendamento.data || '';
                const dataFormatada = dataStr ? new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${id}</td>
                    <td>${clienteNome}${clienteCpf ? ' (' + clienteCpf + ')' : ''}</td>
                    <td>${servicoNome}</td>
                    <td>R$ ${preco}</td>
                    <td>${dataFormatada}</td>
                `;
                tabelaAgendamentos.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar relatórios:', error);
            const tabelaAgendamentos = document.getElementById("tabela-agendamentos");
            tabelaAgendamentos.innerHTML = `<tr><td colspan="5">Erro ao carregar agendamentos.</td></tr>`;
        });
}

// Buscar agendamentos automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    buscarAgendamentos();
});