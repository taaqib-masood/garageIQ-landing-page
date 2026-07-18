import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    resolveQuery(dto: ResolveQueryDto): Promise<any>;
    query(dto: SearchQueryDto): Promise<{
        query_resolution: any;
        location_resolution: {
            strategy: string;
            resolved_area: string | null;
            device_coords_used: boolean;
        };
        results: {
            id: any;
            name: any;
            slug: any;
            area: string;
            primary_category: any;
            phone: any;
            whatsapp: any;
            rating: string | null;
            review_count: number;
            relevance_score: number;
            profile_completeness: any;
            scores: {
                trust: number;
                speed: number;
                price: number;
            };
            top_tags: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            latency_ms: number;
        };
    }>;
    getAreas(): Promise<{
        emirates: string[];
        areas: (string | null)[];
    }>;
}
