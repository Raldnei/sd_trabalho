import { CLIENT_BASE_URL, WS_URL} from './config.js';

const ws = new WebSocket(WS_URL);

ws.addEventListener('open', () => {
  console.log('WebSocket conectado - Cliente');
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'novo_pedido') {
    adicionarPedidoNaTela(data.pedido);
  } else if (data.type === 'status_atualizado') {
    atualizarStatusNaTela(data.pedido);
  }
});

ws.addEventListener('error', (event) => {
  console.error('WebSocket erro:', event);
});

ws.addEventListener('close', () => {
  console.log('WebSocket desconectado - Cliente');
});

window.addEventListener('load', () => {
  carregarPedidosIniciais();
});

async function carregarPedidosIniciais() {
  try {
    const res = await fetch(`${CLIENT_BASE_URL}/pedidos`);
    if (!res.ok) throw new Error('Erro ao carregar pedidos');
    const pedidos = await res.json();
    pedidos.forEach(adicionarPedidoNaTela);
  } catch (err) {
    console.error('Erro ao carregar pedidos iniciais:', err);
  }
}

// Adiciona um pedido na tela
function adicionarPedidoNaTela(pedido) {
  const lista = document.getElementById('lista-pedidos');
  if (!lista) return;

  // Evita duplicatas
  if (document.getElementById(`pedido-${pedido.id}`)) return;

  const div = document.createElement('div');
  div.id = `pedido-${pedido.id}`;
  div.className = 'pedido';

  const descricao = document.createElement('div');
  descricao.className = 'descricao';
  descricao.textContent = `${pedido.descricao} (x${pedido.quantidade || 1})`;

  const status = document.createElement('div');
  status.className = 'status ' + getStatusClass(pedido.status);
  status.textContent = pedido.status;

  div.appendChild(descricao);
  div.appendChild(status);
  lista.appendChild(div);
}

// Atualiza o status e classe do pedido na tela
function atualizarStatusNaTela(pedido) {
  const pedidoDiv = document.getElementById(`pedido-${pedido.id}`);
  if (!pedidoDiv) return;

  const statusDiv = pedidoDiv.querySelector('.status');
  if (statusDiv) {
    statusDiv.textContent = pedido.status;
    statusDiv.className = 'status ' + getStatusClass(pedido.status);
  }
}

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'pedido realizado':
      return 'status-realizado';
    case 'em preparo':
      return 'status-preparo';
    case 'saiu para entrega':
      return 'status-entrega';
    case 'entregue':
      return 'status-entregue';
    default:
      return '';
  }
}

// Enviar pedido via POST para o backend
document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade')?.value) || 1;

  if (!descricao) return alert('Informe a descrição do pedido');

  try {
    const res = await fetch('/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao, quantidade }),
    });
    if (!res.ok) throw new Error('Erro ao enviar pedido');
    document.getElementById('descricao').value = '';
    if (document.getElementById('quantidade')) document.getElementById('quantidade').value = '1';
  } catch (err) {
    alert('Erro ao enviar pedido: ' + err.message);
  }
});
