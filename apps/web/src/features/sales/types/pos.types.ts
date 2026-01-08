export interface Product {
    id: string;
    code: string;
    name: string;
    price: number;
    image: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export type PaymentMethod = "cash" | "card" | "qr";