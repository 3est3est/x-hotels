# X Hotel

A hotel reservation system for hotels owned and operated by the X Hotel group only. This glossary captures the domain language settled with the instructor's requirements.

## Language

### People

**Guest**:
A person browsing the system. Can view hotel details without logging in; must log in to create a booking.
_Avoid_: customer, user, member

**Hotel Management**:
The owner side of the X Hotel business. Views booking and check-in statistics; never books hotels.
_Avoid_: admin, staff, owner

### Catalog

**Region**:
A geographic area (such as a country) where the group operates hotels. The group operates in multiple regions and plans to expand to new ones.
_Avoid_: area, zone, country

**Hotel**:
A property operated under the X Hotel group; one branch of the group is one Hotel, and a Region contains many Hotels. External hotels cannot join.
_Avoid_: property, branch (as a separate entity)

**Room Type**:
A category of room that a guest selects when booking. Guests never select a specific physical room.
_Avoid_: room, room category

### Booking

**Booking**:
A reservation created by a logged-in guest, made up of a room type, a number of guests, a check-in date, and a number of nights. Bookings involve no availability checking.
_Avoid_: reservation, order

**On-site Payment**:
All payment happens at the hotel. There is no online payment in the system.
_Avoid_: PAY_AT_HOTEL

**Cancellation**:
A booking may be cancelled with no rules, deadlines, or penalties.
_Avoid_: refund

**Actual Check-in**:
A record that a booked guest physically checked in at the hotel. Used to compute management statistics.
_Avoid_: check-in date, arrival

### Feedback & Trust

**Review**:
A guest's rating of a hotel on a 0–5 star scale. Only a guest who completed an Actual Check-in at that hotel may review it.
_Avoid_: comment, feedback

**Identity Verification**:
A process by which a user verifies their identity by uploading an identity document (ID card or passport) at registration.
_Avoid_: KYC
