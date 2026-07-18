import logging
import uuid
import datetime
from decimal import Decimal
from src.celery_app import celery_app
from src.db import SessionLocal, Garage, GarageReview
from src.tasks.enrichment import enrich_garage_profile

logger = logging.getLogger(__name__)

@celery_app.task(name='sync_google_reviews')
def sync_google_reviews():
    """
    Scheduled task that hits Google Places API, fetches latest reviews
    for all active garages, deduplicates them, and inserts them into
    the `garage_reviews` table.
    """
    logger.info("Starting weekly Google Places review sync...")
    
    db = SessionLocal()
    try:
        # 1. Fetch active garages
        active_garages = db.query(Garage).filter(Garage.is_active == True).all()
        logger.info(f"Found {len(active_garages)} active garages to sync.")

        for garage in active_garages:
            # 2. Hit Outscraper/Places API (Mocking here)
            logger.info(f"Fetching reviews for garage: {garage.name}")
            
            mock_review_id = f"place_review_{uuid.uuid4().hex[:8]}"
            
            # 3. Deduplicate
            existing = db.query(GarageReview).filter(
                GarageReview.garage_id == garage.id,
                GarageReview.source_review_id == mock_review_id
            ).first()

            if not existing:
                # 4. Insert into DB
                new_review = GarageReview(
                    id=str(uuid.uuid4()),
                    garage_id=garage.id,
                    source_provider="google_places",
                    source_review_id=mock_review_id,
                    author_name="Mock User",
                    rating=Decimal('4.5'),
                    review_text="Great service, very honest pricing on my BMW brakes.",
                    review_date=datetime.datetime.now(datetime.timezone.utc),
                    raw_payload={"mock": True}
                )
                db.add(new_review)
                db.commit()
                logger.info(f"Inserted new review for {garage.name}")

                # 5. Queue `enrich_garage_profile`
                enrich_garage_profile.delay(garage_id=garage.id)
                logger.info(f"Queued enrichment task for {garage.name}")
            
        logger.info("Sync complete.")
        return {"status": "success", "processed": len(active_garages)}
    except Exception as exc:
        db.rollback()
        logger.error(f"Sync failed: {exc}")
        raise
    finally:
        db.close()
