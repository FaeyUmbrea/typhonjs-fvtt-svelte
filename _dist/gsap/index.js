import * as easingFuncs from 'svelte/easing';
import { Position } from '@typhonjs-fvtt/svelte/application';
import { isIterable } from '@typhonjs-fvtt/svelte/util';

let gsap = void 0;

// Plugins
let CustomBounce = void 0;
let CustomEase = void 0;
let CustomWiggle = void 0;
let Draggable = void 0;    // eslint-disable-line no-shadow
let DrawSVGPlugin = void 0;
let EasePack = void 0;
let GSDevTools = void 0;
let InertiaPlugin = void 0;
let MorphSVGPlugin = void 0;
let MotionPathHelper = void 0;
let MotionPathPlugin = void 0;
let Physics2DPlugin = void 0;
let PhysicsPropsPlugin = void 0;
let PixiPlugin = void 0;
let ScrambleTextPlugin = void 0;
let ScrollToPlugin = void 0;
let ScrollTrigger = void 0;
let SplitText = void 0;
let TextPlugin = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/all.js');

try
{
   const module = await import(modulePath);
   gsap = module.gsap;

   CustomBounce = module.CustomBounce;
   CustomEase = module.CustomEase;
   CustomWiggle = module.CustomWiggle;
   Draggable = module.Draggable;
   DrawSVGPlugin = module.DrawSVGPlugin;
   EasePack = module.EasePack;
   GSDevTools = module.GSDevTools;
   InertiaPlugin = module.InertiaPlugin;
   MorphSVGPlugin = module.MorphSVGPlugin;
   MotionPathHelper = module.MotionPathHelper;
   MotionPathPlugin = module.MotionPathPlugin;
   Physics2DPlugin = module.Physics2DPlugin;
   PhysicsPropsPlugin = module.PhysicsPropsPlugin;
   PixiPlugin = module.PixiPlugin;
   ScrambleTextPlugin = module.ScrambleTextPlugin;
   ScrollToPlugin = module.ScrollToPlugin;
   ScrollTrigger = module.ScrollTrigger;
   SplitText = module.SplitText;
   TextPlugin = module.TextPlugin;

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(easingFuncs))
   {
      const name = `svelte-${prop}`;
      gsap.registerEase(name, easingFuncs[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

/**
 * Internal helper class for timeline implementation. Performs error checking before applying any timeline actions.
 */
class TimelineImpl
{
   static add(timeline, entry, cntr)
   {
      const child = entry.child;
      const position = entry.position;

      if (child === void 0)
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'child' property.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.add(child, position);
   }

   static addLabel(timeline, entry, cntr)
   {
      const label = entry.label;
      const position = entry.position;

      if (typeof label !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'label' is not a string.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.addLabel(label, position);
   }

   static addPause(timeline, entry, cntr)
   {
      const position = entry.position;
      const callback = entry.callback;
      const params = entry.params;

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      if (callback !== void 0 && typeof callback !== 'function')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'params' is not an array.`);
      }

      timeline.addPause(position, callback, params);
   }

   static call(timeline, entry, cntr)
   {
      const callback = entry.callback;
      const params = entry.params;
      const position = entry.position;

      if (typeof callback !== 'function')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'params' is not an array.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.call(callback, params, position);
   }
}

/**
 * Stores the entry types that potentially use the generated initial position data.
 *
 * @type {Set<string>}
 */
const s_TYPES_POSITION = new Set(['from', 'fromTo', 'set', 'to']);

/**
 * Stores the Position properties in order to create the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_KEYS = new Set([
 // Main keys
 'left', 'top', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'width', 'height',
  'rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ', 'zIndex',

 // Aliases
 'rotation'
]);

/**
 * Stores the seen Position properties when building the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_PROPS = new Set();

/**
 * Defines the options for {@link Position.get}.
 *
 * @type {{keys: Set<string>, numeric: boolean}}
 */
const s_POSITION_GET_OPTIONS = {
   keys: s_POSITION_PROPS,
   numeric: true
};

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapPosition
{
   /**
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @returns {object} GSAP tween
    */
   static from(tjsPosition, options, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = Array.isArray(tjsPosition) ?
       s_GET_POSITIONINFO_ARRAY(tjsPosition, vars, filter).positionData :
        s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.from(positionData, vars);
   }

   /**
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @returns {object} GSAP tween
    */
   static fromTo(tjsPosition, options, fromVars, toVars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in fromVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in toVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = Array.isArray(tjsPosition) ?
       s_GET_POSITIONINFO_ARRAY(tjsPosition, toVars, filter).positionData :
        s_GET_POSITIONINFO(tjsPosition, toVars, filter).positionData;

      return gsap.fromTo(positionData, fromVars, toVars);
   }

   /**
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(tjsPosition, options, key, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = Array.isArray(tjsPosition) ?
       s_GET_POSITIONINFO_ARRAY(tjsPosition, vars, filter).positionData :
        s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.quickTo(positionData, key, vars);
   }

   /**
    * @param {Position|Position[]}           tjsPosition - Position instance.
    *
    * @param {object|object[]|Function}      arg1 - Either an object defining timelineOptions or an array of gsapData
    *                                               entries.
    *
    * @param {object[]|Function|GsapPositionOptions}  [arg2] - When arg1 is defined as an object; arg2 defines an array
    *                                                          of gsapData entries.
    *
    * @param {GsapPositionOptions}           [arg3] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(tjsPosition, arg1, arg2, arg3)
   {
      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = typeof arg1 === 'object' ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = Array.isArray(arg1) || typeof arg1 === 'function' ? arg1 : arg2;

      /** @type {GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      // TODO Figure out this check!
      // if (!Array.isArray(gsapData) || typeof gsapData !== 'function')
      // {
      //    throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an array or function.`);
      // }

      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      const positionInfo = Array.isArray(tjsPosition) ?
       s_GET_POSITIONINFO_ARRAY(tjsPosition, timelineOptions, filter, gsapData) :
        s_GET_POSITIONINFO(tjsPosition, timelineOptions, filter, gsapData);

      const timeline = gsap.timeline(timelineOptions);

      // If the passed in gsapData is a function then we know we are working w/ individual positions.
      if (typeof gsapData === 'function')
      {
         const optionPosition = options?.position;

         if (typeof optionPosition === 'function')
         {
            const positionCallbackData = {
               index: void 0,
               positionData: void 0,
               element: void 0
            };

            for (let index = 0; index < positionInfo.gsapData.length; index++)
            {
               const subTimeline = gsap.timeline();

               positionCallbackData.index = index;
               positionCallbackData.positionData = positionInfo.positionData[index];
               positionCallbackData.element = positionInfo.elements[index];

               const positionTimeline = optionPosition(positionCallbackData);

               this.handleGSAPDATA(positionInfo.gsapData[index], subTimeline, positionInfo.positionData[index],
                positionInfo.elements[index]);

               timeline.add(subTimeline, positionTimeline);
            }
         }
         else
         {
            for (let index = 0; index < positionInfo.gsapData.length; index++)
            {
               const subTimeline = gsap.timeline();

               this.handleGSAPDATA(positionInfo.gsapData[index], subTimeline, positionInfo.positionData[index],
                positionInfo.elements[index]);

               timeline.add(subTimeline, optionPosition);
            }
         }
      }
      else
      {
         this.handleGSAPDATA(positionInfo.gsapData, timeline, positionInfo.positionData, positionInfo.elements);
      }

      return timeline;
   }

   static handleGSAPDATA(gsapData, timeline, positionData, elements)
   {
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         const type = entry.type;

         switch (type)
         {
            case 'add':
               TimelineImpl.add(timeline, entry, cntr);
               break;

            case 'addLabel':
               TimelineImpl.addLabel(timeline, entry, cntr);
               break;

            case 'addPause':
               TimelineImpl.addPause(timeline, entry, cntr);
               break;

            case 'call':
               TimelineImpl.call(timeline, entry, cntr);
               break;

            case 'from':
               timeline.from(s_GET_TARGET(positionData, elements, entry, cntr), entry.vars, entry.position);
               break;

            case 'fromTo':
               timeline.fromTo(s_GET_TARGET(positionData, elements, entry, cntr), entry.fromVars, entry.toVars,
                entry.position);
               break;

            case 'set':
               timeline.set(s_GET_TARGET(positionData, elements, entry, cntr), entry.vars, entry.position);
               break;

            case 'to':
               timeline.to(s_GET_TARGET(positionData, elements, entry, cntr), entry.vars, entry.position);
               break;

            default:
               throw new Error(`GsapCompose.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }
   }

   /**
    * @param {Position|Position[]} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @returns {object} GSAP tween
    */
   static to(tjsPosition, options, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = Array.isArray(tjsPosition) ?
       s_GET_POSITIONINFO_ARRAY(tjsPosition, vars, filter).positionData :
        s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.to(positionData, vars);
   }
}

/**
 * Internal helper class for timeline implementation. Performs error checking before applying any timeline actions.
 */
class TimelinePositionImpl
{
   /**
    * Validates data for Position related properties: 'from', 'fromTo', 'set', 'to'. Also adds all properties found
    * in Gsap entry data to s_POSITION_PROPS, so that just the properties being animated are added to animated
    * `positionData`.
    *
    * @param {object}   entry - Gsap entry data.
    *
    * @param {number}   cntr - Current index.
    */
   static validatePositionProp(entry, cntr)
   {
      const position = entry.position;

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(
          `GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      switch (entry.type)
      {
         case 'from':
         case 'to':
         case 'set':
         {
            const vars = entry.vars;

            if (typeof vars !== 'object')
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'vars' object.`);
            }

            // Only retrieve the Position keys that are in vars.
            for (const prop in vars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            break;
         }

         case 'fromTo':
         {
            const fromVars = entry.fromVars;
            const toVars = entry.toVars;

            if (typeof fromVars !== 'object')
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
            }

            if (typeof toVars !== 'object')
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
            }

            // Only retrieve the Position keys that are in fromVars / toVars.
            for (const prop in fromVars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            for (const prop in toVars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            break;
         }
      }
   }
}

function s_VALIDATE_GSAP_DATA_ENTRY(gsapData)
{
   for (let cntr = 0; cntr < gsapData.length; cntr++)
   {
      const entry = gsapData[cntr];

      if (typeof entry !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData[${cntr}]' is not an object.`);
      }

      // Determine if any of the entries has a position related type and targets position by explicit value or by
      // default. Build up only the position properties that are being modified by all entries. This allows maximum
      // composability when animating multiple non-overlapping properties in a timeline.
      if (s_TYPES_POSITION.has(entry.type) && (entry.target === void 0 || entry.target === 'position'))
      {
         TimelinePositionImpl.validatePositionProp(entry, cntr);
      }
   }
}

/**
 * @param {Position|Position[]}  tjsPositions -
 *
 * @param {object}               vars -
 *
 * @param {Function}             filter -
 *
 * @param {object[]|Function}    [gsapData] -
 *
 * @returns {PositionInfo} A PositionInfo instance.
 */
function s_GET_POSITIONINFO_ARRAY(tjsPositions, vars, filter, gsapData)
{
   /** @type {PositionInfo} */
   const data = {
      position: [],
      positionData: [],
      elements: [],
      gsapData: void 0,
   };

   // If gsapData is a function invoke it w/ the current Position instance and position data to retrieve a unique
   // gsapData object. If null / undefined is returned this entry is ignored.
   if (typeof gsapData === 'function')
   {
      data.gsapData = [];

      let cntr = 0;

      for (const entry of tjsPositions)
      {
         const finalGsapData = gsapData(entry, cntr++);

         if (typeof finalGsapData !== 'object')
         {
            throw new TypeError(`GsapCompose error: gsapData callback function failed to return an object.`);
         }

         s_VALIDATE_GSAP_DATA_ENTRY(finalGsapData);

         data.gsapData.push(finalGsapData);
      }
   }
   else if (Array.isArray(gsapData))
   {
      s_VALIDATE_GSAP_DATA_ENTRY(gsapData);

      data.gsapData = gsapData;
   }

   const existingOnUpdate = vars.onUpdate;

   for (const entry of tjsPositions)
   {
      const position = entry instanceof Position ? entry : entry.position;
      const positionData = position.get({ immediateElementUpdate: true }, s_POSITION_GET_OPTIONS);

      data.position.push(position);
      data.positionData.push(positionData);
      data.elements.push(position.element);
   }

   if (typeof filter === 'function')
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < data.position.length; cntr++)
            {
               data.position[cntr].set(filter(data.positionData[cntr]));
            }
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < data.position.length; cntr++)
            {
               data.position[cntr].set(filter(data.positionData[cntr]));
            }
         };
      }
   }
   else
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < data.position.length; cntr++)
            {
               data.position[cntr].set(data.positionData[cntr]);
            }
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < data.position.length; cntr++)
            {
               data.position[cntr].set(data.positionData[cntr]);
            }
         };
      }
   }

   return data;
}

