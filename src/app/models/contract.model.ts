export interface Contract {
  id: number;
  user_id: number;
  companyId: string;
  companyName?: string;
  number: string;
  name: string;
  deliveryMethod: string;
  notificationAddress?: string;
  created_at?: string;
}
