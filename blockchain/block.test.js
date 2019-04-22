const Block = require('./block');
//const { DIFFICULTY } = require('../config');

describe('Block', () => {

  let data, lastblock, block;

  beforeEach(() => {
    data = 'sato';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it('data test', () => {
    expect(block.data).toEqual(data);
  });

  it('hash test', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  it('指定難易度のハッシュ値生成テスト', () => {
    expect(block.hash.substring(0,block.difficulty)).toEqual('0'.repeat(block.difficulty));
    console.log(block.toString());
  });

  it('低速ブロック採掘で難易度を下げるテスト',() => {
    expect(Block.adjustDifficulty(block, block.timestamp + 36000)).toEqual(block.difficulty-1);
  });

  it('高速ブロック採掘で難易度をあげるテスト',() => {
    expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(block.difficulty+1);
  });
});
