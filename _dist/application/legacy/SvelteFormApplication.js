import { derived, writable }  from "svelte/store";

import {
   propertyStore,
   subscribeIgnoreFirst }     from '@typhonjs-fvtt/svelte/store';

import {
   hasGetter,
   isApplicationShell,
   outroAndDestroy,
   parseSvelteConfig,
   safeAccess,
   safeSet }                  from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a Svelte aware extension to FormApplication to control the app lifecycle appropriately. You can
 * declaratively load one or more components from `defaultOptions`.
 */
export class SvelteFormApplication extends FormApplication
{
   /**
    * Stores the first mounted component which follows the application shell contract.
    *
    * @type {MountedAppShell[]|null[]} Application shell.
    */
   #applicationShellHolder = [null];

   /**
    * Stores the target element which may not necessarily be the main element.
    *
    * @type {HTMLElement}
    */
   #elementTarget = null;

   /**
    * Stores the content element which is set for application shells.
    *
    * @type {HTMLElement}
    */
   #elementContent = null;

   /**
    * Stores initial z-index from `_renderOuter` to set to target element / Svelte component.
    *
    * @type {number}
    */
   #initialZIndex = 95;

   /**
    * Contains the Svelte stores and reactive accessors.
    *
    * @type {SvelteReactive}
    */
   #reactive;

   /**
    * Stores SvelteData entries with instantiated Svelte components.
    *
    * @type {SvelteData[]}
    */
   #svelteData = [];

   /**
    * Provides a helper class that combines multiple methods for interacting with the mounted components tracked in
    * {@link SvelteData}.
    *
    * @type {GetSvelteData}
    */
   #getSvelteData = new GetSvelteData(this.#applicationShellHolder, this.#svelteData);

   /**
    * Contains methods to interact with the Svelte stores.
    *
    * @type {SvelteStores}
    */
   #stores;

   /**
    * @inheritDoc
    */
   constructor(object, options)
   {
      super(object, options);

      this.#reactive = new SvelteReactive(this);

      this.#stores = this.#reactive.initialize();
   }

