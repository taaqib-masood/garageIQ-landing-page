import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GaragesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const garage = await this.prisma.garage.findUnique({
      where: { id },
      include: {
        location: true,
        scores: true,
        tags: {
          orderBy: { confidence_score: 'desc' },
        },
        services: true,
        brand_specializations: {
          orderBy: { confidence_score: 'desc' },
        },
        garage_reviews: {
          orderBy: { review_date: 'desc' },
          take: 10,
          select: {
            author_name: true,
            rating: true,
            review_text: true,
            review_date: true,
            source_provider: true,
          },
        },
      },
    });

    if (!garage) {
      throw new NotFoundException(`Garage with id "${id}" not found`);
    }

    const [reviewCount, ratingAgg] = await Promise.all([
      this.prisma.garageReview.count({ where: { garage_id: id } }),
      this.prisma.garageReview.aggregate({
        where: { garage_id: id },
        _avg: { rating: true },
      }),
    ]);

    const coldStart = reviewCount < 5;

    return {
      id: garage.id,
      name: garage.name,
      slug: garage.slug,
      phone: garage.phone,
      whatsapp: garage.whatsapp,
      website_url: garage.website_url,
      primary_category: garage.primary_category,
      is_verified: garage.is_verified,
      cold_start: coldStart,
      review_count: reviewCount,
      rating: ratingAgg._avg.rating
        ? Number(ratingAgg._avg.rating).toFixed(1)
        : null,
      location: garage.location
        ? {
            area: garage.location.area,
            city: garage.location.city,
            emirate: garage.location.emirate,
            address_line: garage.location.address_line,
            latitude: Number(garage.location.latitude),
            longitude: Number(garage.location.longitude),
          }
        : null,
      scores: garage.scores && !coldStart
        ? {
            trust: Number(garage.scores.trust_score),
            speed: Number(garage.scores.speed_score),
            price: Number(garage.scores.price_score),
            overall: Number(garage.scores.overall_score),
            review_confidence: Number(garage.scores.review_confidence_score),
            profile_completeness: garage.scores.profile_completeness,
          }
        : null,
      tags: coldStart
        ? []
        : garage.tags.map(t => ({
            type: t.tag_type,
            value: t.tag_value,
            confidence: t.confidence_score ? Number(t.confidence_score) : null,
          })),
      services: garage.services.map(s => ({
        category: s.service_category,
        price_band: s.price_band,
      })),
      brands: garage.brand_specializations.map(b => ({
        name: b.brand_name,
        confidence: b.confidence_score ? Number(b.confidence_score) : null,
      })),
      reviews: garage.garage_reviews.map(r => ({
        author: r.author_name,
        rating: Number(r.rating),
        text: r.review_text,
        date: r.review_date,
        source: r.source_provider,
      })),
    };
  }

  async findBySlug(slug: string) {
    const garage = await this.prisma.garage.findUnique({ where: { slug } });
    if (!garage) {
      throw new NotFoundException(`Garage with slug "${slug}" not found`);
    }
    return this.findById(garage.id);
  }
}
