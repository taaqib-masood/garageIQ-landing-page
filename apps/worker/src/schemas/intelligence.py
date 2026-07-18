from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class ServiceExtraction(BaseModel):
    service_name: str = Field(..., description="Canonical service name (e.g., 'AC Repair')")
    confidence: float = Field(..., ge=0.0, le=1.0)

class BrandSpecialization(BaseModel):
    brand_name: str = Field(..., description="Car brand name (e.g., 'BMW')")
    confidence: float = Field(..., ge=0.0, le=1.0)

class GarageTag(BaseModel):
    tag_type: Literal['best_for', 'avoid_for', 'vibe'] = Field(...)
    tag_value: str = Field(..., description="The content of the tag (e.g., 'Honest pricing')")
    confidence: float = Field(..., ge=0.0, le=1.0)

class ScoreCard(BaseModel):
    trust_score: float = Field(..., ge=0.0, le=1.0)
    speed_score: float = Field(..., ge=0.0, le=1.0)
    price_score: float = Field(..., ge=0.0, le=1.0)
    luxury_score: float = Field(..., ge=0.0, le=1.0)
    budget_score: float = Field(..., ge=0.0, le=1.0)
    review_confidence_score: float = Field(..., ge=0.0, le=1.0)

class GarageIntelligence(BaseModel):
    summary: str = Field(..., description="1-2 sentence AI summary of the garage")
    price_band: Literal['budget', 'mid_range', 'premium', 'unknown']
    services: List[ServiceExtraction]
    brands: List[BrandSpecialization]
    tags: List[GarageTag]
    scores: ScoreCard
