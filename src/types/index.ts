export interface Assistant {
  id: string;
  name: string;
  major: string;
  subjects: string[];
  hourly_rate: number;
  rating: number;
  photo_url: string;
  video_url: string;
  bio: string;
  university: string;
  available_slots: Slot[];
  login_email: string | null;
  login_password: string | null;
  created_at?: string;
}

export interface Slot {
  date: string; // ISO date: YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
}

export type BookingStatus =
  | 'pending_verification'
  | 'accepted_by_assistant'
  | 'declined_by_assistant'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  booking_code: string;
  assistant_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  total_cost: number;
  payment_ref: string | null;
  receipt_url: string | null;
  lesson_description: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface BookingWithAssistant extends Booking {
  assistant: Assistant | null;
}
