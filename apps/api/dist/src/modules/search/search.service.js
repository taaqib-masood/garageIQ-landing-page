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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
const client_1 = require("@prisma/client");
let SearchService = SearchService_1 = class SearchService {
    prisma;
    model = null;
    logger = new common_1.Logger(SearchService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        if (process.env.GEMINI_API_KEY) {
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }
        else {
            this.logger.warn('GEMINI_API_KEY not set. Using keyword fallback for intent resolution.');
        }
    }
    async resolveQuery(query) {
        if (!this.model) {
            return this.mockResolveQuery(query);
        }
        const prompt = `You are an intent extractor for GarageIQ — a UAE garage discovery app.
Extract the following fields from the user query. Return ONLY a JSON object, no markdown.

Fields:
- service_type: string or null (e.g. "Tyres", "AC Repair", "Engine", "Oil Change", "Brakes", "Suspension", "Gearbox")
- vehicle_brand: string or null (e.g. "Honda", "BMW", "Mercedes-Benz", "Toyota", "Porsche")
- location_text: string or null (e.g. "Sharjah", "Al Quoz", "Deira", "Mussafah", "JLT", "Dubai")
- price_band: string or null ("budget", "mid_range", or "premium")

Query: "${query}"`;
        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 256,
                    responseMimeType: 'application/json',
                },
            });
            return JSON.parse(result.response.text());
        }
        catch (e) {
            this.logger.error(`Gemini intent resolution failed: ${e.message}`);
            return this.mockResolveQuery(query);
        }
    }
    mockResolveQuery(query) {
        const q = query.toLowerCase();
        return {
            service_type: q.includes('tyre') || q.includes('tire') ? 'Tyres'
                : q.includes('ac') || q.includes('air con') ? 'AC Repair'
                    : q.includes('oil') ? 'Oil Change'
                        : q.includes('brake') ? 'Brakes'
                            : q.includes('engine') ? 'Engine'
                                : q.includes('gearbox') ? 'Gearbox'
                                    : null,
            vehicle_brand: q.includes('honda') ? 'Honda'
                : q.includes('bmw') ? 'BMW'
                    : q.includes('mercedes') ? 'Mercedes-Benz'
                        : q.includes('toyota') ? 'Toyota'
                            : q.includes('porsche') ? 'Porsche'
                                : null,
            location_text: q.includes('sharjah') ? 'Sharjah'
                : q.includes('al quoz') ? 'Al Quoz'
                    : q.includes('deira') ? 'Deira'
                        : q.includes('mussafah') ? 'Mussafah'
                            : q.includes('jlt') ? 'JLT'
                                : q.includes('abu dhabi') ? 'Abu Dhabi'
                                    : null,
            price_band: q.includes('cheap') || q.includes('budget') ? 'budget'
                : q.includes('premium') || q.includes('luxury') ? 'premium'
                    : null,
        };
    }
    async searchGarages(dto) {
        const startTime = Date.now();
        const { query, location, filters, page, limit } = dto;
        const intent = query ? await this.resolveQuery(query) : { service_type: null, vehicle_brand: null, location_text: null, price_band: null };
        let geoCondition = client_1.Prisma.empty;
        let locationStrategy = 'none';
        let resolvedArea = null;
        if (filters?.radius_km && location?.lat && location?.lng) {
            locationStrategy = 'device_coords';
            const radiusMeters = filters.radius_km * 1000;
            geoCondition = client_1.Prisma.sql `
        AND ST_DWithin(
          gl.geo_point,
          ST_MakePoint(${location.lng}, ${location.lat})::geography,
          ${radiusMeters}
        )
      `;
        }
        else if (intent.location_text) {
            locationStrategy = 'text_match';
            resolvedArea = intent.location_text;
        }
        const locationTextCondition = intent.location_text && locationStrategy === 'text_match'
            ? client_1.Prisma.sql `AND (gl.area ILIKE ${'%' + intent.location_text + '%'} OR gl.emirate ILIKE ${'%' + intent.location_text + '%'} OR gl.city ILIKE ${'%' + intent.location_text + '%'})`
            : client_1.Prisma.empty;
        const serviceCondition = intent.service_type
            ? client_1.Prisma.sql `AND EXISTS (
          SELECT 1 FROM garage_services gs
          WHERE gs.garage_id = g.id
          AND gs.service_category ILIKE ${'%' + intent.service_type + '%'}
        )`
            : client_1.Prisma.empty;
        const brandCondition = intent.vehicle_brand
            ? client_1.Prisma.sql `AND EXISTS (
          SELECT 1 FROM garage_brand_specializations gbs
          WHERE gbs.garage_id = g.id
          AND gbs.brand_name ILIKE ${'%' + intent.vehicle_brand + '%'}
        )`
            : client_1.Prisma.empty;
        const candidates = await this.prisma.$queryRaw `
      SELECT
        g.id,
        g.name,
        g.slug,
        g.primary_category,
        g.phone,
        g.whatsapp,
        gl.emirate,
        gl.city,
        gl.area,
        gs.trust_score,
        gs.speed_score,
        gs.price_score,
        gs.review_confidence_score,
        gs.overall_score,
        gs.profile_completeness,
        (SELECT COUNT(*) FROM garage_reviews gr WHERE gr.garage_id = g.id) AS review_count,
        (SELECT AVG(rating) FROM garage_reviews gr WHERE gr.garage_id = g.id) AS avg_rating,
        (
          SELECT json_agg(json_build_object('type', gt.tag_type, 'value', gt.tag_value))
          FROM (
            SELECT tag_type, tag_value FROM garage_tags
            WHERE garage_id = g.id AND tag_type = 'best_for'
            ORDER BY confidence_score DESC LIMIT 3
          ) gt
        ) AS top_tags
      FROM garages g
      LEFT JOIN garage_locations gl ON gl.garage_id = g.id
      LEFT JOIN garage_scores gs ON gs.garage_id = g.id
      WHERE g.is_active = true
      ${geoCondition}
      ${locationTextCondition}
      ${serviceCondition}
      ${brandCondition}
      LIMIT 100
    `;
        const scoredResults = candidates.map(c => {
            const trust = c.trust_score ? Number(c.trust_score) : 0.5;
            const speed = c.speed_score ? Number(c.speed_score) : 0.5;
            const price = c.price_score ? Number(c.price_score) : 0.5;
            const confidence = c.review_confidence_score ? Number(c.review_confidence_score) : 0.3;
            const overall = c.overall_score ? Number(c.overall_score) : 0.5;
            let priceWeight = price;
            if (intent.price_band === 'budget')
                priceWeight = price * 1.3;
            if (intent.price_band === 'premium')
                priceWeight = (1 - price) * 1.3;
            const finalScore = (0.30 * overall) +
                (0.20 * trust) +
                (0.15 * confidence) +
                (0.10 * speed) +
                (0.10 * priceWeight);
            const areaStr = [c.area, c.emirate].filter(Boolean).join(', ') || 'UAE';
            return {
                id: c.id,
                name: c.name,
                slug: c.slug,
                area: areaStr,
                primary_category: c.primary_category,
                phone: c.phone,
                whatsapp: c.whatsapp,
                rating: c.avg_rating ? Number(c.avg_rating).toFixed(1) : null,
                review_count: Number(c.review_count || 0),
                relevance_score: Number(finalScore.toFixed(3)),
                profile_completeness: c.profile_completeness || 'partial',
                scores: { trust, speed, price },
                top_tags: c.top_tags || [],
            };
        });
        scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);
        const offset = ((page || 1) - 1) * (limit || 20);
        const paginated = scoredResults.slice(offset, offset + (limit || 20));
        const latencyMs = Date.now() - startTime;
        this.logger.log(`Search "${query}" → intent: ${JSON.stringify(intent)} → ${scoredResults.length} results in ${latencyMs}ms`);
        return {
            query_resolution: intent,
            location_resolution: {
                strategy: locationStrategy,
                resolved_area: resolvedArea,
                device_coords_used: locationStrategy === 'device_coords',
            },
            results: paginated,
            meta: {
                page: page || 1,
                limit: limit || 20,
                total: scoredResults.length,
                latency_ms: latencyMs,
            },
        };
    }
    async getAreas() {
        const areas = await this.prisma.garageLocation.findMany({
            select: { emirate: true, area: true },
            distinct: ['area', 'emirate'],
        });
        const emirates = [...new Set(areas.map(a => a.emirate).filter(Boolean))];
        const distinctAreas = [...new Set(areas.map(a => a.area).filter(Boolean))];
        return { emirates, areas: distinctAreas };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map