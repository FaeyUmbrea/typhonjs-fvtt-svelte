import {
   isApplicationShell,
   parseSvelteConfig }  from '@typhonjs-fvtt/svelte/util';

/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {SvelteFormApplication} app - The application
 *
 * @param {JQuery}            html - The inserted HTML.
 *
 * @param {object}            config - Svelte component options
 *
 * @param {Function}          elementRootUpdate - A callback to assign to the external context.
 *
 * @returns {SvelteData} The config + instantiated Svelte component.
 */
export function loadSvelteConfig(app, html, config, elementRootUpdate)
{
   const svelteOptions = typeof config.options === 'object' ? config.options : {};

   let target;

   if (config.target instanceof HTMLElement)       // A specific HTMLElement to append Svelte component.
   {
      target = config.target;
   }
   else if (typeof config.target === 'string')     // A string target defines a selector to find in existing HTML.
   {
      target = html.find(config.target).get(0);
   }
   else                                            // No target defined, create a document fragment.
   {
      target = document.createDocumentFragment();
   }

   if (target === void 0)
   {
      throw new Error(
       `SvelteFormApplication - s_LOAD_CONFIG - could not find target selector: ${config.target} for config:\n${
        JSON.stringify(config)}`);
   }

   const NewSvelteComponent = config.class;

   const svelteConfig = parseSvelteConfig({ ...config, target }, app);

   const externalContext = svelteConfig.context.get('external');

   // Inject the Foundry application instance and `elementRootUpdate` to the external context.
   externalContext.application = app;
   externalContext.elementRootUpdate = elementRootUpdate;

   let eventbus;

   // Potentially inject any TyphonJS eventbus and track the proxy in the SvelteData instance.
   if (typeof app._eventbus === 'object' && typeof app._eventbus.createProxy === 'function')
   {
      eventbus = app._eventbus.createProxy();
      externalContext.eventbus = eventbus;
   }

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

   // Detect if target is a synthesized DocumentFragment with an child element. Child elements will be present
   // if the Svelte component mounts and renders initial content into the document fragment.
   if (config.target instanceof DocumentFragment && target.firstElementChild)
   {
      if (element === void 0) { element = target.firstElementChild; }
      html.append(target);
   }
   else if (config.target instanceof HTMLElement && element === void 0)
   {
      if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== 'string')
      {
         throw new Error(
          `SvelteFormApplication - s_LOAD_CONFIG - HTMLElement target with no 'selectorElement' defined for config:\n${
           JSON.stringify(config)}`);
      }

      // The target is an HTMLElement so find the Application element from `selectorElement` option.
      element = target.querySelector(svelteOptions.selectorElement);

      if (element === null || element === void 0)
      {
         throw new Error(
          `SvelteFormApplication - s_LOAD_CONFIG - HTMLElement target - could not find 'selectorElement' for config:\n${
           JSON.stringify(config)}`);
      }
   }

   // If the configuration / original target is an HTML element then do not inject HTML.
   const injectHTML = !(config.target instanceof HTMLElement);

   return { config: svelteConfig, component, element, injectHTML };
}
