# Project Specification: 潮·作 | CRAFT & CHAO (MVP)

## 1. Project Overview

This is a lightweight, mobile-first web application designed to collect orders for a home-based meatball business in Calgary. The primary goal is to replace unstructured WhatsApp/WeChat text orders with structured data. Business Model: Informal/Friends & Family. Payment Method: No payment gateway. Uses manual Interac e-Transfer.

## 2. Tech Stack (Strict Constraints)

1. Framework: Next.js 16+ (App Router).
2. Language: TypeScript (Strict mode).
3. Styling: Tailwind CSS + Lucide React (Icons).
4. Backend/Database: Google Sheets API.
5. Deployment: Vercel.
6. State Management: React Hooks (keep it simple).

## 3. Data Architecture (Google Sheets)

### Spreadsheet Structure: orders

Since the scale is small, we will use a single Google Sheet with one worksheet for orders.

#### **Worksheet: orders**

Columns (Row 1 as headers):

- `id` (UUID generated client-side or server-side)
- `created_at` (ISO timestamp string)
- `customer_name` (text)
- `phone_number` (text) - Critical for e-Transfer reconciliation
- `delivery_method` (text) - 'pickup_sage_hill' or 'delivery'
- `delivery_address` (text) - Empty if pickup
- `items` (JSON string) - Structure: `[{"id": "beef", "qty": 2, "price": 20}, ...]`
- `total_amount` (number)
- `status` (text) - Default: 'pending'. Options: 'pending', 'paid', 'completed'
- `notes` (text) - Optional customer notes

### Access Control

1. Write Access: Server-side API route uses Google Service Account credentials to append rows (Anyone with the link can order via the web app).
2. Read/Update Access: Only authenticated admin users can read/update orders via protected routes or direct Google Sheets access.

**Note for Cursor:** For the MVP, we might skip building a complex Admin UI and rely on direct Google Sheets access, but the code should be structured to allow an Admin View later. Use `googleapis` npm package with Service Account authentication for server-side operations.

## 4. Product Configuration (Hardcoded for MVP)

To avoid database lookups for product definitions, use a constant config file.

1. Beef Meatballs: $20 / pack (1 lb)
2. Pork Meatballs: $18 / pack (1 lb)
3. Fish Meatballs: $22 / pack (1 lb)

## 5. User Flows

### A. Customer Flow (The "Happy Path")

1. Landing: User opens the link. Sees a clean, appetizing header.
2. Selection: User sees the list of meatballs. Uses + / - buttons to adjust quantity.
3. Cart Summary: A sticky footer or visible section showing total items and Total Price ($).
4. Checkout Form:
   - Input: Name (Required)
   - Input: Phone Number (Required - Validate for 10 digits)
   - Toggle: Pickup (Sage Hill) vs. Delivery (Calgary). If Delivery, show Address input.
5. Submission: User clicks "Submit Order".
6. Success State (Critical):
   - Clear message: "Order Received!"
   - Payment Instruction: "Please e-Transfer $[Total] to <samson@email.com>."
   - Reminder: "Put your phone number in the e-Transfer memo."
   - No automatic redirect. Let the user stare at the payment info.

### B. Admin Flow (Future Phase)

For now, we will manage data directly in Google Sheets or via a simple protected route /admin that requires a hardcoded PIN or basic auth.

## 6. UI/UX Design Guidelines

1. Mobile First: 95% of users will open this on a phone. Tap targets must be large (44px+).
2. Aesthetic: Warm, trustworthy, artisanal.
3. Feedback: Immediate feedback when adding items. Loading spinners during submission.

## 7. Development Rules for Cursor

1. Component Structure: Use small, reusable components (e.g., ProductCard, CartSummary, OrderForm).
2. Server Actions: Use Next.js Server Actions for the form submission to keep client-side JS minimal and secure.
3. Type Safety: Generate TypeScript interfaces for the Google Sheets order structure and the Product object.
4. Error Handling: Gracefully handle network errors during submission (e.g., "Network error, please try again").
5. Google Sheets API: Use `googleapis` npm package with Service Account credentials stored as environment variables. Create server-side API routes or Server Actions to append rows to the Google Sheet.
