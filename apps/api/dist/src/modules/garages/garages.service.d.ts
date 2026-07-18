import { PrismaService } from '../../prisma/prisma.service';
export declare class GaragesService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        phone: string | null;
        whatsapp: string | null;
        website_url: string | null;
        primary_category: string | null;
        is_verified: boolean;
        cold_start: boolean;
        review_count: number;
        rating: string | null;
        location: {
            area: string | null;
            city: string;
            emirate: string;
            address_line: string | null;
            latitude: number;
            longitude: number;
        } | null;
        scores: {
            trust: number;
            speed: number;
            price: number;
            overall: number;
            review_confidence: number;
            profile_completeness: string;
        } | null;
        tags: {
            type: string;
            value: string;
            confidence: number | null;
        }[];
        services: {
            category: string;
            price_band: string | null;
        }[];
        brands: {
            name: string;
            confidence: number | null;
        }[];
        reviews: {
            author: string | null;
            rating: number;
            text: string | null;
            date: Date | null;
            source: string;
        }[];
    }>;
    findBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        phone: string | null;
        whatsapp: string | null;
        website_url: string | null;
        primary_category: string | null;
        is_verified: boolean;
        cold_start: boolean;
        review_count: number;
        rating: string | null;
        location: {
            area: string | null;
            city: string;
            emirate: string;
            address_line: string | null;
            latitude: number;
            longitude: number;
        } | null;
        scores: {
            trust: number;
            speed: number;
            price: number;
            overall: number;
            review_confidence: number;
            profile_completeness: string;
        } | null;
        tags: {
            type: string;
            value: string;
            confidence: number | null;
        }[];
        services: {
            category: string;
            price_band: string | null;
        }[];
        brands: {
            name: string;
            confidence: number | null;
        }[];
        reviews: {
            author: string | null;
            rating: number;
            text: string | null;
            date: Date | null;
            source: string;
        }[];
    }>;
}
