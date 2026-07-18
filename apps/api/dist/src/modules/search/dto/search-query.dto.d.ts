export declare class LocationDto {
    lat: number;
    lng: number;
}
export declare class FiltersDto {
    price_band?: string;
    service_type?: string;
    brand?: string;
    radius_km?: number;
}
export declare class SearchQueryDto {
    query?: string;
    vehicle_id?: string;
    location?: LocationDto;
    filters?: FiltersDto;
    page?: number;
    limit?: number;
}
