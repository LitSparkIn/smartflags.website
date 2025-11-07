# SmartFlags Admin Panel - API Contracts & Implementation Plan

## Overview
Building a complete admin panel with authentication, dashboard, and CRUD operations for Organisation and Property management.

---

## Frontend Structure

### Pages
1. **Login Page** (`/admin/login`)
   - Email & Password fields
   - Login button
   - Mock authentication initially

2. **Admin Dashboard** (`/admin/dashboard`)
   - Protected route (requires authentication)
   - Left sidebar navigation
   - Main content area

3. **Organisation Management** (`/admin/organisations`)
   - List view with table
   - Create/Edit modal or form
   - Delete confirmation
   - Fields: Name, Email, Phone, Address

4. **Property Management** (`/admin/properties`)
   - List view with table
   - Create/Edit modal or form
   - Delete confirmation
   - Organisation dropdown (relationship)
   - Fields: Organisation, Name, Email, Phone, Address

### Components
- `AdminLayout.jsx` - Main layout with sidebar
- `Sidebar.jsx` - Navigation menu
- `OrganisationList.jsx`, `OrganisationForm.jsx`
- `PropertyList.jsx`, `PropertyForm.jsx`
- `ProtectedRoute.jsx` - Auth wrapper

---

## Mock Data (mock.js)

### Mock Organisations
```javascript
[
  {
    id: "org-1",
    name: "Paradise Resorts Group",
    email: "contact@paradiseresorts.com",
    phone: "+1 555 100 0001",
    address: "123 Resort Boulevard, Miami, FL 33139"
  },
  {
    id: "org-2",
    name: "Azure Hospitality",
    email: "info@azurehospitality.com",
    phone: "+1 555 200 0002",
    address: "456 Ocean Drive, Maldives"
  }
]
```

### Mock Properties
```javascript
[
  {
    id: "prop-1",
    organisationId: "org-1",
    name: "Paradise Beach Resort",
    email: "beach@paradiseresorts.com",
    phone: "+1 555 100 1001",
    address: "789 Beach Road, Miami Beach, FL 33140"
  },
  {
    id: "prop-2",
    organisationId: "org-1",
    name: "Paradise Pool Club",
    email: "pool@paradiseresorts.com",
    phone: "+1 555 100 1002",
    address: "321 Poolside Ave, Miami, FL 33141"
  }
]
```

### Mock Admin User
```javascript
{
  email: "admin@smartflags.com",
  password: "admin123"
}
```

---

## Backend Implementation (After Frontend Approval)

### MongoDB Collections

#### 1. **admins** Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed with bcrypt, required),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **organisations** Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **properties** Collection
```javascript
{
  _id: ObjectId,
  organisationId: ObjectId (ref: organisations, required),
  name: String (required),
  email: String (required),
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
  - Request: `{ email, password }`
  - Response: `{ token, user: { id, email, name } }`
  - Mock: Always returns success for admin@smartflags.com / admin123

- `POST /api/auth/logout` - Logout
  - Mock: Clear local storage

- `GET /api/auth/me` - Get current user
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user: { id, email, name } }`

### Organisations
- `GET /api/organisations` - List all organisations
  - Response: `{ organisations: [...] }`
  
- `GET /api/organisations/:id` - Get single organisation
  - Response: `{ organisation: {...} }`
  
- `POST /api/organisations` - Create organisation
  - Request: `{ name, email, phone, address }`
  - Response: `{ organisation: {...} }`
  
- `PUT /api/organisations/:id` - Update organisation
  - Request: `{ name, email, phone, address }`
  - Response: `{ organisation: {...} }`
  
- `DELETE /api/organisations/:id` - Delete organisation
  - Response: `{ message: "Organisation deleted" }`

### Properties
- `GET /api/properties` - List all properties
  - Query: `?organisationId=<id>` (optional filter)
  - Response: `{ properties: [...] }` (includes organisation details)
  
- `GET /api/properties/:id` - Get single property
  - Response: `{ property: {...} }`
  
- `POST /api/properties` - Create property
  - Request: `{ organisationId, name, email, phone, address }`
  - Response: `{ property: {...} }`
  
