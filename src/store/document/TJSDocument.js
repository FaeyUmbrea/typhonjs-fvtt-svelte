import { uuidv4 } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {foundry.abstract.Document} T
 */
export class TJSDocument
{
   #document;
   #uuid;
   #deleteFn;
   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T}                    document - Document to wrap.
    *
    * @param {{delete: Function}}   options - Optional delete function to invoke when document is deleted.
    */
   constructor(document, options = {})
   {
      if (options?.delete && typeof options?.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function.`);
      }

      this.#uuid = `store-document-${uuidv4()}`;
      this.#deleteFn = options.delete;

      this.set(document);
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
    * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      if (this.#document instanceof foundry.abstract.Document)
      {
         delete this.#document.apps[this.#uuid];
         this.#document = void 0;
      }

      this.#updateOptions = void 0;

      if (typeof this.#deleteFn === 'function') { await this.#deleteFn(); }

      this.#notify();
   }

   /**
    * @param {boolean}  force - unused
    *
    * @param {object}   options - Options from render call; will have document update context.
    */
   #notify(force = false, options = void 0) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const document = this.#document;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](document); }
   }

   /**
    * @returns {T | undefined} Current document
    */
   get() { return this.#document; }

   /**
    * @param {T | undefined}  document - New document to set.
    */
   set(document)
   {
      if (this.#document)
      {
         delete this.#document.apps[this.#uuid];
      }

      if (document === null) { throw new TypeError(`TJSDocument set error: 'document' is null.`); }

      if (document !== void 0 && !(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined.`);
      }

      if (document instanceof foundry.abstract.Document)
      {
         document.apps[this.#uuid] = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };
      }

      this.#document = document;
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

      handler(this.#document);           // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}