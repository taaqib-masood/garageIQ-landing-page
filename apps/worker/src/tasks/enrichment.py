import json
import logging
import os
from src.celery_app import celery_app
from src.schemas.intelligence import GarageIntelligence
from src.db import SessionLocal, Garage, GarageReview, GarageScore, GarageTag, GarageService, GarageBrandSpecialization
from groq import Groq

logger = logging.getLogger(__name__)

@celery_app.task(name='enrich_garage_profile', bind=True, max_retries=3)
def enrich_garage_profile(self, garage_id: str):
    """
    Fetches raw reviews for the garage, sends them to Groq API (Llama 3),
    validates the output using Pydantic (GarageIntelligence), and writes 
    the aggregated scores/tags back to PostgreSQL.
    """
    logger.info(f"Starting enrichment for garage: {garage_id}")
    
    db = SessionLocal()
    try:
        # 1. Fetch raw reviews from DB
        garage = db.query(Garage).filter(Garage.id == garage_id).first()
        if not garage:
            logger.error(f"Garage not found: {garage_id}")
            return {"status": "error", "message": "Garage not found"}

        reviews = db.query(GarageReview).filter(GarageReview.garage_id == garage_id).all()
        if not reviews:
            logger.warning(f"No reviews found for garage: {garage_id}")
            return {"status": "skipped", "message": "No reviews to analyze"}

        review_blob = "\n---\n".join([f"Rating: {r.rating}\nText: {r.review_text}" for r in reviews])

        # 2. Call Groq API with Llama 3 70B
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        system_prompt = """
        You are an automotive intelligence agent. Analyze the provided customer reviews for a car garage in the UAE.
        Extract structured intelligence including trust, speed, price, luxury, and budget scores (0.0 to 1.0).
        Identify specific services mentioned, brands they specialize in, and create qualitative 'vibe' and 'best_for' tags.
        Return ONLY a JSON object matching the requested schema.
        """
        
        user_prompt = f"Garage Name: {garage.name}\n\nReviews:\n{review_blob}\n\nAnalyze and return JSON."

        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )

        # 3. Parse and validate
        intel_data = GarageIntelligence.model_validate_json(completion.choices[0].message.content)

        # 4. Upsert GarageScore
        score = db.query(GarageScore).filter(GarageScore.garage_id == garage_id).first()
        if not score:
            score = GarageScore(garage_id=garage_id)
            db.add(score)
        
        score.trust_score = intel_data.scores.trust_score
        score.speed_score = intel_data.scores.speed_score
        score.price_score = intel_data.scores.price_score
        score.luxury_score = intel_data.scores.luxury_score
        score.budget_score = intel_data.scores.budget_score
        score.review_confidence_score = intel_data.scores.review_confidence_score
        score.overall_score = (float(score.trust_score) * 0.4) + (float(score.speed_score) * 0.3) + (float(score.price_score) * 0.3)
        score.profile_completeness = "enriched"
        
        # 5. Clear and update tags
        db.query(GarageTag).filter(GarageTag.garage_id == garage_id).delete()
        for tag in intel_data.tags:
            db.add(GarageTag(
                garage_id=garage_id,
                tag_type=tag.tag_type,
                tag_value=tag.tag_value,
                confidence_score=tag.confidence,
                source_type="ai_enrichment",
                model_version="llama3-70b"
            ))

        # 6. Update Services
        for svc in intel_data.services:
            existing_svc = db.query(GarageService).filter(
                GarageService.garage_id == garage_id,
                GarageService.service_category == svc.service_name
            ).first()
            if not existing_svc:
                db.add(GarageService(
                    garage_id=garage_id, 
                    service_category=svc.service_name, 
                    is_verified=False,
                    price_band=intel_data.price_band if intel_data.price_band != 'unknown' else None
                ))

        # 7. Update Brand Specializations
        for brand in intel_data.brands:
            existing_brand = db.query(GarageBrandSpecialization).filter(
                GarageBrandSpecialization.garage_id == garage_id,
                GarageBrandSpecialization.brand_name == brand.brand_name
            ).first()
            if not existing_brand:
                db.add(GarageBrandSpecialization(
                    garage_id=garage_id,
                    brand_name=brand.brand_name,
                    confidence_score=brand.confidence,
                    source_type="ai_enrichment"
                ))

        db.commit()
        logger.info(f"Successfully enriched garage: {garage_id}")
        return {"status": "success", "garage_id": garage_id}
        
    except Exception as exc:
        db.rollback()
        logger.error(f"Enrichment failed for {garage_id}: {exc}")
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
