from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Admin Login Models
class CreateAdminRequest(BaseModel):
    name: str
    email: EmailStr
    entityType: str  # "organisation" or "property"
    entityId: str

class CreateAdminResponse(BaseModel):
    success: bool
    message: str
    email: str

class AdminOTP(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    otp: str
    name: str
    entityType: str
    entityId: str
    expiresAt: datetime
    used: bool = False
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class VerifyOTPResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None

class RequestOTPRequest(BaseModel):
    email: EmailStr

class RequestOTPResponse(BaseModel):
    success: bool
    message: str

# Seat Type Models
class SeatType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    icon: str  # Base64 encoded PNG image
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SeatTypeCreate(BaseModel):
    propertyId: str
    name: str
    icon: str

class SeatTypeUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None

# Seat Models
class Seat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    seatTypeId: str
    seatNumber: str
    groupId: Optional[str] = None  # Group assignment
    staticDeviceId: Optional[str] = None  # Static device assigned to seat
    status: str = "Free"  # Free, Allocated, Blocked
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SeatBulkCreate(BaseModel):
    propertyId: str
    seatTypeId: str
    groupId: Optional[str] = None
    prefix: Optional[str] = ""
    suffix: Optional[str] = ""
    startNumber: int
    endNumber: int

class SeatUpdate(BaseModel):
    seatTypeId: Optional[str] = None
    seatNumber: Optional[str] = None
    groupId: Optional[str] = None
    staticDeviceId: Optional[str] = None
    status: Optional[str] = None

class SeatStatusUpdate(BaseModel):
    status: str  # Free, Allocated, Blocked

# Device Models
class Device(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    deviceId: str  # Physical device identifier
    enabled: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DeviceCreate(BaseModel):
    propertyId: str
    deviceId: str

class DeviceUpdate(BaseModel):
    deviceId: Optional[str] = None
    enabled: Optional[bool] = None

# Group Models
class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    seatIds: List[str] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GroupCreate(BaseModel):
    propertyId: str
    name: str
    seatIds: List[str] = []

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    seatIds: Optional[List[str]] = None

# Staff Models
class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    roleId: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str  # In production, this should be hashed
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StaffCreate(BaseModel):
    propertyId: str
    roleId: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class StaffUpdate(BaseModel):
    roleId: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

# Role Models
class Role(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Guest Models
class Guest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    roomNumber: str
    guestName: str
    category: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GuestCreate(BaseModel):
    propertyId: str
    roomNumber: str
    guestName: str
    category: Optional[str] = None

class GuestUpdate(BaseModel):
    roomNumber: Optional[str] = None
    guestName: Optional[str] = None
    category: Optional[str] = None

class GuestBulkCreate(BaseModel):
    propertyId: str
    guests: List[dict]  # List of {roomNumber, guestName, category}

# Allocation Models
class AllocationEvent(BaseModel):
    """Event in allocation timeline"""
    eventType: str  # Created, Status Change, Calling On, Calling Off, Complete
    oldValue: Optional[str] = None
    newValue: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description: str

class Allocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    guestId: str
    roomNumber: str
    guestName: str
    guestCategory: Optional[str] = None  # Guest category from Daily Guest List
    fbManagerId: str  # Food & Beverage Manager staff ID
    seatIds: List[str] = []
    deviceIds: List[str] = []  # Devices assigned to this allocation
    allocationDate: str  # Date in YYYY-MM-DD format
    status: str = "Allocated"  # Allocated, Active, Billing, Clear, Complete
    callingFlag: str = "Non Calling"  # Non Calling, Calling, Calling for Checkout
    events: List[dict] = []  # Timeline of events
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AllocationCreate(BaseModel):
    propertyId: str
    roomNumber: str
    fbManagerId: str
    seatIds: List[str]
    deviceIds: Optional[List[str]] = []
    allocationDate: Optional[str] = None  # Defaults to today

class AllocationUpdate(BaseModel):
    fbManagerId: Optional[str] = None
    seatIds: Optional[List[str]] = None
    allocationDate: Optional[str] = None

class AllocationStatusUpdate(BaseModel):
    status: str  # Allocated, Active, Billing, Clear, Complete

class AllocationCallingFlagUpdate(BaseModel):
    callingFlag: str  # Non Calling, Calling, Calling for Checkout

# Helper Functions
def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

async def send_welcome_email(name: str, email: str, login_url: str) -> bool:
    """Send welcome email to the new admin user"""
    try:
        smtp_server = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('SMTP_FROM_EMAIL')
        from_name = os.environ.get('SMTP_FROM_NAME', 'SmartFlags Admin')
        
        # Create message
        message = MIMEMultipart('alternative')
        message['Subject'] = 'Welcome to SmartFlags - Admin Access Granted'
        message['From'] = f"{from_name} <{from_email}>"
        message['To'] = email
        
        # Email body - plain text
        text = f"""
Hello {name},

Welcome to SmartFlags! You have been added as an admin user.

You can now access the SmartFlags admin panel by visiting:
{login_url}

To log in:
1. Visit the login page
2. Enter your email address
3. Click "Send OTP" to receive a one-time password
4. Enter the OTP to access your account

If you have any questions or didn't expect this email, please contact support.

Best regards,
SmartFlags Team
        """
        
        # Email body - HTML
        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #14b8a6; margin-top: 0;">Welcome to SmartFlags!</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Great news! You have been added as an admin user to the SmartFlags platform.</p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; font-size: 16px; color: #115e59; font-weight: 600;">🎉 Admin Access Granted</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #0f766e;">You can now manage and access the SmartFlags admin panel.</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #334155; font-size: 16px;">How to Log In:</h3>
          <ol style="margin: 10px 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Visit the login page</li>
            <li style="margin-bottom: 8px;">Enter your email address: <strong>{email}</strong></li>
            <li style="margin-bottom: 8px;">Click "Send OTP" to receive a one-time password</li>
            <li style="margin-bottom: 8px;">Enter the OTP to access your account</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{login_url}" style="background-color: #14b8a6; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">Access Admin Panel</a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          If you didn't expect this email or have any questions, please contact our support team.
        </p>
        
        <p style="margin-top: 30px; color: #64748b;">Best regards,<br><strong>SmartFlags Team</strong></p>
      </div>
    </div>
  </body>
</html>
        """
        
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        message.attach(part1)
        message.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        
        logger.info(f"Welcome email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False

async def send_otp_email(name: str, email: str, otp: str) -> bool:
    """Send OTP email when user requests to login"""
    try:
        smtp_server = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('SMTP_FROM_EMAIL')
        from_name = os.environ.get('SMTP_FROM_NAME', 'SmartFlags Admin')
        
        # Create message
        message = MIMEMultipart('alternative')
        message['Subject'] = 'Your SmartFlags Login OTP'
        message['From'] = f"{from_name} <{from_email}>"
        message['To'] = email
        
        # Email body - plain text
        text = f"""
Hello {name},

Your one-time password (OTP) for SmartFlags login is: {otp}

This OTP will expire in 15 minutes.

If you didn't request this OTP, please ignore this email.

Best regards,
SmartFlags Team
        """
        
        # Email body - HTML
        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #14b8a6; margin-top: 0;">Your Login OTP</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>You requested to log in to your SmartFlags admin account. Use the OTP below to complete your login:</p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #115e59;">Your one-time password:</p>
          <p style="font-size: 36px; font-weight: bold; color: #14b8a6; margin: 15px 0 10px 0; letter-spacing: 8px; text-align: center;">{otp}</p>
          <p style="margin: 0; font-size: 13px; color: #ef4444; text-align: center;">⏰ Expires in 15 minutes</p>
        </div>
        
        <p style="font-size: 13px; color: #64748b; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          If you didn't request this OTP, please ignore this email or contact support if you have concerns.
        </p>
        
        <p style="margin-top: 30px; color: #64748b;">Best regards,<br><strong>SmartFlags Team</strong></p>
      </div>
    </div>
  </body>
</html>
        """
        
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        message.attach(part1)
        message.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Admin Login Creation Endpoints
@api_router.post("/admin/create", response_model=CreateAdminResponse)
async def create_admin_login(request: CreateAdminRequest):
    """
    Create admin user and send welcome email
    """
    try:
        # Check if admin already exists
        existing_admin = await db.admins.find_one({"email": request.email}, {"_id": 0})
        
        if existing_admin:
            raise HTTPException(status_code=400, detail="Admin with this email already exists")
        
        # Create admin document
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "name": request.name,
            "entityType": request.entityType,
            "entityId": request.entityId,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "active": True
        }
        
        # Store admin in database
        await db.admins.insert_one(admin_doc)
        
        # Get frontend URL for login link
        login_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000') + '/user/login'
        
        # Send welcome email
        email_sent = await send_welcome_email(request.name, request.email, login_url)
        
        if not email_sent:
            # Still consider it success even if email fails
            logger.warning(f"Admin created but failed to send email to {request.email}")
        
        logger.info(f"Admin created: {request.email}, entity: {request.entityType}:{request.entityId}")
        
        return CreateAdminResponse(
            success=True,
            message=f"Admin added successfully! A welcome email has been sent to {request.email}",
            email=request.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/user/request-otp", response_model=RequestOTPResponse)
async def request_otp(request: RequestOTPRequest):
    """
    Request OTP for login - generates and sends OTP to user's email
    """
    try:
        # Check if admin exists
        admin = await db.admins.find_one({"email": request.email, "active": True}, {"_id": 0})
        
        if not admin:
            raise HTTPException(status_code=404, detail="No admin account found with this email address")
        
        # Generate OTP
        otp = generate_otp()
        
        # Set expiry time (15 minutes from now)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        # Create OTP document - include all admin data for later use
        otp_doc = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "otp": otp,
            "name": admin['name'],
            "entityType": admin.get('entityType', ''),
            "entityId": admin.get('entityId', ''),
            "expiresAt": expires_at.isoformat(),
            "used": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        
        # Store OTP in database
        await db.admin_otps.insert_one(otp_doc)
        
        # Send OTP email
        email_sent = await send_otp_email(admin['name'], request.email, otp)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send OTP email. Please try again.")
        
        logger.info(f"OTP requested and sent to {request.email}")
        
        return RequestOTPResponse(
            success=True,
            message=f"OTP has been sent to {request.email}. Please check your email."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/admin/list/{entity_type}/{entity_id}")
async def get_entity_admins(entity_type: str, entity_id: str):
    """
    Get all admins for a specific entity (organisation or property)
    """
    try:
        # Find all admins for this entity
        admins = await db.admins.find(
            {
                "entityType": entity_type,
                "entityId": entity_id,
                "active": True
            },
            {"_id": 0}
        ).to_list(100)
        
        return {
            "success": True,
            "admins": admins
        }
        
    except Exception as e:
        logger.error(f"Error fetching admins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Seat Type CRUD Endpoints
@api_router.post("/seat-types", response_model=SeatType)
async def create_seat_type(seat_type: SeatTypeCreate):
    """Create a new seat type"""
    try:
        seat_type_obj = SeatType(**seat_type.model_dump())
        
        # Convert to dict and serialize datetime
        doc = seat_type_obj.model_dump()
        doc['createdAt'] = doc['createdAt'].isoformat()
        doc['updatedAt'] = doc['updatedAt'].isoformat()
        
        await db.seat_types.insert_one(doc)
        
        logger.info(f"Seat type created: {seat_type_obj.id}")
        return seat_type_obj
        
    except Exception as e:
        logger.error(f"Error creating seat type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/seat-types/{property_id}")
async def get_seat_types(property_id: str):
    """Get all seat types for a property"""
    try:
        seat_types = await db.seat_types.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "seatTypes": seat_types}
        
    except Exception as e:
        logger.error(f"Error fetching seat types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/seat-types/{seat_type_id}")
async def update_seat_type(seat_type_id: str, update_data: SeatTypeUpdate):
    """Update a seat type"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.seat_types.update_one(
            {"id": seat_type_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seat type not found")
        
        # Get updated seat type
        updated_seat_type = await db.seat_types.find_one({"id": seat_type_id}, {"_id": 0})
        
        logger.info(f"Seat type updated: {seat_type_id}")
        return {"success": True, "seatType": updated_seat_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating seat type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/seat-types/{seat_type_id}")
async def delete_seat_type(seat_type_id: str):
    """Delete a seat type"""
    try:
        result = await db.seat_types.delete_one({"id": seat_type_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Seat type not found")
        
        logger.info(f"Seat type deleted: {seat_type_id}")
        return {"success": True, "message": "Seat type deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting seat type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Seat CRUD Endpoints
@api_router.post("/seats/bulk")
async def create_seats_bulk(seat_data: SeatBulkCreate):
    """Create multiple seats based on range"""
    try:
        if seat_data.startNumber > seat_data.endNumber:
            raise HTTPException(status_code=400, detail="Start number must be less than or equal to end number")
        
        if seat_data.endNumber - seat_data.startNumber > 1000:
            raise HTTPException(status_code=400, detail="Cannot create more than 1000 seats at once")
        
        # Determine padding length based on end number
        padding_length = len(str(seat_data.endNumber))
        
        # Generate seats
        seats = []
        for num in range(seat_data.startNumber, seat_data.endNumber + 1):
            # Format number with zero padding
            formatted_num = str(num).zfill(padding_length)
            seat_number = f"{seat_data.prefix}{formatted_num}{seat_data.suffix}"
            
            seat = Seat(
                propertyId=seat_data.propertyId,
                seatTypeId=seat_data.seatTypeId,
                seatNumber=seat_number,
                groupId=seat_data.groupId
            )
            
            # Convert to dict and serialize datetime
            seat_doc = seat.model_dump()
            seat_doc['createdAt'] = seat_doc['createdAt'].isoformat()
            seat_doc['updatedAt'] = seat_doc['updatedAt'].isoformat()
            
            seats.append(seat_doc)
        
        # Insert all seats
        await db.seats.insert_many(seats)
        
        logger.info(f"Created {len(seats)} seats for property {seat_data.propertyId}")
        return {
            "success": True,
            "message": f"Successfully created {len(seats)} seats",
            "count": len(seats)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating seats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/seats/{property_id}")
async def get_seats(property_id: str):
    """Get all seats for a property"""
    try:
        seats = await db.seats.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(10000)
        
        return {"success": True, "seats": seats}
        
    except Exception as e:
        logger.error(f"Error fetching seats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/seats/{seat_id}")
async def update_seat(seat_id: str, update_data: SeatUpdate):
    """Update a seat"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.seats.update_one(
            {"id": seat_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seat not found")
        
        # Get updated seat
        updated_seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
        
        logger.info(f"Seat updated: {seat_id}")
        return {"success": True, "seat": updated_seat}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating seat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/seats/{seat_id}")
async def delete_seat(seat_id: str):
    """Delete a seat"""
    try:
        result = await db.seats.delete_one({"id": seat_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Seat not found")
        
        logger.info(f"Seat deleted: {seat_id}")
        return {"success": True, "message": "Seat deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting seat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.patch("/seats/{seat_id}/status")
async def update_seat_status(seat_id: str, status_update: SeatStatusUpdate):
    """Update seat status (Free, Allocated, Blocked)"""
    try:
        valid_statuses = ["Free", "Allocated", "Blocked"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        result = await db.seats.update_one(
            {"id": seat_id},
            {"$set": {
                "status": status_update.status,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seat not found")
        
        updated_seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
        
        logger.info(f"Seat status updated: {seat_id} -> {status_update.status}")
        return {"success": True, "seat": updated_seat}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating seat status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.patch("/seats/bulk-status")
async def update_bulk_seat_status(seat_ids: List[str], status: str):
    """Update status for multiple seats"""
    try:
        valid_statuses = ["Free", "Allocated", "Blocked"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        result = await db.seats.update_many(
            {"id": {"$in": seat_ids}},
            {"$set": {
                "status": status,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Updated {result.modified_count} seats to status: {status}")
        return {
            "success": True, 
            "message": f"Updated {result.modified_count} seats",
            "count": result.modified_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating bulk seat status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============= DEVICE ENDPOINTS =============

@api_router.get("/devices/{property_id}")
async def get_devices_by_property(property_id: str):
    """Get all devices for a property"""
    try:
        devices = await db.devices.find({"propertyId": property_id}, {"_id": 0}).to_list(1000)
        logger.info(f"Fetched {len(devices)} devices for property {property_id}")
        return {"success": True, "devices": devices}
    except Exception as e:
        logger.error(f"Error fetching devices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/devices", response_model=Device)
async def create_device(device: DeviceCreate):
    """Create a new device"""
    try:
        # Check if device ID already exists for this property
        existing = await db.devices.find_one({
            "propertyId": device.propertyId,
            "deviceId": device.deviceId
        })
        
        if existing:
            raise HTTPException(status_code=400, detail=f"Device ID {device.deviceId} already exists")
        
        new_device = Device(
            propertyId=device.propertyId,
            deviceId=device.deviceId
        )
        
        device_dict = new_device.model_dump()
        device_dict['createdAt'] = device_dict['createdAt'].isoformat()
        device_dict['updatedAt'] = device_dict['updatedAt'].isoformat()
        
        await db.devices.insert_one(device_dict)
        
        logger.info(f"Device created: {new_device.deviceId}")
        return new_device
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating device: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/devices/{device_id}")
async def update_device(device_id: str, device: DeviceUpdate):
    """Update a device"""
    try:
        update_data = {k: v for k, v in device.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.devices.update_one(
            {"id": device_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        updated_device = await db.devices.find_one({"id": device_id}, {"_id": 0})
        
        logger.info(f"Device updated: {device_id}")
        return {"success": True, "device": updated_device}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating device: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/devices/{device_id}")
async def delete_device(device_id: str):
    """Delete a device"""
    try:
        result = await db.devices.delete_one({"id": device_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        logger.info(f"Device deleted: {device_id}")
        return {"success": True, "message": "Device deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting device: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Group CRUD Endpoints
@api_router.post("/groups")
async def create_group(group: GroupCreate):
    """Create a new group"""
    try:
        group_obj = Group(**group.model_dump())
        
        # Convert to dict and serialize datetime
        doc = group_obj.model_dump()
        doc['createdAt'] = doc['createdAt'].isoformat()
        doc['updatedAt'] = doc['updatedAt'].isoformat()
        
        await db.groups.insert_one(doc)
        
        logger.info(f"Group created: {group_obj.id}")
        return {"success": True, "group": group_obj}
        
    except Exception as e:
        logger.error(f"Error creating group: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/groups/{property_id}")
async def get_groups(property_id: str):
    """Get all groups for a property"""
    try:
        groups = await db.groups.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "groups": groups}
        
    except Exception as e:
        logger.error(f"Error fetching groups: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/groups/{group_id}")
async def update_group(group_id: str, update_data: GroupUpdate):
    """Update a group"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.groups.update_one(
            {"id": group_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Get updated group
        updated_group = await db.groups.find_one({"id": group_id}, {"_id": 0})
        
        logger.info(f"Group updated: {group_id}")
        return {"success": True, "group": updated_group}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating group: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str):
    """Delete a group"""
    try:
        result = await db.groups.delete_one({"id": group_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Group not found")
        
        logger.info(f"Group deleted: {group_id}")
        return {"success": True, "message": "Group deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting group: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Staff CRUD Endpoints
@api_router.post("/staff")
async def create_staff(staff: StaffCreate):
    """Create a new staff member"""
    try:
        # Check if email already exists
        existing = await db.staff.find_one({"email": staff.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Staff member with this email already exists")
        
        staff_obj = Staff(**staff.model_dump())
        
        # Convert to dict and serialize datetime
        doc = staff_obj.model_dump()
        doc['createdAt'] = doc['createdAt'].isoformat()
        doc['updatedAt'] = doc['updatedAt'].isoformat()
        
        await db.staff.insert_one(doc)
        
        logger.info(f"Staff created: {staff_obj.id}")
        return {"success": True, "staff": staff_obj}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating staff: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/staff/{property_id}")
async def get_staff(property_id: str):
    """Get all staff for a property"""
    try:
        staff_list = await db.staff.find(
            {"propertyId": property_id},
            {"_id": 0, "password": 0}  # Don't return passwords
        ).to_list(1000)
        
        return {"success": True, "staff": staff_list}
        
    except Exception as e:
        logger.error(f"Error fetching staff: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/staff/{staff_id}")
async def update_staff(staff_id: str, update_data: StaffUpdate):
    """Update a staff member"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Check if email is being updated and if it already exists
        if 'email' in update_dict:
            existing = await db.staff.find_one(
                {"email": update_dict['email'], "id": {"$ne": staff_id}},
                {"_id": 0}
            )
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use by another staff member")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.staff.update_one(
            {"id": staff_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # Get updated staff (without password)
        updated_staff = await db.staff.find_one({"id": staff_id}, {"_id": 0, "password": 0})
        
        logger.info(f"Staff updated: {staff_id}")
        return {"success": True, "staff": updated_staff}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating staff: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/staff/{staff_id}")
async def delete_staff(staff_id: str):
    """Delete a staff member"""
    try:
        result = await db.staff.delete_one({"id": staff_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        logger.info(f"Staff deleted: {staff_id}")
        return {"success": True, "message": "Staff member deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting staff: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============= ROLE ENDPOINTS =============

@api_router.get("/roles")
async def get_all_roles():
    """Get all roles from the master data"""
    try:
        roles = await db.roles.find({}, {"_id": 0}).to_list(1000)
        logger.info(f"Fetched {len(roles)} roles")
        return {"success": True, "roles": roles}
    except Exception as e:
        logger.error(f"Error fetching roles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/roles/seed")
async def seed_initial_roles():
    """Seed initial roles if database is empty"""
    try:
        # Check if roles already exist
        existing_count = await db.roles.count_documents({})
        
        if existing_count > 0:
            return {
                "success": True, 
                "message": f"Roles already exist ({existing_count} roles). No seeding needed.",
                "roles": await db.roles.find({}, {"_id": 0}).to_list(1000)
            }
        
        # Initial roles to seed
        initial_roles = [
            {
                "id": "role-1",
                "name": "Org Admin",
                "description": "Will be able to see an org, all properties under it and all the reporting later on.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "role-2",
                "name": "Property Admin",
                "description": "Will be able to see all the details of the associated property.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "role-3",
                "name": "Pool and Beach Manager",
                "description": "Will be able to manage Pool and Beach Attendants of the associated property.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "role-4",
                "name": "Pool Attendant",
                "description": "Will be able to see the people on a seat and actions like check-in and check-out.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "role-5",
                "name": "Beach Attendant",
                "description": "Will be able to see the people on a seat and actions like check-in and check-out.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        # Insert all roles
        await db.roles.insert_many(initial_roles)
        
        logger.info(f"Seeded {len(initial_roles)} initial roles")
        return {
            "success": True, 
            "message": f"Successfully seeded {len(initial_roles)} roles",
            "roles": initial_roles
        }
        
    except Exception as e:
        logger.error(f"Error seeding roles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/roles", response_model=Role)
async def create_role(role: RoleCreate):
    """Create a new role"""
    try:
        new_role = Role(
            name=role.name,
            description=role.description
        )
        
        role_dict = new_role.model_dump()
        role_dict['createdAt'] = role_dict['createdAt'].isoformat()
        role_dict['updatedAt'] = role_dict['updatedAt'].isoformat()
        
        await db.roles.insert_one(role_dict)
        
        logger.info(f"Role created: {new_role.id}")
        return new_role
        
    except Exception as e:
        logger.error(f"Error creating role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/roles/{role_id}")
async def update_role(role_id: str, role: RoleUpdate):
    """Update a role"""
    try:
        update_data = {k: v for k, v in role.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.roles.update_one(
            {"id": role_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Role not found")
        
        updated_role = await db.roles.find_one({"id": role_id}, {"_id": 0})
        
        logger.info(f"Role updated: {role_id}")
        return {"success": True, "role": updated_role}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/roles/{role_id}")
async def delete_role(role_id: str):
    """Delete a role"""
    try:
        # Check if any staff members are using this role
        staff_with_role = await db.staff.find_one({"roleId": role_id})
        
        if staff_with_role:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete role that is assigned to staff members"
            )
        
        result = await db.roles.delete_one({"id": role_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Role not found")
        
        logger.info(f"Role deleted: {role_id}")
        return {"success": True, "message": "Role deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============= GUEST ENDPOINTS =============

@api_router.get("/guests/{property_id}")
async def get_guests_by_property(property_id: str):
    """Get all guests for a property"""
    try:
        guests = await db.guests.find({"propertyId": property_id}, {"_id": 0}).to_list(10000)
        logger.info(f"Fetched {len(guests)} guests for property {property_id}")
        return {"success": True, "guests": guests}
    except Exception as e:
        logger.error(f"Error fetching guests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/guests/bulk")
async def create_guests_bulk(data: GuestBulkCreate):
    """Bulk create guests from Excel import"""
    try:
        property_id = data.propertyId
        guests_data = data.guests
        
        if not guests_data:
            raise HTTPException(status_code=400, detail="No guest data provided")
        
        # Create guest documents
        guests_to_insert = []
        for guest_data in guests_data:
            guest = Guest(
                propertyId=property_id,
                roomNumber=guest_data.get('roomNumber', ''),
                guestName=guest_data.get('guestName', ''),
                category=guest_data.get('category')
            )
            
            guest_dict = guest.model_dump()
            guest_dict['createdAt'] = guest_dict['createdAt'].isoformat()
            guest_dict['updatedAt'] = guest_dict['updatedAt'].isoformat()
            guests_to_insert.append(guest_dict)
        
        # Insert all guests
        await db.guests.insert_many(guests_to_insert)
        
        logger.info(f"Bulk created {len(guests_to_insert)} guests for property {property_id}")
        return {
            "success": True,
            "message": f"Successfully imported {len(guests_to_insert)} guests",
            "count": len(guests_to_insert)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error bulk creating guests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/guests", response_model=Guest)
async def create_guest(guest: GuestCreate):
    """Create a new guest"""
    try:
        new_guest = Guest(
            propertyId=guest.propertyId,
            roomNumber=guest.roomNumber,
            guestName=guest.guestName,
            category=guest.category
        )
        
        guest_dict = new_guest.model_dump()
        guest_dict['createdAt'] = guest_dict['createdAt'].isoformat()
        guest_dict['updatedAt'] = guest_dict['updatedAt'].isoformat()
        
        await db.guests.insert_one(guest_dict)
        
        logger.info(f"Guest created: {new_guest.id}")
        return new_guest
        
    except Exception as e:
        logger.error(f"Error creating guest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/guests/{guest_id}")
async def update_guest(guest_id: str, guest: GuestUpdate):
    """Update a guest"""
    try:
        update_data = {k: v for k, v in guest.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.guests.update_one(
            {"id": guest_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        updated_guest = await db.guests.find_one({"id": guest_id}, {"_id": 0})
        
        logger.info(f"Guest updated: {guest_id}")
        return {"success": True, "guest": updated_guest}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating guest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/guests/{guest_id}")
async def delete_guest(guest_id: str):
    """Delete a guest"""
    try:
        result = await db.guests.delete_one({"id": guest_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        logger.info(f"Guest deleted: {guest_id}")
        return {"success": True, "message": "Guest deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting guest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/guests/property/{property_id}")
async def clear_all_guests(property_id: str):
    """Clear all guests for a property"""
    try:
        result = await db.guests.delete_many({"propertyId": property_id})
        
        logger.info(f"Cleared {result.deleted_count} guests for property {property_id}")
        return {
            "success": True,
            "message": f"Cleared {result.deleted_count} guests",
            "count": result.deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error clearing guests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============= ALLOCATION ENDPOINTS =============

@api_router.get("/allocations/{property_id}")
async def get_allocations_by_property(property_id: str, date: Optional[str] = None):
    """Get all allocations for a property, optionally filtered by date"""
    try:
        query = {"propertyId": property_id}
        if date:
            query["allocationDate"] = date
        
        allocations = await db.allocations.find(query, {"_id": 0}).to_list(10000)
        logger.info(f"Fetched {len(allocations)} allocations for property {property_id}")
        return {"success": True, "allocations": allocations}
    except Exception as e:
        logger.error(f"Error fetching allocations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/allocations/{property_id}/allocated-seats")
async def get_allocated_seats(property_id: str, date: Optional[str] = None):
    """Get list of already allocated seat IDs for a specific date"""
    try:
        allocation_date = date or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        # Only get seats from non-complete allocations
        allocations = await db.allocations.find(
            {
                "propertyId": property_id, 
                "allocationDate": allocation_date,
                "status": {"$nin": ["Complete"]}  # Exclude completed allocations
            },
            {"_id": 0, "seatIds": 1}
        ).to_list(10000)
        
        # Collect all allocated seat IDs (only from active allocations)
        allocated_seat_ids = set()
        for allocation in allocations:
            allocated_seat_ids.update(allocation.get('seatIds', []))
        
        logger.info(f"Found {len(allocated_seat_ids)} allocated seats (non-complete) for property {property_id} on {allocation_date}")
        return {
            "success": True, 
            "allocatedSeatIds": list(allocated_seat_ids),
            "date": allocation_date
        }
    except Exception as e:
        logger.error(f"Error fetching allocated seats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/allocations/{property_id}/allocated-devices")
async def get_allocated_devices(property_id: str, date: Optional[str] = None):
    """Get list of already allocated device IDs for a specific date"""
    try:
        allocation_date = date or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        # Only get devices from non-complete allocations
        allocations = await db.allocations.find(
            {
                "propertyId": property_id, 
                "allocationDate": allocation_date,
                "status": {"$nin": ["Complete"]}  # Exclude completed allocations
            },
            {"_id": 0, "deviceIds": 1}
        ).to_list(10000)
        
        # Collect all allocated device IDs (only from active allocations)
        allocated_device_ids = set()
        for allocation in allocations:
            allocated_device_ids.update(allocation.get('deviceIds', []))
        
        logger.info(f"Found {len(allocated_device_ids)} allocated devices (non-complete) for property {property_id} on {allocation_date}")
        return {
            "success": True, 
            "allocatedDeviceIds": list(allocated_device_ids),
            "date": allocation_date
        }
    except Exception as e:
        logger.error(f"Error fetching allocated devices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/allocations")
async def create_allocation(allocation: AllocationCreate):
    """Create a new seat allocation"""
    try:
        # Verify guest exists with the room number
        guest = await db.guests.find_one(
            {"propertyId": allocation.propertyId, "roomNumber": allocation.roomNumber},
            {"_id": 0}
        )
        
        if not guest:
            raise HTTPException(
                status_code=404,
                detail=f"No guest found in room number {allocation.roomNumber}"
            )
        
        # Verify F&B Manager exists
        fb_manager = await db.staff.find_one(
            {"id": allocation.fbManagerId, "propertyId": allocation.propertyId},
            {"_id": 0}
        )
        
        if not fb_manager:
            raise HTTPException(status_code=404, detail="F&B Manager not found")
        
        # Set allocation date to today if not provided
        allocation_date = allocation.allocationDate or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        # Check if any of the requested seats are blocked
        blocked_seats = []
        for seat_id in allocation.seatIds:
            seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
            if seat and seat.get('status') == 'Blocked':
                blocked_seats.append(seat.get('seatNumber', seat_id))
        
        if blocked_seats:
            raise HTTPException(
                status_code=400,
                detail=f"The following seats are blocked and cannot be allocated: {', '.join(blocked_seats)}"
            )
        
        # Check if any of the requested seats are already allocated for the same date
        existing_allocations = await db.allocations.find(
            {
                "propertyId": allocation.propertyId,
                "allocationDate": allocation_date,
                "status": {"$nin": ["Complete"]}  # Exclude completed allocations
            },
            {"_id": 0}
        ).to_list(10000)
        
        # Collect all already allocated seat IDs
        already_allocated_seats = set()
        conflicting_allocations = []
        
        for existing in existing_allocations:
            existing_seat_ids = existing.get('seatIds', [])
            for seat_id in allocation.seatIds:
                if seat_id in existing_seat_ids:
                    already_allocated_seats.add(seat_id)
                    conflicting_allocations.append({
                        'guestName': existing.get('guestName'),
                        'roomNumber': existing.get('roomNumber')
                    })
        
        # If any seats are already allocated, return error with details
        if already_allocated_seats:
            # Get seat numbers for better error message
            seat_numbers = []
            for seat_id in already_allocated_seats:
                seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
                if seat:
                    seat_numbers.append(seat.get('seatNumber', seat_id))
            
            # Get unique conflicting guests
            unique_conflicts = []
            seen = set()
            for conflict in conflicting_allocations:
                key = f"{conflict['roomNumber']}-{conflict['guestName']}"
                if key not in seen:
                    seen.add(key)
                    unique_conflicts.append(conflict)
            
            conflict_details = ", ".join([f"{c['guestName']} (Room {c['roomNumber']})" for c in unique_conflicts[:3]])
            
            raise HTTPException(
                status_code=400,
                detail=f"The following seats are already allocated: {', '.join(seat_numbers)}. Currently allocated to: {conflict_details}"
            )
        
        # Create initial event
        initial_event = {
            "eventType": "Created",
            "oldValue": None,
            "newValue": "Allocated",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "description": f"Allocation created for {guest['guestName']} (Room {allocation.roomNumber})"
        }
        
        new_allocation = Allocation(
            propertyId=allocation.propertyId,
            guestId=guest['id'],
            roomNumber=allocation.roomNumber,
            guestName=guest['guestName'],
            guestCategory=guest.get('category'),
            fbManagerId=allocation.fbManagerId,
            seatIds=allocation.seatIds,
            deviceIds=allocation.deviceIds or [],
            allocationDate=allocation_date,
            status="Allocated",
            events=[initial_event]
        )
        
        allocation_dict = new_allocation.model_dump()
        allocation_dict['createdAt'] = allocation_dict['createdAt'].isoformat()
        allocation_dict['updatedAt'] = allocation_dict['updatedAt'].isoformat()
        
        await db.allocations.insert_one(allocation_dict)
        
        # Update seat status to "Allocated"
        await db.seats.update_many(
            {"id": {"$in": allocation.seatIds}},
            {"$set": {
                "status": "Allocated",
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Allocation created: {new_allocation.id} with {len(allocation.seatIds)} seats")
        return {"success": True, "allocation": new_allocation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/allocations/{allocation_id}")
async def update_allocation(allocation_id: str, allocation: AllocationUpdate):
    """Update an allocation"""
    try:
        update_data = {k: v for k, v in allocation.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.allocations.update_one(
            {"id": allocation_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Allocation not found")
        
        updated_allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        
        logger.info(f"Allocation updated: {allocation_id}")
        return {"success": True, "allocation": updated_allocation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.patch("/allocations/{allocation_id}/status")
async def update_allocation_status(allocation_id: str, status_update: AllocationStatusUpdate):
    """Update allocation status (Allocated, Active, Billing, Clear, Complete)"""
    try:
        valid_statuses = ["Allocated", "Active", "Billing", "Clear", "Complete"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Get allocation first
        allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        
        # Update allocation status
        result = await db.allocations.update_one(
            {"id": allocation_id},
            {"$set": {
                "status": status_update.status,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # If status changed to "Complete", set seat status back to "Free"
        if status_update.status == "Complete":
            seat_ids = allocation.get('seatIds', [])
            await db.seats.update_many(
                {"id": {"$in": seat_ids}},
                {"$set": {
                    "status": "Free",
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Released {len(seat_ids)} seats from allocation {allocation_id}")
        
        updated_allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        
        logger.info(f"Allocation status updated: {allocation_id} -> {status_update.status}")
        return {"success": True, "allocation": updated_allocation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating allocation status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.patch("/allocations/{allocation_id}/calling-flag")
async def update_allocation_calling_flag(allocation_id: str, flag_update: AllocationCallingFlagUpdate):
    """Update allocation calling flag (Non Calling, Calling, Calling for Checkout)"""
    try:
        valid_flags = ["Non Calling", "Calling", "Calling for Checkout"]
        if flag_update.callingFlag not in valid_flags:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid calling flag. Must be one of: {', '.join(valid_flags)}"
            )
        
        # Get allocation first
        allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        
        # Update allocation calling flag
        result = await db.allocations.update_one(
            {"id": allocation_id},
            {"$set": {
                "callingFlag": flag_update.callingFlag,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        updated_allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        
        logger.info(f"Allocation calling flag updated: {allocation_id} -> {flag_update.callingFlag}")
        return {"success": True, "allocation": updated_allocation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating allocation calling flag: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/allocations/{allocation_id}")
async def delete_allocation(allocation_id: str):
    """Delete an allocation and free up seats"""
    try:
        # Get allocation first to get seat IDs
        allocation = await db.allocations.find_one({"id": allocation_id}, {"_id": 0})
        
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        
        # Delete allocation
        await db.allocations.delete_one({"id": allocation_id})
        
        # Free up seats
        seat_ids = allocation.get('seatIds', [])
        if seat_ids:
            await db.seats.update_many(
                {"id": {"$in": seat_ids}},
                {"$set": {
                    "status": "Free",
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        logger.info(f"Allocation deleted: {allocation_id}, freed {len(seat_ids)} seats")
        return {"success": True, "message": "Allocation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/user/login", response_model=VerifyOTPResponse)
async def verify_otp_login(request: VerifyOTPRequest):
    """
    Verify OTP and log in user
    """
    try:
        # Find the OTP document
        otp_doc = await db.admin_otps.find_one(
            {
                "email": request.email,
                "otp": request.otp,
                "used": False
            },
            {"_id": 0}
        )
        
        if not otp_doc:
            raise HTTPException(status_code=401, detail="Invalid OTP or email")
        
        # Parse expiry time
        expires_at = datetime.fromisoformat(otp_doc['expiresAt'])
        
        # Check if OTP has expired
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=401, detail="OTP has expired. Please request a new one.")
        
        # Mark OTP as used
        await db.admin_otps.update_one(
            {"id": otp_doc['id']},
            {"$set": {"used": True}}
        )
        
        # Create a simple token (in production, use JWT with proper secret)
        token = str(uuid.uuid4())
        
        # Store admin session (you can create an admins collection for this)
        admin_session = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "name": otp_doc['name'],
            "token": token,
            "entityType": otp_doc.get('entityType', ''),
            "entityId": otp_doc.get('entityId', ''),
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        
        await db.admin_sessions.insert_one(admin_session)
        
        logger.info(f"User {request.email} logged in successfully")
        
        return VerifyOTPResponse(
            success=True,
            message="Login successful",
            token=token,
            user={
                "email": request.email,
                "name": otp_doc['name'],
                "entityType": otp_doc.get('entityType', ''),
                "entityId": otp_doc.get('entityId', '')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()