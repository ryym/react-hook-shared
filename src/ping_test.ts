import { ping } from './ping';

describe('ping()', () => {
  it('demonstrates unit test', () => {
    expect(ping('world')).toEqual('Hello, world!');
  });
});
