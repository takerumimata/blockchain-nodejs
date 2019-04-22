const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
//?:三項演算子についてhttps://qiita.com/raccy/items/0b25b2f106e2a813828b
//if分的なもの。a ? b : c でaが条件式でtrueの時にb、falseの時にc
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transaction: 'CLEAR_TRANSACTION'
};

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

//P2Pポートでリッスンさせる
  listen() {
    const server = new Websocket.Server( { port :P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));
    this.connectPeers();
  }

//ノード同士をP2Pで結合する
  connectPeers(){
    peers.forEach( peer => {
      const socket =new Websocket(peer);
      socket.on('open', () => this.connectSocket(socket));
    });
  }

//
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected');
    this.messageHandler(socket);
    this.sendChain(socket);
    //socket.send(JSON.stringify(this.blockchain.chain));
  }

//
  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
      //this.blockchain.chain
    }));
  }

//全ノードに同期させる
  syncChains() {
    this.sockets.forEach(socket => {
        this.sendChain(socket);
    });
  }

//トランザクションをソケットへ流すためのメソッド
  sendTransaction(socket, transaction) {
    //json形式でトランザクションを渡す．
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }

  messageHandler(socket) {
    socket.on('message',message => {
      //文字列をJSONとして解析し、文字列によって記述されているJavascriptの値やオブジェクトを構築します
      const data = JSON.parse(message);
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transaction:
          this.transactionPool.clear();
          break;
      }
      //this.blockchain.replaceChain(data);
      console.log('data',data);
    });
  }

//トランザクションを全ノードへブロードキャストする．
  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }

  broadcastClearTransaction(){
    this.sockets.forEach(socket => socket.send(
      JSON.stringify( {
        type: MESSAGE_TYPES.clear_transaction
      })
    ));

  }
  }

module.exports = P2pServer;
