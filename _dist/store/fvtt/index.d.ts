import { DynOptionsMapCreate, DynMapReducer } from '@typhonjs-svelte/runtime-base/data/struct/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
    /**
     * Creates an embedded collection store.
     */
    create<T extends NamedDocumentConstructor>(doc: T, options: DynOptionsMapCreate<string, InstanceType<T>>): DynMapReducer<string, InstanceType<T>>;
    /**
     * - Destroys one or more embedded collection stores.
     */
    destroy<T extends NamedDocumentConstructor>(doc?: T, storeName?: string): boolean;
    /**
     * - Returns a specific existing embedded collection store.
     */
    get<T extends NamedDocumentConstructor>(doc: T, storeName: string): DynMapReducer<string, InstanceType<T>>;
}
/**
 * Provides a basic duck type for Foundry documents. Expects a constructor / class w/ static property `name`.
 */
interface NamedDocumentConstructor {
    new (...args: any[]): any;
    readonly documentName: string;
}

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
declare class TJSDocument {
    /**
     * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
     *
     * @param {object}   data - Drop transfer data.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.actor=true] - Accept actor owned documents.
     *
     * @param {boolean}  [opts.compendium=true] - Accept compendium documents.
     *
     * @param {boolean}  [opts.world=true] - Accept world documents.
     *
     * @param {string[]|undefined}   [opts.types] - Require the `data.type` to match entry in `types`.
     *
     * @returns {string|undefined} Foundry UUID for drop data.
     */
    static getUUIDFromDataTransfer(data: object, { actor, compendium, world, types }?: {
        actor?: boolean;
        compendium?: boolean;
        world?: boolean;
        types?: string[] | undefined;
    }): string | undefined;
    /**
     * @param {foundry.abstract.Document | TJSDocumentOptions}  [document] - Document to wrap or TJSDocumentOptions.
     *
     * @param {TJSDocumentOptions}      [options] - TJSDocument options.
     */
    constructor(document?: foundry.abstract.Document | TJSDocumentOptions, options?: TJSDocumentOptions);
    /**
     * @returns {import('./types').EmbeddedAPI} Embedded store manager.
     */
    get embedded(): EmbeddedAPI;
    /**
     * Returns the options passed on last update.
     *
     * @returns {object} Last update options.
     */
    get updateOptions(): any;
    /**
     * Returns the UUID assigned to this store.
     *
     * @returns {string} UUID
     */
    get uuidv4(): string;
    /**
     * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
     * ClientDocumentMixin `apps` tracking object.
     */
    destroy(): void;
    /**
     * @returns {foundry.abstract.Document | undefined} Current document
     */
    get(): foundry.abstract.Document | undefined;
    /**
     * @param {foundry.abstract.Document | undefined}  document - New document to set.
     *
     * @param {object}         [options] - New document update options to set.
     */
    set(document: foundry.abstract.Document | undefined, options?: object): void;
    /**
     * Potentially sets new document from data transfer object.
     *
     * @param {object}   data - Document transfer data.
     *
     * @param {{ actor?: boolean, compendium?: boolean, world?: boolean, types?: string[] } & TJSDocumentOptions}   [options] - Optional
     *        parameters.
     *
     * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
     */
    setFromDataTransfer(data: object, options?: {
        actor?: boolean;
        compendium?: boolean;
        world?: boolean;
        types?: string[];
    } & TJSDocumentOptions): Promise<boolean>;
    /**
     * Sets the document by Foundry UUID performing a lookup and setting the document if found.
     *
     * @param {string}   uuid - A Foundry UUID to lookup.
     *
     * @param {TJSDocumentOptions}   [options] - New document update options to set.
     *
     * @returns {Promise<boolean>} True if successfully set document from UUID.
     */
    setFromUUID(uuid: string, options?: TJSDocumentOptions): Promise<boolean>;
    /**
     * Sets options for this document wrapper / store.
     *
     * @param {TJSDocumentOptions}   options - Options for TJSDocument.
     */
    setOptions(options: TJSDocumentOptions): void;
    /**
     * @param {function(foundry.abstract.Document, object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: foundry.abstract.Document, arg1: object) => void): (() => void);
    #private;
}
type TJSDocumentOptions = {
    /**
     * - Optional post delete function to invoke when
     * document is deleted _after_ subscribers have been notified.
     */
    delete?: (doc: foundry.abstract.Document) => void;
    /**
     * - Optional pre delete function to invoke when
     * document is deleted _before_ subscribers are notified.
     */
    preDelete?: (doc: foundry.abstract.Document) => void;
};

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {globalThis.DocumentCollection} T
 */
declare class TJSDocumentCollection<T extends globalThis.DocumentCollection> {
    /**
     * @param {T|TJSDocumentCollectionOptions}   [collection] - Collection to wrap or TJSDocumentCollectionOptions.
     *
     * @param {TJSDocumentCollectionOptions}     [options] - TJSDocumentCollection options.
     */
    constructor(collection?: T | TJSDocumentCollectionOptions, options?: TJSDocumentCollectionOptions);
    /**
     * Returns the options passed on last update.
     *
     * @returns {object} Last update options.
     */
    get updateOptions(): any;
    /**
     * Returns the UUID assigned to this store.
     *
     * @returns {*} UUID
     */
    get uuid(): any;
    /**
     * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
     * DocumentCollection `apps` tracking array.
     */
    destroy(): void;
    /**
     * @returns {T | undefined} Current collection
     */
    get(): T | undefined;
    /**
     * @param {T | undefined}  collection - New collection to set.
     *
     * @param {object}         [options] - New collection update options to set.
     */
    set(collection: T | undefined, options?: object): void;
    /**
     * Sets options for this collection wrapper / store.
     *
     * @param {TJSDocumentCollectionOptions}   options - Options for TJSDocumentCollection.
     */
    setOptions(options: TJSDocumentCollectionOptions): void;
    /**
     * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: T, arg1: object) => void): (() => void);
    #private;
}
type TJSDocumentCollectionOptions = {
    /**
     * - Optional post delete function
     * to invoke when document is deleted _after_ subscribers have been notified.
     */
    delete?: (collection: globalThis.DocumentCollection) => void;
    /**
     * - Optional pre delete function to
     * invoke when document is deleted _before_ subscribers are notified.
     */
    preDelete?: (collection: globalThis.DocumentCollection) => void;
};

/**
 * @type {import('#svelte/store').Readable<globalThis.game>} Provides a Svelte store wrapping the Foundry `game` global
 * variable. It is initialized on the `ready` hook. You may use this store to access the global game state from a
 * Svelte template. It is a read only store and will receive no reactive updates during runtime.
 */
declare const gameState: any;

export { TJSDocument, TJSDocumentCollection, TJSDocumentCollectionOptions, TJSDocumentOptions, gameState };
