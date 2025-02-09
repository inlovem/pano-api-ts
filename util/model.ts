// Define the allowed primitive types for an id.
export type PrimitiveId = number | string;

// Define an interface for objects that have an `id` property.
export interface Identifiable<T extends PrimitiveId = PrimitiveId> {
    id: T;
}

/**
 * Extracts the id from a model or returns the id if it's already a number or string.
 *
 * @param modelOrId - Either an id (number or string) or an object with an `id` property.
 * @returns The id as a number or string.
 */
export function getId<T extends PrimitiveId>(modelOrId: T | Identifiable<T>): T {
    if (typeof modelOrId === 'number' || typeof modelOrId === 'string') {
        return modelOrId;
    }
    return modelOrId.id;
}
