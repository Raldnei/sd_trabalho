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
docker-compose up -d
```

Isso iniciará o RabbitMQ.

5. Aguarde até que o **RabbitMQ esteja completamente iniciado.**

   - Verifique acessando: http://localhost:15672  
   - Usuário: `guest`  
   - Senha: `guest`

6. **Depois disso, vá no Docker Desktop → aba "Containers" → clique em “Run service” na aplicação.**

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

## ✉️ End