- `PUT /api/properties/:id` - Update property
  - Request: `{ organisationId, name, email, phone, address }`
  - Response: `{ property: {...} }`
  
- `DELETE /api/properties/:id` - Delete property
  - Response: `{ message: "Property deleted" }`

---

## Frontend-Backend Integration

### Authentication Flow
1. User enters credentials on login page
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials, generates JWT token
4. Frontend stores token in localStorage
5. All subsequent API calls include token in Authorization header
6. Protected routes check for valid token

### Data Flow
1. **List View**: Component mounts → Fetch data from API → Display in table
2. **Create**: User fills form → Submit → POST to API → Refresh list
3. **Edit**: Click edit → Load data in form → Submit → PUT to API → Refresh list
4. **Delete**: Click delete → Confirmation dialog → DELETE to API → Refresh list

### Mock Data Removal
When implementing backend:
1. Remove all mock data imports from components
2. Replace mock CRUD functions with actual API calls using axios
3. Update AuthContext to use real JWT tokens
4. Add proper error handling for API failures

---

## State Management
- Use React Context for authentication state
- Local state for CRUD operations
- Toast notifications for success/error messages using Sonner

---

## Admin Login Creation Feature

### Frontend Implementation
- "Create Admin Login" button added to Organisation and Property details pages
- AdminLoginDialog component collects Name and Email
- Sends OTP via email for secure first-time login

### Backend Implementation Required

#### New API Endpoint
**POST /api/auth/create-admin-login**
- Request Body:
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "entityType": "organisation" | "property",
    "entityId": "org-1"
  }
  ```
- Functionality:
  1. Generate random 6-digit OTP
  2. Store OTP in database with expiry (15 minutes)
  3. Send email with OTP
  4. Return success response

#### Email Configuration (.env)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=litsparkmail@gmail.com
SMTP_PASSWORD=exni qmky efci medc
SMTP_FROM_EMAIL=litsparkmail@gmail.com
SMTP_FROM_NAME=SmartFlags Admin
```

#### Email Template
**Subject:** Your SmartFlags Admin Login OTP

**Body:**
```
Hello {name},

Welcome to SmartFlags! An admin account has been created for you.

Your one-time password (OTP) is: {otp}

This OTP will expire in 15 minutes.

Use this OTP to log in to your account:
{login_url}

Best regards,
SmartFlags Team
```

#### Database Schema
**admin_otps Collection:**
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  name: String,
  entityType: String, // "organisation" or "property"
  entityId: String,
  expiresAt: Date,
  used: Boolean,
  createdAt: Date
}
```

#### Python Email Sending Code (FastAPI)
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime, timedelta

async def send_otp_email(name: str, email: str, otp: str):
    # Email configuration
    smtp_server = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    from_email = os.environ.get('SMTP_FROM_EMAIL')
    
    # Create message
    message = MIMEMultipart('alternative')
    message['Subject'] = 'Your SmartFlags Admin Login OTP'
    message['From'] = f"SmartFlags Admin <{from_email}>"
    message['To'] = email
    
    # Email body
    text = f"""
    Hello {name},
    
    Welcome to SmartFlags! An admin account has been created for you.
    
    Your one-time password (OTP) is: {otp}
    
    This OTP will expire in 15 minutes.
    
    Best regards,
    SmartFlags Team
    """
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #14b8a6;">Welcome to SmartFlags!</h2>
          <p>Hello {name},</p>
          <p>An admin account has been created for you.</p>
          <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Your one-time password (OTP):</p>
            <p style="font-size: 32px; font-weight: bold; color: #14b8a6; margin: 10px 0; letter-spacing: 5px;">{otp}</p>
          </div>
          <p style="color: #ef4444; font-size: 14px;">⏰ This OTP will expire in 15 minutes.</p>
          <p style="margin-top: 30px;">Best regards,<br>SmartFlags Team</p>
        </div>
      </body>
    </html>
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    message.attach(part1)
    message.attach(part2)
    
    # Send email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
```

---

## Next Steps
1. ✅ Create contracts.md (this file)
2. Build frontend with mock data
3. Get user approval on design/functionality
4. Implement backend APIs
5. Integrate frontend with backend
6. Test complete flow
