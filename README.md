<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&width=850&lines=Este+%C3%A9+apenas+um+prot%C3%B3tipo+para+fins+educativos!&color=6A0DAD" alt="Typing SVG" />

# 🧾 Tecnologias utilizadas
<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="32" height="32" style="margin-right: 10px;" />
  <img src="https://img.icons8.com/color/48/000000/express-js.png" alt="Express" width="32" height="32" style="margin-right: 10px;" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg" alt="RabbitMQ" width="32" height="32" style="margin-right: 10px;" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="32" height="32" style="margin-right: 10px;" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="32" height="32" style="margin-right: 10px;" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="32" height="32" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="40" height="40"/>

</p>




# 🧾 Sistema de Pedidos com WebSocket + RabbitMQ

Este projeto simula um sistema de pedidos em tempo real usando:

- WebSockets para comunicação instantânea entre cliente e loja  
- RabbitMQ como intermediador de mensagens  
- Docker Compose para orquestração dos serviços  

---

## 📂 Estrutura do Projeto

```
📁 projeto/
├── docker-compose.yml
├── server.js
├── package.json
├── config.js               # Configuração de portas e URLs do backend
├── /js/
│   ├── cliente.js
│   ├── loja.js
│   └── config.js           # Configuração de URLs do frontend (cliente e loja)
├── /html/
│   ├── cliente.html
│   ├── loja.html
├── /css/
│   ├── style-cliente.css
│   └── style-loja.css
```

---

## 🚀 Como Rodar o Projeto

### ✅ Pré-requisitos

- Docker  
- Docker Desktop  
- Git (opcional)  

---

### 🧠 Etapas para rodar:

1. **Abra o Docker Desktop** e verifique se o **Docker Engine está rodando**

2. **Clone o repositório ou abra a pasta do projeto**

3. No terminal ou pelo Docker Desktop:

   ⚠️ **É importante que o `rabbitmq` inicie antes do serviço da aplicação.**

4. Execute:

```bash
docker-compose up --build
```

Isso iniciará o RabbitMQ.

5. Aguarde até que o **RabbitMQ esteja completamente iniciado.**

   - Verifique acessando: http://localhost:15672  
   - Usuário: `guest`  
   - Senha: `guest`

6. **Depois disso, vá no código no VSCode → Procure pelo arquivo “docker-compose.yml” → Procure pela linha “app:” → clique em “Run service” no código.**

---

## 🌐 Acessando as Interfaces

- **Cliente:** http://localhost:8080/  
- **Loja (Admin):** http://localhost:8888/  

---

## 🔧 Configuração de Portas (opcional)

### 🖥️ Backend – `config.js` (na raiz)

Arquivo: `./config.js`

```js
module.exports = {
  CLIENT_PORT: 8080,
  LOJA_PORT: 8888,
  WS_PORT: 9999
};

```

### 🌐 Frontend – `config.js` (na pasta /js)

Arquivo: `./js/config.js`

```js
export const CLIENT_BASE_URL = 'http://localhost:8080';
export const LOJA_BASE_URL = 'http://localhost:8888';
export const WS_URL = 'ws://localhost:9999';
```

---

## ⚙️ Serviços Usados

| Serviço         | Porta | Descrição                          |
|-----------------|-------|------------------------------------|
| Cliente         | 8080  | Tela do cliente final              |
| Loja (Admin)    | 8888  | Tela de gerenciamento de pedidos   |
| WebSocket       | 9999  | Comunicação em tempo real          |
| RabbitMQ (AMQP) | 5672  | Porta de mensagens                 |
| RabbitMQ UI     | 15672 | Painel web de administração        |

---

## 📦 Comandos úteis

```bash
# Subir os containers
docker-compose up -d

# Parar tudo
docker-compose down

# Ver logs do app
docker-compose logs app

# Ver logs do RabbitMQ
docker-compose logs rabbitmq
```

---

## 🖥️ Telas do Sistema

### ✅ Cliente

