// Type definitions for k6 secrets API
declare module 'k6/secrets' {
    /**
     * Get a secret from the default secret source
     * @param key The secret key to retrieve
     * @returns Promise that resolves to the secret value
     */
    function get(key: string): Promise<string>;

    /**
     * Get a specific secret source by name
     * @param name The name of the secret source
     * @returns A secret source object
     */
    function source(name: string): SecretSource;

    interface SecretSource {
        /**
         * Get a secret from this specific source
         * @param key The secret key to retrieve
         * @returns Promise that resolves to the secret value
         */
        get(key: string): Promise<string>;
    }

    // Default export with get function
    const secrets: {
        get: typeof get;
        source: typeof source;
    };

    export default secrets;
    export { get, source, SecretSource };
}

// Legacy experimental module (deprecated, use k6/secrets instead)
declare module 'k6/experimental/secrets' {
    export interface Secret {
        get(key: string): string | undefined;
    }

    export const Secret: Secret;
}
