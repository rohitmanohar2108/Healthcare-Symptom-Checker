from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
class SymptomCheckCreate(BaseModel):
    symptoms_text: str

class Condition(BaseModel):
    name: str
    probability: str
    description: str

class Recommendation(BaseModel):
    action: str
    priority: str
    details: str

class SymptomCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symptoms_text: str
    analysis_result: str
    conditions: List[dict]
    recommendations: List[dict]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrendData(BaseModel):
    symptom_category: str
    count: int

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Healthcare Symptom Checker API"}

@api_router.post("/symptoms/analyze", response_model=SymptomCheck)
async def analyze_symptoms(input: SymptomCheckCreate):
    try:
        # Get Gemini API key from environment
        gemini_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=gemini_key,
            session_id=str(uuid.uuid4()),
            system_message="You are a medical AI assistant. Analyze symptoms and provide probable conditions and recommendations. Always include educational disclaimers that this is for informational purposes only and not a substitute for professional medical advice."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Create prompt for symptom analysis
        prompt = f"""Based on these symptoms: {input.symptoms_text}

Provide a detailed analysis in the following JSON format:
{{
  "conditions": [
    {{
      "name": "Condition name",
      "probability": "High/Medium/Low",
      "description": "Brief description of the condition"
    }}
  ],
  "recommendations": [
    {{
      "action": "Recommendation title",
      "priority": "High/Medium/Low",
      "details": "Detailed recommendation"
    }}
  ],
  "summary": "Overall summary with educational disclaimer"
}}

Provide 3-5 possible conditions and 3-5 recommendations. Include a clear disclaimer that this is educational only."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response - try to extract JSON from markdown code blocks
        analysis_text = response
        import json
        import re
        
        # Try to find JSON in code blocks
        json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', analysis_text, re.DOTALL)
        if json_match:
            analysis_data = json.loads(json_match.group(1))
        else:
            # Try to parse the entire response as JSON
            try:
                analysis_data = json.loads(analysis_text)
            except:
                # Fallback if JSON parsing fails
                analysis_data = {
                    "conditions": [{"name": "Analysis Available", "probability": "See full text", "description": "Review detailed analysis"}],
                    "recommendations": [{"action": "Consult Healthcare Provider", "priority": "High", "details": "Professional medical advice recommended"}],
                    "summary": analysis_text
                }
        
        # Create symptom check object
        symptom_check = SymptomCheck(
            symptoms_text=input.symptoms_text,
            analysis_result=analysis_data.get('summary', analysis_text),
            conditions=analysis_data.get('conditions', []),
            recommendations=analysis_data.get('recommendations', [])
        )
        
        # Store in database
        doc = symptom_check.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.symptom_checks.insert_one(doc)
        
        return symptom_check
    except Exception as e:
        logging.error(f"Error analyzing symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing symptoms: {str(e)}")

@api_router.get("/symptoms/history", response_model=List[SymptomCheck])
async def get_symptom_history():
    try:
        # Get all symptom checks, sorted by most recent
        checks = await db.symptom_checks.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
        
        # Convert ISO string timestamps back to datetime objects
        for check in checks:
            if isinstance(check['timestamp'], str):
                check['timestamp'] = datetime.fromisoformat(check['timestamp'])
        
        return checks
    except Exception as e:
        logging.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@api_router.get("/symptoms/trends")
async def get_symptom_trends():
    try:
        # Aggregate symptom data for trends
        pipeline = [
            {
                "$project": {
                    "timestamp": 1,
                    "conditions": 1,
                    "date": {
                        "$dateFromString": {
                            "dateString": "$timestamp",
                            "onError": "$timestamp"
                        }
                    }
                }
            },
            {
                "$unwind": "$conditions"
            },
            {
                "$group": {
                    "_id": "$conditions.name",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            },
            {
                "$limit": 10
            }
        ]
        
        trends = await db.symptom_checks.aggregate(pipeline).to_list(100)
        
        # Format the results
        trend_data = [
            {"symptom_category": trend["_id"], "count": trend["count"]}
            for trend in trends
        ]
        
        # Also get total checks and recent activity
        total_checks = await db.symptom_checks.count_documents({})
        
        return {
            "total_checks": total_checks,
            "top_conditions": trend_data
        }
    except Exception as e:
        logging.error(f"Error fetching trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")

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