export interface OrderResponse {
  success: boolean;
  message: string;
  orderTrackingNumber: string;
  status: string;
  totalPrice: number;
  totalQuantity: number;
  cardLastFour: string;
  dateCreated: string;
  items: OrderItemDto[];
  shippingAddress: any;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
}