/**
 * @param {Position}             tjsPosition -
 *
 * @param {object}               vars -
 *
 * @param {Function}             filter -
 *
 * @param {object[]|Function}    [gsapData] -
 *
 * @returns {PositionInfo} A PositionInfo instance.
 */
function s_GET_POSITIONINFO(tjsPosition, vars, filter, gsapData)
{
   /** @type {PositionInfo} */
   const data = {
      position: [tjsPosition],
      positionData: [],
      elements: [tjsPosition.element],
      gsapData: void 0
   };

   // If gsapData is a function invoke it w/ the current Position instance and position data to retrieve a unique
   // gsapData object. If null / undefined is returned this entry is ignored.
   if (typeof gsapData === 'function')
   {
      data.gsapData = [];

      const finalGsapData = gsapData(tjsPosition, 0);

      if (typeof finalGsapData !== 'object')
      {
         throw new TypeError(`GsapCompose error: gsapData callback function failed to return an object.`);
      }

      s_VALIDATE_GSAP_DATA_ENTRY(finalGsapData);

      data.gsapData.push(finalGsapData);
   }
   else if (Array.isArray(gsapData))
   {
      s_VALIDATE_GSAP_DATA_ENTRY(gsapData);

      data.gsapData = gsapData;
   }

   const positionData = tjsPosition.get({ immediateElementUpdate: true }, s_POSITION_GET_OPTIONS);

   data.positionData.push(positionData);

   const existingOnUpdate = vars.onUpdate;

   if (typeof filter === 'function')
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            tjsPosition.set(filter(positionData));
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () => tjsPosition.set(filter(positionData));
      }
   }
   else
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            tjsPosition.set(positionData);
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () => tjsPosition.set(positionData);
      }
   }

   return data;
}

