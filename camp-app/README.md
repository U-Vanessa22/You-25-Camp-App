# Camp Application - Evangelical Restoration Church

A full-stack camp management application with registration, payment tracking, and admin dashboard.

## Features

- 🌍 **Multi-language Support** (English/Kinyarwanda)
- 🌓 **Dark/Light Mode**
- 📝 **Child Registration** with DF.jpeg background
- 💳 **Payment System** with fixed code (1395770 - Guy)
- 📊 **Admin Dashboard** with real-time analytics
- 🔐 **Secure Login** (admin/admin123)
- 📱 **Responsive Design** for all devices
- 🔍 **QR Code Scanner** for quick access

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Free Deployment

This app is ready for free hosting on Netlify or Vercel.

### Netlify

1. Connect the `camp-app` folder as the site root.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add these environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel

1. Import the `camp-app` folder as the project root.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### QR Code Behavior

The QR code is generated from the current public site URL, so once the app is deployed the scanned code will open the hosted registration page for everyone.