   /**
    * Specifies the default options that SvelteFormApplication supports.
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         draggable: true,              // If true then application shells are draggable.
         headerButtonNoClose: false,   // If true then the close header button is removed.
         headerButtonNoLabel: false,   // If true then header button labels are removed for application shells.
         defaultCloseAnimation: true,  // If false the Foundry JQuery close animation is not run.
         setPosition: true,            // If false then `setPosition` does not take effect.
         suppressFormInit: false,      // If true automatic suppression of core FormApplication methods is enabled.
         zIndex: null                  // When set the zIndex is manually controlled.
      });
   }

   /**
    * Returns the content element if an application shell is mounted.
    *
    * @returns {HTMLElement} Content element.
    */
   get elementContent() { return this.#elementContent; }

   /**
    * Returns the target element or main element if no target defined.
    *
    * @returns {HTMLElement} Target element.
    */
   get elementTarget() { return this.#elementTarget; }

   /**
    * Returns the reactive accessors & Svelte stores for SvelteFormApplication.
    *
    * @returns {SvelteReactive} The reactive accessors & Svelte stores.
    */
   get reactive() { return this.#reactive; }

   /**
    * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
    *
    * @returns {GetSvelteData} GetSvelteData
    */
   get svelte() { return this.#getSvelteData; }

   /**
    * In this case of when a template is defined in app options `html` references the inner HTML / template. However,
    * to activate classic v1 tabs for a Svelte component the element target is passed as an array simulating JQuery as
    * the element is retrieved immediately and the core listeners use standard DOM queries.
    *
    * Note: App options `suppressFormInit` prevents activating core listeners. Potentially suppress form initialization.
    * Useful when a Svelte application needs to use a FormApplication like when creating a game / config settings app.
    *
    * @inheritDoc
    * @protected
    * @ignore
    */
   _activateCoreListeners(html)
   {
      if (this.options.suppressFormInit) { return; }

      super._activateCoreListeners(typeof this.options.template === 'string' ? html : [this.#elementTarget]);
   }

   /**
    * Provide an override to set reactive z-index after calling super method.
    */
   bringToTop()
   {
      super.bringToTop();

      const z = document.defaultView.getComputedStyle(this.element[0]).zIndex;

      this.reactive.zIndex = z === 'null' || z === null ? null : parseInt(z, 10);
   }

   /**
    * Potentially suppress form initialization. Useful when a Svelte application needs to use a FormApplication like
    * when creating a game / config settings app.
    *
    * @inheritDoc
    * @protected
    * @ignore
    */
   async _updateObject(event, formData) // eslint-disable-line no-unused-vars
   {
      if (this.options.suppressFormInit)
      {
         event.preventDefault();
         return;
      }

      return super._updateObject(event, formData);
   }

   /**
    * Note: This method is fully overridden and duplicated as Svelte components need to be destroyed manually and the
    * best visual result is to destroy them after the default JQuery slide up animation occurs, but before the element
    * is removed from the DOM.
    *
    * If you destroy the Svelte components before the slide up animation the Svelte elements are removed immediately
    * from the DOM. The purpose of overriding ensures the slide up animation is always completed before
    * the Svelte components are destroyed and then the element is removed from the DOM.
    *
    * Close the application and un-register references to it within UI mappings.
    * This function returns a Promise which resolves once the window closing animation concludes
    *
    * @param {object}   options - Optional parameters.
    *
    * @param {boolean}  options.force - Force close regardless of render state.
    *
    * @returns {Promise<void>}    A Promise which resolves once the application is closed.
    * @ignore
    */
   async close(options = {})
   {
      const states = Application.RENDER_STATES;
      if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) { return; }

      // Unsubscribe from any local stores.
      this.#stores.unsubscribe();

      /**
       * @ignore
       */
      this._state = states.CLOSING;

      /**
       * Get the element.
       *
       * @type {JQuery}
       */
      const el = $(this.#elementTarget);
      if (!el) { return this._state = states.CLOSED; }

      // Dispatch Hooks for closing the base and subclass applications
      for (const cls of this.constructor._getInheritanceChain())
      {
         /**
          * A hook event that fires whenever this Application is closed.
          *
          * @param {Application} app                     The Application instance being closed
          *
          * @param {jQuery[]} html                       The application HTML when it is closed
          *
          * @function closeApplication
          *
          * @memberof hookEvents
          */
         Hooks.call(`close${cls.name}`, this, el);
      }

      // If options `defaultCloseAnimation` is false then do not execute the standard JQuery slide up animation.
      // This allows Svelte components to provide any out transition. Application shells will automatically set
      // `defaultCloseAnimation` based on any out transition set or unset.
      const animate = typeof this.options.defaultCloseAnimation === 'boolean' ? this.options.defaultCloseAnimation :
       true;

      if (animate)
      {
         // Await on JQuery to slide up the main element.
         el[0].style.minHeight = '0';
         await new Promise((resolve) => { el.slideUp(200, () => resolve()); });
      }

      // Stores the Promises returned from running outro transitions and destroying each Svelte component.
      const svelteDestroyPromises = [];

      // Manually invoke the destroy callbacks for all Svelte components.
      for (const entry of this.#svelteData)
      {
         // Use `outroAndDestroy` to run outro transitions before destroying.
         svelteDestroyPromises.push(outroAndDestroy(entry.component));

         // If any proxy eventbus has been added then remove all event registrations from the component.
         const eventbus = entry.config.eventbus;
         if (typeof eventbus === 'object' && typeof eventbus.off === 'function')
         {
            eventbus.off();
            entry.config.eventbus = void 0;
         }
      }

      // Await all Svelte components to destroy.
      await Promise.all(svelteDestroyPromises);

      // Reset SvelteData like this to maintain reference to GetSvelteData / `this.svelte`.
      this.#svelteData.length = 0;

      // Use JQuery to remove `this._element` from the DOM. Most SvelteComponents have already removed it.
      el.remove();

      // Clean up data
      this.#applicationShellHolder[0] = null;
      /**
       * @ignore
       */
      this._element = null;
      this.#elementContent = null;
      this.#elementTarget = null;
      delete ui.windows[this.appId];
      /**
       * @ignore
       */
      this._minimized = false;
      /**
       * @ignore
       */
      this._scrollPositions = null;
      this._state = states.CLOSED;

      // Update the minimized UI store options.
      this.#stores.uiOptionsUpdate((storeOptions) => foundry.utils.mergeObject(storeOptions, {
         minimized: this._minimized
      }));
   }

   /**
    * Inject the Svelte components defined in `this.options.svelte`. The Svelte component can attach to the existing
    * pop-out of Application or provide no template and render into a document fragment which is then attached to the
    * DOM.
    *
    * @param {JQuery} html -
    *
    * @inheritDoc
    * @ignore
    */
   _injectHTML(html)
   {
      if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte))
      {
         throw new Error(
          'SvelteFormApplication - _injectHTML - A popout app with no template can only support one Svelte component.');
      }

      // Make sure the store is updated with the latest header buttons. Also allows filtering buttons before display.
      this.reactive.updateHeaderButtons();

      // Create a function to generate a callback for Svelte components to invoke to update the tracked elements for
      // application shells in the rare cases that the main element root changes. The update is only trigged on
      // successive changes of `elementRoot`. Returns a boolean to indicate the element roots are updated.
      const elementRootUpdate = () =>
      {
         let cntr = 0;

         return (elementRoot) =>
         {
            if (elementRoot !== null && elementRoot !== void 0 && cntr++ > 0)
            {
               this.#updateApplicationShell();
               return true;
            }

            return false;
         };
      };

      if (Array.isArray(this.options.svelte))
      {
         for (const svelteConfig of this.options.svelte)
         {
            const svelteData = s_LOAD_CONFIG(this, html, svelteConfig, elementRootUpdate);

            if (isApplicationShell(svelteData.component))
            {
               if (this.svelte.applicationShell !== null)
               {
                  throw new Error(
                   `SvelteFormApplication - _injectHTML - An application shell is already mounted; offending config:
                    ${JSON.stringify(svelteConfig)}`);
               }

               this.#applicationShellHolder[0] = svelteData.component;
            }

            this.#svelteData.push(svelteData);
         }
      }
      else if (typeof this.options.svelte === 'object')
      {
         const svelteData = s_LOAD_CONFIG(this, html, this.options.svelte, elementRootUpdate);

         if (isApplicationShell(svelteData.component))
         {
            // A sanity check as shouldn't hit this case as only one component is being mounted.
            if (this.svelte.applicationShell !== null)
            {
               throw new Error(
                `SvelteFormApplication - _injectHTML - An application shell is already mounted; offending config:
                 ${JSON.stringify(this.options.svelte)}`);
            }

            this.#applicationShellHolder[0] = svelteData.component;
         }

         this.#svelteData.push(svelteData);
      }

      // Detect if this is a synthesized DocumentFragment.
      const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;

      // If any of the Svelte components mounted directly targets an HTMLElement then do not inject HTML.
      let injectHTML = true;
      for (const svelteData of this.#svelteData)
      {
         if (!svelteData.injectHTML) { injectHTML = false; break; }
      }
      if (injectHTML) { super._injectHTML(html); }

      if (this.svelte.applicationShell !== null)
      {
         this._element = $(this.svelte.applicationShell.elementRoot);

         // Detect if the application shell exports an `elementContent` accessor.
         this.#elementContent = hasGetter(this.svelte.applicationShell, 'elementContent') ?
          this.svelte.applicationShell.elementContent : null;

         // Detect if the application shell exports an `elementTarget` accessor.
         this.#elementTarget = hasGetter(this.svelte.applicationShell, 'elementTarget') ?
          this.svelte.applicationShell.elementTarget : null;
      }
      else if (isDocumentFragment) // Set the element of the app to the first child element in order of Svelte components mounted.
      {
         for (const svelteData of this.#svelteData)
         {
            if (svelteData.element instanceof HTMLElement)
            {
               this._element = $(svelteData.element);
               break;
            }
         }
      }

      // Potentially retrieve a specific target element if `selectorTarget` is defined otherwise make the target the
      // main element.
      if (this.#elementTarget === null)
      {
         const element = typeof this.options.selectorTarget === 'string' ?
          this._element.find(this.options.selectorTarget) : this._element;

         this.#elementTarget = element[0];
      }

      // TODO VERIFY THIS CHECK ESPECIALLY `this.#elementTarget.length === 0`.
      if (this.#elementTarget === null || this.#elementTarget === void 0 || this.#elementTarget.length === 0)
      {
         throw new Error(`SvelteFormApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
      }

      // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
      // in `this.#initialZIndex`.
      if (typeof this.options.setPosition === 'boolean' && this.options.setPosition)
      {
         this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
          this.#initialZIndex ?? 95;
      }

      // Subscribe to local store handling.
      this.#stores.subscribe();

      this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget:
       this.#elementTarget });
   }

   /**
    * Provides a mechanism to update the UI options store for minimized.
    *
    * Note: the sanity check is duplicated from {@link Application.maximize} and the store is updated _before_
    * the actual parent method is invoked. This allows application shells to remove / show any resize handlers
    * correctly.
    *
    * @inheritDoc
    * @ignore
    */
   async maximize()
   {
      if (!this.popOut || [false, null].includes(this._minimized)) { return; }

      this.#stores.uiOptionsUpdate((options) => foundry.utils.mergeObject(options, { minimized: false }));

      return super.maximize();
   }

   /**
    * Provides a mechanism to update the UI options store for minimized.
    *
    * Note: the sanity check is duplicated from {@link Application.minimize} and the store is updated _before_
    * the actual parent method is invoked. This allows application shells to remove / show any resize handlers
    * correctly.
    *
    * @inheritDoc
    * @ignore
    */
   async minimize()
   {
      if (!this.rendered || !this.popOut || [true, null].includes(this._minimized)) { return; }

      this.#stores.uiOptionsUpdate((options) => foundry.utils.mergeObject(options, { minimized: true }));

      return super.minimize();
   }

   /**
    * Provides a callback after all Svelte components are initialized.
    *
    * @param {object}      [opts] - Optional parameters.
    *
    * @param {HTMLElement} [opts.element] - HTMLElement container for main application element.
    *
    * @param {HTMLElement} [opts.elementContent] - HTMLElement container for content area of application shells.
    *
    * @param {HTMLElement} [opts.elementTarget] - HTMLElement container for main application target element.
    */
   onSvelteMount({ element, elementContent, elementTarget }) {} // eslint-disable-line no-unused-vars

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @inheritDoc
    * @ignore
    */
   _replaceHTML(element, html)  // eslint-disable-line no-unused-vars
   {
      if (!element.length) { return; }

      this.reactive.updateHeaderButtons();
   }

   /**
    * Provides an override verifying that a new Application being rendered for the first time doesn't have a
    * corresponding DOM element already loaded. This is a check that only occurs when `this._state` is
    * `Application.RENDER_STATES.NONE`. It is useful in particular when SvelteFormApplication has a static ID
    * explicitly set in `this.options.id` and long intro / outro transitions are assigned. If a new application
    * sharing this static ID attempts to open / render for the first time while an existing DOM element sharing
    * this static ID exists then the initial render is cancelled below rather than crashing later in the render
    * cycle (at setPosition).
    *
    * @inheritDoc
    * @protected
    * @ignore
    */
   async _render(force = false, options = {})
   {
      if (this._state === Application.RENDER_STATES.NONE &&
       document.querySelector(`#${this.id}`) instanceof HTMLElement)
      {
         console.warn(`SvelteFormApplication - _render: A DOM element already exists for CSS ID '${this.id
         }'. Cancelling initial render for new application with appId '${this.appId}'.`);

         return;
      }

      return super._render(force, options);
   }

   /**
    * Render the inner application content. Only render a template if one is defined otherwise provide an empty
    * JQuery element.
    *
    * @param {Object} data         The data used to render the inner template
    *
    * @returns {Promise.<JQuery>}   A promise resolving to the constructed jQuery object
    *
    * @protected
    * @ignore
    */
   async _renderInner(data)
   {
      const html = typeof this.template === 'string' ? await renderTemplate(this.template, data) :
       document.createDocumentFragment();

      return $(html);
   }

   /**
    * Stores the initial z-index set in `_renderOuter` which is used in `_injectHTML` to set the target element
    * z-index after the Svelte component is mounted.
    *
    * @returns {Promise<JQuery>} Outer frame / unused.
    * @protected
    * @ignore
    */
   async _renderOuter()
   {
      const html = await super._renderOuter();
      this.#initialZIndex = html.css('zIndex');
      return html;
   }

   /**
    * Modified Application `setPosition` which changes a few aspects from the default {@link Application.setPosition}.
    * The gate on `popOut` is removed, so if manually called popOut applications can use `setPosition`.
    *
    * There are two new options `noHeight` and `noWidth` that respect `width` & `height` style options while still
    * producing a correct position object in return. You may set these options manually, but they are also automatically
    * determined when not explicitly provided by checking if the target element style for `height` or `width` is `auto`.
    *
    * @param {object}               [opts] - Optional parameters.
    *
    * @param {number|null}          [opts.left] - The left offset position in pixels
    *
    * @param {number|null}          [opts.top] - The top offset position in pixels
    *
    * @param {number|string|null}   [opts.width] - The application width in pixels
    *
    * @param {number|string|null}   [opts.height] - The application height in pixels
    *
    * @param {number|null}          [opts.scale] - The application scale as a numeric factor where 1.0 is default
    *
    * @param {boolean}              [opts.noHeight] - When true no element height is modified.
    *
    * @param {boolean}              [opts.noWidth] - When true no element width is modified.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values
    */
   setPosition({ left, top, width, height, scale, noHeight, noWidth } = {})
   {
      // An early out to prevent `setPosition` from taking effect.
      if (typeof this.options.setPosition === 'boolean' && !this.options.setPosition) { return; }

      const el = this.elementTarget;
      const currentPosition = this.position;
      const styles = globalThis.getComputedStyle(el);

      // Automatically determine if noHeightActual from manual value or when `el.style.height` is `auto`.
      const noHeightActual = typeof noHeight === 'boolean' ? noHeight : el.style.height === 'auto';

      // Automatically determine if noWidthActual from manual value or when `el.style.width` is `auto`.
      const noWidthActual = typeof noWidth === 'boolean' ? noWidth : el.style.width === 'auto';

      // Update width if an explicit value is passed, or if no width value is set on the element
      if (!el.style.width || width)
      {
         const tarW = width || el.offsetWidth;
         const minW = parseInt(styles.minWidth) || MIN_WINDOW_WIDTH;
         const maxW = el.style.maxWidth || globalThis.innerWidth;
         currentPosition.width = width = Math.clamped(tarW, minW, maxW);

         if (!noWidthActual) { el.style.width = `${width}px`; }
         if ((width + currentPosition.left) > globalThis.innerWidth) { left = currentPosition.left; }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element
      if (!el.style.height || height)
      {
         const tarH = height || (el.offsetHeight + 1);
         const minH = parseInt(styles.minHeight) || MIN_WINDOW_HEIGHT;
         const maxH = el.style.maxHeight || globalThis.innerHeight;
         currentPosition.height = height = Math.clamped(tarH, minH, maxH);

         if (!noHeightActual) { el.style.height = `${height}px`; }
         if ((height + currentPosition.top) > globalThis.innerHeight + 1) { top = currentPosition.top - 1; }
      }
      height = el.offsetHeight;

      // Update Left
      if ((!el.style.left) || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = left = Math.clamped(tarL, 0, maxL);
         el.style.left = `${left}px`;
      }

      // Update Top
      if ((!el.style.top) || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = top = Math.clamped(tarT, 0, maxT);
         el.style.top = `${currentPosition.top}px`;
      }

      // Update Scale
      if (scale)
      {
         currentPosition.scale = Math.max(scale, 0);
         if (scale === 1) { el.style.transform = ""; }
         else { el.style.transform = `scale(${scale})`; }
      }

      // Return the updated position object
      return currentPosition;
   }

   /**
    * This method is only invoked by the `elementRootUpdate` callback that is added to the external context passed to
    * Svelte components. When invoked it updates the local element roots tracked by SvelteApplication.
    */
   #updateApplicationShell()
   {
      const applicationShell = this.svelte.applicationShell;

      if (applicationShell !== null)
      {
         this._element = $(applicationShell.elementRoot);

         // Detect if the application shell exports an `elementContent` accessor.
         this.#elementContent = hasGetter(applicationShell, 'elementContent') ?
          applicationShell.elementContent : null;

         // Detect if the application shell exports an `elementTarget` accessor.
         this.#elementTarget = hasGetter(applicationShell, 'elementTarget') ?
          applicationShell.elementTarget : null;

         if (this.#elementTarget === null)
         {
            const element = typeof this.options.selectorTarget === 'string' ?
             this._element.find(this.options.selectorTarget) : this._element;

            this.#elementTarget = element[0];
         }

         // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
         // in `this.#initialZIndex`.
         if (typeof this.options.setPosition === 'boolean' && this.options.setPosition)
         {
            this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
             this.#initialZIndex ?? 95;

            super.bringToTop();

            this.setPosition(this.position);
         }

         super._activateCoreListeners([this.#elementTarget]);

         this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget:
          this.#elementTarget });
      }
   }
}

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
function s_LOAD_CONFIG(app, html, config, elementRootUpdate)
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
   externalContext.foundryApp = app;
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

/**
 * Provides a helper class for {@link SvelteFormApplication} by combining all methods that work on the {@link SvelteData[]}
 * of mounted components. This class is instantiated and can be retrieved by the getter `svelte` via SvelteFormApplication.
 */
class GetSvelteData
{
   /**
    * @type {MountedAppShell[]|null[]}
    */
   #applicationShellHolder;

   /**
    * @type {SvelteData[]}
    */
   #svelteData;

   /**
    * Keep a direct reference to the SvelteData array in an associated {@link SvelteFormApplication}.
    *
    * @param {MountedAppShell[]|null[]}  applicationShellHolder - A reference to the MountedAppShell array.
    *
    * @param {SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
    */
   constructor(applicationShellHolder, svelteData)
   {
      this.#applicationShellHolder = applicationShellHolder;
      this.#svelteData = svelteData;

      Object.freeze(this);
   }

   /**
    * Returns any mounted {@link MountedAppShell}.
    *
    * @returns {MountedAppShell|null} Any mounted application shell.
    */
   get applicationShell() { return this.#applicationShellHolder[0]; }

   /**
    * Returns the indexed Svelte component.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte component.
    */
   component(index)
   {
      const data = this.#svelteData[index];
      return typeof data === 'object' ? data?.component : void 0;
   }

   /**
    * Returns the Svelte component entries iterator.
    *
    * @returns {Generator<Array<number|SvelteComponent>>} Svelte component entries iterator.
    * @yields
    */
   *componentEntries()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield [cntr, this.#svelteData[cntr].component];
      }
   }

   /**
    * Returns the Svelte component values iterator.
    *
    * @returns {Generator<SvelteComponent>} Svelte component values iterator.
    * @yields
    */
   *componentValues()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield this.#svelteData[cntr].component;
      }
   }

   /**
    * Returns the indexed SvelteData entry.
    *
    * @param {number}   index -
    *
    * @returns {SvelteData} The loaded Svelte config + component.
    */
   data(index)
   {
      return this.#svelteData[index];
   }

   /**
    * Returns the {@link SvelteData} instance for a given component.
    *
    * @param {object} component - Svelte component.
    *
    * @returns {SvelteData} -  The loaded Svelte config + component.
    */
   dataByComponent(component)
   {
      for (const data of this.#svelteData)
      {
         if (data.component === component) { return data; }
      }

      return void 0;
   }

   /**
    * Returns the SvelteData entries iterator.
    *
    * @returns {IterableIterator<Array<number, SvelteData>>} SvelteData entries iterator.
    */
   dataEntries()
   {
      return this.#svelteData.entries();
   }

   /**
    * Returns the SvelteData values iterator.
    *
    * @returns {IterableIterator<SvelteData>} SvelteData values iterator.
    */
   dataValues()
   {
      return this.#svelteData.values();
   }

   /**
    * Returns the length of the mounted Svelte component list.
    *
    * @returns {number} Length of mounted Svelte component list.
    */
   get length()
   {
      return this.#svelteData.length;
   }
}

/**
 * Contains the reactive functionality / Svelte stores associated with SvelteFormApplication.
 */
class SvelteReactive
{
   /**
    * @type {SvelteFormApplication}
    */
   #application;

   /**
    * @type {boolean}
    */
   #initialized = false;

   /**
    * The Application option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {StoreAppOptions}
    */
   #storeAppOptions;

   /**
    * Stores the update function for `#storeAppOptions`.
    *
    * @type {import('svelte/store').Writable.update}
    */
   #storeAppOptionsUpdate;

   /**
    * The UI option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {StoreUIOptions}
    */
   #storeUIOptions;

   /**
    * Stores the update function for `#storeUIOptions`.
    *
    * @type {import('svelte/store').Writable.update}
    */
   #storeUIOptionsUpdate;

   /**
    * Stores the unsubscribe functions from local store subscriptions.
    *
    * @type {import('svelte/store').Unsubscriber[]}
    */
   #storeUnsubscribe = [];

   /**
    * @param {SvelteFormApplication} application - The host Foundry application.
    */
   constructor(application)
   {
      this.#application = application;

      Object.freeze(this);
   }

   /**
    * Initializes reactive support. Package private for internal use.
    *
    * @returns {SvelteStores} Internal methods to interact with Svelte stores.
    * @package
    */
   initialize()
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      this.#storesInitialize();

      return {
         appOptionsUpdate: this.#storeAppOptionsUpdate,
         uiOptionsUpdate: this.#storeUIOptionsUpdate,
         subscribe: this.#storesSubscribe.bind(this),
         unsubscribe: this.#storesUnsubscribe.bind(this)
      };
   }

   /**
    * Returns the draggable app option.
    *
    * @returns {boolean} Draggable app option.
    */
   get draggable() { return this.#application?.options?.draggable; }

   /**
    * Returns the headerButtonNoClose app option.
    *
    * @returns {boolean} Remove the close the button in header app option.
    */
   get headerButtonNoClose() { return this.#application?.options?.headerButtonNoClose; }

   /**
    * Returns the headerButtonNoLabel app option.
    *
    * @returns {boolean} Remove the labels from buttons in header app option.
    */
   get headerButtonNoLabel() { return this.#application?.options?.headerButtonNoLabel; }

   /**
    * Returns the minimizable app option.
    *
    * @returns {boolean} Minimizable app option.
    */
   get minimizable() { return this.#application?.options?.minimizable; }

   /**
    * @inheritDoc
    */
   get popOut() { return this.#application.popOut; }

   /**
    * Returns the resizable option.
    *
    * @returns {boolean} Resizable app option.
    */
   get resizable() { return this.#application?.options?.resizable; }

   /**
    * Returns the store for app options.
    *
    * @returns {StoreAppOptions} App options store.
    */
   get storeAppOptions() { return this.#storeAppOptions; }

   /**
    * Returns the store for UI options.
    *
    * @returns {StoreUIOptions} UI options store.
    */
   get storeUIOptions() { return this.#storeUIOptions; }

   /**
    * Returns the title accessor from the parent Application class.
    * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.
    *
    * @returns {string} Title.
    */
   get title() { return this.#application.title; }

   /**
    * Returns the zIndex app option.
    *
    * @returns {number} z-index app option.
    */
   get zIndex() { return this.#application?.options?.zIndex; }

   /**
    * Sets `this.options.draggable` which is reactive for application shells.
    *
    * @param {boolean}  draggable - Sets the draggable option.
    */
   set draggable(draggable)
   {
      if (typeof draggable === 'boolean') { this.setOptions('draggable', draggable); }
   }

   /**
    * Sets `this.options.headerButtonNoClose` which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
    */
   set headerButtonNoClose(headerButtonNoClose)
   {
      if (typeof headerButtonNoClose === 'boolean') { this.setOptions('headerButtonNoClose', headerButtonNoClose); }
   }

   /**
    * Sets `this.options.headerButtonNoLabel` which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
    */
   set headerButtonNoLabel(headerButtonNoLabel)
   {
      if (typeof headerButtonNoLabel === 'boolean') { this.setOptions('headerButtonNoLabel', headerButtonNoLabel); }
   }

   /**
    * Sets `this.options.minimizable` which is reactive for application shells that are also pop out.
    *
    * @param {boolean}  minimizable - Sets the minimizable option.
    */
   set minimizable(minimizable)
   {
      if (typeof minimizable === 'boolean') { this.setOptions('minimizable', minimizable); }
   }

   /**
    * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
    * from `ui.windows`.
    *
    * @param {boolean}  popOut - Sets the popOut option.
    */
   set popOut(popOut)
   {
      if (typeof popOut === 'boolean') { this.setOptions('popOut', popOut); }
   }

   /**
    * Sets `this.options.resizable` which is reactive for application shells.
    *
    * @param {boolean}  resizable - Sets the resizable option.
    */
   set resizable(resizable)
   {
      if (typeof resizable === 'boolean') { this.setOptions('resizable', resizable); }
   }

   /**
    * Sets `this.options.title` which is reactive for application shells.
    *
    * @param {string}   title - Application title; will be localized, so a translation key is fine.
    */
   set title(title)
   {
      if (typeof title === 'string') { this.setOptions('title', title); }
   }

   /**
    * Sets `this.options.zIndex` which is reactive for application shells.
    *
    * @param {number}   zIndex - Application z-index.
    */
   set zIndex(zIndex)
   {
      this.setOptions('zIndex', Number.isInteger(zIndex) ? zIndex : null);
   }

   /**
    * Provides a way to safely get this applications options given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {*}        [defaultValue] - A default value returned if the accessor is not found.
    *
    * @returns {*} Value at the accessor.
    */
   getOptions(accessor, defaultValue)
   {
      return safeAccess(this.#application.options, accessor, defaultValue);
   }

   /**
    * Provides a way to merge `options` into this applications options and update the appOptions store.
    *
    * @param {object}   options - The options object to merge with `this.options`.
    */
   mergeOptions(options)
   {
      this.#storeAppOptionsUpdate((instanceOptions) => foundry.utils.mergeObject(instanceOptions, options));
   }

   /**
    * Provides a way to safely set this applications options given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * Additionally if an application shell Svelte component is mounted and exports the `appOptions` property then
    * the application options is set to `appOptions` potentially updating the application shell / Svelte component.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {*}        value - Value to set.
    */
   setOptions(accessor, value)
   {
      const success = safeSet(this.#application.options, accessor, value);

      // If `this.options` modified then update the app options store.
      if (success)
      {
         this.#storeAppOptionsUpdate(() => this.#application.options);
      }
   }

   /**
    * Initializes the Svelte stores and derived stores for the application options and UI state.
    *
    * While writable stores are created the update method is stored in private variables locally and derived Readable
    * stores are provided for essential options which are commonly used.
    *
    * These stores are injected into all Svelte components mounted under the `external` context: `storeAppOptions` and
    * ` storeUIOptions`.
    */
   #storesInitialize()
   {
      const writableAppOptions = writable(this.#application.options);

      // Keep the update function locally, but make the store essentially readable.
      this.#storeAppOptionsUpdate = writableAppOptions.update;

      /**
       * Create custom store. The main subscribe method for all app options changes is provided along with derived
       * writable stores for all reactive options.
       *
       * @type {StoreAppOptions}
       */
      const storeAppOptions = {
         subscribe: writableAppOptions.subscribe,

         draggable: propertyStore(writableAppOptions, 'draggable'),
         headerButtonNoClose: propertyStore(writableAppOptions, 'headerButtonNoClose'),
         headerButtonNoLabel: propertyStore(writableAppOptions, 'headerButtonNoLabel'),
         minimizable: propertyStore(writableAppOptions, 'minimizable'),
         popOut: propertyStore(writableAppOptions, 'popOut'),
         resizable: propertyStore(writableAppOptions, 'resizable'),
         title: propertyStore(writableAppOptions, 'title'),
         zIndex: propertyStore(writableAppOptions, 'zIndex'),
      };

      Object.freeze(storeAppOptions);

      this.#storeAppOptions = storeAppOptions;

      // Create a store for UI state data.
      const writableUIOptions = writable({
         headerButtons: [],
         minimized: this.#application._minimized
      });

      // Keep the update function locally, but make the store essentially readable.
      this.#storeUIOptionsUpdate = writableUIOptions.update;

      /**
       * @type {StoreUIOptions}
       */
      const storeUIOptions = {
         subscribe: writableUIOptions.subscribe,

         headerButtons: derived(writableUIOptions, ($options, set) => set($options.headerButtons)),
         minimized: derived(writableUIOptions, ($options, set) => set($options.minimized))
      };

      Object.freeze(storeUIOptions);

      // Initialize the store with options set in the Application constructor.
      this.#storeUIOptions = storeUIOptions;
   }

   /**
    * Registers local store subscriptions for app options. `popOut` controls registering this app with `ui.windows`.
    * `zIndex` controls the z-index style of the element root.
    *
    * @see SvelteFormApplication._injectHTML
    */
   #storesSubscribe()
   {
      // Register local subscriptions.

      // Handles updating header buttons to add / remove the close button.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoClose, (value) =>
      {
         this.updateHeaderButtons({ headerButtonNoClose: value });
      }));

      // Handles updating header buttons to add / remove button labels.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoLabel, (value) =>
      {
         this.updateHeaderButtons({ headerButtonNoLabel: value });
      }));

      // Handles adding / removing this application from `ui.windows` when popOut changes.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.popOut, (value) =>
      {
         if (value && this.#application.rendered)
         {
            ui.windows[this.#application.appId] = this.#application;
         }
         else
         {
            delete ui.windows[this.#application.appId];
         }
      }));

      // Handles directly updating the element root `z-index` style when `zIndex` changes.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.zIndex, (value) =>
      {
         if (this.#application._element !== null) { this.#application._element[0].style.zIndex = value; }
      }));
   }

   /**
    * Unsubscribes from any locally monitored stores.
    *
    * @see SvelteFormApplication.close
    */
   #storesUnsubscribe()
   {
      this.#storeUnsubscribe.forEach((unsubscribe) => unsubscribe());
      this.#storeUnsubscribe = [];
   }

   /**
    * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
    * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
    * Hooks fired return a new button array and the uiOptions store is updated and the application shell will render
    * the new buttons.
    *
    * Optionally you can set in the Foundry app options `headerButtonNoClose` to remove the close button and
    * `headerButtonNoLabel` to true and labels will be removed from the header buttons.
    *
    * @param {object} opts - Optional parameters (for internal use)
    *
    * @param {boolean} opts.headerButtonNoClose - The value for `headerButtonNoClose`.
    *
    * @param {boolean} opts.headerButtonNoLabel - The value for `headerButtonNoLabel`.
    */
   updateHeaderButtons({ headerButtonNoClose = this.#application.options.headerButtonNoClose,
    headerButtonNoLabel = this.#application.options.headerButtonNoLabel } = {})
   {
      let buttons = this.#application._getHeaderButtons();

      // Remove close button if this.options.headerButtonNoClose is true;
      if (typeof headerButtonNoClose === 'boolean' && headerButtonNoClose)
      {
         buttons = buttons.filter((button) => button.class !== 'close');
      }

      // Remove labels if this.options.headerButtonNoLabel is true;
      if (typeof headerButtonNoLabel === 'boolean' && headerButtonNoLabel)
      {
         for (const button of buttons) { button.label = void 0; }
      }

      this.#storeUIOptionsUpdate((options) =>
      {
         options.headerButtons = buttons;
         return options;
      });
   }
}

/**
 * @typedef {object} SvelteData
 *
 * @property {object}                           config -
 *
 * @property {import('svelte').SvelteComponent} component -
 *
 * @property {HTMLElement}                      element -
 *
 * @property {boolean}                          injectHTML -
 */

/**
 * @typedef {object} SvelteStores
 *
 * @property {import('svelte/store').Writable.update} appOptionsUpdate - Update function for app options store.
 *
 * @property {Function} subscribe - Subscribes to local stores.
 *
 * @property {import('svelte/store').Writable.update} uiOptionsUpdate - Update function for UI options store.
 *
 * @property {Function} unsubscribe - Unsubscribes from local stores.
 */
