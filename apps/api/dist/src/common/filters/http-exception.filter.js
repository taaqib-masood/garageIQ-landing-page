"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_ERROR';
        let details = {};
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : res.message || message;
            if (status === common_1.HttpStatus.BAD_REQUEST) {
                code = 'VALIDATION_ERROR';
                details = typeof res === 'object' ? res : {};
            }
            else if (status === common_1.HttpStatus.UNAUTHORIZED) {
                code = 'UNAUTHORIZED';
            }
            else if (status === common_1.HttpStatus.FORBIDDEN) {
                code = 'FORBIDDEN';
            }
            else if (status === common_1.HttpStatus.NOT_FOUND) {
                code = 'NOT_FOUND';
            }
            else if (status === common_1.HttpStatus.TOO_MANY_REQUESTS) {
                code = 'RATE_LIMITED';
            }
        }
        response.status(status).json({
            success: false,
            data: null,
            meta: {},
            error: {
                code,
                message,
                details,
            },
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map