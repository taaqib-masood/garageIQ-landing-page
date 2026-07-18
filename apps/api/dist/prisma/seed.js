"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const garages = [
    {
        name: 'Al Quoz BMW Specialist', slug: 'al-quoz-bmw-specialist',
        source_provider: 'manual', primary_category: 'German Cars Specialist',
        phone: '+971501234001', whatsapp: '+971501234001',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Al Quoz', latitude: 25.1372, longitude: 55.2263 },
        scores: { trust_score: 0.92, speed_score: 0.70, price_score: 0.30, luxury_score: 0.90, budget_score: 0.10, review_confidence_score: 0.88, overall_score: 0.78, profile_completeness: 'full' },
        services: ['Engine Diagnostics', 'AC Repair', 'Major Service', 'Suspension'],
        brands: [{ name: 'BMW', confidence: 0.97 }, { name: 'Mercedes-Benz', confidence: 0.85 }, { name: 'Audi', confidence: 0.78 }],
        tags: [{ type: 'best_for', value: 'BMW AC Repair' }, { type: 'best_for', value: 'Engine Diagnostics' }, { type: 'vibe', value: 'Professional & spotless' }],
        reviews: [
            { text: 'Best BMW specialist in Dubai. Fixed my X5 AC issue others couldnt diagnose. Honest pricing.', rating: 5.0, author: 'Ahmed K.' },
            { text: 'Very professional team. Slightly expensive but worth it for the expertise.', rating: 4.5, author: 'Sarah M.' },
        ]
    },
    {
        name: 'Sharjah Budget Tyre Centre', slug: 'sharjah-budget-tyre-centre',
        source_provider: 'manual', primary_category: 'Tyres & Wheels',
        phone: '+971551234002', whatsapp: '+971551234002',
        location: { emirate: 'Sharjah', city: 'Sharjah', area: 'Industrial Area 3', latitude: 25.3226, longitude: 55.4031 },
        scores: { trust_score: 0.80, speed_score: 0.95, price_score: 0.95, luxury_score: 0.05, budget_score: 0.97, review_confidence_score: 0.82, overall_score: 0.72, profile_completeness: 'full' },
        services: ['Tyre Replacement', 'Wheel Balancing', 'Alignment', 'Puncture Repair'],
        brands: [{ name: 'Any Brand', confidence: 0.99 }],
        tags: [{ type: 'best_for', value: 'Cheap tyre change' }, { type: 'best_for', value: 'Fast service' }, { type: 'vibe', value: 'No fuss, get it done' }],
        reviews: [
            { text: 'Cheapest tyre prices in Sharjah. Done in 20 minutes. No complaints.', rating: 4.5, author: 'Omar R.' },
            { text: 'Quick and affordable. They dont try to upsell you.', rating: 4.0, author: 'Priya S.' },
        ]
    },
    {
        name: 'German Auto Care Mussafah', slug: 'german-auto-care-mussafah',
        source_provider: 'manual', primary_category: 'German Cars Specialist',
        phone: '+971521234003', whatsapp: '+971521234003',
        location: { emirate: 'Abu Dhabi', city: 'Abu Dhabi', area: 'Mussafah', latitude: 24.3613, longitude: 54.5028 },
        scores: { trust_score: 0.89, speed_score: 0.72, price_score: 0.45, luxury_score: 0.80, budget_score: 0.25, review_confidence_score: 0.85, overall_score: 0.75, profile_completeness: 'full' },
        services: ['Engine Repair', 'Gearbox Service', 'Electrical Diagnostics', 'AC Service'],
        brands: [{ name: 'BMW', confidence: 0.88 }, { name: 'Mercedes-Benz', confidence: 0.92 }, { name: 'Volkswagen', confidence: 0.78 }],
        tags: [{ type: 'best_for', value: 'Mercedes service' }, { type: 'best_for', value: 'Gearbox repair' }, { type: 'vibe', value: 'Reliable & experienced' }],
        reviews: [
            { text: 'Fixed my Mercedes gearbox issue perfectly. Very knowledgeable team.', rating: 5.0, author: 'Khalid A.' },
            { text: 'Good work but takes a bit longer than expected. Quality is top notch.', rating: 4.0, author: 'Nour H.' },
        ]
    },
    {
        name: 'JLT Engine & Diagnostics', slug: 'jlt-engine-diagnostics',
        source_provider: 'manual', primary_category: 'Engine Specialist',
        phone: '+971501234004', whatsapp: '+971501234004',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'JLT', latitude: 25.0657, longitude: 55.1407 },
        scores: { trust_score: 0.94, speed_score: 0.65, price_score: 0.20, luxury_score: 0.93, budget_score: 0.05, review_confidence_score: 0.91, overall_score: 0.80, profile_completeness: 'full' },
        services: ['Engine Rebuild', 'Performance Tuning', 'ECU Diagnostics', 'Turbo Repair'],
        brands: [{ name: 'Porsche', confidence: 0.90 }, { name: 'BMW', confidence: 0.87 }, { name: 'Ferrari', confidence: 0.75 }],
        tags: [{ type: 'best_for', value: 'Performance tuning' }, { type: 'best_for', value: 'ECU diagnostics' }, { type: 'avoid_for', value: 'Budget repairs' }],
        reviews: [
            { text: 'They tuned my 911 perfectly. Worth every dirham. These guys really know cars.', rating: 5.0, author: 'Faisal M.' },
            { text: 'Expensive but exceptional. Fixed an engine issue 3 other garages couldnt find.', rating: 5.0, author: 'David L.' },
        ]
    },
    {
        name: 'Deira Quick Lube & Service', slug: 'deira-quick-lube-service',
        source_provider: 'manual', primary_category: 'General Service',
        phone: '+971551234005', whatsapp: '+971551234005',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Deira', latitude: 25.2697, longitude: 55.3095 },
        scores: { trust_score: 0.75, speed_score: 0.98, price_score: 0.90, luxury_score: 0.05, budget_score: 0.92, review_confidence_score: 0.78, overall_score: 0.68, profile_completeness: 'full' },
        services: ['Oil Change', 'Filter Replacement', 'Battery Check', 'Tyre Rotation'],
        brands: [{ name: 'Toyota', confidence: 0.90 }, { name: 'Honda', confidence: 0.88 }, { name: 'Nissan', confidence: 0.85 }],
        tags: [{ type: 'best_for', value: 'Fast oil change' }, { type: 'best_for', value: 'Routine service' }, { type: 'vibe', value: 'In and out quickly' }],
        reviews: [
            { text: 'Oil change done in 15 minutes. Cheap and reliable. Come here every 3 months.', rating: 4.5, author: 'Ravi P.' },
            { text: 'Good for basic stuff. Dont go for complex repairs.', rating: 3.5, author: 'Ali T.' },
        ]
    },
    {
        name: 'Honda Specialist Al Nahda Sharjah', slug: 'honda-specialist-al-nahda-sharjah',
        source_provider: 'manual', primary_category: 'Japanese Cars Specialist',
        phone: '+971561234006', whatsapp: '+971561234006',
        location: { emirate: 'Sharjah', city: 'Sharjah', area: 'Al Nahda', latitude: 25.3312, longitude: 55.4134 },
        scores: { trust_score: 0.87, speed_score: 0.80, price_score: 0.72, luxury_score: 0.20, budget_score: 0.70, review_confidence_score: 0.83, overall_score: 0.74, profile_completeness: 'full' },
        services: ['Honda Service', 'AC Repair', 'Brake Service', 'Suspension'],
        brands: [{ name: 'Honda', confidence: 0.96 }, { name: 'Toyota', confidence: 0.80 }],
        tags: [{ type: 'best_for', value: 'Honda Civic service' }, { type: 'best_for', value: 'Honest pricing' }, { type: 'vibe', value: 'Friendly & fair' }],
        reviews: [
            { text: 'The best Honda specialist I have found in Sharjah. They know these cars inside out.', rating: 5.0, author: 'Mohamad Z.' },
            { text: 'Fixed my Accord AC for much less than the dealer. Trustworthy team.', rating: 4.5, author: 'Lina F.' },
        ]
    },
    {
        name: 'Toyota & Lexus Care Dubai', slug: 'toyota-lexus-care-dubai',
        source_provider: 'manual', primary_category: 'Japanese Cars Specialist',
        phone: '+971501234007', whatsapp: '+971501234007',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Al Barsha', latitude: 25.1099, longitude: 55.1993 },
        scores: { trust_score: 0.88, speed_score: 0.78, price_score: 0.58, luxury_score: 0.55, budget_score: 0.50, review_confidence_score: 0.86, overall_score: 0.76, profile_completeness: 'full' },
        services: ['Toyota Service', 'Lexus Service', 'Hybrid Repair', 'Transmission'],
        brands: [{ name: 'Toyota', confidence: 0.95 }, { name: 'Lexus', confidence: 0.92 }],
        tags: [{ type: 'best_for', value: 'Lexus IS & ES' }, { type: 'best_for', value: 'Hybrid battery check' }, { type: 'vibe', value: 'Clean & professional' }],
        reviews: [
            { text: 'Perfect for Lexus owners who want dealer quality without the dealer price.', rating: 4.5, author: 'Yousuf B.' },
            { text: 'Fixed my Land Cruiser issue quickly. Highly recommend.', rating: 5.0, author: 'Amira S.' },
        ]
    },
    {
        name: 'Bur Dubai Body & Paint Works', slug: 'bur-dubai-body-paint-works',
        source_provider: 'manual', primary_category: 'Body & Paint',
        phone: '+971521234008', whatsapp: '+971521234008',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Bur Dubai', latitude: 25.2531, longitude: 55.3000 },
        scores: { trust_score: 0.82, speed_score: 0.60, price_score: 0.55, luxury_score: 0.55, budget_score: 0.55, review_confidence_score: 0.80, overall_score: 0.70, profile_completeness: 'full' },
        services: ['Dent Removal', 'Full Respray', 'Scratch Repair', 'Panel Replacement'],
        brands: [{ name: 'Any Brand', confidence: 0.95 }],
        tags: [{ type: 'best_for', value: 'Dent repair' }, { type: 'best_for', value: 'Full body respray' }, { type: 'vibe', value: 'Meticulous & thorough' }],
        reviews: [
            { text: 'My car looks brand new. The paint match was perfect. Very skilled team.', rating: 5.0, author: 'Hassan N.' },
            { text: 'Takes time but the quality is unmatched. Not the cheapest but worth it.', rating: 4.5, author: 'Carmen V.' },
        ]
    },
    {
        name: 'Ajman AC Specialist', slug: 'ajman-ac-specialist',
        source_provider: 'manual', primary_category: 'AC Specialist',
        phone: '+971561234009', whatsapp: '+971561234009',
        location: { emirate: 'Ajman', city: 'Ajman', area: 'Al Jurf', latitude: 25.3993, longitude: 55.4886 },
        scores: { trust_score: 0.85, speed_score: 0.90, price_score: 0.85, luxury_score: 0.10, budget_score: 0.88, review_confidence_score: 0.82, overall_score: 0.73, profile_completeness: 'full' },
        services: ['AC Gas Refill', 'AC Compressor', 'AC Filter', 'AC Diagnostics'],
        brands: [{ name: 'Any Brand', confidence: 0.97 }],
        tags: [{ type: 'best_for', value: 'AC gas top-up' }, { type: 'best_for', value: 'Budget AC repair' }, { type: 'vibe', value: 'Quick & affordable' }],
        reviews: [
            { text: 'Best AC prices in Ajman. My car is ice cold now. Took less than an hour.', rating: 4.5, author: 'Rania K.' },
            { text: 'Honest about what needed fixing. Did not try to oversell.', rating: 4.5, author: 'Tariq O.' },
        ]
    },
    {
        name: 'Marina Prestige Auto', slug: 'marina-prestige-auto',
        source_provider: 'manual', primary_category: 'Luxury Cars Specialist',
        phone: '+971501234010', whatsapp: '+971501234010',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Dubai Marina', latitude: 25.0773, longitude: 55.1321 },
        scores: { trust_score: 0.91, speed_score: 0.65, price_score: 0.10, luxury_score: 0.98, budget_score: 0.02, review_confidence_score: 0.89, overall_score: 0.79, profile_completeness: 'full' },
        services: ['Lamborghini Service', 'Ferrari Service', 'Rolls Royce Care', 'Detailing'],
        brands: [{ name: 'Lamborghini', confidence: 0.92 }, { name: 'Ferrari', confidence: 0.90 }, { name: 'Rolls Royce', confidence: 0.88 }, { name: 'Bentley', confidence: 0.85 }],
        tags: [{ type: 'best_for', value: 'Supercar service' }, { type: 'avoid_for', value: 'Regular car owners' }, { type: 'vibe', value: 'White glove treatment' }],
        reviews: [
            { text: 'Only place I trust with my Lambo. Flawless service every time.', rating: 5.0, author: 'Rashid Al F.' },
            { text: 'Worth the price for peace of mind. They treat your car like their own.', rating: 5.0, author: 'James W.' },
        ]
    },
    {
        name: 'Ras Al Khaimah Auto Repair', slug: 'rak-auto-repair',
        source_provider: 'manual', primary_category: 'General Repair',
        phone: '+971551234011', whatsapp: '+971551234011',
        location: { emirate: 'Ras Al Khaimah', city: 'Ras Al Khaimah', area: 'Al Nakheel', latitude: 25.8007, longitude: 55.9762 },
        scores: { trust_score: 0.83, speed_score: 0.85, price_score: 0.88, luxury_score: 0.08, budget_score: 0.90, review_confidence_score: 0.79, overall_score: 0.70, profile_completeness: 'full' },
        services: ['General Repair', 'Oil Change', 'Brake Service', 'Tyre Service'],
        brands: [{ name: 'Toyota', confidence: 0.88 }, { name: 'Nissan', confidence: 0.85 }, { name: 'Honda', confidence: 0.82 }],
        tags: [{ type: 'best_for', value: 'Affordable RAK service' }, { type: 'vibe', value: 'Friendly local team' }],
        reviews: [
            { text: 'Best garage in RAK. Very affordable and honest. No hidden charges.', rating: 4.5, author: 'Sultan M.' },
        ]
    },
    {
        name: 'Silicon Oasis Suspension Experts', slug: 'silicon-oasis-suspension-experts',
        source_provider: 'manual', primary_category: 'Suspension & Steering',
        phone: '+971521234012', whatsapp: '+971521234012',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Dubai Silicon Oasis', latitude: 25.1176, longitude: 55.3882 },
        scores: { trust_score: 0.88, speed_score: 0.82, price_score: 0.62, luxury_score: 0.35, budget_score: 0.58, review_confidence_score: 0.84, overall_score: 0.74, profile_completeness: 'full' },
        services: ['Shock Absorber', 'Steering Rack', 'Ball Joint', 'Wheel Alignment'],
        brands: [{ name: 'Toyota', confidence: 0.85 }, { name: 'BMW', confidence: 0.80 }, { name: 'Honda', confidence: 0.82 }],
        tags: [{ type: 'best_for', value: 'Suspension noise fix' }, { type: 'best_for', value: 'Wheel alignment' }],
        reviews: [
            { text: 'Fixed the clunking noise in my suspension. Professional and transparent about costs.', rating: 5.0, author: 'Diane F.' },
        ]
    },
    {
        name: 'Sharjah Motor Works', slug: 'sharjah-motor-works',
        source_provider: 'manual', primary_category: 'General Repair',
        phone: '+971561234013', whatsapp: '+971561234013',
        location: { emirate: 'Sharjah', city: 'Sharjah', area: 'Al Qasimia', latitude: 25.3490, longitude: 55.3934 },
        scores: { trust_score: 0.79, speed_score: 0.88, price_score: 0.82, luxury_score: 0.10, budget_score: 0.85, review_confidence_score: 0.75, overall_score: 0.68, profile_completeness: 'full' },
        services: ['General Repair', 'Engine Oil', 'AC Service', 'Brake Pads'],
        brands: [{ name: 'Nissan', confidence: 0.88 }, { name: 'Mitsubishi', confidence: 0.80 }, { name: 'Kia', confidence: 0.78 }],
        tags: [{ type: 'best_for', value: 'Affordable Sharjah service' }, { type: 'vibe', value: 'Fast and no-nonsense' }],
        reviews: [
            { text: 'Quick service, fair prices. Go here for anything routine.', rating: 4.0, author: 'Wael S.' },
        ]
    },
    {
        name: 'Karama Electrical & Diagnostics', slug: 'karama-electrical-diagnostics',
        source_provider: 'manual', primary_category: 'Auto Electrical',
        phone: '+971501234014', whatsapp: '+971501234014',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Karama', latitude: 25.2397, longitude: 55.3091 },
        scores: { trust_score: 0.90, speed_score: 0.78, price_score: 0.65, luxury_score: 0.30, budget_score: 0.62, review_confidence_score: 0.86, overall_score: 0.76, profile_completeness: 'full' },
        services: ['Electrical Fault', 'Battery Replace', 'Alternator', 'ECU Repair'],
        brands: [{ name: 'Toyota', confidence: 0.87 }, { name: 'BMW', confidence: 0.85 }, { name: 'Land Rover', confidence: 0.80 }],
        tags: [{ type: 'best_for', value: 'Electrical fault diagnosis' }, { type: 'best_for', value: 'Battery replacement' }],
        reviews: [
            { text: 'Diagnosed an electrical fault 2 other garages missed. Very smart team.', rating: 5.0, author: 'Leo K.' },
        ]
    },
    {
        name: 'Umm Ramool Korean Car Specialist', slug: 'umm-ramool-korean-car-specialist',
        source_provider: 'manual', primary_category: 'Korean Cars Specialist',
        phone: '+971551234015', whatsapp: '+971551234015',
        location: { emirate: 'Dubai', city: 'Dubai', area: 'Umm Ramool', latitude: 25.2271, longitude: 55.3437 },
        scores: { trust_score: 0.85, speed_score: 0.83, price_score: 0.78, luxury_score: 0.15, budget_score: 0.80, review_confidence_score: 0.81, overall_score: 0.72, profile_completeness: 'full' },
        services: ['Kia Service', 'Hyundai Service', 'AC Repair', 'Gearbox'],
        brands: [{ name: 'Kia', confidence: 0.96 }, { name: 'Hyundai', confidence: 0.94 }, { name: 'Genesis', confidence: 0.80 }],
        tags: [{ type: 'best_for', value: 'Kia & Hyundai service' }, { type: 'vibe', value: 'Knowledgeable & fair' }],
        reviews: [
            { text: 'Best Kia specialist in Dubai. Very honest and knows the cars well.', rating: 5.0, author: 'Ji W.' },
        ]
    },
];
async function main() {
    console.log('🌱 Starting GarageIQ database seed...');
    await prisma.garageTag.deleteMany();
    await prisma.garageBrandSpecialization.deleteMany();
    await prisma.garageService.deleteMany();
    await prisma.garageReview.deleteMany();
    await prisma.garageScore.deleteMany();
    await prisma.garageLocation.deleteMany();
    await prisma.garage.deleteMany();
    console.log('🗑️  Cleared old seed data');
    for (const g of garages) {
        const garage = await prisma.garage.create({
            data: {
                name: g.name,
                slug: g.slug,
                source_provider: g.source_provider,
                primary_category: g.primary_category,
                phone: g.phone,
                whatsapp: g.whatsapp,
            }
        });
        await prisma.$executeRaw `
      INSERT INTO garage_locations (id, garage_id, emirate, city, area, latitude, longitude, country, geo_point)
      VALUES (
        gen_random_uuid(),
        ${garage.id}::uuid,
        ${g.location.emirate},
        ${g.location.city},
        ${g.location.area},
        ${g.location.latitude},
        ${g.location.longitude},
        'UAE',
        ST_SetSRID(ST_MakePoint(${g.location.longitude}, ${g.location.latitude}), 4326)::geography
      )
    `;
        await prisma.garageScore.create({
            data: {
                garage_id: garage.id,
                trust_score: g.scores.trust_score,
                speed_score: g.scores.speed_score,
                price_score: g.scores.price_score,
                luxury_score: g.scores.luxury_score,
                budget_score: g.scores.budget_score,
                review_confidence_score: g.scores.review_confidence_score,
                overall_score: g.scores.overall_score,
                profile_completeness: g.scores.profile_completeness,
                last_calculated_at: new Date(),
            }
        });
        for (const svc of g.services) {
            await prisma.garageService.create({
                data: { garage_id: garage.id, service_category: svc, is_verified: true }
            });
        }
        for (const brand of g.brands) {
            await prisma.garageBrandSpecialization.create({
                data: { garage_id: garage.id, brand_name: brand.name, confidence_score: brand.confidence, source_type: 'manual' }
            });
        }
        for (const tag of g.tags) {
            await prisma.garageTag.create({
                data: { garage_id: garage.id, tag_type: tag.type, tag_value: tag.value, confidence_score: 0.92, source_type: 'manual' }
            });
        }
        for (const rev of g.reviews) {
            await prisma.garageReview.create({
                data: {
                    garage_id: garage.id,
                    source_provider: 'google_places',
                    source_review_id: `manual_${garage.id}_${Math.random().toString(36).slice(2, 8)}`,
                    author_name: rev.author,
                    rating: rev.rating,
                    review_text: rev.text,
                    review_date: new Date(),
                }
            });
        }
        console.log(`✅ Seeded: ${g.name}`);
    }
    console.log(`\n🎉 Seed complete! Inserted ${garages.length} garages.`);
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map