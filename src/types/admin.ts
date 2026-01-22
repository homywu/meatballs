export interface DeliveryOption {
    id: string;
    address: string | null;
    description: string | null;
    map_url: string | null;
    delivery_method: string | null;
    label: string;
    created_at?: string;
}

export interface ProductionSchedule {
    id: string;
    status: 'draft' | 'published' | 'completed';
    notes: string | null;
    products: ScheduleProduct[];
    deliveries: ScheduleDelivery[];
    created_at?: string;
}

export interface ScheduleProduct {
    schedule_id: string;
    product_id: string;
    quantity: number;
}

export interface ScheduleDelivery {
    id: string;
    schedule_id: string;
    delivery_option_id: string;
    delivery_time: string; // ISO string for Timestamp
    cutoff_time: string | null; // ISO string
    delivery_option?: DeliveryOption; // For joined data
}
