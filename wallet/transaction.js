const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
  //constructorにプロパティを定義
  constructor() {
    this.id = ChainUtil.id();   //トランザクションに固有のidが振られる
    this.input = null;          //トランザクションの中身を一時的に入れる箱　signTransactionで利用する．
    this.outputs = [];          //トランザクションの箱
  }

//取引の更新．送金者，受け取り手，送金額を引数にとるクラスだよ．
  update(senderWallet, recipient, amount) {
    const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);  //送金者のアドレスと同じアドレスで行われた取引をsenderOutputとして定義している．明細．

    if (amount > senderOutput.amount){
      console.log(`金額${amount}が残高を超過しています．`);
      return;
    }

    //アカウント残高方式でやってると思うんだけど，送金すると送金者のアカウント残高は減るけど，受け取った側の残高が増えるような処理を行なっていないのでは？まだやってないだけ？
    senderOutput.amount = senderOutput.amount - amount;
    this.outputs.push( {amount, address: recipient});
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  static newTransaction(senderWallet, recipient, amount) {
    //残高が送金したい金額よりも少ないとエラーを吐くようにする．
    if (amount > senderWallet.balance) {
      console.log(`金額： ${amount}が残高釣果しています`);
      return;
    }

    return Transaction.transactionWithOutputs(senderWallet,[
      {amount: senderWallet.balance -amount, address: senderWallet.publicKey},
      {amount, address: recipient}
    ])
    //残高の方が送金金額よりも大きいことを確認したら，インスタンスを作成．
    // const transaction =new this();    //インスタンスを生成
    // //outputsの配列にpushする内容が以下
    // transaction.outputs.push(...[
    //   { amount: senderWallet.balance - amount,address: senderWallet.publicKey}, //送金者の残高 - 送金額　：　送金者のパブリックキー（アドレス）
    //   { amount, address: recipient}                                            //貰った金額（送金額）：受取手のアドレス
    // ]);
    //
    // this.signTransaction(transaction, senderWallet);  //トランザクションに署名.
    //
    // //トランザクションを返す．
    // return transaction;
  }

  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionWithOutputs(blockchainWallet,
      [
        {amount: MINING_REWARD, address: minerWallet.publicKey}
      ]);
  }

  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }


//トランザクションに署名処理を行う
  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),                                              //タイムスタンプ
      amount: senderWallet.balance,                                       //送金者の残高
      address: senderWallet.publicKey,                                    //送金者のアドレス
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))   //署名．ハッシュ化されたトランザクションをもう一度，秘密鍵を利用して暗号化 https://qiita.com/Akatsuki_py/items/65a009968f9cefca440b
    };
  }
//トランザクションの検証処理．signTransactionで利用された値を用いる．
  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,          //公開鍵（アドレス）
      transaction.input.signature,        //秘密鍵を利用して作られた署名．
      ChainUtil.hash(transaction.outputs) //データハッシュ
    );
  }

}

module.exports = Transaction;
