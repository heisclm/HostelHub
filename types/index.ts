export interface User {
  uid: string;
  email: string;
  role: 'student' | 'guest' | 'manager' | 'admin';
  displayName?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  createdAt: Date;
}

export interface Hostel {
  id?: string;
  managerId: string;
  name: string;
  location: string;
  address: string;
  distanceFromCampus: number; // in km
  coordinates?: { lat: number, lng: number };
  amenities: string[];
  images: string[];
  rating: number;
  isVerified: boolean;
  policies?: string[];
  contactDetails?: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  createdAt: any;
}

export interface Room {
  id?: string;
  hostelId: string;
  roomNumber: string;
  type: '1-in-a-room' | '2-in-a-room' | '3-in-a-room' | '4-in-a-room';
  pricePerSemester: number;
  capacity: number;
  occupiedBeds: number;
  isAvailable: boolean;
}

export interface Review {
  id?: string;
  hostelId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Booking {
  id?: string;
  hostelId: string;
  hostelName?: string;
  managerId?: string;
  roomId: string;
  roomNumber?: string;
  studentId: string;
  studentEmail: string;
  status: 'pending' | 'approved' | 'confirmed' | 'cancelled';
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: any;
  expiresAt?: any;
  semester?: string;
  paymentReference?: string;
}

export interface Complaint {
  id?: string;
  userId: string;
  hostelId: string;
  managerId: string;
  title: string;
  message: string;
  image?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  managerResponse?: string;
  adminVisible: boolean;
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
}

export interface Payout {
  id?: string;
  managerId: string;
  amount: number;
  reference?: string;
  notes?: string;
  createdAt: any;
}

export interface Inquiry {
  id?: string;
  hostelId: string;
  managerId: string;
  studentName: string;
  studentEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: any;
}

export interface AppNotification {
  id?: string;
  userId: string;
  type: 'booking' | 'system' | 'complaint' | 'verification' | 'inquiry';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: any;
}
