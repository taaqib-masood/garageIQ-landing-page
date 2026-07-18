import { Strategy } from 'passport-jwt';
export interface SupabaseJwtPayload {
    sub: string;
    email?: string;
    phone?: string;
    role: string;
    aud: string;
    exp: number;
    iat: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: SupabaseJwtPayload): Promise<{
        id: string;
        email: string | undefined;
        phone: string | undefined;
    }>;
}
export {};
