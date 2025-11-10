// basic smoke test for minimax.js
const fs = require('fs');
const vm = require('vm');

// Load the code (since minimax.js defines global functions)
const code = fs.readFileSync('./minimax.js', 'utf8');
vm.runInThisContext(code);

test('minimax returns an object with index and score', () => {
  const board = [0,1,2,3,4,5,6,7,8];
  const result = minimax(board.slice(), aiPlayer);
  expect(result).toHaveProperty('index');
  expect(result).toHaveProperty('score');
});

