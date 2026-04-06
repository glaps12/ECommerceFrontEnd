import { Product } from './product';

describe('Product', () => {
  it('should create an instance', () => {
    expect(
      new Product(1, 'sku', 'n', 'd', 1, 'u', true, 1, new Date(), new Date()),
    ).toBeTruthy();
  });
});