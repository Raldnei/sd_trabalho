import { LOJA_BASE_URL, WS_URL } from './config.js';

const ws = new WebSocket(WS_URL);

const listaPedidos = document.getElementById('listaPedidos');
let pedidos = [];

ws.addEventListener('open', () => {
  console.log('WebSocket conectado - Loja');
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'novo_pedido') {
    pedidos.push(data.pedido);
    renderPedidos();
  } else if (data.type === 'status_atualizado') {
    const idx = pedidos.findIndex(p => p.id === data.pedido.id);
    if (idx !== -1) {
      pedidos[idx].status = data.pedido.status;
      renderPedidos();
    }
  }
});

ws.addEventListener('close', () => {
  console.log('WebSocket desconectado - Loja');
});

window.addEventListener('load', () => {
  carregarPedidosIniciais();
});

async function carregarPedidosIniciais() {
  try {
    const res = await fetch(`${LOJA_BASE_URL}/pedidos`);
    if (!res.ok) throw new Error('Erro ao carregar pedidos');
    pedidos = await res.json();
    renderPedidos();
  } catch (err) {
    console.error('Erro ao carregar pedidos iniciais:', err);
  }
}

function renderPedidos() {
  listaPedidos.innerHTML = '';

  pedidos.forEach(pedido => {
    const tr = document.createElement('tr');

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
        </select>
      </td>
    `;

    listaPedidos.appendChild(tr);
  });

  // Adiciona event listeners nos selects após adicioná-los ao DOM
  const selects = listaPedidos.querySelectorAll('select[data-id]');
  selects.forEach(select => {
    select.addEventListener('change', (event) => {
      const id = event.target.getAttribute('data-id');
      const status = event.target.value;
      atualizarStatus(id, status);
    });
  });
}

async function atualizarStatus(id, status) {
  if (!status) return;

  try {
    const res = await fetch(`/pedido/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Erro ao atualizar status');
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
  }
}
