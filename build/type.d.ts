export declare type RequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';
export declare type Request = {
    method: RequestMethod;
    path: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
};
export declare type Response = {
    statusCode: number;
    json?: Record<string, any>;
};
export declare type RequestQuerySchema = {
    [k: string]: {
        required?: boolean;
        schema: any;
    };
};
export declare type RequestBodySchema = {
    required?: boolean;
    content: {
        [k: string]: {
            schema: any;
        };
    };
};
export declare type AdditionalInfo = {
    summary?: string;
    operationId?: string;
    tags?: string[];
    produces?: string[];
    security?: Record<string, any>[];
    consumes?: string[];
    path?: RequestQuerySchema;
    query?: RequestQuerySchema;
    body?: RequestBodySchema;
    response?: {
        content: any;
    };
};