/**
 * Gets the target from GSAP data entry.
 *
 * @param {PositionDataExtended|PositionDataExtended[]}  positionData - PositionInfo data.
 *
 * @param {object}         entry - Gsap data entry.
 *
 * @param {number}         cntr - Current GSAP data entry index.
 *
 * @returns {PositionDataExtended|PositionDataExtended[]|HTMLElement|HTMLElement[]} The target object or HTMLElement.
 */
function s_GET_TARGET(positionData, elements, entry, cntr)
{
   const target = entry.target ?? 'position';

   switch (target)
   {
      case 'position':
         return positionData;
      case 'element':
         return elements;
      default:
         throw new Error(`GsapCompose.timeline error: 'gsapData[${cntr}]' unknown 'target' - '${target}'.`);
   }
}

/**
 * @typedef {object} PositionInfo
 *
 * @property {Position[]}                 position -
 *
 * @property {PositionDataExtended[]}     positionData -
 *
 * @property {HTMLElement[]}              elements -
 *
 * @property {object[]|Array<object[]>}   [gsapData] -
 */

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapCompose
{
   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population for Position tweens.
    *
    * @returns {object} GSAP tween
    */
   static from(target, vars, options)
   {
      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('from', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.from(target, vars);
   }

   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP tween
    */
   static fromTo(target, fromVars, toVars, options)
   {
      if (typeof fromVars !== 'object')
      {
         throw new TypeError(`GsapCompose.fromTo error: 'fromVars' is not an object.`);
      }

      if (typeof toVars !== 'object')
      {
         throw new TypeError(`GsapCompose.fromTo error: 'toVars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('fromTo', target, options, fromVars, toVars);

      return positionTween !== void 0 ? positionTween : gsap.fromTo(target, fromVars, toVars);
   }

   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(target, key, vars, options)
   {
      if (typeof key !== 'string')
      {
         throw new TypeError(`GsapCompose.quickTo error: 'key' is not a string.`);
      }

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.quickTo error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionQuickTo = s_DISPATCH_POSITION('quickTo', target, options, key, vars);

      return positionQuickTo !== void 0 ? positionQuickTo : gsap.quickTo(target, key, vars);
   }

   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object|object[]}   arg1 - Either an object defining timelineOptions or an array of gsapData entries.
    *
    * @param {object[]|Function} [arg2] - When arg1 is defined as an object; arg2 defines an array of gsapData entries.
    *
    * @param {GsapPositionOptions} [arg3] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(target, arg1, arg2, arg3)
   {
      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTimeline = s_DISPATCH_POSITION('timeline', target, arg1, arg2, arg3);
      if (positionTimeline !== void 0) { return positionTimeline; }

      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = typeof arg1 === 'object' ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = Array.isArray(arg1) ? arg1 : arg2;

      /** @type {GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!Array.isArray(gsapData))
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an array.`);
      }

      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      // Validate gsapData.
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         if (typeof entry !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: 'gsapData[${cntr}]' is not an object.`);
         }

         s_VALIDATE_OPTIONS(entry, cntr);
      }

      const timeline = gsap.timeline(timelineOptions);

      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         const type = entry.type;

         switch (type)
         {
            case 'add':
               TimelineImpl.add(timeline, entry, cntr);
               break;

            case 'addLabel':
               TimelineImpl.addLabel(timeline, entry, cntr);
               break;

            case 'addPause':
               TimelineImpl.addPause(timeline, entry, cntr);
               break;

            case 'call':
               TimelineImpl.call(timeline, entry, cntr);
               break;

            case 'from':
               timeline.from(target, entry.vars, entry.position);
               break;

            case 'fromTo':
               timeline.fromTo(target, entry.fromVars, entry.toVars, entry.position);
               break;

            case 'set':
               timeline.set(target, entry.vars, entry.position);
               break;

            case 'to':
               timeline.to(target, entry.vars, entry.position);
               break;

            default:
               throw new Error(`GsapCompose.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }

      return timeline;
   }

   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP tween
    */
   static to(target, vars, options)
   {
      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.to error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('to', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.to(target, vars);
   }
}

function s_DISPATCH_POSITION(operation, target, options, arg1, arg2)
{
   if (target instanceof Position)
   {
      return GsapPosition[operation](target, options, arg1, arg2);
   }
   else if (typeof target === 'object' && target.position instanceof Position)
   {
      return GsapPosition[operation](target.position, options, arg1, arg2);
   }
   else if (Array.isArray(target))
   {
      let hasPosition = false;
      let allPosition = true;

      for (const entry of target)
      {
         const isPosition = entry instanceof Position || entry?.position instanceof Position;

         hasPosition |= isPosition;
         if (!isPosition) { allPosition = false; }
      }

      if (hasPosition)
      {
         if (!allPosition)
         {
            throw new TypeError(
             `GsapCompose.${operation} error: 'target' is an array but all entries are not a Position instance.`);
         }
         else
         {
            return GsapPosition[operation](target, options, arg1, arg2);
         }
      }
   }

   return void 0;
}

/**
 * Validates data for Position related properties: 'from', 'fromTo', 'set', 'to'. Also adds all properties found
 * in Gsap entry data to s_POSITION_PROPS, so that just the properties being animated are added to animated
 * `positionData`.
 *
 * @param {object}   entry - Gsap entry data.
 *
 * @param {number}   cntr - Current index.
 */
function s_VALIDATE_OPTIONS(entry, cntr)
{
   const position = entry.position;

   if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
   {
      throw new TypeError(
       `GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
   }

   switch (entry.type)
   {
      case 'from':
      case 'to':
      case 'set':
      {
         const vars = entry.vars;

         if (typeof vars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'vars' object.`);
         }

         break;
      }

      case 'fromTo':
      {
         const fromVars = entry.fromVars;
         const toVars = entry.toVars;

         if (typeof fromVars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
         }

         if (typeof toVars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
         }

         break;
      }
   }
}

/**
 * @typedef {object} GsapPositionOptions
 *
 * @property {Function} [filter] - An optional filter function to adjust position data in `onUpdate` callbacks. This is
 *                                 useful if you need to transform any data from GSAP / plugins into data Position can
 *                                 utilize.
 *
 * @property {Iterable<string>} [initialProps] - Provides an iterable of property keys to assign to initial position
 *                                               data. This is useful when you are using GSAP plugins that manipulate
 *                                               data automatically; Ex. MotionPathPlugin
 */

/**
 * @typedef {string|object|Position|Position[]|Array<HTMLElement|object>} GSAPTarget
 */

export { CustomBounce, CustomEase, CustomWiggle, Draggable, DrawSVGPlugin, EasePack, GSDevTools, GsapCompose, InertiaPlugin, MorphSVGPlugin, MotionPathHelper, MotionPathPlugin, Physics2DPlugin, PhysicsPropsPlugin, PixiPlugin, ScrambleTextPlugin, ScrollToPlugin, ScrollTrigger, SplitText, TextPlugin, gsap };
//# sourceMappingURL=index.js.map
