// Importa as bibliotecas necessárias
const express = require('express');
const amqp = require('amqplib');
const WebSocket = require('ws');
const path = require('path');
const { CLIENT_PORT, LOJA_PORT, WS_PORT } = require('./config');

// Nomes da fila e do canal de mensagens (exchange)
const QUEUE_NAME = 'pedidos';
const EXCHANGE_NAME = 'pedidos_status';

// Cria dois servidores express: um para o cliente, outro para a loja
const appCliente = express();
const appLoja = express();

// Configura para o express conseguir entender JSON e formulários
appCliente.use(express.urlencoded({ extended: true }));
appCliente.use(express.json());
appLoja.use(express.urlencoded({ extended: true }));
appLoja.use(express.json());

// Configura arquivos estáticos (CSS, JS, HTML)
appCliente.use('/html', express.static(path.join(__dirname, 'html')));
appCliente.use('/css', express.static(path.join(__dirname, 'css')));
appCliente.use('/js', express.static(path.join(__dirname, 'js')));
appLoja.use('/html', express.static(path.join(__dirname, 'html')));
appLoja.use('/css', express.static(path.join(__dirname, 'css')));
appLoja.use('/js', express.static(path.join(__dirname, 'js')));

// Variáveis para armazenar os pedidos em memória (simples)
let pedidos = [];
let pedidoId = 1;

// Variáveis para conexão com RabbitMQ
let connection, channel;

// Função para conectar no RabbitMQ
async function connectRabbit() {
  try {
    connection = await amqp.connect('amqp://rabbitmq'); // conecta no RabbitMQ
    channel = await connection.createChannel(); // cria um canal para comunicação
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false }); // cria exchange para broadcast
    console.log('Conectado ao RabbitMQ e exchange criada');
  } catch (err) {
    console.error('Erro na conexão com RabbitMQ:', err);
    setTimeout(connectRabbit, 5000); // tenta reconectar em 5 segundos se der erro
  }
}

connectRabbit();

// --- ROTAS DO CLIENTE ---

// Página principal do cliente
appCliente.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'cliente.html'));
});

// Enviar pedido do cliente (agora recebe usuarioId)
appCliente.post('/pedido', async (req, res) => {
  if (!channel) {
    return res.status(503).send('Serviço temporariamente indisponível');
  }

  const { descricao, quantidade, usuarioId } = req.body;
  if (!descricao) return res.status(400).send('Descrição é obrigatória');
  if (!usuarioId) return res.status(400).send('Usuário é obrigatório');

  const qtd = Number(quantidade) || 1;

  // Cria o pedido incluindo o usuarioId e adiciona na lista


  const pedido = { id: pedidoId++, descricao, quantidade: qtd, status: 'Pedido realizado', usuarioId };
  pedidos.push(pedido);

  // Publica no RabbitMQ para avisar outros serviços
  try {
    channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({ type: 'novo_pedido', pedido })));
    setTimeout(() => {
    pedido.status = 'Em preparo';
    channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({ type: 'status_atualizado', pedido })));
   },10000);
   res.json(pedido);



  } catch (err) {
    console.error('Erro ao publicar novo pedido:', err);
    res.status(500).send('Erro ao criar pedido');
  }
});

// Buscar todos os pedidos (cliente e loja podem usar)
appCliente.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// --- ROTAS DA LOJA ---

// Página principal da loja
appLoja.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'loja.html'));
});

// Buscar todos os pedidos (idem cliente)
appLoja.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// Atualizar status do pedido
appLoja.post('/pedido/:id/status', async (req, res) => {
  if (!channel) {
    return res.status(503).send('Serviço temporariamente indisponível');
  }

  const id = Number(req.params.id);
  const { status } = req.body;

  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).send('Pedido não encontrado');
  if (!status) return res.status(400).send('Status inválido');

  pedido.status = status;

  // Publica o status atualizado
  try {

      channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({ type: 'status_atualizado', pedido })));
      res.json(pedido);


   
  } catch (err) {
    console.error('Erro ao publicar status atualizado:', err);
    res.status(500).send('Erro ao atualizar status');
  }
});

// --- WEBSOCKET (para comunicação em tempo real) ---


const appWs = express();
const serverWs = require('http').createServer(appWs);
const wss = new WebSocket.Server({ server: serverWs });

let clients = new Set();

async function startWS() {
  try {
    if (!connection || !channel) {
      await connectRabbit();
    }

    // Cria fila exclusiva para este servidor WS escutar a exchange

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    // Quando chegar mensagem no RabbitMQ, envia para todos os clientes WebSocket conectados
    channel.consume(q.queue, msg => {
      if (msg !== null) {
        const content = msg.content.toString();

        // Envia para todos os clientes WS conectados (filtragem no cliente)
        for (const ws of clients) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(content);
          }
        }
        channel.ack(msg);
      }
    }, { noAck: false });

    // Configura eventos do WebSocket
    wss.on('connection', ws => {
      clients.add(ws);
      console.log('Cliente WS conectado');

      ws.on('close', () => {
        clients.delete(ws);
        console.log('Cliente WS desconectado');
      });

      ws.on('error', (err) => {
        console.error('WS error:', err);
        clients.delete(ws);
      });
    });

    // Sobe o servidor WebSocket na porta WS_PORT
    serverWs.listen(WS_PORT, () => {
      console.log(`Servidor WebSocket rodando na porta ${WS_PORT}`);
    });
  } catch (e) {
    console.error('Erro ao iniciar WS:', e);
  }
}

startWS();

// --- SERVIDORES HTTP ---

appCliente.listen(CLIENT_PORT, () => console.log(`Área do Cliente rodando na porta ${CLIENT_PORT}`));
appLoja.listen(LOJA_PORT, () => console.log(`Área da Loja rodando na porta ${LOJA_PORT}`));
