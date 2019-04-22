const Transaction = require('./transaction');
const ChainUtil = require('../chain-util');
//const INITIAL_BALANCE = 500;
const { INITIAL_BALANCE } = require('../config'); //外部ファイルから読み込み．アカウントの残高初期値

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;                            //残高
    this.keyPair = ChainUtil.genKeyPair();                     //秘密鍵
    this.publicKey = this.keyPair.getPublic().encode('hex');  //公開鍵
  }

//文字列にして公開鍵と，残高を返す処理
  toString() {
    return `Wallet -
      publicKey : ${this.publicKey.toString()}
      balance   : ${this.balance}`;
  }

//署名．
  sign(dataHash) {
    return this.keyPair.sign(dataHash);   //秘密鍵を使って暗号化
  }

  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);
      if (amount > this.balance) {
          console.log(`金額: ${amount}が残高超過しています．`);
          return;
      }
      //トランザクションがあるか確認
      let transaction = transactionPool.existingTransaction(this.publicKey);
      //あるなしでアップデートか，新規追加か処理を分ける．
      if (transaction) {
        transaction.update(this, recipient, amount);
      } else {
        transaction = Transaction.newTransaction(this, recipient, amount);
        transactionPool.updateOrAddTransaction(transaction);
      }

      return transaction;
  }

//残高を確認する
  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(
      block => block.data.forEach(
        t => {
          transactions.push(t);
        }
      )
    );

    const WalletINputTs = transactions.filter(
      t => t.address === this.publicKey
    );

    let startTime = 0;

    if (WalletINputTs.length > 0) {
      const recentInputT = WalletINputTs.reduce(
        (prev, current) =>
        prev.input.timestamp > current.input.timestamp ?
          prev : current
      );

      balance = recentInputT.outputs.find(
        output =>
        output.address === this.publicKey
      ).amount;

      startTime = recentInputT.input.timestamp;

      transactions.forEach(
        t => {
          if (t.input.timestamp > startTime) {
            t.outputs,find(
              output => {
                if (output.address === this.publicKey) {
                  balance += output.amount;
                }
              }
            )
          }
        }
      );
    }

    return balance;
  }


//ウォレットを作成して返す
  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-address';
    return blockchainWallet;
  }
}

module.exports = Wallet;
