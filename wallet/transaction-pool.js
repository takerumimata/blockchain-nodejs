const Transaction = require('../wallet/transaction');

//取引明細を実装
class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    //トランザクションidで検索をかける．
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);

    //トランザクションリストからトランザクションが見つかったら更新して，見つからなければ追加する処理を実装する．
    if(transactionWithId) {
      //見つかった場合
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } else {
      //見つからなかった場合
      this.transactions.push(transaction);
    }
  }

//トランザクションが存在するか確認するメソッド
  existingTransaction(address) {
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions() {
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.outputs.reduce(
        (total, output) => {
          return total + output.amount
        }, 0
      )
      //インプットの総量とアウトプットの総量が一致していなければダメ
      if (transaction.input.amount !== outputTotal) {
        console.log(`不正な取引です。${transaction.input.address}`);
        return;
      }

      if(!Transaction.verifyTransaction(transaction)) {
        console.log(`不正な署名です。${transaction.input.address}`)
        return;
      }

      return transaction;
    });
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
