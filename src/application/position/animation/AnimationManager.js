import { nextAnimationFrame }    from '@typhonjs-fvtt/svelte/animate';

import { UpdateElementManager }  from '../update/UpdateElementManager.js';

const s_ACTIVE_LIST = [];
const s_NEW_LIST = [];
let s_PROMISE;

/**
 * Provides animation management and scheduling allowing all Position instances to utilize one micro-task.
 */
export class AnimationManager
{
   /**
    * Add animation data.
    *
    * @param {object}   data -
    */
   static add(data)
   {
      s_NEW_LIST.push(data);

      if (!s_PROMISE) { s_PROMISE = this.animate(); }
   }

   /**
    * Manage all animation
    *
    * @returns {Promise<void>}
    */
   static async animate()
   {
      let current = await nextAnimationFrame();

      while (s_ACTIVE_LIST.length || s_NEW_LIST.length)
      {
         if (s_NEW_LIST.length)
         {
            // Process new data
            for (let cntr = s_NEW_LIST.length; --cntr >= 0;)
            {
               const data = s_NEW_LIST[cntr];
               data.start = current;
               data.current = 0;

               s_ACTIVE_LIST.push(data);
            }

            s_NEW_LIST.length = 0;
         }

         // Process existing data.
         for (let cntr = s_ACTIVE_LIST.length; --cntr >= 0;)
         {
            const data = s_ACTIVE_LIST[cntr];

            // Ensure that the element is still connected otherwise remove it from active list and continue.
            if (!data.el.isConnected)
            {
               s_ACTIVE_LIST.splice(cntr, 1);
               continue;
            }

            data.current = current - data.start;

            // Remove this animation instance.
            if (data.current >= data.duration)
            {
               // Prepare final update with end position data and remove keys from `currentAnimationKeys`.
               for (let dataCntr = data.keys.length; --dataCntr >= 0;)
               {
                  const key = data.keys[dataCntr];
                  data.newData[key] = data.destination[key];
                  data.currentAnimationKeys.delete(key);
               }

               data.position.set(data.newData);

               s_ACTIVE_LIST.splice(cntr, 1);

               data.resolve();
               continue;
            }

            const easedTime = data.easing(data.current / data.duration);

            for (let dataCntr = data.keys.length; --dataCntr >= 0;)
            {
               const key = data.keys[dataCntr];
               data.newData[key] = data.interpolate(data.initial[key], data.destination[key], easedTime);
            }

            data.position.set(data.newData);
         }

         const newCurrent = await UpdateElementManager.promise;

         // Must check that time has passed otherwise likely the element has been removed.
         if (!Number.isFinite(newCurrent) && newCurrent <= current)
         {
            // TODO: Temporary warning message
            // console.warn(`TRL - AnimationManager Warning - quitting animation: newCurrent <= current.`);

            for (const data of s_ACTIVE_LIST)
            {
               for (const key of data.keys)
               {
                  data.newData[key] = data.destination[key];
                  data.currentAnimationKeys.delete(key);
               }

               data.position.set(data.newData);
               data.resolve();
            }

            s_ACTIVE_LIST.length = 0;

            break;
         }

         current = newCurrent;
      }

      s_PROMISE = void 0;
   }
}
