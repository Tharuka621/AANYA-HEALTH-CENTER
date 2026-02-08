# Doctor Availability - UI Flow Guide

## 🔷 Doctor's View - Availability Manager

### Empty State
```
┌────────────────────────────────────────────────────────────────┐
│  Availability Manager                                          │
│  Manage your weekly schedule and time slots                    │
│                                                                 │
│                          📅                                     │
│          No availability slots configured                       │
│                                                                 │
│     Add your first time slot to start accepting                │
│            patient appointments                                 │
│                                                                 │
│              [+ Add Your First Slot]                            │
└────────────────────────────────────────────────────────────────┘
```

### With Slots Created
```
┌──────────────────────────────────────────────────────────────────────┐
│  Availability Manager                    [+ Add Time Slot]           │
│  Manage your weekly schedule and time slots                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Date                 │ Time Slot        │ Capacity │ Status │ Actions│
│  ─────────────────────┼──────────────────┼──────────┼────────┼────────│
│  📅 Monday, Feb 10    │ 09:00 AM -       │ 10 pts   │ Active │ ✏️ 🔄 🗑️│
│  2026                 │ 12:00 PM         │          │ ✓      │        │
│  ─────────────────────┼──────────────────┼──────────┼────────┼────────│
│  📅 Monday, Feb 10    │ 02:00 PM -       │ 8 pts    │ Active │ ✏️ 🔄 🗑️│
│  2026                 │ 05:00 PM         │          │ ✓      │        │
│  ─────────────────────┼──────────────────┼──────────┼────────┼────────│
│  📅 Tuesday, Feb 11   │ 09:00 AM -       │ 12 pts   │ Inactive│ ✏️ 🔄 🗑️│
│  2026                 │ 01:00 PM         │          │ ✗      │        │
└──────────────────────────────────────────────────────────────────────┘

Legend:
✏️  = Edit slot
🔄 = Toggle active/inactive
🗑️  = Delete slot
```

### Add/Edit Slot Dialog
```
┌────────────────────────────────────────────────┐
│  Add New Availability Slot              ✕      │
├────────────────────────────────────────────────┤
│                                                 │
│  Date *                                         │
│  ┌───────────────────────────────────────┐    │
│  │ 02/10/2026              📅            │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  Start Time *         End Time *                │
│  ┌──────────────┐    ┌──────────────┐         │
│  │ 09:00   🕒   │    │ 12:00   🕒   │         │
│  └──────────────┘    └──────────────┘         │
│                                                 │
│  Maximum Appointments *                         │
│  ┌───────────────────────────────────────┐    │
│  │ 10                                    │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ☑ Active                                      │
│                                                 │
│                                                 │
│          [Cancel]    [Create Slot]             │
└────────────────────────────────────────────────┘
```

## 🔷 Patient's View - Appointment Booking

### Initial State
```
┌────────────────────────────────────────────────────────────────┐
│  Book an Appointment                                            │
│  Select a date to view available time slots with doctors       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select Date                                                    │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ 02/10/2026                           📅             │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  ℹ️ Select a date to see available appointments                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### With Available Slots
```
┌────────────────────────────────────────────────────────────────┐
│  Book an Appointment                                            │
├────────────────────────────────────────────────────────────────┤
│  Select Date                                                    │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ Monday, February 10, 2026            📅             │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  Available Slots for Monday, February 10, 2026                 │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ 👨‍⚕️ Dr. Sarah   │  │ 👨‍⚕️ Dr. Sarah   │  │ 👨‍⚕️ Dr. John│ │
│  │ Wilson           │  │ Wilson           │  │ Smith        │ │
│  │                  │  │                  │  │              │ │
│  │ 🕒 09:00 - 12:00│  │ 🕒 14:00 - 17:00│  │ 🕒 09:00 - ..│ │
│  │                  │  │                  │  │              │ │
│  │ 8 slots available│  │ 10 slots avail.  │  │ 5 slots avail│ │
│  │        [Book]    │  │        [Book]    │  │     [Book]   │ │
│  └──────────────────┘  └──────────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Booking Confirmation Dialog
```
┌────────────────────────────────────────────────┐
│  Confirm Appointment                    ✕      │
├────────────────────────────────────────────────┤
│  Appointment Details:                           │
│                                                 │
│  Doctor:         Dr. Sarah Wilson              │
│  ─────────────────────────────────────────     │
│  Date:           Monday, February 10, 2026     │
│  ─────────────────────────────────────────     │
│  Time:           09:00 AM - 12:00 PM           │
│  ─────────────────────────────────────────     │
│                                                 │
│  Reason for Visit (Optional)                    │
│  ┌─────────────────────────────────────────┐  │
│  │ General checkup and consultation        │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│          [Cancel]    [✓ Confirm Booking]       │
└────────────────────────────────────────────────┘
```

