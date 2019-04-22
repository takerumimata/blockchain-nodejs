// const Block = require('./block');
//
// const block = new Block("sato","suzuki","yamada","kitagawa");
//
// const fooBlock = Block.mineBlock(Block.genesis(),"hoge");
//
// console.log(fooBlock.toString());

// const Blockchain = require('./blockchain');
// //インスタンスを生成
// const bc = new Blockchain();
//
// for ( let i = 0; i < 10; i++) {
//   console.log(bc.addBlock(`hello ${i}`).toString());
// }


const Wallet = require('./wallet');

const wallet = new Wallet();
//walletが作成されていることを確認
console.log(wallet.toString());
