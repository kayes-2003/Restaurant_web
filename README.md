# 🍴 La Maison Restaurant App

Full-stack restaurant menu with Supabase Auth (email confirmation, password reset), customer cart, and admin panel.

---

## ⚡ Quick Start

### 1 — Install dependencies
```bash
npm install
```

### 2 — Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste + run the entire contents of `supabase/schema.sql`
3. Copy `.env.example` → `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

You get these from **Supabase → Project Settings → API**.

### 3 — Configure email confirmation (Supabase dashboard)

Go to **Authentication → Email Templates** and verify the Confirm Signup template is enabled.  
Go to **Authentication → URL Configuration** and add your local dev URL:
```
http://localhost:5173
```

### 4 — Run the app
```bash
npm run dev
```

---

## 👤 Auth Flows

| Flow | How it works |
|---|---|
| **Sign Up** | User fills form → Supabase sends confirmation email → user clicks link → can now sign in |
| **Sign In** | Email + password → instant access |
| **Forgot Password** | Enter email → Supabase sends reset link → user clicks → new password form opens automatically |
| **Resend Confirmation** | Button shown when email not yet confirmed |

---

## 🔐 Roles

Roles are stored in the `profiles` table (created automatically on signup via DB trigger).

### Make yourself admin

After signing up with your account, run this in the **Supabase SQL Editor**:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

Sign out and sign back in — you'll see the **Admin Panel** button in the header.

### What admins can do
- Add new menu items (name, description, price, category, emoji/image URL, offer %)
- Edit any item
- Delete items
- Toggle item availability on/off
- Grid or list view of all items
- Stats bar (total items, categories, items on offer, unavailable items)

### What customers can do
- Browse menu with search + category filter
- Add items to cart (must be signed in)
- Adjust quantities in cart
- Remove items from cart
- Place order (demo checkout)

---

## 🗄️ Database Structure

```
profiles      — id, email, role (admin|customer), created_at
menu_items    — id, name, description, price, category, image_url, offer_percent, available, created_at
cart_items    — id, user_id, menu_item_id, quantity, created_at
```

All tables use Row Level Security:
- `menu_items`: anyone can read; only `role = 'admin'` profiles can write
- `cart_items`: users can only see/edit their own rows
- `profiles`: users can only see/edit their own row

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── admin/        AdminItemCard, AdminItemModal, StatsBar
│   ├── customer/     MenuCard, CartDrawer
│   └── shared/       Header, AuthModal, CategoryTabs, Loader
├── hooks/            useAuth, useMenu, useCart
├── lib/              supabase.ts, utils.ts
├── pages/            MenuPage, AdminPage
├── styles/           globals.css
└── types/            index.ts
supabase/
└── schema.sql        — run this in Supabase SQL Editor
```

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS** (custom dark theme)
- **Supabase** (Auth, Postgres DB, RLS)
- **react-hot-toast** (notifications)
- **lucide-react** (icons)
