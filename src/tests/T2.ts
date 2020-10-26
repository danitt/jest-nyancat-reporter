/* eslint-disable @typescript-eslint/no-unused-vars */
test('Hello default', (): void => {
  expect(true).toBeTruthy();
});

describe('jest test many', () => {
  it.each([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15]])(
    'iterates %i',
    async (num) => {
      await new Promise((res) => {
        setTimeout(() => {
          expect(true).toBeTruthy();
          res();
        }, 300);
      });
    },
  );
});

describe('jest test many 2', () => {
  it.each([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15]])(
    'iterates %i',
    async (num) => {
      await new Promise((res) => {
        setTimeout(() => {
          expect(true).toBeTruthy();
          res();
        }, 500);
      });
    },
  );
});
