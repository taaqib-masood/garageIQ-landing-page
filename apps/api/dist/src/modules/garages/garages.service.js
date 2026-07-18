"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaragesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GaragesService = class GaragesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
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
            throw new common_1.NotFoundException(`Garage with id "${id}" not found`);
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
    async findBySlug(slug) {
        const garage = await this.prisma.garage.findUnique({ where: { slug } });
        if (!garage) {
            throw new common_1.NotFoundException(`Garage with slug "${slug}" not found`);
        }
        return this.findById(garage.id);
    }
};
exports.GaragesService = GaragesService;
exports.GaragesService = GaragesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GaragesService);
//# sourceMappingURL=garages.service.js.map