### Payment Dialog
```
┌────────────────────────────────────────────────┐
│  💳 Payment Details                      ✕     │
├────────────────────────────────────────────────┤
│                                                 │
│  ℹ️ Consultation Fee: Rs. 2,500.00             │
│     Dr. Sarah Wilson                            │
│                                                 │
│  Card Information                               │
│                                                 │
│  Card Number                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ 1234 5678 9012 3456                     │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Card Holder Name                               │
│  ┌─────────────────────────────────────────┐  │
│  │ NIMAL PERERA                            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Expiry Date         CVV                        │
│  ┌──────────────┐   ┌──────────────┐          │
│  │ 12/26        │   │ •••          │          │
│  └──────────────┘   └──────────────┘          │
│                                                 │
│  ⚠️ Your payment information is secure          │
│                                                 │
│      [Cancel]    [💳 Pay Rs. 2,500.00]         │
└────────────────────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────────────────────────────────────┐
│  Book an Appointment                                            │
├────────────────────────────────────────────────────────────────┤
│  ✓ Appointment Booked Successfully!                    ✕       │
│    Your Appointment Number: APT000123                          │
│    Please save this number for your records.                   │
├────────────────────────────────────────────────────────────────┤
│  Select Date                                                    │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ Monday, February 10, 2026            📅             │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  Available Slots for Monday, February 10, 2026                 │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ 👨‍⚕️ Dr. Sarah   │  │ 👨‍⚕️ Dr. Sarah   │                   │
│  │ Wilson           │  │ Wilson           │                   │
│  │                  │  │                  │                   │
│  │ 🕒 09:00 - 12:00│  │ 🕒 14:00 - 17:00│                   │
│  │                  │  │                  │                   │
│  │ 7 slots available│  │ 10 slots avail.  │ ← Count reduced │
│  │        [Book]    │  │        [Book]    │                   │
│  └──────────────────┘  └──────────────────┘                   │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding

### Status Indicators
- **Active Slot:** Green chip with ✓
- **Inactive Slot:** Gray chip with ✗
- **High Availability (>5 slots):** Green
- **Low Availability (≤5 slots):** Orange/Warning
- **Fully Booked (0 slots):** Red (not shown to patients)

### Buttons
- **Primary Actions:** Blue (Book, Confirm, Pay)
- **Edit Actions:** Blue pencil icon
- **Delete Actions:** Red trash icon
- **Toggle Actions:** Orange/Green switch
- **Cancel Actions:** Gray

## 📱 Responsive Design

All components are fully responsive:
- Desktop: 3 slot cards per row
- Tablet: 2 slot cards per row
- Mobile: 1 slot card per row

## 🔔 Notifications

### Toast Notifications
```
┌────────────────────────────────────┐
│ ✓ Success                    ✕    │
│ Availability slot created!         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ✗ Error                      ✕    │
│ Failed to fetch slots             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⚠️ Warning                   ✕    │
│ Slot is fully booked              │
└────────────────────────────────────┘
```

## 🎯 User Journey Summary

### Doctor Journey
1. Login → Dashboard
2. See Availability Manager section
3. Click "Add Time Slot"
4. Fill form and submit
5. See slot in table
6. Can edit, deactivate, or delete

### Patient Journey
1. Login → Dashboard
2. Navigate to Appointment Booking
3. Select date
4. View available slots
5. Click "Book" on desired slot
6. Confirm details
7. Enter payment info
8. Receive appointment number
9. Save for records

## 🔄 Real-Time Updates

- Slot availability updates immediately after booking
- Doctor sees all their slots with booking counts
- Patient only sees slots with availability > 0
- Status changes reflect instantly in UI
- Loading states during API calls
- Error states with retry options

## ✨ Key UI Features

✅ Material-UI components for modern look
✅ Responsive grid layout
✅ Loading spinners during data fetch
✅ Empty states with helpful messages
✅ Confirmation dialogs for destructive actions
✅ Form validation with error messages
✅ Success/error toast notifications
✅ Date pickers with min date validation
✅ Time pickers with 24-hour format
✅ Card-based slot display
✅ Icons for visual clarity
✅ Color-coded status indicators
✅ Hover effects on interactive elements
✅ Smooth transitions and animations
