const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class  Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    //有効なトランザクションかどうか検証する
    const validTransactions = this.transactionPool.validTransactions();
    //有効なトランザクションだったら配列にpushする
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    //ブロックチェーンにブロックを追加する処理
    const block = this.blockchain.addBlock(validTransactions);
    //p2pで同期処理
    this.p2pServer.syncChains();
    //トランザクションプールをクリア
    this.transactionPool.clear();
    //ブロードキャストしてトランザクションを流す．
    this.p2pServer.broadcastClearTransaction();
    return block;
  }

}

module.exports = Miner;
