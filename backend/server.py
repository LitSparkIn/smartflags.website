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

# Helper Functions
def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

async def send_otp_email(name: str, email: str, otp: str, login_url: str) -> bool:
    """Send OTP email to the user"""
    try:
        smtp_server = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('SMTP_FROM_EMAIL')
        from_name = os.environ.get('SMTP_FROM_NAME', 'SmartFlags Admin')
        
        # Create message
        message = MIMEMultipart('alternative')
        message['Subject'] = 'Your SmartFlags Admin Login OTP'
        message['From'] = f"{from_name} <{from_email}>"
        message['To'] = email
        
        # Email body - plain text
        text = f"""
Hello {name},

Welcome to SmartFlags! An admin account has been created for you.

Your one-time password (OTP) is: {otp}

This OTP will expire in 15 minutes.

Use this OTP to log in at: {login_url}

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
        <p>An admin account has been created for you. You can now access the SmartFlags admin panel.</p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #115e59;">Your one-time password (OTP):</p>
          <p style="font-size: 36px; font-weight: bold; color: #14b8a6; margin: 15px 0 10px 0; letter-spacing: 8px; text-align: center;">{otp}</p>
          <p style="margin: 0; font-size: 13px; color: #ef4444; text-align: center;">⏰ Expires in 15 minutes</p>
        </div>
        
        <p>Click the link below to log in:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="{login_url}" style="background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Login to SmartFlags</a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          If you didn't request this account, please ignore this email.
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
        logger.error(f"Failed to send email to {email}: {str(e)}")
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