export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  opened_at?: string;
  closed_at?: string;
}
