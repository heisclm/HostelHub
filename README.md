# HostelHub: Professional Hostel Management System

HostelHub is a high-performance, full-stack web application designed to streamline the hostel booking and management process for students, hostel managers, and administrators. Built with **Next.js 15**, **TypeScript**, and **Firebase**, it offers a secure, real-time platform for the modern student housing market.

## 🚀 Key Features

### 🎓 For Students
- **Smart Search & Discovery**: Filter hostels by location, price, amenities, and proximity to campus.
- **Real-Time Availability**: View live room status and bed availability.
- **Secure Booking**: Instant booking with integrated payment options (Mobile Money).
- **Personal Dashboard**: Track booking status, payment history, and manage active stays.
- **Complaint Management**: Submit and track maintenance or service issues directly to managers.

### 🏠 For Hostel Managers
- **Property Management**: List hostels, define room types, and set pricing.
- **Verification System**: Securely upload identity and property ownership documents for platform authorization.
- **Booking Control**: Manage incoming student requests, approve payments, and monitor occupancy.
- **Service Desk**: Real-time response system for student complaints and inquiries.

### 🛡️ For Administrators
- **Platform Analytics**: High-level overview of total users, hostels, bookings, and revenue.
- **Verification Authority**: Review and authorize manager applications and property credentials.
- **User Management**: Monitor platform activity and ensure system integrity.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Auth**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage) (for document and image uploads)
- **Animations**: [Motion](https://motion.dev/) (formerly Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📦 Project Structure

```text
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication routes (Login, Register, Verify)
│   ├── admin/            # Administrator dashboard and verification modules
│   ├── manager/          # Manager dashboard, hostel listing, and verification
│   ├── student/          # Student dashboard and booking management
│   └── hostels/          # Public hostel browsing and details
├── components/           # Reusable UI components
│   ├── shared/           # Global components (Navbar, Footer)
│   └── ui/               # Base UI elements (Buttons, Cards, Inputs)
├── context/              # React Context providers (Auth, Theme)
├── services/             # Firebase interaction logic (Firestore queries)
├── types/                # TypeScript interfaces and types
├── lib/                  # Utility functions and shared configurations
└── public/               # Static assets
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js 20+
- A Firebase Project

### 2. Firebase Configuration
This project uses a `firebase-applet-config.json` file in the root directory to manage Firebase credentials. Ensure this file exists and contains your project's configuration:

```json
{
  "apiKey": "your_api_key",
  "authDomain": "your_auth_domain",
  "projectId": "your_project_id",
  "storageBucket": "your_storage_bucket",
  "messagingSenderId": "your_sender_id",
  "appId": "your_app_id",
  "firestoreDatabaseId": "your_database_id"
}
```

### 3. Install Dependencies
Due to certain third-party libraries (like `react-paystack`) not yet officially supporting React 19 peer dependencies, you **must** use the `--legacy-peer-deps` flag during installation:

```bash
npm install --legacy-peer-deps
```

If you encounter issues with form validation libraries, ensure all core dependencies are present:
```bash
npm install react-hook-form @hookform/resolvers zod --legacy-peer-deps
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔒 Security & Rules

### Firestore Security Rules
The system implements strict server-side validation via `firestore.rules`:
- **Role-Based Access Control (RBAC)**: Users can only access data relevant to their role.
- **Ownership Protection**: Students can only view their own bookings; managers can only manage their own hostels.
- **Admin Privileges**: Only authorized admin accounts (e.g., `admin@gmail.com`) can verify managers or view platform-wide stats.
- **Data Integrity**: All writes are validated for type safety, required fields, and logical consistency.

### Firebase Storage Rules
- Only authenticated users can upload documents.
- Managers can only access their own verification documents.
- Public images (hostel photos) are readable by all users.

## 💳 Payment Integration
The system is designed to support **Mobile Money (MoMo)** payments via providers like Paystack or Hubtel. Ensure you configure the appropriate API keys in your environment settings to enable live transactions.

## 📄 License
This project is proprietary and built for the HostelHub platform.
