//blockchainが正常に動作しているかをテストしているコードです．

const Blockchain = require('./index');   //blockchainのクラスを読み込む
const Block = require('./block');             //blockのクラスを読み込む

//describe関数に関して．
//https://qiita.com/y_hokkey/items/f73ea6b3d5f6902396b6
//かっこの中の引数の文字列はフォルダ名くらいの認識で良い．テストを実行した際に，表示される．

describe('Blockchain', () => {
  let bc,bc2;                     //オブジェクトを定義
  beforeEach( () => {
    bc = new Blockchain();    //インスタンスを生成
    bc2 = new Blockchain();
  });                        //

  it('start genesis block', () => {
    expect(bc.chain[bc.chain.length - 1]).toEqual(Block.genesis());   //最後のブロックのデータとジェネシスが一致しているか確認
  });

//ブロックを生成して、データが変じゃないか確認
  it('add Block', () => {
    const data = "hoge";

    bc.addBlock(data);

    expect(bc.chain[bc.chain.length - 1].data).toEqual(data); //ここで検証．hogeってデータがラストブロックのデータと一致しているか確認している．
  });

//正しいブロックデータを追加したら認証が通るか確認
  it('validate a valid chain', () => {
    bc2.addBlock("hoge");

    expect(bc.isValidChain(bc2.chain)).toBe(true);            //bc2インスタンスにデータとしてhogeを保存させて、検証を行なっている．
  });

//間違ったデータが入っててちゃんと検知できるかを確認--OK
  it('invalidate a chain with a corrupt genesis block', () => {
    bc2.chain[0] = "bad data";

    expect(bc2.isValidChain(bc2.chain)).toBe(false);
  });

//ブロックデータが改竄されたことを想定したテストを実施--NG
  it('invalidates a corrupt chain', () => {
    //ハッシュ関数がおかしい．dataを改竄しようがしまいが、同じ値になっている
    bc2.addBlock('foo');
    bc2.chain[1].data = 'Not foo';
    expect(bc2.isValidChain(bc2.chain)).toBe(false);

  });

  it('ブロックチェーン更新テスト', () => {
    bc2.addBlock("fuga");
    bc.replaceChain(bc2.chain);

    expect(bc.chain).toEqual(bc2.chain);
  });

  it('ブロックチェーンの更新省略テスト', () => {
    bc.addBlock("fuda");
    bc.replaceChain(bc2.chain);

    expect(bc.chain).not.toEqual(bc2.chain);
  });

});
