# Lead Management System API

## Overview
This API provides comprehensive lead management functionality including CRUD operations, advanced filtering, analytics, and export capabilities.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Lead Endpoints

### 1. Create Lead
**POST** `/leads`

Creates a new lead in the system.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "city": "New York",
  "state": "NY",
  "source": "website",
  "status": "new",
  "score": 75,
  "lead_value": 5000,
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { /* lead object */ }
}
```

### 2. List Leads with Pagination and Filters
**GET** `/leads`

Retrieves leads with comprehensive server-side filtering, pagination, and sorting options.

**Query Parameters:**

#### Pagination
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page

#### String Field Filters
- `email` - Exact match or use `*email*` for contains
- `company` - Exact match or use `*company*` for contains  
- `city` - Exact match or use `*city*` for contains

#### Enum Field Filters
- `status` - Single status value
- `status_in` - JSON array of multiple statuses
- `source` - Single source value
- `source_in` - JSON array of multiple sources

#### Number Field Filters
- `score` - Exact score value
- `score_gt` - Score greater than
- `score_lt` - Score less than
- `score_between` - JSON array [min, max]
- `lead_value` - Exact lead value
- `lead_value_gt` - Lead value greater than
- `lead_value_lt` - Lead value less than
- `lead_value_between` - JSON array [min, max]

#### Date Field Filters
- `created_at` - On specific date
- `created_at_before` - Before date
- `created_at_after` - After date
- `created_at_between` - JSON array [start, end]
- `last_activity_at` - On specific date
- `last_activity_at_before` - Before date
- `last_activity_at_after` - After date
- `last_activity_at_between` - JSON array [start, end]

#### Boolean Field Filters
- `is_qualified` - true/false

#### Global Search
- `search` - Search across name, email, company, city

#### Sorting
- `sort_by` (default: 'created_at') - Sort field
- `sort_order` (default: 'desc') - Sort direction ('asc' or 'desc')

**Example:**
```
GET /leads?page=1&limit=25&status_in=["new","contacted"]&source=website&company=*Tech*&score_gt=60&sort_by=score&sort_order=desc
```

**Response:**
```json
{
  "data": [ /* array of lead objects */ ],
  "page": 1,
  "limit": 25,
  "total": 146,
  "totalPages": 6
}
```

**Note:** All filters combine with AND logic. For detailed filtering examples, see `FILTERING_GUIDE.md`.

### 3. Get Single Lead
**GET** `/leads/:id`

Retrieves a specific lead by ID.

**Response:**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": { /* lead object */ }
}
```

### 4. Update Lead
**PUT** `/leads/:id`

Updates an existing lead.

**Request Body:** (all fields optional)
```json
{
  "status": "contacted",
  "score": 80,
  "notes": "Follow up scheduled for next week"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": { /* updated lead object */ }
}
```

### 5. Delete Lead
**DELETE** `/leads/:id`

Deletes a lead from the system.

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### 6. Lead Statistics
**GET** `/leads/stats/overview`

Retrieves comprehensive lead analytics and statistics.

**Response:**
```json
{
  "success": true,
  "message": "Lead statistics retrieved successfully",
  "data": {
    "overview": {
      "total_leads": 1000,
      "total_value": 500000,
      "avg_score": 75.5,
      "qualified_leads": 250
    },
    "status_distribution": [
      { "_id": "new", "count": 300 },
      { "_id": "contacted", "count": 200 },
      { "_id": "qualified", "count": 250 },
      { "_id": "won", "count": 150 },
      { "_id": "lost", "count": 100 }
    ],
    "source_distribution": [
      { "_id": "website", "count": 400 },
      { "_id": "google_ads", "count": 300 },
      { "_id": "facebook_ads", "count": 200 },
      { "_id": "referral", "count": 100 }
    ],
    "monthly_trends": [
      { "_id": { "year": 2024, "month": 1 }, "count": 85 },
      { "_id": { "year": 2024, "month": 2 }, "count": 92 }
    ]
  }
}
```

### 7. Bulk Update Leads
**PUT** `/leads/bulk-update`

Updates multiple leads simultaneously.

**Request Body:**
```json
{
  "lead_ids": ["lead_id_1", "lead_id_2", "lead_id_3"],
  "update_data": {
    "status": "contacted",
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated 3 leads",
  "data": {
    "matched_count": 3,
    "modified_count": 3
  }
}
```

### 8. Export Leads
**GET** `/leads/export`

Exports leads in various formats.

**Query Parameters:**
- `format` (default: 'json') - Export format ('json' or 'csv')
- `filters` - JSON string of filters to apply

**Example:**
```
GET /leads/export?format=csv&filters={"status":"new","source":"website"}
```

**Response:**
- For CSV: File download with proper headers
- For JSON: Same as list endpoint but without pagination

## Lead Model Schema

### Required Fields
- `first_name` (String, 5-15 chars)
- `last_name` (String, 5-15 chars)
- `email` (String, unique, valid email format)
- `source` (Enum: website, facebook_ads, google_ads, referral, events, other)
- `status` (Enum: new, contacted, qualified, lost, won, default: new)

### Optional Fields
- `phone` (String, valid phone format)
- `company` (String, 3-100 chars)
- `city` (String, 3-50 chars)
- `state` (String, 3-50 chars)
- `score` (Number, 0-100, default: 0)
- `lead_value` (Number, ≥0, default: 0)

- `is_qualified` (Boolean, default: false)

### Auto-generated Fields
- `_id` (ObjectId)
- `created_at` (Date)
- `updated_at` (Date)
- `last_activity_at` (Date, updated when status changes)

### Virtual Fields
- `full_name` - Computed from first_name + last_name

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Features

### Advanced Filtering
- Text search across multiple fields
- Range filtering for numeric values
- Enum-based filtering for status and source
- Geographic filtering by city/state

### Pagination
- Configurable page size
- Total count and page information
- Efficient database queries with skip/limit

### Sorting
- Multiple sortable fields
- Ascending/descending order
- Default sorting by creation date

### Analytics
- Real-time lead counts by status
- Source distribution analysis
- Monthly trend tracking
- Lead value aggregation

### Export Functionality
- JSON format for API consumption
- CSV format for spreadsheet analysis
- Filtered exports
- Proper file headers and formatting

### Bulk Operations
- Update multiple leads simultaneously
- Efficient batch processing
- Validation and error handling

## Performance Optimizations

- Database indexes on frequently queried fields
- Compound indexes for common filter combinations
- Efficient aggregation pipelines
- Pagination to handle large datasets
- Proper error handling and validation
