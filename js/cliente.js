// Importa as URLs de configuração do WebSocket e da API REST
import { CLIENT_BASE_URL, WS_URL } from './config.js';

// Pede o ID ou nome do usuário quando abre o cliente
let usuarioId = '';
//Função para mostrar o usuário
function solicitarUsuario() {
  while (!usuarioId) {
    usuarioId = prompt('Digite seu nome ou ID de usuário:');
  }
  document.getElementById('nome-usuario').textContent = usuarioId;
  document.getElementById('btn-sair').style.display = 'inline-block';
  document.getElementById('saudacao').style.display = 'inline-block';

}
solicitarUsuario();

// Comportamento do botão Sair:
document.getElementById('btn-sair').addEventListener('click', () => {
  location.reload();
});

// Cria a conexão WebSocket
const ws = new WebSocket(WS_URL);

// Evento disparado quando o WebSocket é conectado com sucesso
ws.addEventListener('open', () => {
  console.log('WebSocket conectado - Cliente');
});

// Evento disparado sempre que uma nova mensagem chega do servidor
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data); // Converte a mensagem recebida em JSON

  // Filtra só mensagens para o usuário atual
  if (data.pedido?.usuarioId !== usuarioId) return;

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

    // Filtra e adiciona só pedidos do usuário atual
    pedidos.filter(p => p.usuarioId === usuarioId)
           .forEach(adicionarPedidoNaTela);
  } catch (err) {
    console.error('Erro ao carregar pedidos iniciais:', err);
  }
}

// Função que adiciona visualmente um novo pedido na tela
function adicionarPedidoNaTela(pedido) {
  const lista = document.getElementById('lista-pedidos');
  if (!lista) return;

  // Evita duplicatas
  if (document.getElementById(`pedido-${pedido.id}`)) return;

  // Cria a div para o pedido
  const div = document.createElement('div');
  div.id = `pedido-${pedido.id}`;
  div.className = 'pedido';

  // Cria div para descrição e quantidade
  const descricao = document.createElement('div');
  descricao.className = 'descricao';
  descricao.textContent = `${pedido.descricao} (x${pedido.quantidade || 1})`;

  // Cria div para status e adiciona classe para estilo
  const status = document.createElement('div');
  status.className = 'status ' + getStatusClass(pedido.status);
  status.textContent = pedido.status;

  // Adiciona descrição e status à div do pedido
  div.appendChild(descricao);
  div.appendChild(status);

  // Adiciona a div na lista
  lista.appendChild(div);
}

// Função que atualiza o status de um pedido já renderizado
function atualizarStatusNaTela(pedido) {
  const pedidoDiv = document.getElementById(`pedido-${pedido.id}`);
  if (!pedidoDiv) return;

  const statusDiv = pedidoDiv.querySelector('.status');
  if (statusDiv) {
    statusDiv.textContent = pedido.status;
    statusDiv.className = 'status ' + getStatusClass(pedido.status);
  }
}

// Função que retorna a classe CSS para cada status do pedido
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

// Envia um novo pedido para o backend via HTTP POST (incluindo o usuarioId)
document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade')?.value) || 1;

  if (!descricao) return alert('Informe a descrição do pedido');

  try {
    const res = await fetch('/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao, quantidade, usuarioId }),
    });

    if (!res.ok) throw new Error('Erro ao enviar pedido');

    // Limpa o formulário após envio
    document.getElementById('descricao').value = '';
    if (document.getElementById('quantidade')) document.getElementById('quantidade').value = '1';
  } catch (err) {
    alert('Erro ao enviar pedido: ' + err.message);
  }
});
