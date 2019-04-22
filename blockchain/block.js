//生成されるブロックの定義．生成のされ方やジェネシスブロック．コンセンサスアルゴリズム．ハッシュ化．difficultyの更新処理など
const ChainUtil = require('../chain-util');
//const SHA256 = require('crypto-js/sha256');
const { DIFFICULTY, MINE_RATE } = require('../config');   //dofficuktyの設定．ファイルから読み込む

class Block {

  //コンストラクタ．ブロックに含まれるデータを定義している．
    constructor(timestamp,lastHash,hash,data,nonce,difficulty ) {
        this.timestamp = timestamp;             //タイムスタンプ
        this.lastHash = lastHash;               //ラストハッシュ
        this.hash = hash;                       //ハッシュ
        this.data = data;                       //ブロックのデータ
        this.nonce = nonce;                     //ブロックのなんす
        this.difficulty = difficulty  || DIFFICULTY;           //difficulty
    }
    //ブロックに含まれるデータを文字列にして返すメソッド
    toString() {
        return `Block
        Timestamp : ${this.timestamp}
        lastHash  : ${this.lastHash.substring(0,10)}
        hash      : ${this.hash.substring(0,10)}
        nonce     : ${this.nonce}
        difficulty: ${this.difficulty}
        data      : ${this.data}`;
    }

    //ジェネシスブロックを生成している
    static genesis(){
        return new this("timestamp","----","h4r0-h123",[],0,DIFFICULTY);
    }

    //マイニング処理．１つ前のブロックと今回のデータを引数としてとる
    static mineBlock(lastBlock, data) {
      const lastHash = lastBlock.hash;
      let { difficulty } = lastBlock;
      let timestamp,hash;
      let nonce = 0;
//proof of workのアルゴリズム
      do {
        nonce++;                  //nonceをインクリメント
        timestamp = Date.now();   //時間を取得
        difficulty = this.adjustDifficulty(lastBlock, timestamp);
        hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);  //hash値を求める．

      } while (hash.substring(0,difficulty) !== '0'.repeat(difficulty));  //hash値の先頭４文字が0でなければ繰り返し．

      return new Block(timestamp, lastHash, hash, data, nonce, difficulty);
        // const timestamp = Date.now();                       //タイムスタンプはここで取得
        // const lastHash = lastBlock.hash;                    //１つ前のブロックのハッシュ値を含める．
        // const hash = Block.hash(timestamp, lastHash, data); //ハッシュ値はタイムスタンプ、一個前のハッシュ値、データから生成する．
        //
        // return new Block(timestamp,lastHash,hash,data);
    }

    //ハッシュ化
    static hash(timestamp, lastHash, data, nonce, difficulty) {
        //return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();   //sha256でハッシュ化して、文字列に変換する
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();   //sha256でハッシュ化して、文字列に変換する
    }

    //ハッシュ値のみを返すメソッド．
    static blockHash(block) {
      const {timestamp, lastHash, data, nonce, difficulty } = block;
      return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
      let { difficulty } = lastBlock;     //最後のブロックの難易度を取得
      //三項演算子を用いてマインレート以上に時間がかかっているかで処理を分ける．
      difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty -1;
      return difficulty;
    }
}

//Blockとして外部に読み込めるようにモジュール化
module.exports = Block;
