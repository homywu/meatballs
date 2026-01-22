export interface Product {
    id: string;
    name: {
        en: string;
        zh: string;
    };
    description: {
        en: string;
        zh: string;
    };
    price: number;
    tag: {
        en: string;
        zh: string;
    };
    image: string;
    created_at?: string;
}
