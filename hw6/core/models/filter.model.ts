export interface ExceptionFilter {
    catch(exception: Error, context: any): void;
}
