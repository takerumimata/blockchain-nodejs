const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } =require('../config');

//テストケースを作成
//

describe('Transaction', () => {
  let transaction, wallet, recipient, amount;
  beforeEach( () => {
    wallet = new Wallet();
    amount =50;
    recipient = 'r2c1e0p24nt';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  //単体テスト
  it('残高差し引きテスト', () => {
    expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount);
  });

  it('送金テスト', () => {
    expect(transaction.outputs.find(output => output.address === recipient).amount)
      .toEqual(amount);
  });

  it('取引署名テスト', () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it('正常な取引の検証', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it('不正な取引の検証', () => {
    transaction.outputs[0].amount = 5555;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe('残高超過テスト', () => {
    beforeEach( () => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient,amount);
    })

    it('取引省略テスト', () => {
      expect(transaction).toEqual(undefined);
    });
  });

  describe('取引更新テストケース', () => {
    let nextAmount, nextRecipient;

    beforeEach( () => {
      nextAmount = 20;
      nextRecipient = 'n32st-13rpi4nt';
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it('取引後差し引きテスト', () => {
      expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount -nextAmount);
    });

    it('送信先取引金額', () => {
      expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
        .toEqual(nextAmount);
    });

  });

  describe('招集取引作成', () => {
    beforeEach( () => {
      transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
    });

    it('口座採掘報酬テスト', () => {
      expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(MINING_REWARD);
    });
  });

});
