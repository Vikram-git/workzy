export type Role = 'customer' | 'worker' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AvailabilityStatus = 'available' | 'unavailable';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type RateType = 'hourly' | 'daily';

export interface Profile {
  id: string;
  auth_user_id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  email: string;
  profile_image: string | null;
  account_status: 'active' | 'suspended';
  created_at: string;
}

export interface Category { id: string; name: string; description: string; icon: string; active: boolean }
export interface Language { id: string; name: string; active: boolean }
export interface ServiceArea { id: string; name: string; city: string; active: boolean }

export interface WorkerDirectoryEntry {
  id: string;
  profile_id: string;
  full_name: string;
  profile_image: string | null;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  daily_rate: number;
  verification_status: VerificationStatus;
  availability_status: AvailabilityStatus;
  accepting_bookings: boolean;
  availability?: { weekday: number; start_time: string; end_time: string; active: boolean }[];
  category_ids: string[];
  category_names: string[];
  languages: string[];
  service_areas: string[];
  average_rating: number;
  review_count: number;
  is_demo?: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_image: string | null;
  worker_id: string;
  worker_profile_id: string;
  worker_name: string;
  worker_image: string | null;
  category_id: string;
  category_name: string;
  booking_date: string;
  start_time: string;
  duration: number;
  rate_type: RateType;
  agreed_rate: number;
  customer_note: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  review_id: string | null;
}

export interface Review { id: string; customer_name: string; rating: number; review_text: string; created_at: string }
export interface AppNotification { id: string; title: string; message: string; type: string; read: boolean; created_at: string }
