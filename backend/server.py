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
            "entityType": otp_doc['entityType'],
            "entityId": otp_doc['entityId'],
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
                "entityType": otp_doc['entityType'],
                "entityId": otp_doc['entityId']
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