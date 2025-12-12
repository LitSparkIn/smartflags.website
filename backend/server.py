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

# Organisation Models
class Organisation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    address: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganisationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str

class OrganisationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

# Property Models (for admin)
class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organisationId: str
    name: str
    email: EmailStr
    phone: str
    address: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    organisationId: str
    name: str
    email: EmailStr
    phone: str
    address: str

class PropertyUpdate(BaseModel):
    organisationId: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

# Master Data Models - Countries, States, Cities
class Country(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CountryCreate(BaseModel):
    name: str
    code: str

class CountryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None

class State(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    countryId: str
    name: str
    code: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StateCreate(BaseModel):
    countryId: str
    name: str
    code: str

class StateUpdate(BaseModel):
    countryId: Optional[str] = None
    name: Optional[str] = None
    code: Optional[str] = None

class City(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stateId: str
    name: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CityCreate(BaseModel):
    stateId: str
    name: str

class CityUpdate(BaseModel):
    stateId: Optional[str] = None
    name: Optional[str] = None

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
    username: str  # Alphanumeric username for login
    pin: str  # PIN for staff login
    password: Optional[str] = None  # Optional - staff login uses username + PIN
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StaffCreate(BaseModel):
    propertyId: str
    roleId: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    username: str
    pin: str
    password: Optional[str] = None

class StaffUpdate(BaseModel):
    roleId: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    pin: Optional[str] = None
    password: Optional[str] = None


# Staff Login Models
class StaffLoginRequest(BaseModel):
    username: str
    pin: str
    propertyId: str

class StaffLoginResponse(BaseModel):
    success: bool
    message: str
    staff: Optional[dict] = None
    propertyId: Optional[str] = None


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


# Menu Category Models
class MenuCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    description: Optional[str] = None
    displayOrder: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuCategoryCreate(BaseModel):
    propertyId: str
    name: str
    description: Optional[str] = None
    displayOrder: int = 0
    isActive: bool = True

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    displayOrder: Optional[int] = None
    isActive: Optional[bool] = None


# Menu Tag Models
class MenuTag(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    color: str = "#3B82F6"  # Hex color code for badge
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuTagCreate(BaseModel):
    propertyId: str
    name: str
    color: str = "#3B82F6"
    isActive: bool = True

class MenuTagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    isActive: Optional[bool] = None

# Dietary Restriction Models
class DietaryRestriction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    icon: Optional[str] = None  # Emoji or icon identifier
    description: Optional[str] = None
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DietaryRestrictionCreate(BaseModel):
    propertyId: str
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None
    isActive: bool = True

class DietaryRestrictionUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None

# Menu Item Models
class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    categoryId: str
    name: str
    image: Optional[str] = None
    price: float
    description: Optional[str] = None
    isActive: bool = True
    tagIds: List[str] = []
    dietaryRestrictionIds: List[str] = []
    priority: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    propertyId: str
    categoryId: str
    name: str
    image: Optional[str] = None
    price: float
    description: Optional[str] = None
    isActive: bool = True
    tagIds: List[str] = []
    dietaryRestrictionIds: List[str] = []
    priority: int = 0

class MenuItemUpdate(BaseModel):
    categoryId: Optional[str] = None
    name: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None
    tagIds: Optional[List[str]] = None
    dietaryRestrictionIds: Optional[List[str]] = None
    priority: Optional[int] = None

# Menu Models (Collection of items)
class Menu(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    name: str
    itemIds: List[str] = []
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuCreate(BaseModel):
    propertyId: str
    name: str
    itemIds: List[str] = []
    isActive: bool = True

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    itemIds: Optional[List[str]] = None
    isActive: Optional[bool] = None


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Configuration Models
class Configuration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    checkInTime: str  # Format: "HH:MM" (24-hour)
    checkOutTime: str  # Format: "HH:MM" (24-hour)
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConfigurationCreate(BaseModel):
    propertyId: str
    checkInTime: str
    checkOutTime: str

class ConfigurationUpdate(BaseModel):
    checkInTime: Optional[str] = None
    checkOutTime: Optional[str] = None

# Guest Models
class Guest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propertyId: str
    roomNumber: str
    guestName: str
    category: Optional[str] = None
    description: Optional[str] = None
    checkInDate: Optional[str] = None  # Format: "YYYY-MM-DD"
    checkOutDate: Optional[str] = None  # Format: "YYYY-MM-DD"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GuestCreate(BaseModel):
    propertyId: str
    roomNumber: str
    guestName: str
    category: Optional[str] = None
    description: Optional[str] = None
    checkInDate: Optional[str] = None
    checkOutDate: Optional[str] = None

class GuestUpdate(BaseModel):
    roomNumber: Optional[str] = None
    guestName: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    checkInDate: Optional[str] = None
    checkOutDate: Optional[str] = None
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
    poolBeachAttendantIds: List[str] = []  # Pool And Beach Attendant staff IDs
    fbServerIds: List[str] = []  # Food and Beverages Server staff IDs
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


# Organisation Endpoints
@api_router.get("/organisations")
async def get_organisations():
    """Get all organisations"""
    try:
        organisations = await db.organisations.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "organisations": organisations}
    except Exception as e:
        logger.error(f"Error fetching organisations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/organisations/{organisation_id}")
async def get_organisation(organisation_id: str):
    """Get a single organisation by ID"""
    try:
        organisation = await db.organisations.find_one({"id": organisation_id}, {"_id": 0})
        if not organisation:
            raise HTTPException(status_code=404, detail="Organisation not found")
        return {"success": True, "organisation": organisation}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organisation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/organisations")
async def create_organisation(org_data: OrganisationCreate):
    """Create a new organisation"""
    try:
        new_org = Organisation(**org_data.model_dump())
        
        org_dict = new_org.model_dump()
        org_dict['createdAt'] = org_dict['createdAt'].isoformat()
        org_dict['updatedAt'] = org_dict['updatedAt'].isoformat()
        
        await db.organisations.insert_one(org_dict)
        
        logger.info(f"Organisation created: {new_org.id}")
        return {"success": True, "organisation": new_org}
    except Exception as e:
        logger.error(f"Error creating organisation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/organisations/{organisation_id}")
async def update_organisation(organisation_id: str, update_data: OrganisationUpdate):
    """Update an organisation"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.organisations.update_one(
            {"id": organisation_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Organisation not found")
        
        updated_org = await db.organisations.find_one({"id": organisation_id}, {"_id": 0})
        
        logger.info(f"Organisation updated: {organisation_id}")
        return {"success": True, "organisation": updated_org}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating organisation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/organisations/{organisation_id}")
async def delete_organisation(organisation_id: str):
    """Delete an organisation"""
    try:
        result = await db.organisations.delete_one({"id": organisation_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Organisation not found")
        
        logger.info(f"Organisation deleted: {organisation_id}")
        return {"success": True, "message": "Organisation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting organisation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Property Endpoints (Admin)
@api_router.get("/properties")
async def get_properties():
    """Get all properties"""
    try:
        properties = await db.properties.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "properties": properties}
    except Exception as e:
        logger.error(f"Error fetching properties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/properties/organisation/{organisation_id}")
async def get_properties_by_organisation(organisation_id: str):
    """Get all properties for an organisation"""
    try:
        properties = await db.properties.find({"organisationId": organisation_id}, {"_id": 0}).to_list(1000)
        return {"success": True, "properties": properties}
    except Exception as e:
        logger.error(f"Error fetching properties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    """Get a single property by ID"""
    try:
        property_data = await db.properties.find_one({"id": property_id}, {"_id": 0})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        return {"success": True, "property": property_data}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/properties")
async def create_property(property_data: PropertyCreate):
    """Create a new property"""
    try:
        # Verify organisation exists
        organisation = await db.organisations.find_one({"id": property_data.organisationId}, {"_id": 0})
        if not organisation:
            raise HTTPException(status_code=404, detail="Organisation not found")
        
        new_property = Property(**property_data.model_dump())
        
        prop_dict = new_property.model_dump()
        prop_dict['createdAt'] = prop_dict['createdAt'].isoformat()
        prop_dict['updatedAt'] = prop_dict['updatedAt'].isoformat()
        
        await db.properties.insert_one(prop_dict)
        
        logger.info(f"Property created: {new_property.id}")
        return {"success": True, "property": new_property}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/properties/{property_id}")
async def update_property(property_id: str, update_data: PropertyUpdate):
    """Update a property"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # If organisationId is being updated, verify it exists
        if 'organisationId' in update_dict:
            organisation = await db.organisations.find_one({"id": update_dict['organisationId']}, {"_id": 0})
            if not organisation:
                raise HTTPException(status_code=404, detail="Organisation not found")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.properties.update_one(
            {"id": property_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Property not found")
        
        updated_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
        
        logger.info(f"Property updated: {property_id}")
        return {"success": True, "property": updated_property}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str):
    """Delete a property"""
    try:
        result = await db.properties.delete_one({"id": property_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Property not found")
        
        logger.info(f"Property deleted: {property_id}")
        return {"success": True, "message": "Property deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Master Data Endpoints - Countries
@api_router.get("/countries")
async def get_countries():
    """Get all countries"""
    try:
        countries = await db.countries.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "countries": countries}
    except Exception as e:
        logger.error(f"Error fetching countries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/countries")
async def create_country(country_data: CountryCreate):
    """Create a new country"""
    try:
        new_country = Country(**country_data.model_dump())
        
        country_dict = new_country.model_dump()
        country_dict['createdAt'] = country_dict['createdAt'].isoformat()
        
        await db.countries.insert_one(country_dict)
        
        logger.info(f"Country created: {new_country.id}")
        return {"success": True, "country": new_country}
    except Exception as e:
        logger.error(f"Error creating country: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/countries/{country_id}")
async def update_country(country_id: str, update_data: CountryUpdate):
    """Update a country"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.countries.update_one(
            {"id": country_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Country not found")
        
        updated_country = await db.countries.find_one({"id": country_id}, {"_id": 0})
        
        logger.info(f"Country updated: {country_id}")
        return {"success": True, "country": updated_country}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating country: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/countries/{country_id}")
async def delete_country(country_id: str):
    """Delete a country"""
    try:
        result = await db.countries.delete_one({"id": country_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Country not found")
        
        logger.info(f"Country deleted: {country_id}")
        return {"success": True, "message": "Country deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting country: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Master Data Endpoints - States
@api_router.get("/states")
async def get_states():
    """Get all states"""
    try:
        states = await db.states.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "states": states}
    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/states/country/{country_id}")
async def get_states_by_country(country_id: str):
    """Get all states for a country"""
    try:
        states = await db.states.find({"countryId": country_id}, {"_id": 0}).to_list(1000)
        return {"success": True, "states": states}
    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/states")
async def create_state(state_data: StateCreate):
    """Create a new state"""
    try:
        # Verify country exists
        country = await db.countries.find_one({"id": state_data.countryId}, {"_id": 0})
        if not country:
            raise HTTPException(status_code=404, detail="Country not found")
        
        new_state = State(**state_data.model_dump())
        
        state_dict = new_state.model_dump()
        state_dict['createdAt'] = state_dict['createdAt'].isoformat()
        
        await db.states.insert_one(state_dict)
        
        logger.info(f"State created: {new_state.id}")
        return {"success": True, "state": new_state}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating state: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/states/{state_id}")
async def update_state(state_id: str, update_data: StateUpdate):
    """Update a state"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # If countryId is being updated, verify it exists
        if 'countryId' in update_dict:
            country = await db.countries.find_one({"id": update_dict['countryId']}, {"_id": 0})
            if not country:
                raise HTTPException(status_code=404, detail="Country not found")
        
        result = await db.states.update_one(
            {"id": state_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="State not found")
        
        updated_state = await db.states.find_one({"id": state_id}, {"_id": 0})
        
        logger.info(f"State updated: {state_id}")
        return {"success": True, "state": updated_state}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating state: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/states/{state_id}")
async def delete_state(state_id: str):
    """Delete a state"""
    try:
        result = await db.states.delete_one({"id": state_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="State not found")
        
        logger.info(f"State deleted: {state_id}")
        return {"success": True, "message": "State deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting state: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Master Data Endpoints - Cities
@api_router.get("/cities")
async def get_cities():
    """Get all cities"""
    try:
        cities = await db.cities.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "cities": cities}
    except Exception as e:
        logger.error(f"Error fetching cities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/cities/state/{state_id}")
async def get_cities_by_state(state_id: str):
    """Get all cities for a state"""
    try:
        cities = await db.cities.find({"stateId": state_id}, {"_id": 0}).to_list(1000)
        return {"success": True, "cities": cities}
    except Exception as e:
        logger.error(f"Error fetching cities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/cities")
async def create_city(city_data: CityCreate):
    """Create a new city"""
    try:
        # Verify state exists
        state = await db.states.find_one({"id": city_data.stateId}, {"_id": 0})
        if not state:
            raise HTTPException(status_code=404, detail="State not found")
        
        new_city = City(**city_data.model_dump())
        
        city_dict = new_city.model_dump()
        city_dict['createdAt'] = city_dict['createdAt'].isoformat()
        
        await db.cities.insert_one(city_dict)
        
        logger.info(f"City created: {new_city.id}")
        return {"success": True, "city": new_city}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating city: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/cities/{city_id}")
async def update_city(city_id: str, update_data: CityUpdate):
    """Update a city"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # If stateId is being updated, verify it exists
        if 'stateId' in update_dict:
            state = await db.states.find_one({"id": update_dict['stateId']}, {"_id": 0})
            if not state:
                raise HTTPException(status_code=404, detail="State not found")
        
        result = await db.cities.update_one(
            {"id": city_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="City not found")
        
        updated_city = await db.cities.find_one({"id": city_id}, {"_id": 0})
        
        logger.info(f"City updated: {city_id}")
        return {"success": True, "city": updated_city}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating city: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/cities/{city_id}")
async def delete_city(city_id: str):
    """Delete a city"""
    try:
        result = await db.cities.delete_one({"id": city_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="City not found")
        
        logger.info(f"City deleted: {city_id}")
        return {"success": True, "message": "City deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting city: {str(e)}")
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


@api_router.patch("/seats/{seat_id}/toggle-block")
async def toggle_seat_block(seat_id: str):
    """Toggle seat between Blocked and Free status"""
    try:
        # Get current seat
        seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
        if not seat:
            raise HTTPException(status_code=404, detail="Seat not found")
        
        # Toggle status
        current_status = seat.get('status', 'Free')
        new_status = "Free" if current_status == "Blocked" else "Blocked"
        
        result = await db.seats.update_one(
            {"id": seat_id},
            {"$set": {
                "status": new_status,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        updated_seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
        
        logger.info(f"Seat block toggled: {seat_id} -> {new_status}")
        return {"success": True, "seat": updated_seat, "status": new_status}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling seat block: {str(e)}")
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
        
        # Update seats with this group ID
        if group_obj.seatIds:
            await db.seats.update_many(
                {"id": {"$in": group_obj.seatIds}},
                {"$set": {"groupId": group_obj.id}}
            )
            logger.info(f"Updated {len(group_obj.seatIds)} seats with groupId: {group_obj.id}")
        
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
        # Get the old group to compare seat assignments
        old_group = await db.groups.find_one({"id": group_id}, {"_id": 0})
        if not old_group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.groups.update_one(
            {"id": group_id},
            {"$set": update_dict}
        )
        
        # Handle seat assignments if seatIds was updated
        if 'seatIds' in update_dict:
            new_seat_ids = update_dict['seatIds']
            old_seat_ids = old_group.get('seatIds', [])
            
            # Remove groupId from seats that are no longer in this group
            removed_seats = [sid for sid in old_seat_ids if sid not in new_seat_ids]
            if removed_seats:
                await db.seats.update_many(
                    {"id": {"$in": removed_seats}, "groupId": group_id},
                    {"$set": {"groupId": ""}}
                )
                logger.info(f"Removed groupId from {len(removed_seats)} seats")
            
            # Add groupId to new seats
            added_seats = [sid for sid in new_seat_ids if sid not in old_seat_ids]
            if added_seats:
                await db.seats.update_many(
                    {"id": {"$in": added_seats}},
                    {"$set": {"groupId": group_id}}
                )
                logger.info(f"Added groupId to {len(added_seats)} seats")
        
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

@api_router.get("/roles/{role_id}")
async def get_role_by_id(role_id: str):
    """Get a specific role by ID"""
    try:
        role = await db.roles.find_one({"id": role_id}, {"_id": 0})
        
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return {"success": True, "role": role}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/roles/seed")
async def seed_initial_roles():
    """Seed initial roles if database is empty"""
    try:
        # Check if role-6 (Food and Beverages Server) exists
        role_6_exists = await db.roles.find_one({"id": "role-6"})
        
        # If role-6 doesn't exist, add it
        if not role_6_exists:
            new_role = {
                "id": "role-6",
                "name": "Food and Beverages Server",
                "description": "Will be able to serve food and beverages to guests.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.roles.insert_one(new_role)
            logger.info("Added Food and Beverages Server role")
        
        # Check if role-7 (Pool And Beach Attendant) exists
        role_7_exists = await db.roles.find_one({"id": "role-7"})
        
        # If role-7 doesn't exist, add it
        if not role_7_exists:
            new_role = {
                "id": "role-7",
                "name": "Pool And Beach Attendant",
                "description": "Will be able to serve both pool and beach areas.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.roles.insert_one(new_role)
            logger.info("Added Pool And Beach Attendant role")
        
        # Check if roles already exist
        existing_count = await db.roles.count_documents({})
        
        if existing_count > 0:
            return {
                "success": True, 
                "message": f"Roles exist ({existing_count} roles). Added missing roles if any.",
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
            },
            {
                "id": "role-6",
                "name": "Food and Beverages Server",
                "description": "Will be able to serve food and beverages to guests.",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "role-7",
                "name": "Pool And Beach Attendant",
                "description": "Will be able to serve both pool and beach areas.",
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

# Menu Category Endpoints
@api_router.get("/menu-categories/{property_id}")
async def get_menu_categories(property_id: str):
    """Get all menu categories for a property"""
    try:
        categories = await db.menu_categories.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).sort("displayOrder", 1).to_list(1000)
        
        return {"success": True, "categories": categories}
    except Exception as e:
        logger.error(f"Error fetching menu categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/menu-categories")
async def create_menu_category(category: MenuCategoryCreate):
    """Create a new menu category"""
    try:
        new_category = MenuCategory(**category.model_dump())
        
        category_dict = new_category.model_dump()
        category_dict['createdAt'] = category_dict['createdAt'].isoformat()
        category_dict['updatedAt'] = category_dict['updatedAt'].isoformat()
        
        await db.menu_categories.insert_one(category_dict)
        
        logger.info(f"Menu category created: {new_category.id}")
        return {"success": True, "category": new_category}
    except Exception as e:
        logger.error(f"Error creating menu category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/menu-categories/{category_id}")
async def update_menu_category(category_id: str, update_data: MenuCategoryUpdate):
    """Update a menu category"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.menu_categories.update_one(
            {"id": category_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        
        updated_category = await db.menu_categories.find_one({"id": category_id}, {"_id": 0})
        
        logger.info(f"Menu category updated: {category_id}")
        return {"success": True, "category": updated_category}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating menu category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/menu-categories/{category_id}")
async def delete_menu_category(category_id: str):
    """Delete a menu category"""
    try:
        result = await db.menu_categories.delete_one({"id": category_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        
        logger.info(f"Menu category deleted: {category_id}")
        return {"success": True, "message": "Category deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting menu category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")




# Menu Tag Endpoints
@api_router.get("/menu-tags/{property_id}")
async def get_menu_tags(property_id: str):
    """Get all menu tags for a property"""
    try:
        tags = await db.menu_tags.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "tags": tags}
    except Exception as e:
        logger.error(f"Error fetching menu tags: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/menu-tags")
async def create_menu_tag(tag: MenuTagCreate):
    """Create a new menu tag"""
    try:
        new_tag = MenuTag(**tag.model_dump())
        
        tag_dict = new_tag.model_dump()
        tag_dict['createdAt'] = tag_dict['createdAt'].isoformat()
        tag_dict['updatedAt'] = tag_dict['updatedAt'].isoformat()
        
        await db.menu_tags.insert_one(tag_dict)
        
        logger.info(f"Menu tag created: {new_tag.id}")
        return {"success": True, "tag": new_tag}
    except Exception as e:
        logger.error(f"Error creating menu tag: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/menu-tags/{tag_id}")
async def update_menu_tag(tag_id: str, update_data: MenuTagUpdate):
    """Update a menu tag"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.menu_tags.update_one(
            {"id": tag_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        updated_tag = await db.menu_tags.find_one({"id": tag_id}, {"_id": 0})
        
        logger.info(f"Menu tag updated: {tag_id}")
        return {"success": True, "tag": updated_tag}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating menu tag: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/menu-tags/{tag_id}")
async def delete_menu_tag(tag_id: str):
    """Delete a menu tag"""
    try:
        result = await db.menu_tags.delete_one({"id": tag_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        logger.info(f"Menu tag deleted: {tag_id}")
        return {"success": True, "message": "Tag deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting menu tag: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Dietary Restriction Endpoints
@api_router.get("/dietary-restrictions/{property_id}")
async def get_dietary_restrictions(property_id: str):
    """Get all dietary restrictions for a property"""
    try:
        restrictions = await db.dietary_restrictions.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "restrictions": restrictions}
    except Exception as e:
        logger.error(f"Error fetching dietary restrictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/dietary-restrictions")
async def create_dietary_restriction(restriction: DietaryRestrictionCreate):
    """Create a new dietary restriction"""
    try:
        new_restriction = DietaryRestriction(**restriction.model_dump())
        
        restriction_dict = new_restriction.model_dump()
        restriction_dict['createdAt'] = restriction_dict['createdAt'].isoformat()
        restriction_dict['updatedAt'] = restriction_dict['updatedAt'].isoformat()
        
        await db.dietary_restrictions.insert_one(restriction_dict)
        
        logger.info(f"Dietary restriction created: {new_restriction.id}")
        return {"success": True, "restriction": new_restriction}
    except Exception as e:
        logger.error(f"Error creating dietary restriction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/dietary-restrictions/{restriction_id}")
async def update_dietary_restriction(restriction_id: str, update_data: DietaryRestrictionUpdate):
    """Update a dietary restriction"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.dietary_restrictions.update_one(
            {"id": restriction_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Restriction not found")
        
        updated_restriction = await db.dietary_restrictions.find_one({"id": restriction_id}, {"_id": 0})
        
        logger.info(f"Dietary restriction updated: {restriction_id}")
        return {"success": True, "restriction": updated_restriction}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating dietary restriction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/dietary-restrictions/{restriction_id}")
async def delete_dietary_restriction(restriction_id: str):
    """Delete a dietary restriction"""
    try:
        result = await db.dietary_restrictions.delete_one({"id": restriction_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Restriction not found")
        
        logger.info(f"Dietary restriction deleted: {restriction_id}")
        return {"success": True, "message": "Dietary restriction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dietary restriction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Menu Item Endpoints
@api_router.get("/menu-items/{property_id}")
async def get_menu_items(property_id: str):
    """Get all menu items for a property"""
    try:
        items = await db.menu_items.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "items": items}
    except Exception as e:
        logger.error(f"Error fetching menu items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/menu-items")
async def create_menu_item(item: MenuItemCreate):
    """Create a new menu item"""
    try:
        new_item = MenuItem(**item.model_dump())
        
        item_dict = new_item.model_dump()
        item_dict['createdAt'] = item_dict['createdAt'].isoformat()
        item_dict['updatedAt'] = item_dict['updatedAt'].isoformat()
        
        await db.menu_items.insert_one(item_dict)
        
        logger.info(f"Menu item created: {new_item.id}")
        return {"success": True, "item": new_item}
    except Exception as e:
        logger.error(f"Error creating menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/menu-items/{item_id}")
async def update_menu_item(item_id: str, update_data: MenuItemUpdate):
    """Update a menu item"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.menu_items.update_one(
            {"id": item_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        updated_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
        
        logger.info(f"Menu item updated: {item_id}")
        return {"success": True, "item": updated_item}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str):
    """Delete a menu item"""
    try:
        result = await db.menu_items.delete_one({"id": item_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        logger.info(f"Menu item deleted: {item_id}")
        return {"success": True, "message": "Menu item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Menu Endpoints (Collection of items)
@api_router.get("/menus/{property_id}")
async def get_menus(property_id: str):
    """Get all menus for a property"""
    try:
        menus = await db.menus.find(
            {"propertyId": property_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {"success": True, "menus": menus}
    except Exception as e:
        logger.error(f"Error fetching menus: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/menus/by-id/{menu_id}")
async def get_menu_by_id(menu_id: str):
    """Get a specific menu by its ID"""
    try:
        menu = await db.menus.find_one(
            {"id": menu_id},
            {"_id": 0}
        )
        
        if not menu:
            raise HTTPException(status_code=404, detail="Menu not found")
        
        return {"success": True, "menu": menu}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching menu: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/menus")
async def create_menu(menu: MenuCreate):
    """Create a new menu"""
    try:
        new_menu = Menu(**menu.model_dump())
        
        menu_dict = new_menu.model_dump()
        menu_dict['createdAt'] = menu_dict['createdAt'].isoformat()
        menu_dict['updatedAt'] = menu_dict['updatedAt'].isoformat()
        
        await db.menus.insert_one(menu_dict)
        
        logger.info(f"Menu created: {new_menu.id}")
        return {"success": True, "menu": new_menu}
    except Exception as e:
        logger.error(f"Error creating menu: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.put("/menus/{menu_id}")
async def update_menu(menu_id: str, update_data: MenuUpdate):
    """Update a menu"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.menus.update_one(
            {"id": menu_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Menu not found")
        
        updated_menu = await db.menus.find_one({"id": menu_id}, {"_id": 0})
        
        logger.info(f"Menu updated: {menu_id}")
        return {"success": True, "menu": updated_menu}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating menu: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/menus/{menu_id}")
async def delete_menu(menu_id: str):
    """Delete a menu"""
    try:
        result = await db.menus.delete_one({"id": menu_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Menu not found")
        
        logger.info(f"Menu deleted: {menu_id}")
        return {"success": True, "message": "Menu deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting menu: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Configuration Endpoints
@api_router.get("/configuration/{property_id}")
async def get_configuration(property_id: str):
    """Get configuration for a property"""
    try:
        config = await db.configurations.find_one(
            {"propertyId": property_id},
            {"_id": 0}
        )
        
        if not config:
            # Return default configuration if none exists
            return {
                "success": True,
                "configuration": {
                    "propertyId": property_id,
                    "checkInTime": "14:00",
                    "checkOutTime": "11:00"
                }
            }
        
        return {"success": True, "configuration": config}
    except Exception as e:
        logger.error(f"Error fetching configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/configuration")
async def create_or_update_configuration(config: ConfigurationCreate):
    """Create or update configuration for a property"""
    try:
        # Check if configuration exists
        existing = await db.configurations.find_one({"propertyId": config.propertyId})
        
        if existing:
            # Update existing
            update_dict = config.model_dump()
            del update_dict['propertyId']
            update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
            
            await db.configurations.update_one(
                {"propertyId": config.propertyId},
                {"$set": update_dict}
            )
            
            updated_config = await db.configurations.find_one({"propertyId": config.propertyId}, {"_id": 0})
            logger.info(f"Configuration updated for property: {config.propertyId}")
            return {"success": True, "configuration": updated_config}
        else:
            # Create new
            new_config = Configuration(**config.model_dump())
            config_dict = new_config.model_dump()
            config_dict['createdAt'] = config_dict['createdAt'].isoformat()
            config_dict['updatedAt'] = config_dict['updatedAt'].isoformat()
            
            await db.configurations.insert_one(config_dict)
            logger.info(f"Configuration created for property: {config.propertyId}")
            return {"success": True, "configuration": new_config}
    except Exception as e:
        logger.error(f"Error saving configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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
                category=guest_data.get('category'),
                description=guest_data.get('description'),
                checkInDate=guest_data.get('checkInDate'),
                checkOutDate=guest_data.get('checkOutDate')
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
        
        # Check guest eligibility based on check-in/check-out times
        if guest.get('checkInDate') and guest.get('checkOutDate'):
            # Fetch property configuration for check-in/check-out times
            configuration = await db.configurations.find_one(
                {"propertyId": allocation.propertyId},
                {"_id": 0}
            )
            
            if configuration:
                now = datetime.now(timezone.utc)
                current_date = now.strftime('%Y-%m-%d')  # YYYY-MM-DD
                current_time = now.strftime('%H:%M')  # HH:MM
                
                check_in_date = guest['checkInDate']
                check_out_date = guest['checkOutDate']
                check_in_time = configuration.get('checkInTime', '14:00')
                check_out_time = configuration.get('checkOutTime', '11:00')
                
                # Check if current date is before check-in date
                if current_date < check_in_date:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Guest is not eligible. Check-in is on {check_in_date}"
                    )
                
                # Check if current date is the check-in date but before check-in time
                if current_date == check_in_date and current_time < check_in_time:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Guest is not eligible. Check-in time is {check_in_time}"
                    )
                
                # Check if current date is after check-out date
                if current_date > check_out_date:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Guest is not eligible. Already checked out on {check_out_date}"
                    )
                
                # Check if current date is the check-out date and past check-out time
                if current_date == check_out_date and current_time >= check_out_time:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Guest is not eligible. Check-out time was {check_out_time}"
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
        
        # Determine which groups the allocated seats belong to
        seat_groups = set()
        for seat_id in allocation.seatIds:
            seat = await db.seats.find_one({"id": seat_id}, {"_id": 0})
            if seat and seat.get('groupId'):
                seat_groups.add(seat.get('groupId'))
        
        # Find Pool And Beach Attendants and Food and Beverages Servers for these groups
        # Get role IDs for the roles we need
        pool_beach_attendant_role = await db.roles.find_one({"name": "Pool And Beach Attendant"}, {"_id": 0})
        fb_server_role = await db.roles.find_one({"name": "Food and Beverages Server"}, {"_id": 0})
        
        pool_beach_attendant_ids = []
        fb_server_ids = []
        
        # Note: We're checking all staff with these roles
        # In a real system, you might want to track which staff are currently "on duty" for each group
        if pool_beach_attendant_role:
            attendants = await db.staff.find(
                {
                    "propertyId": allocation.propertyId,
                    "roleId": pool_beach_attendant_role['id']
                },
                {"_id": 0}
            ).to_list(1000)
            pool_beach_attendant_ids = [s['id'] for s in attendants]
        
        if fb_server_role:
            servers = await db.staff.find(
                {
                    "propertyId": allocation.propertyId,
                    "roleId": fb_server_role['id']
                },
                {"_id": 0}
            ).to_list(1000)
            fb_server_ids = [s['id'] for s in servers]
        
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
            poolBeachAttendantIds=pool_beach_attendant_ids,
            fbServerIds=fb_server_ids,
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
        
        old_status = allocation.get('status', 'Allocated')
        
        # Create event for status change
        status_event = {
            "eventType": "Status Change",
            "oldValue": old_status,
            "newValue": status_update.status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "description": f"Status changed from {old_status} to {status_update.status}"
        }
        
        # Update allocation status and add event
        result = await db.allocations.update_one(
            {"id": allocation_id},
            {
                "$set": {
                    "status": status_update.status,
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                },
                "$push": {"events": status_event}
            }
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
        
        old_flag = allocation.get('callingFlag', 'Non Calling')
        
        # Create event for calling flag change
        event_type = "Calling On" if flag_update.callingFlag != "Non Calling" else "Calling Off"
        calling_event = {
            "eventType": event_type,
            "oldValue": old_flag,
            "newValue": flag_update.callingFlag,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "description": f"Calling flag changed from {old_flag} to {flag_update.callingFlag}"
        }
        
        # Update allocation calling flag and add event
        result = await db.allocations.update_one(
            {"id": allocation_id},
            {
                "$set": {
                    "callingFlag": flag_update.callingFlag,
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                },
                "$push": {"events": calling_event}
            }
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


# Staff Login Endpoint
@api_router.post("/staff/login", response_model=StaffLoginResponse)
async def staff_login(request: StaffLoginRequest):
    """
    Staff login with username and PIN
    """
    try:
        # Find staff member by username and propertyId
        staff = await db.staff.find_one(
            {
                "username": request.username,
                "propertyId": request.propertyId
            },
            {"_id": 0}
        )
        
        if not staff:
            raise HTTPException(status_code=401, detail="Invalid username or PIN")
        
        # Verify PIN
        if staff.get('pin') != request.pin:
            raise HTTPException(status_code=401, detail="Invalid username or PIN")
        
        # Remove sensitive data before sending response
        staff_data = {
            "id": staff['id'],
            "name": staff['name'],
            "username": staff['username'],
            "email": staff['email'],
            "phone": staff.get('phone'),
            "roleId": staff['roleId'],
            "propertyId": staff['propertyId']
        }
        
        logger.info(f"Staff login successful: {staff['username']} ({staff['name']})")
        
        return StaffLoginResponse(
            success=True,
            message="Login successful",
            staff=staff_data,
            propertyId=staff['propertyId']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during staff login: {str(e)}")
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

# ============= ADMIN UTILITIES =============

@api_router.post("/admin/clear-all-data")
async def clear_all_data():
    """Clear all data from the database - USE WITH CAUTION"""
    try:
        collections = [
            'organisations',
            'properties',
            'seats',
            'groups',
            'seat_types',
            'staff',
            'roles',
            'allocations',
            'devices',
            'menu_categories',
            'menu_tags',
            'dietary_restrictions',
            'menu_items',
            'menus',
            'guests',
            'configurations',
            'countries',
            'states',
            'cities',
            'admin_otps',
            'admin_sessions'
        ]
        
        deleted_counts = {}
        for collection in collections:
            result = await db[collection].delete_many({})
            deleted_counts[collection] = result.deleted_count
        
        logger.warning("All data cleared from database by admin")
        return {
            "success": True,
            "message": "All data has been cleared successfully",
            "deleted": deleted_counts
        }
    except Exception as e:
        logger.error(f"Error clearing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/admin/users")
async def get_all_users():
    """Get all users (Organisation Admins, Property Admins, and Staff) for admin dashboard"""
    try:
        users_list = []
        
        # Get Organisation and Property Admins from admin_otps
        admin_otps = await db.admin_otps.find({}, {"_id": 0}).to_list(10000)
        
        # Group by email to get unique admins (avoid duplicates from multiple OTPs)
        admins_by_email = {}
        for otp in admin_otps:
            email = otp.get('email')
            if email and email not in admins_by_email:
                entity_type = otp.get('entityType', 'unknown')
                entity_id = otp.get('entityId', '')
                
                # Get organisation or property name
                entity_name = ''
                if entity_type == 'organisation' and entity_id:
                    org = await db.organisations.find_one({"id": entity_id}, {"_id": 0, "name": 1})
                    entity_name = org.get('name', '') if org else ''
                elif entity_type == 'property' and entity_id:
                    prop = await db.properties.find_one({"id": entity_id}, {"_id": 0, "name": 1})
                    entity_name = prop.get('name', '') if prop else ''
                
                admins_by_email[email] = {
                    'email': email,
                    'name': otp.get('name', ''),
                    'userType': 'Organisation Admin' if entity_type == 'organisation' else 'Property Admin',
                    'entityType': entity_type,
                    'entityId': entity_id,
                    'entityName': entity_name,
                    'createdAt': otp.get('createdAt', '')
                }
        
        users_list.extend(admins_by_email.values())
        
        # Get all Staff
        staff_members = await db.staff.find({}, {"_id": 0}).to_list(10000)
        for staff in staff_members:
            property_id = staff.get('propertyId', '')
            property_name = ''
            if property_id:
                prop = await db.properties.find_one({"id": property_id}, {"_id": 0, "name": 1})
                property_name = prop.get('name', '') if prop else ''
            
            users_list.append({
                'email': staff.get('email', ''),
                'name': staff.get('name', ''),
                'userType': 'Staff',
                'entityType': 'property',
                'entityId': property_id,
                'entityName': property_name,
                'username': staff.get('username', ''),
                'createdAt': staff.get('createdAt', '')
            })
        
        logger.info(f"Fetched {len(users_list)} users")
        return {"success": True, "users": users_list}
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
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