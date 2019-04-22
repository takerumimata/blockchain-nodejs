//RSAよりも遅い暗号”elliptic”ってのでキーペアを作ってます．ハッシュ化処理もここでメソッドを定義していて，モジュール化して外部に公開しています．

const EC = require('elliptic').ec;  //https://www.npmjs.com/package/elliptic
const uuidV1 = require('uuid/v1');  //固有idを管理するためのモジュール
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');     //今回使う暗号化モジュール

class ChainUtil {
  //keyを生成するメソッド
  static genKeyPair() {
    return ec.genKeyPair();   // Generate keys
  }
//固有のidを生成するメソッド
  static id() {
    return uuidV1();
  }

//hash関数を定義する．
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

//電子署名の確認を行う．公開鍵，署名，データのハッシュ値を利用する．
static verifySignature(publicKey, signature, dataHash) {
  //ECのメソッドをゴリゴリ利用する．
  return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);  //hexを利用．
}

}
//モジュールとして外部で読み込めるようにする．
module.exports = ChainUtil;
