import { linear } from "svelte/easing";
import { lerp }   from '@typhonjs-fvtt/svelte/util';

export class ApplicationState
{
   #application;

   /**
    * @type {Map<string, ApplicationData>}
    */
   #dataSaved = new Map();

   /**
    * @param {{ reactive: SvelteReactive, options: object }}   application - The application.
    */
   constructor(application)
   {
      this.#application = application;
   }

   /**
    * Returns current application state along with any extra data passed into method.
    *
    * @param {object} [extra] - Extra data to add to application state.
    *
    * @returns {ApplicationData} Passed in object with current application state.
    */
   get(extra = {})
   {
      return Object.assign(extra, {
         position: this.#application?.position?.get(),
         options: Object.assign({}, this.#application?.options),
         ui: { minimized: this.#application?.reactive?.minimized }
      });
   }

   /**
    * Returns any stored save state by name.
    *
    * @param {string}   name - Saved data set name.
    *
    * @returns {ApplicationData} The saved data set.
    */
   getSave({ name })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - getSave error: 'name' is not a string.`);
      }

      return this.#dataSaved.get(name);
   }

   /**
    * Removes and returns any application state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {ApplicationData} Saved position data.
    */
   remove({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - remove: 'name' is not a string.`); }

      const data = this.#dataSaved.get(name);
      this.#dataSaved.delete(name);

      return data;
   }

   /**
    * Restores a saved positional state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link Position.animateTo} allows
    * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
    * returned if awaiting the end of the animation.
    *
    * @param {object}            params - Parameters
    *
    * @param {string}            params.name - Saved data set name.
    *
    * @param {boolean}           [params.remove=false] - Remove data set.
    *
    * @param {boolean}           [params.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [params.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [params.duration=100] - Duration in milliseconds.
    *
    * @param {Function}          [params.easing=linear] - Easing function.
    *
    * @param {Function}          [params.interpolate=lerp] - Interpolation function.
    *
    * @returns {ApplicationData} Saved application data.
    */
   restore({ name, remove = false, async = false, animateTo = false, duration = 100, easing = linear,
    interpolate = lerp })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - restore error: 'name' is not a string.`);
      }

      const dataSaved = this.#dataSaved.get(name);

      if (dataSaved)
      {
         if (remove) { this.#dataSaved.delete(name); }

         return this.set(dataSaved, { async, animateTo, duration, easing, interpolate });
      }

      return dataSaved;
   }

   /**
    * Saves current position state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - name to index this saved data.
    *
    * @param {...*}     [options.extra] - Extra data to add to saved data.
    *
    * @returns {ApplicationData} Current position data
    */
   save({ name, ...extra })
   {
      if (typeof name !== 'string') { throw new TypeError(`ApplicationState - save error: 'name' is not a string.`); }

      const data = this.get(extra);

      this.#dataSaved.set(name, data);

      return data;
   }

   /**
    * Restores a saved positional state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link Position.animateTo} allows
    * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
    * returned if awaiting the end of the animation.
    *
    * @param {ApplicationData}   data - Saved data set name.
    *
    * @param {object}            opts - Optional parameters
    *
    * @param {boolean}           [opts.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [opts.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [opts.duration=100] - Duration in milliseconds.
    *
    * @param {Function}          [opts.easing=linear] - Easing function.
    *
    * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {ApplicationData} Saved application data.
    */
   set(data, { async = false, animateTo = false, duration = 100, easing = linear, interpolate = lerp })
   {
      if (typeof data !== 'object')
      {
         throw new TypeError(`ApplicationState - restore error: 'data' is not an object.`);
      }

      if (data)
      {
         const application = this.#application;

         // Merge in saved options to application.
         if (typeof data?.options === 'object')
         {
            application?.reactive.mergeOptions(data.options);
         }

         if (typeof data?.ui === 'object')
         {
            const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

            // Application is currently minimized and stored state is not, so reset minimized state without animationn.
            if (application?.reactive?.minimized && !minimized)
            {
               application.maximize({ animate: false, duration: 0 });
            }
            else if (!application?.reactive?.minimized && minimized)
            {
               application.minimize({ animate: false, duration });
            }
         }

         if (typeof data?.position === 'object')
         {
            // Update data directly with no store or inline style updates.
            if (animateTo)  // Animate to saved data.
            {
               // Return a Promise with saved data that resolves after animation ends.
               if (async)
               {
                  return application.position.animateTo(data.position, { duration, easing, interpolate }).then(
                   () => data);
               }
               else  // Animate synchronously.
               {
                  application.position.animateTo(data.position, { duration, easing, interpolate });
               }
            }
            else
            {
               // Default options is to set data for an immediate update.
               application.position.set(data.position);
            }
         }
      }

      return data;
   }
}

/**
 * @typedef {object} ApplicationData
 *
 * @property {PositionData}   position - Application position.
 *
 * @property {object}         options - Application options.
 *
 * @property {object}         ui - Application UI state.
 */
