import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery(
    'garageiq_worker',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['src.tasks.ingestion', 'src.tasks.enrichment']
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Dubai',
    enable_utc=True,
    # Configure beat schedule
    beat_schedule={
        'weekly-google-places-sync': {
            'task': 'sync_google_reviews',
            'schedule': 604800.0, # Every 7 days
        },
    }
)

if __name__ == '__main__':
    celery_app.start()
