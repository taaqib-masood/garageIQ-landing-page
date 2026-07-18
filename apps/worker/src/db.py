import os
from sqlalchemy import create_engine, Column, String, Decimal, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# SQLAlchemy engine
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Garage(Base):
    __tablename__ = "garages"

    id = Column(String, primary_key=True)
    external_source_id = Column(String)
    source_provider = Column(String)
    name = Column(String)
    slug = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    
    reviews = relationship("GarageReview", back_populates="garage")
    scores = relationship("GarageScore", back_populates="garage", uselist=False)
    tags = relationship("GarageTag", back_populates="garage")
    services = relationship("GarageService", back_populates="garage")
    brand_specializations = relationship("GarageBrandSpecialization", back_populates="garage")


class GarageReview(Base):
    __tablename__ = "garage_reviews"

    id = Column(String, primary_key=True, server_default=func.uuid_generate_v4())
    garage_id = Column(String, ForeignKey("garages.id"))
    source_provider = Column(String)
    source_review_id = Column(String)
    author_name = Column(String)
    rating = Column(Decimal(2, 1))
    review_text = Column(String)
    review_date = Column(DateTime(timezone=True))
    raw_payload = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    garage = relationship("Garage", back_populates="reviews")


class GarageScore(Base):
    __tablename__ = "garage_scores"

    id = Column(String, primary_key=True, server_default=func.uuid_generate_v4())
    garage_id = Column(String, ForeignKey("garages.id"), unique=True)
    trust_score = Column(Decimal(4, 2))
    speed_score = Column(Decimal(4, 2))
    price_score = Column(Decimal(4, 2))
    luxury_score = Column(Decimal(4, 2))
    budget_score = Column(Decimal(4, 2))
    review_confidence_score = Column(Decimal(4, 2))
    overall_score = Column(Decimal(4, 2))
    profile_completeness = Column(String)
    last_calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    garage = relationship("Garage", back_populates="scores")


class GarageTag(Base):
    __tablename__ = "garage_tags"

    id = Column(String, primary_key=True, server_default=func.uuid_generate_v4())
    garage_id = Column(String, ForeignKey("garages.id"))
    tag_type = Column(String)
    tag_value = Column(String)
    confidence_score = Column(Decimal(4, 3))
    source_type = Column(String)
    model_version = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    garage = relationship("Garage", back_populates="tags")


class GarageService(Base):
    __tablename__ = "garage_services"

    id = Column(String, primary_key=True, server_default=func.uuid_generate_v4())
    garage_id = Column(String, ForeignKey("garages.id"))
    service_category = Column(String)
    is_verified = Column(Boolean, default=False)
    price_band = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    garage = relationship("Garage", back_populates="services")


class GarageBrandSpecialization(Base):
    __tablename__ = "garage_brand_specializations"

    id = Column(String, primary_key=True, server_default=func.uuid_generate_v4())
    garage_id = Column(String, ForeignKey("garages.id"))
    brand_name = Column(String)
    confidence_score = Column(Decimal(4, 3))
    source_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    garage = relationship("Garage", back_populates="brand_specializations")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
