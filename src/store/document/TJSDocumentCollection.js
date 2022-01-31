import { uuidv4 } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {DocumentCollection} T
 */
export class TJSDocumentCollection
{
   #collection;
   #collectionCallback;
   #uuid;
   #deleteFn;
   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T}                    collection - Collection to wrap.
    *
    * @param {{delete: Function}}   options - Optional delete function to invoke when collection is deleted.
    */
   constructor(collection, options = {})
   {
      if (options?.delete && typeof options?.delete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function.`);
      }

      this.#uuid = `store-collection-${uuidv4()}`;
      this.#deleteFn = options.delete;

      this.set(collection);
   }

   /**
    * Returns the options passed on last update.
    *
    * @returns {object} Last update options.
    */
   get updateOptions() { return this.#updateOptions ?? {}; }

   /**
    * Returns the UUID assigned to this store.
    *
    * @returns {*} UUID
    */
   get uuid() { return this.#uuid; }

   /**
    * Handles cleanup when the collection is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      if (this.#collection instanceof DocumentCollection)
      {
         const index = this.#collection.apps.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { this.#collection.apps.splice(index, 1); }

         this.#collection = void 0;
      }

      this.#updateOptions = void 0;

      if (typeof this.#deleteFn === 'function') { await this.#deleteFn(); }

      this.#notify();
   }

   /**
    * @param {boolean}  force - unused
    *
    * @param {object}   options - Options from render call; will have collection update context.
    */
   #notify(force = false, options = void 0) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const collection = this.#collection;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](collection); }
   }

   /**
    * @returns {T | undefined} Current collection
    */
   get() { return this.#collection; }

   /**
    * @param {T | undefined}  collection - New collection to set.
    */
   set(collection)
   {
      if (this.#collection)
      {
         const index = this.#collection.apps.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { this.#collection.apps.splice(index, 1); }

         this.#collectionCallback = void 0;
      }

      if (collection === null) { throw new TypeError(`TJSDocumentCollection set error: 'collection' is null.`); }

      if (collection !== void 0 && !(collection instanceof DocumentCollection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (collection instanceof DocumentCollection)
      {
         this.#collectionCallback = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };

         collection.apps.push(this.#collectionCallback);
      }

      this.#collection = document;
      this.#notify();
   }

   /**
    * @param {function(T): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this.#collection);           // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}