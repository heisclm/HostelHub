# HostelHub: Professional Hostel Management System

HostelHub is a high-performance, full-stack web application designed to streamline the hostel booking and management process for students, hostel managers, and administrators. Built with **Next.js 15**, **TypeScript**, and **Firebase**, it offers a secure, real-time platform for the modern student housing market.

## 🚀 Key Features

### 🎓 For Students
- **Smart Search & Discovery**: Filter hostels by location, price, amenities, and proximity to campus.
- **Real-Time Availability**: View live room status and bed availability.
- **Secure Booking**: Instant booking with integrated payment options (Mobile Money).
- **Personal Dashboard**: Track booking status, payment history, and manage active stays.
- **Complaint Management**: Submit and track maintenance or service issues directly to managers.

## 🚀 Pro-Dev Recovery & Portability

If you clone this project and switch to a different Firebase account or project, follow these steps to avoid "Missing or insufficient permissions":

1.  **Configure Environment**: Copy `.env.example` to `.env` or `.env.local` and update the `NEXT_PUBLIC_FIREBASE_*` variables with your new project's credentials.
2.  **Deploy Security Rules**: This is the most common cause of permission errors. Run:
    ```bash
    npm run firebase:deploy:rules
    ```
3.  **Bootstrap Admin**: The system includes a fallback for the admin email `feraclem@gmail.com`. Log in with this email to access admin features on a new project, or update the `isAdmin` check in `firestore.rules`.
4.  **Diagnostics**: If an operation fails, the system provides a detailed `FirestoreErrorInfo` in the console, specifying exactly why the operation was denied.

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
- **Storage & Media**: [Cloudinary](https://cloudinary.com/) (for optimized image and document uploads)
- **Email**: [Resend](https://resend.com/) (for transactional emails and notifications)
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

### 2. Environment Variables & Configuration
This project uses environment variables (`.env` or `.env.local`) to securely store configuration, API keys, and credentials. 

To set up your environment:
1. Copy `.env.example` to `.env.local`: `cp .env.example .env.local`
2. Fill in the required credentials. Note that variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:12345678:web:abcdef12345"

# Cloudinary (Image/Document Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret" # DO NOT EXPOSE TO NEXT_PUBLIC

# Resend (Email Notifications)
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="HostelHub <onboarding@resend.dev>"
```

*(Note: For legacy compatibility during migration, the app can temporarily fallback to a `firebase-config.json` file if the preferred `NEXT_PUBLIC_FIREBASE_*` environment variables are missing.)*

### 4. Install Dependencies
Due to certain third-party libraries (like `react-paystack`) not yet officially supporting React 19 peer dependencies, you **must** use the `--legacy-peer-deps` flag during installation:

```bash
npm install --legacy-peer-deps
```

If you encounter issues with form validation libraries, ensure all core dependencies are present:

### 5. Run Development Server
```bash
npm run dev
```

## 🚀 Production Deployment & Handover Guide

Welcome to the HostelHub production setup! This section walks you through the exact steps required to deploy this high-performance platform reliably and securely.

### Phase 1: Environment Variables Setup (The `.env` File)
All sensitive data, API keys, and deployment configurations have been centralized (as seen in step 2 above).
1. Duplicate `.env.example` and name it `.env.local` (for local development) or `.env` (for production).
2. Fill in all the raw keys requested within the file. 
3. **Never commit your `.env` file to GitHub.** It is automatically ignored by `.gitignore`.

### Phase 2: Firebase Deployment (Database & Rules)
The codebase includes professional security rules (`firestore.rules`) and performance indexes (`firestore.indexes.json`).

#### 1. Identify Your Admin Account
By default, the Firestore database completely locks out modification of Hostels unless you are an "Admin". You MUST set up your admin email BEFORE deploying rules:
* Open `firestore.rules`.
* Go to around Line 26: `request.auth.token.email == "admin@gmail.com"`
* Replace `"admin@gmail.com"` with the Google account email you will use to log into the platform.

#### 2. Deploy Configuration to Firebase via CLI
If you have the Firebase CLI installed (`npm install -g firebase-tools`):
1. Login: `firebase login`
2. Connect the project: `firebase use your-firebase-project-id`
3. Deploy rules & indexes:
   ```bash
   firebase deploy --only firestore
   ```
*(Note: If you do not deploy the indexes, complex dashboard queries will fail with "Index Building" errors).*

### Phase 3: Email Delivery Setup (Resend)
The platform uses Resend to deliver OTPs, Welcome Emails, and Booking Confirmations. 

By default, Resend limits delivery in their "Sandbox Mode" to ONLY the email address that created the Resend account.
1. Log in to [Resend.com](https://resend.com).
2. Go to **Domains** and add your production domain (e.g., `hostelhub.com`).
3. Verify the domain using the DNS records provided by Resend.
4. Open your `.env` file and update:
   `RESEND_FROM_EMAIL="HostelHub <notifications@your-verified-domain.com>"`

If you do not complete this step, real managers and students will NOT receive emails.

### Phase 4: Image & Document Storage Setup (Cloudinary)
The system uploads room images and manager identity verifications to Cloudinary using secure, server-side cryptographic signatures.

Cloudinary sometimes blocks uploads if the requested destination folder doesn't exist yet.
1. Log in to your Cloudinary Dashboard.
2. Go to **Settings (Gear Icon)** -> **Upload**.
3. Scroll down to **Upload presets** or general upload settings and ensure **"Auto-create folders"** is ENABLED.

### Phase 5: Building for Production
Once all API keys are securely linked, you can build the application for deployment (Vercel, AWS, Google Cloud Run, etc.).

```bash
# 1. Clean install dependencies
npm install --legacy-peer-deps

# 2. Build the optimized Next.js app
npm run build

# 3. Start the production server
npm run start
```

**Note on Vercel Deployments:**
If deploying to Vercel, you do not need to upload the `.env` file. Instead:
1. Go to your Vercel Project Dashboard.
2. Navigate to **Settings** -> **Environment Variables**.
3. Copy/Paste the exact keys and values from your `.env` file directly into Vercel.

## 🔒 Security & Rules

### Firestore Security Rules
The system implements strict server-side validation via `firestore.rules`:
- **Role-Based Access Control (RBAC)**: Users can only access data relevant to their role.
- **Ownership Protection**: Students can only view their own bookings; managers can only manage their own hostels.
- **Admin Privileges**: Only authorized admin accounts (e.g., `admin@gmail.com`) can verify managers or view platform-wide stats.
- **Data Integrity**: All writes are validated for type safety, required fields, and logical consistency.

### Media Security (Cloudinary)
- **Secure Uploads**: All media uploads are secured via server-side cryptographic signature generation (`/api/upload`).
- **Optimized Delivery**: Images are automatically compressed and delivered via Cloudinary's global CDN to ensure fast load times and minimal data usage.

## 💳 Payment Integration
The system is designed to support **Mobile Money (MoMo)** payments via providers like Paystack or Hubtel. Ensure you configure the appropriate API keys in your environment settings to enable live transactions.

## 📄 License
This project is proprietary and built for the HostelHub platform.
