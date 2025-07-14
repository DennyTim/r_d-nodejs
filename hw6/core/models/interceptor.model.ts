export interface Interceptor {
    intercept(ctx: any, next: () => any): any;
}
