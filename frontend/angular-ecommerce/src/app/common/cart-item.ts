import { Product } from './product';

export class CartItem {
  quantity: number = 1;

  constructor(public product: Product) {}

  get id(): number {
    return this.product.id;
  }

  get name(): string {
    return this.product.name;
  }

  get unitPrice(): number {
    return this.product.unitPrice;
  }

  get imageUrl(): string {
    return this.product.imageUrl;
  }
}

