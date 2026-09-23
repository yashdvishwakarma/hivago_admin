# Hivago Admin Portal — Features Specification

This document provides a detailed list of features implemented in the Hivago Admin Portal.

---

## 📋 Comprehensive Feature Breakdown

### 1. Restaurant Management & Integration
- **Restaurant Directory**: Paginated grid/table listing of all restaurant partners with real-time status indication.
- **Active / Inactive Status Badging**: Color-coded badges with glowing status dots and row tinting for quick scanning.
- **Quick Status Filters**: One-click tab switcher for `All`, `Active`, and `Inactive` restaurants with live counter chips.
- **Restaurant Onboarding & Editing**:
  - General info: Name, Phone, Email, Address, Operating Hours, Latitude/Longitude coordinates.
  - Financial & Prep Settings: Flat fee commission, Average preparation time, Minimum order amount, FSSAI number.
  - Dietary Flags: Pure Veg, Vegan-Friendly, Jain Options selector.
  - Pickup Toggle: Allow/disallow customer pickup orders per location.
- **Google Listing & Place ID Integration**:
  - Google Places autocomplete search integration (`/admins/places/search`).
  - Search Google Places by business name and area.
  - Display assigned Google Place Name, Address, and Place ID (`ChIJ...`).
  - Show explicit `Linked` vs `Not Linked` status tags.
  - Duplicate / Collision indicator (`Currently Linked` vs `Linked to [Other Restaurant]`).
  - Link, Re-link, and Unlink buttons with immediate cache invalidation.
- **Account Status Toggling**: Deactivate or reactivate restaurants with a confirmation modal (`ToggleConfirmModal`).
- **Credential Resets**: Support password resets generating temporary credentials.

---

### 2. Order Management & Cancellation
- **Order Pipeline View**: Overview of all customer orders, filterable by order status.
- **Order Details Inspection**: Customer contact details, delivery address, ordered menu items, quantities, and total bill.
- **Order Cancellation Workflow**: Dedicated modal (`CancelOrderModal`) requiring cancellation reason selection before triggering API cancellation.

---

### 3. Rider Fleet Administration
- **Rider Directory**: View delivery riders, phone numbers, email addresses, and active state.
- **Password Resets**: Trigger rider password reset with a temporary password display popup (`TemporaryPasswordModal`).
- **Activation Control**: Toggle rider active/inactive status.

---

### 4. Financials, Payouts & Bank Accounts
- **Payout Summaries**: Track gross earnings, net payouts, platform flat fees, and commission totals.
- **Order-Level Fee Breakdown**: Modal view (`OrderLevelBreakdown`) displaying exact order commissions, delivery fees, and net payouts.
- **Bank Details Editor**: Update bank account details (Bank Name, Account Number, IFSC Code) for partners (`EditBankDetailsModal`).

---

### 5. Operational Dashboard & Analytics
- **Summary KPI Cards**: Real-time counts for Active Orders, Total Revenue, Active Restaurants, and Active Riders.
- **Interactive Visualizations**: Recharts-powered revenue trends, hourly order volumes, and performance analytics.

---

### 6. Marketing & Banners
- **Banner Administration**: Manage app promotional banners, hero imagery, and campaign dates (`AdminMarketingPage`).

---

### 7. Security & Auth Capabilities
- **Role-Based Views**: Admin vs Support role permission checks (`isSupport`).
- **Axios HTTP Client**: Interceptor with auto JWT token injection and standard error toast notifications.
- **Zod Schema Validation**: Form inputs validated before mutation execution.
