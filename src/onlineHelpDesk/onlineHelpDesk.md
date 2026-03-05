# Event Module – Create Event

## Overview

This section describes the **Create Event** feature of the ActorsEquitey backend.

The Event module allows admins to create **Upcoming** and **Past** events with different media requirements based on the event date.

- **Pattern:** MVC (Router → Controller → Service → Model)
- **Tech:** Express, Node.js, Mongoose, TypeScript
- **Media Upload:** Multer + Cloudinary

---

## Event Types Logic

Event type is determined automatically using `eventDate`:

- **Upcoming Event** → `eventDate > today`
- **Past Event** → `eventDate <= today`

Virtual fields in the schema:

- `eventType`: `UPCOMING | PAST`
- `remainingDays`: Days left until the event

---

## API Endpoint

### Create Event (90% done. who created event, this part is reaming)

**URL**

```
POST /api/v1/events
```

**Access**

- Admin (authentication middleware can be added later)

**Content-Type**

```
multipart/form-data
```

---

## File Upload Fields

| Field Name | Type   | Max Count | Required            | Notes                |
| ---------- | ------ | --------- | ------------------- | -------------------- |
| `logo`     | File   | 1         | Required (Upcoming) | Event logo           |
| `banner`   | File   | 1         | Required (Upcoming) | Event banner         |
| `images`   | File[] | 20        | Required (Past)     | Event gallery images |

---

## Request Body (Form Fields)

| Field           | Type       | Required | Description                           |
| --------------- | ---------- | -------- | ------------------------------------- |
| `title`         | string     | Yes      | Event title                           |
| `name`          | string     | Yes      | Event name                            |
| `description`   | string     | Yes      | Short description                     |
| `details`       | string     | No       | Long details (mainly for past events) |
| `eventDate`     | date (ISO) | Yes      | Event date                            |
| `isBookingOpen` | boolean    | No       | Default: `true`                       |

---

## Validation Rules

### Common

- `description` and `eventDate` are mandatory
- Files object must exist

### Upcoming Event

- `eventDate` must be in the future
- `logo` is required
- `banner` is required

### Past Event

- `eventDate` must be in the past
- At least one image in `images[]` is required

---

## Create Event Flow (MVC)

### 1. Router

- Accepts multipart files
- Passes request to controller

### 2. Controller

- Extracts body and files
- Calls service layer
- Sends formatted API response

### 3. Service

- Uploads files to Cloudinary
- Determines event type (upcoming / past)
- Validates business rules
- Saves event to database

### 4. Model

- Stores event data
- Calculates virtual fields (`eventType`, `remainingDays`)

---

## Database Schema (Event)

### Core Fields

- `title: string`
- `name: string`
- `description: string`
- `details?: string`
- `eventDate: Date`

### Media Fields

- `logo?: string`
- `banner?: string`
- `images: string[]`

### Booking & Meta

- `isBookingOpen: boolean`
- `registrationCount: number`
- `createdBy?: ObjectId (Admin)`

### Timestamps

- `createdAt`
- `updatedAt`

---

## Success Response

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "eventId",
    "eventDate": "2026-01-10T00:00:00.000Z",
    "eventType": "UPCOMING",
    "remainingDays": 9
  }
}
```

---

## Error Responses

| Status | Message                           |
| ------ | --------------------------------- |
| 400    | File required                     |
| 400    | Description and date are required |
| 400    | Logo and banner are required      |
| 400    | Images are required               |

---

## Notes & Future Improvements

- Authentication middleware (`req.user`) can be enforced
- `createdBy` should be set from logged-in admin
- Image size & format validation can be added
- Pagination & listing APIs should reuse this logic

---

## Summary

This documentation defines how **Create Event** works, what data is required, and how upcoming and past events are handled differently. This doc should be updated whenever business rules or fields change.

## Get Events (List) (woring)

Get Events with Query

URL

GET /api/v1/events

Access

Public / Admin (based on middleware)

Query Parameters
Query Type Required Description
eventType string No UPCOMING or PAST
Event Type Logic

UPCOMING → eventDate > today

PAST → eventDate <= today

If eventType is not provided, all events are returned.

Example Requests

Upcoming Events

- GET /api/v1/events?eventType=UPCOMING

Past Events

GET /api/events?eventType=PAST
Success Response
``` json
{
"success": true,
"message": "Events fetched successfully",
"data": [
{
"_id": "eventId",
"title": "Film Festival",
"eventType": "UPCOMING",
"remainingDays": 5
}
]
}
Possible Errors
Status Message
400 Invalid event type
Delete Event
Delete Event by ID

URL

DELETE /api/v1/events/:id

Access

Admin only

URL Parameters
Param Type Required Description
id string Yes Event MongoDB ID
Delete Flow

Validate event ID

Find event by ID

Delete event from database

(Optional) Delete media from Cloudinary

Success Response
{
"success": true,
"message": "Event deleted successfully"
}
Error Responses
Status Message
404 Event not found
400 Invalid event ID
403 Unauthorized
Summary

Events can be fetched using eventType query

Event type is calculated from eventDate

Events are deleted using event ID

Media cleanup can be added as a future improvement

This completes Create, Get, and Delete documentation for the Event module.
