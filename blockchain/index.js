//改竄されてないかの検証や、ブロックの追加処理を書いていってる.

const Block = require('./block');

class Blockchain {
  //ジェネシスブロックのみしか入っていない配列を定義していて、この配列にブロックを追加していく．
  constructor() {
    this.chain = [Block.genesis()];
  }

  //マイニングをする処理．this.chain[this.chain.length-1]がラストブロック．それとデータを引数にしてマイニング
  addBlock(data) {
    const block = Block.mineBlock(this.chain[this.chain.length - 1], data);
    //マイニングしたら配列にpushする
    this.chain.push(block);
    //ブロックを返す
    return block;
  }

  //改竄されてないかを検証する
  isValidChain(chain) {
    //ジェネシスブロックが改竄されていないかを検証
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {  //JSON.stringfyを使うと、オブジェクトの内容を文字列に変換できる．
      return false;                                                     //最初のブロック（ジェネシスブロック）が正しいか検証する
    }
    for (let i = 1; i < chain.length; i++ ){    //検証を行なっていく．ただし１番目のブロックの検証は済んでいるので２個目から始める．そのためi=0ではなくi=1からスタート
      const block = chain[i];       //i番目のブロックに関して検証処理を行う
      const lastBlock = chain[i-1]; //i-1番目と比較するために用意

      if (block.lastHash !== lastBlock.hash) {
        return false;
      }
      if (block.hash !== Block.blockHash(block)) {  //データが改竄されていないかを確認する
        return false;   //i番目に含まれるi-1番目のハッシュ値と、i-1番目がもつハッシュ値が等しいか検証：今回のブロックのハッシュ値が、ちゃんとハッシュ値正しいか検証
      }
    }

    return true;    //全部の検証が終わったらtrueを返す．
  }

//
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("ブロック数不足のため省略します")
      return;
    } else if(!this.isValidChain(newChain)) {
      console.log("ブロックチェーンデータ不備のため省略します");
      return;
    }

    console.log("最新ブロックデータチェーンデータに更新します");
    this.chain = newChain;
  }
}

module.exports = Blockchain;
