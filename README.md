# Hivago Admin Portal 🚀

A modern, high-performance Admin Operations & Management Dashboard built for the **Hivago** food delivery platform using **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **TanStack React Query**.

---

## 🌟 Key Features List

### 🏪 1. Restaurant Management
- **Interactive Directory & Filters**: View, search, and filter restaurant partners instantly by status (**All**, **Active**, **Inactive**) with live count badges.
- **Visual Status Tracking**: High-contrast, color-coded badges with pulsing indicators (`Active` vs `Inactive`) and distinct row background highlights for instant scanning.
- **Add & Edit Modal Workflows**: Complete form control for updating restaurant parameters:
  - Basic Info: Restaurant Name, Contact Number, Email, Operating Hours, Address, Coordinates (Latitude/Longitude).
  - Business Parameters: Flat fee commission, Average prep time (mins), Minimum order amount, FSSAI license number, Pickup order toggle.
  - Dietary Options: Pure Veg, Vegan-Friendly, and Jain options selector.
- **Google Listing & Place ID Integration**:
  - Direct integration with Google Places Search API (`/admins/places/search`).
  - Search Google Places by name & area directly within the Edit Restaurant modal.
  - **Live Link Status Display**: Shows assigned Google Place Name, Address/Location, and Place ID.
  - **Collision & Duplicate Detection**: Displays `Currently Linked` or `Linked to [Other Restaurant]` badges on search results.
  - Seamless **Link**, **Re-link**, and **Unlink** actions.
- **Status Control**: One-click Activate / Deactivate toggle with safety confirmation dialogs (`ToggleConfirmModal`).

### 📦 2. Order Operations & Tracking
- **Live Pipeline View**: Monitor incoming, active, and completed orders across all platform restaurants.
- **Order Details Breakdown**: View detailed itemized orders, pricing breakdowns, customer info, and delivery addresses.
- **Order Cancellation Workflow**: Modal workflow for cancelling orders with mandatory reason selection (`CancelOrderModal`).

### 🛵 3. Rider Fleet Management
- **Rider Roster**: Overview of delivery partners, contact details, active status, and account information.
- **Credentials & Access Control**: Admin ability to reset rider credentials with auto-generated temporary password popups (`TemporaryPasswordModal`).
- **Rider Status Toggle**: Deactivate or reactivate delivery riders.

### 💰 4. Payouts & Financial Management
- **Payout Records**: Financial summaries for restaurant partner earnings and rider payouts.
- **Order-Level Fee Breakdown**: Modal view (`OrderLevelBreakdown`) displaying exact order commissions, flat fees, delivery fees, and net payouts.
- **Bank Details Management**: Update restaurant and rider bank account details via modal form (`EditBankDetailsModal`).

### 📊 5. Analytics & Dashboard
- **Executive Operational Dashboard**: Real-time KPI summary cards for total revenue, active orders, active restaurants, and fleet status.
- **Recharts Data Visualizations**: Interactive sales trends, order volume distribution, and performance metrics over configurable timeframes.

### 📢 6. Marketing & Banner Management
- **Campaign Administration**: Manage promotional banners, hero graphics, and marketing campaigns (`AdminMarketingPage`).

### 👤 7. Restaurant Owners & Menu Management
- **Owner Account Control**: Register and manage restaurant owner profiles and credentials.
- **Menu Administration**: View and configure menu items, pricing, and category availability.

### 🔒 8. Security & Access Control
- **Role-Based Access Control (RBAC)**: Custom views and permissions based on user roles (Admin vs Support).
- **Secure Password Reset**: One-click password reset mechanism producing secure, copyable temporary credentials (`ConfirmResetModal` & `TemporaryPasswordModal`).
- **Axios HTTP Client**: Interceptor-based API client with automatic authorization header handling.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite 8
- **State Management & Data Fetching**: TanStack React Query v5, Zustand, Axios
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons
- **Data Visualization**: Recharts
- **Validation & Forms**: Zod schema validation
- **Testing**: Vitest, React Testing Library

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashdvishwakarma/hivago_admin.git
   cd hivago_admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.development` or `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components (Modal, Button, Popups)
├── core/
│   └── api/             # Axios API services (restaurants, riders, orders, etc.)
├── hooks/               # Custom React hooks (useDebounce, useResetPassword, etc.)
├── modules/
│   ├── analytics/       # Sales & analytics charts
│   ├── auth/            # Authentication & store
│   ├── dashboard/       # Main operational dashboard
│   ├── marketing/       # Banners & promos
│   ├── menu/            # Menu management
│   ├── orders/          # Order management & cancellation
│   ├── owners/          # Restaurant owners
│   ├── payouts/         # Financial payouts & breakdown modals
│   ├── restaurants/     # Restaurant directory & Google Place Linker
│   ├── riders/          # Delivery rider management
│   └── settings/        # System configuration
└── store/               # Global Zustand stores
```
