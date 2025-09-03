// Importa as constantes com as URLs da API e do WebSocket
import { LOJA_BASE_URL, WS_URL } from './config.js';

// Cria a conexão WebSocket com o servidor
const ws = new WebSocket(WS_URL);

// Seleciona a tabela onde os pedidos serão listados
const listaPedidos = document.getElementById('listaPedidos');

// Armazena os pedidos em memória
let pedidos = [];

// Evento disparado quando o WebSocket conecta com sucesso
ws.addEventListener('open', () => {
  console.log('WebSocket conectado - Loja');
});

// Evento disparado quando uma mensagem é recebida do servidor via WebSocket
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data); // Converte os dados recebidos em JSON

  // Verifica o tipo da mensagem
  if (data.type === 'novo_pedido') {
    // Adiciona o novo pedido na lista e atualiza a tabela
    pedidos.push(data.pedido);
    renderPedidos();
  } else if (data.type === 'status_atualizado') {
    // Atualiza o status de um pedido existente
    const idx = pedidos.findIndex(p => p.id === data.pedido.id);
    if (idx !== -1) {
      pedidos[idx].status = data.pedido.status;
      renderPedidos();
    }
  }
});

// Evento disparado quando a conexão WebSocket é encerrada
ws.addEventListener('close', () => {
  console.log('WebSocket desconectado - Loja');
});

// Quando a página é carregada, busca os pedidos iniciais da API
window.addEventListener('load', () => {
  carregarPedidosIniciais();
});

// Busca os pedidos já existentes no backend via requisição HTTP (fetch)
async function carregarPedidosIniciais() {
  try {
    const res = await fetch(`${LOJA_BASE_URL}/pedidos`);
    if (!res.ok) throw new Error('Erro ao carregar pedidos');
    pedidos = await res.json(); // Salva os pedidos no array
    renderPedidos(); // Renderiza na tela
  } catch (err) {
    console.error('Erro ao carregar pedidos iniciais:', err);
  }
}

// Função responsável por renderizar todos os pedidos na tabela
function renderPedidos() {
  listaPedidos.innerHTML = ''; // Limpa a tabela antes de renderizar

  pedidos.forEach(pedido => {
    const tr = document.createElement('tr'); // Cria uma nova linha

    // Define uma classe CSS de acordo com o status do pedido
    const statusClasse = getStatusClass(pedido.status);
    if (statusClasse) {
      tr.classList.add(statusClasse);
    }

    // Adiciona as colunas da linha com dados do pedido
    tr.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.descricao}</td>
      <td>${pedido.quantidade || 1}</td>
      <td>${pedido.status}</td>
      <td>
        <select data-id="${pedido.id}">
          <option value="">-- Alterar --</option>
          <option value="Em preparo">Em preparo</option>
          <option value="Saiu para entrega">Saiu para entrega</option>
          <option value="Entregue">Entregue</option>
          <option value="Pedido Cancelado">Pedido Cancelado</option>
        </select>
      </td>
    `;

    // Adiciona a linha na tabela
    listaPedidos.appendChild(tr);
  });

  // Adiciona eventos de mudança nos <select> de status
  const selects = listaPedidos.querySelectorAll('select[data-id]');
  selects.forEach(select => {
    select.addEventListener('change', (event) => {
      const id = event.target.getAttribute('data-id');
      const status = event.target.value;
      atualizarStatus(id, status); // Envia a atualização para o backend
    });
  });
}

// Retorna a classe CSS correspondente ao status do pedido
function getStatusClass(status) {
  switch (status) {
    case 'Realizado':
      return 'status-realizado';
    case 'Em preparo':
      return 'status-preparo';
    case 'Saiu para entrega':
      return 'status-entrega';
    case 'Entregue':
      return 'status-entregue';
    case 'Pedido Cancelado':
      return 'status-cancelado';
    default:
      return ''; // Sem classe se o status não for reconhecido
  }
}

// Envia a atualização de status para o backend via HTTP POST
async function atualizarStatus(id, status) {
  if (!status) return;

  try {
    const res = await fetch(`/pedido/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }), // Envia o novo status em JSON
    });

    if (!res.ok) throw new Error('Erro ao atualizar status');
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
  }
}
