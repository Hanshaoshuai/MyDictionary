const CHARS = 'abcdefghigklmnopqrstuvwxyz';
const NUMS = '0123456789';
const ALL = CHARS + NUMS;


// 最简单的 uid 生成器，够用就好
function uid(n) {
  n = n ? n : 6;
  if (n < 2) {
    throw new RangeError('n 不能小于 2');
  }

  return ('xx' + 'z'.repeat(n - 2)).replace(/[xz]/g, function(c) {
    return c === 'x' ?
      CHARS[Math.random() * 26 | 0] :
      ALL[Math.random() * 36 | 0];
  });
}

module.exports = uid;