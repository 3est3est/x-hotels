# X Hotel — Requirements

## 1. Project Overview

X Hotel is a hotel reservation system for hotels that are owned or operated under the X Hotel business only.

The system does not support external hotels or hotels outside the X Hotel group.

The business may have multiple hotel branches across different regions and may expand to additional regions/countries in the future, such as Israel.

---

## 2. System Scope

The system covers:

- Hotel and branch information
- Hotel search
- Hotel and room type details
- User registration and login
- Identity verification
- Hotel reservation
- Booking cancellation
- On-site payment
- Hotel reviews
- Booking and check-in statistics
- Hotel/room popularity statistics

The system does **not** require online payment.

---

## 3. Actors

### 3.1 Guest / Customer

A guest can:

- Search for hotels within the X Hotel group
- View hotel details without logging in
- View hotel branch/region information
- View room type information
- Select a room type
- Specify the number of guests
- Specify the number of nights
- Create a booking after authentication
- Cancel a booking
- View their booking information
- Submit a hotel review
- Give a rating from 0 to 5 stars
- Complete identity verification

### 3.2 Hotel Owner / Management

Hotel management can:

- View booking statistics
- View which room types are booked most frequently
- View which hotels are booked most frequently
- View which branches/regions are booked most frequently
- View total bookings
- View actual check-ins
- View the percentage of bookings that resulted in actual check-ins

---

## 4. Functional Requirements

### FR-01 — Hotel Search

The system shall allow guests to search for hotels.

Search results shall contain only hotels belonging to the X Hotel group.

External hotels shall not be included.

---

### FR-02 — Hotel Region / Branch

The system shall support multiple X Hotel branches.

Each hotel shall belong to a region/branch.

When making a reservation, the guest shall be able to identify which region/branch the selected hotel belongs to.

The system should be designed so that additional regions or countries can be added in the future.

---

### FR-03 — View Hotel Details

Guests shall be able to view hotel information before logging in.

Hotel information may include:

- Hotel name
- Region
- Branch/location
- Hotel description
- Hotel images
- Available room types
- Room information

Authentication shall not be required merely to view hotel details.

---

### FR-04 — Registration

A guest shall be able to create an account.

---

### FR-05 — Login

A guest shall be able to log in to their account.

The guest must be authenticated before confirming a hotel reservation.

---

### FR-06 — Identity Verification

The system shall support user identity verification.

A user shall be able to complete the required identity verification process.

---

### FR-07 — Room Type Selection

The guest shall be able to select a room type.

The system only requires the guest to select the room type.

---

### FR-08 — Number of Guests

The guest shall specify the number of guests for the reservation.

---

### FR-09 — Number of Nights

The guest shall specify the number of nights for the reservation.

---

### FR-10 — Hotel Reservation

The guest shall be able to create a hotel reservation.

The reservation process shall require authentication before the reservation is confirmed.

The reservation shall contain sufficient information to identify:

- User
- Hotel
- Region/branch
- Room type
- Number of guests
- Number of nights
- Booking information/status

---

### FR-11 — Room Availability

The system does not require a room availability checking system.

The reservation process shall not depend on a real-time room availability check.

The guest only selects the room type.

---

### FR-12 — Payment

Payment shall be made at the hotel.

The system does not require online payment.

---

### FR-13 — Booking Cancellation

The system shall support booking cancellation.

The cancellation process does not need to implement complex cancellation rules unless additional requirements are provided.

---

### FR-14 — Booking Data Persistence

Booking information shall not be lost after it has been created.

The system shall persist booking records in the database.

---

### FR-15 — Hotel Reviews

The system shall support hotel reviews.

Reviews shall support ratings from:

- 0 stars
- 1 star
- 2 stars
- 3 stars
- 4 stars
- 5 stars

---

### FR-16 — Booking Statistics

Hotel management shall be able to view booking statistics.

The statistics shall include:

- Total number of bookings
- Most frequently booked room type
- Most frequently booked hotel
- Most frequently booked branch/region

---

### FR-17 — Check-in Statistics

The system shall record actual check-in information.

Hotel management shall be able to compare:

- Total bookings
- Actual check-ins

The system shall provide the percentage of bookings that resulted in an actual check-in.

Example:

```text
Total bookings: 100
Actual check-ins: 80

Check-in percentage: 80%
```

---

## 5. Business Rules

### BR-01 — X Hotel Only

Only hotels belonging to the X Hotel business/group shall exist in the system.

External hotel owners cannot add their hotels to the system.

---

### BR-02 — Authentication Before Booking Confirmation

Guests may browse and view hotel information without logging in.

Authentication is required before confirming a reservation.

---

### BR-03 — On-site Payment

All reservations use payment at the hotel.

Online payment is outside the current scope.

---

### BR-04 — No Availability Checking

The system does not perform real-time room availability checking.

A guest selects a room type and specifies the required number of guests and nights.

---

### BR-05 — Region Identification

Hotels belong to a specific region/branch.

The reservation must retain the selected hotel's region/branch information.

---

### BR-06 — Rating Range

Hotel reviews support a rating range of 0–5 stars.

---

### BR-07 — Persistent Booking Records

Once a booking has been created, its information must remain stored in the system.

---

## 6. Out of Scope

The following features are not required by the current requirements:

- External hotel registration
- Online payment
- Real-time room availability checking
- Complex cancellation policies
- Payment gateway integration
- Email notification system
- Advanced recommendation system
- Hotel marketplace functionality
- Multi-owner hotel onboarding
- Microservices architecture

These features should not be added unless the requirements are changed or expanded.

---

## 7. Future Considerations

The hotel business may expand to additional regions or countries.

The system should therefore avoid hard-coding a single region or country into the core data model.

Example:

```text
X Hotel
├── Thailand
│   ├── Branch A
│   └── Branch B
│
└── Israel
    └── Branch A
```

The actual regions and branches are determined by the project data.

---

## 8. Requirement Priority

The current requirements provided by the instructor are the source of truth.

The implementation should prioritize:

1. Authentication
2. Identity verification
3. Hotel/branch information
4. Room type selection
5. Booking
6. Booking persistence
7. Cancellation
8. Reviews and 0–5 star ratings
9. Check-in records
10. Management statistics
11. Hotel/room/branch popularity statistics

Additional convenience features should not be implemented unless explicitly approved or required.
