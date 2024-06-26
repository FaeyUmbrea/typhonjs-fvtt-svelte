import { TJSSvelteConfigUtil }   from '#runtime/svelte/util';

import { isApplicationShell }    from './isApplicationShell.js';

import { isObject }              from '#runtime/util/object';

/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {object}            [opts] - Optional parameters.
 *
 * @param {object}            [opts.app] - The target application
 *
 * @param {HTMLElement}       [opts.template] - Any HTML template.
 *
 * @param {import('#runtime/svelte/util').TJSSvelteConfig}  [opts.config] - Svelte component options
 *
 * @param {Function}          [opts.elementRootUpdate] - A callback to assign to the external context.
 *
 * @returns {import('#svelte-fvtt/application').SvelteData} The config + instantiated Svelte component.
 */
export function loadSvelteConfig({ app, template, config, elementRootUpdate } = {})
{
   const svelteOptions = isObject(config.options) ? config.options : {};

   let target;

   // A specific HTMLElement to append Svelte component.
   if (config.target instanceof HTMLElement)
   {
      target = config.target;
   }
   // A string target defines a selector to find in existing HTML.
   else if (template instanceof HTMLElement && typeof config.target === 'string')
   {
      target = template.querySelector(config.target);
   }
   else                                            // No target defined, create a document fragment.
   {
      const activeWindow = app?.reactive?.activeWindow ?? globalThis;
      target = activeWindow.document.createDocumentFragment();
   }

   if (target === void 0)
   {
      console.log(
       `%c[TRL] loadSvelteConfig error - could not find target selector, '${config.target}', for config:\n`,
       'background: rgb(57,34,34)', config);

      throw new Error();
   }

   const NewSvelteComponent = config.class;

   const svelteConfig = TJSSvelteConfigUtil.parseConfig({ ...config, target }, app);

   const externalContext = svelteConfig.context.get('#external');

   // Inject the Foundry application instance and `elementRootUpdate` to the external context.
   externalContext.application = app;
   externalContext.elementRootUpdate = elementRootUpdate;
   externalContext.sessionStorage = app.reactive.sessionStorage;

   let eventbus;

   // Potentially inject any TyphonJS eventbus and track the proxy in the SvelteData instance.
   if (isObject(app._eventbus) && typeof app._eventbus.createProxy === 'function')
   {
      eventbus = app._eventbus.createProxy();
      externalContext.eventbus = eventbus;
   }

   // Seal external context so that it can't be extended.
   Object.seal(externalContext);

   // TODO: Remove deprecation warning in the future -----------------------------------------------------------------

   svelteConfig.context.set('external', new Proxy({}, {
      get(targetUnused, prop)
      {
         console.warn(`[TRL] Deprecation warning: Please change getContext('external') to getContext('#external').`);
         return externalContext[prop];
      }
   }));

   // TODO: Remove deprecation warning in the future -----------------------------------------------------------------

   // Create the Svelte component.
   /**
    * @type {import('svelte').SvelteComponent}
    */
   const component = new NewSvelteComponent(svelteConfig);

   // Set any eventbus to the config.
   svelteConfig.eventbus = eventbus;

   /**
    * @type {HTMLElement}
    */
   let element;

   // We can directly get the root element from components which follow the application store contract.
   if (isApplicationShell(component))
   {
      element = component.elementRoot;
   }

   // Detect if target is a synthesized DocumentFragment with a child element. Child elements will be present
   // if the Svelte component mounts and renders initial content into the document fragment.
   if (target instanceof DocumentFragment && target.firstElementChild)
   {
      if (element === void 0) { element = target.firstElementChild; }
      template.append(target);
   }
   else if (config.target instanceof HTMLElement && element === void 0)
   {
      if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== 'string')
      {
         console.log(
          `%c[TRL] loadSvelteConfig error - HTMLElement target with no 'selectorElement' defined.\n` +
          `\nNote: If configuring an application shell and directly targeting a HTMLElement did you bind an` +
          `'elementRoot' and include '<svelte:options accessors={true}/>'?\n` +
          `\nOffending config:\n`, 'background: rgb(57,34,34)', config);

         throw new Error();
      }

      // The target is an HTMLElement so find the Application element from `selectorElement` option.
      element = target.querySelector(svelteOptions.selectorElement);

      if (element === null || element === void 0)
      {
         console.log(
          `%c[TRL] loadSvelteConfig error - HTMLElement target with 'selectorElement', '${
           svelteOptions.selectorElement}', not found for config:\n`,
          'background: rgb(57,34,34)', config);

         throw new Error();
      }
   }

   // If the configuration / original target is an HTML element then do not inject HTML.
   const injectHTML = !(config.target instanceof HTMLElement);

   return { config: svelteConfig, component, element, injectHTML };
}