- Envia pedidos com descrição e quantidade  
- Visualiza status do pedido em tempo real (com cores)

### 🛒 Loja (Admin)

- Visualiza lista de pedidos recebidos  
- Atualiza o status dos pedidos para:
  - Em preparo  
  - Saiu para entrega  
  - Entregue  
  - Pedido Cancelado  

---

## 🐇 Acesso ao RabbitMQ

Acesse: http://localhost:15672

- Usuário: `guest`  
- Senha: `guest`

---

## 💡 Dicas

- Verifique se o RabbitMQ está rodando antes de iniciar o app
- Configure corretamente os dois arquivos `config.js` para que o cliente e a loja se conectem corretamente
- As cores dos status dos pedidos podem ser customizadas no CSS

---


---

## ✉️ 


# Sistema de Notificações em Tempo Real para Delivery

## 1. Escolha entre RabbitMQ e Kafka

Neste projeto, escolhemos utilizar **RabbitMQ** em conjunto com **WebSocket** para implementar o sistema de notificações em tempo real. A justificativa para essa escolha inclui:

- **Modelo flexível de mensagens:** RabbitMQ oferece vários tipos de exchanges (fanout, direct, topic), facilitando o roteamento das mensagens conforme a necessidade.
- **Baixa latência:** Ideal para notificações rápidas e imediatas, garantindo que os usuários sejam informados instantaneamente sobre o status do pedido.
- **Simplicidade de integração:** RabbitMQ é fácil de configurar e integrar com WebSocket, acelerando o desenvolvimento do protótipo.
- **WebSocket:** Utilizado para comunicação bidirecional e em tempo real entre servidor e cliente, mantendo a conexão aberta para envio instantâneo das notificações.

Embora o Kafka seja robusto para processamento de grandes volumes e streaming de dados com alta durabilidade, o RabbitMQ é mais adequado para sistemas de notificações em tempo real com menor complexidade e latência.

## 2. Arquitetura do Sistema

### Visão Geral

- O servidor gerencia os pedidos enviados pelos clientes e atualizações feitas pela loja.
- Toda vez que um pedido é criado ou seu status é atualizado, o servidor publica uma mensagem na **exchange fanout** do RabbitMQ.
- O servidor WebSocket escuta essa exchange e distribui as mensagens para todos os clientes conectados em tempo real.
- Clientes (usuários finais) e a loja recebem as notificações instantaneamente via WebSocket e atualizam suas interfaces.

### Escalabilidade

- O RabbitMQ pode ser configurado em cluster para suportar alta carga.
- O servidor WebSocket pode ser escalado horizontalmente para suportar múltiplas conexões simultâneas.
- O uso de uma exchange fanout permite o broadcast eficiente das mensagens para múltiplos consumidores.

### Latência

- A combinação RabbitMQ + WebSocket proporciona baixa latência, com entrega quase instantânea das notificações.
- WebSocket mantém conexões abertas, evitando overhead de reconexões ou polling.

### Tolerância a Falhas

- RabbitMQ oferece persistência e confirmações para garantir que mensagens não sejam perdidas.
- O servidor tenta se reconectar automaticamente ao RabbitMQ em caso de falha.
- WebSocket detecta desconexões e possibilita reconexão automática dos clientes.
- O sistema mantém os pedidos em memória (para protótipo), podendo ser adaptado para persistência em banco de dados.

## 3. Protótipo Implementado

- Servidor Node.js que gerencia pedidos via API REST e publica mensagens no RabbitMQ.
- Exchange do tipo **fanout** para distribuir as notificações para todos os consumidores.
- Servidor WebSocket que repassa as mensagens para os clientes conectados.
- Cliente web que recebe as notificações em tempo real e atualiza a interface.
- Loja com painel para visualização e atualização dos pedidos em tempo real.

---

Este sistema demonstra a aplicação prática de filas de mensagens e comunicação em tempo real para melhorar a experiência do usuário em um sistema de delivery, garantindo notificações rápidas, escalabilidade e tolerância a falhas.

