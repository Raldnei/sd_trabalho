// Importa as URLs de configuração do WebSocket e da API REST
import { CLIENT_BASE_URL, WS_URL } from './config.js';

// Cria a conexão WebSocket
const ws = new WebSocket(WS_URL);

// Evento disparado quando o WebSocket é conectado com sucesso
ws.addEventListener('open', () => {
  console.log('WebSocket conectado - Cliente');
});

// Evento disparado sempre que uma nova mensagem chega do servidor
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data); // Converte a mensagem recebida em JSON

  // Trata o tipo da mensagem recebida
  if (data.type === 'novo_pedido') {
    adicionarPedidoNaTela(data.pedido); // Adiciona novo pedido na tela
  } else if (data.type === 'status_atualizado') {
    atualizarStatusNaTela(data.pedido); // Atualiza o status de um pedido já existente
  }
});

// Evento disparado quando ocorre algum erro no WebSocket
ws.addEventListener('error', (event) => {
  console.error('WebSocket erro:', event);
});

// Evento disparado quando o WebSocket é fechado
ws.addEventListener('close', () => {
  console.log('WebSocket desconectado - Cliente');
});

// Quando a página é carregada, busca os pedidos iniciais do backend
window.addEventListener('load', () => {
  carregarPedidosIniciais();
});

// Função assíncrona que carrega todos os pedidos existentes do backend
async function carregarPedidosIniciais() {
  try {
    const res = await fetch(`${CLIENT_BASE_URL}/pedidos`);
    if (!res.ok) throw new Error('Erro ao carregar pedidos');
    const pedidos = await res.json();
    pedidos.forEach(adicionarPedidoNaTela); // Adiciona cada pedido na interface
  } catch (err) {
    console.error('Erro ao carregar pedidos iniciais:', err);
  }
}

// Função que adiciona visualmente um novo pedido na tela
function adicionarPedidoNaTela(pedido) {
  const lista = document.getElementById('lista-pedidos');
  if (!lista) return;

  // Evita adicionar o mesmo pedido mais de uma vez
  if (document.getElementById(`pedido-${pedido.id}`)) return;

  // Cria o container principal do pedido
  const div = document.createElement('div');
  div.id = `pedido-${pedido.id}`;
  div.className = 'pedido';

  // Cria a descrição do pedido
  const descricao = document.createElement('div');
  descricao.className = 'descricao';
  descricao.textContent = `${pedido.descricao} (x${pedido.quantidade || 1})`;

  // Cria a área de status do pedido com a cor correspondente
  const status = document.createElement('div');
  status.className = 'status ' + getStatusClass(pedido.status);
  status.textContent = pedido.status;

  // Adiciona os elementos na div principal
  div.appendChild(descricao);
  div.appendChild(status);
  lista.appendChild(div);
}

// Função que atualiza o status de um pedido já existente na tela
function atualizarStatusNaTela(pedido) {
  const pedidoDiv = document.getElementById(`pedido-${pedido.id}`);
  if (!pedidoDiv) return;

  const statusDiv = pedidoDiv.querySelector('.status');
  if (statusDiv) {
    statusDiv.textContent = pedido.status; // Atualiza o texto do status
    statusDiv.className = 'status ' + getStatusClass(pedido.status); // Atualiza a classe de cor
  }
}

// Mapeia os nomes dos status para as classes CSS correspondentes
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
    case 'pedido cancelado':
      return 'status-cancelado';
    default:
      return '';
  }
}

// Adiciona evento de envio do formulário para criar novo pedido
document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que a página recarregue

  // Pega os valores dos inputs
  const descricao = document.getElementById('descricao').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade')?.value) || 1;

  // Validação simples
  if (!descricao) return alert('Informe a descrição do pedido');

  try {
    // Envia o pedido via POST para o backend
    const res = await fetch('/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao, quantidade }),
    });

    // Trata possíveis erros
    if (!res.ok) throw new Error('Erro ao enviar pedido');

    // Limpa os campos do formulário após envio bem-sucedido
    document.getElementById('descricao').value = '';
    if (document.getElementById('quantidade')) document.getElementById('quantidade').value = '1';
  } catch (err) {
    alert('Erro ao enviar pedido: ' + err.message);
  }
});
