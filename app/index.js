const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const P2pServer = require('./p2p-server');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();                       //expressを定義

app.use(bodyParser.json());                  //

//ブロックチェーン，ウォレット，トランザクションインスタンスを作成．
const bc = new Blockchain();                 //
const wallet = new Wallet();
const tp = new TransactionPool();

//p2pサーバーインスタンスを作成．
const p2pServer = new P2pServer(bc, tp);         //
const miner = new Miner(bc, tp, wallet, p2pServer);

app.get('/blocks', (req, res) => {           //
  res.json(bc.chain);                        //
});

app.post('/mine', (req, res) => {            //
  //リクエストされたデータでブロックチェーンにデータを作っていく．
  const block = bc.addBlock(req.body.data);                     //
  console.log(`ブロックが追加されました。 ${block.toString()}`);    //コンソールにメッセージと追加されたブロックを表示する
  p2pServer.syncChains();                                       //P2Pで同機する
  res.redirect('/blocks');                                      //ポストされた際のリダイレクト先
});

app.get('/transactions', (req, res) => {
  //取引明細の一覧をJSON形式で返すようにしていく．
  res.json(tp.transactions);
});

//トランザクションを投げるメソッド．送信先と金額を指定するとトランザクションが投げれる．
app.post('/transact', (req, res) => {
  //取引を作成して投げる
  const { recipient, amount} = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

//口座番号公開API
app.get('/public-key', (req, res) => {
  res.json({publickey : wallet.publicKey});
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`ブロックが生成されました。${block.toString()}`);
  res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));   //サーバーをHTTPポート指定でリッスン状態にする


p2pServer.listen();       //リッスン状態で待機させる
