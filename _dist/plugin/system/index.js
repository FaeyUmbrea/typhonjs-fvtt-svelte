import { get, writable as writable$2 } from 'svelte/store';
import { noop, run_all, is_function } from 'svelte/internal';
import { TJSGameSettings as TJSGameSettings$1 } from '@typhonjs-fvtt/svelte/store';
import { isIterable } from '@typhonjs-fvtt/svelte/util';

// src/generator.ts
function isSimpleDeriver(deriver) {
  return deriver.length < 2;
}
function generator(storage) {
  function readable(key, value, start) {
    return {
      subscribe: writable(key, value, start).subscribe
    };
  }
  function writable(key, value, start = noop) {
    function wrap_start(ogSet) {
      return start(function wrap_set(new_value) {
        if (storage) {
          storage.setItem(key, JSON.stringify(new_value));
        }
        return ogSet(new_value);
      });
    }
    if (storage) {
      const storageValue = storage.getItem(key);
      try {
        if (storageValue) {
          value = JSON.parse(storageValue);
        }
      } catch (err) {
      }
      storage.setItem(key, JSON.stringify(value));
    }
    const ogStore = writable$2(value, start ? wrap_start : void 0);
    function set(new_value) {
      if (storage) {
        storage.setItem(key, JSON.stringify(new_value));
      }
      ogStore.set(new_value);
    }
    function update(fn) {
      set(fn(get(ogStore)));
    }
    function subscribe(run, invalidate = noop) {
      return ogStore.subscribe(run, invalidate);
    }
    return {set, update, subscribe};
  }
  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (storage && storage.getItem(key)) {
      try {
        initial_value = JSON.parse(storage.getItem(key));
      } catch (err) {
      }
    }
    return readable(key, initial_value, (set) => {
      let inited = false;
      const values = [];
      let pending = 0;
      let cleanup = noop;
      const sync = () => {
        if (pending) {
          return;
        }
        cleanup();
        const input = single ? values[0] : values;
        if (isSimpleDeriver(fn)) {
          set(fn(input));
        } else {
          const result = fn(input, set);
          cleanup = is_function(result) ? result : noop;
        }
      };
      const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
        values[i] = value;
        pending &= ~(1 << i);
        if (inited) {
          sync();
        }
      }, () => {
        pending |= 1 << i;
      }));
      inited = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
      };
    });
  }
  return {
    readable,
    writable,
    derived,
    get: get
  };
}

// src/local.ts
var storage$1 = typeof window !== "undefined" ? window.localStorage : void 0;
var g$1 = generator(storage$1);
var writable$1 = g$1.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} LSStore - The backing Svelte store; a writable w/ get method attached.
 */

class LocalStorage$1
{
   /**
    * @type {Map<string, LSStore>}
    */
   #stores = new Map();

   /**
    * Get value from the localstorage.
    *
    * @param {string}   key - Key to lookup in localstorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
    *
    * @returns {*} Value from local storage or if not defined any default value provided.
    */
   getItem(key, defaultValue)
   {
      let value = defaultValue;

      const storageValue = localStorage.getItem(key);

      if (storageValue !== void 0)
      {
         value = JSON.parse(storageValue);
      }

      return value;
   }

   /**
    * Returns the backing Svelte store for the given key; potentially sets a default value if the key
    * is not already set.
    *
    * @param {string}   key - Key to lookup in localstorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
    *
    * @returns {LSStore} The Svelte store for this key.
    */
   getStore(key, defaultValue)
   {
      return s_GET_STORE$1(this.#stores, key, defaultValue);
   }

   /**
    * Sets the value for the given key in localstorage.
    *
    * @param {string}   key - Key to lookup in localstorage.
    *
    * @param {*}        value - A value to set for this key.
    */
   setItem(key, value)
   {
      const store = s_GET_STORE$1(this.#stores, key);
      store.set(value);
   }

   /**
    * Convenience method to swap a boolean value stored in local storage.
    *
    * @param {string}   key - Key to lookup in localstorage.
    *
    * @param {boolean}  [defaultValue] - A default value to return if key not present in local storage.
    *
    * @returns {boolean} The boolean swap for the given key.
    */
   swapItemBoolean(key, defaultValue)
   {
      const store = s_GET_STORE$1(this.#stores, key, defaultValue);
      const value = store.get();
      const newValue = typeof value === 'boolean' ? !value : false;

      store.set(newValue);
      return newValue;
   }
}

/**
 * Gets a store from the LSStore Map or creates a new store for the key and a given default value.
 *
 * @param {Map<string, LSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {boolean}              [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The store for the given key.
 */
function s_GET_STORE$1(stores, key, defaultValue = void 0)
{
   let store = stores.get(key);
   if (store === void 0)
   {
      store = s_CREATE_STORE$1(key, defaultValue);
      stores.set(key, store);
   }

   return store;
}

/**
 * Creates a new LSStore for the given key.
 *
 * @param {string}   key - Key to lookup in stores map.
 *
 * @param {boolean}  [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The new LSStore.
 */
function s_CREATE_STORE$1(key, defaultValue = void 0)
{
   try
   {
      const value = localStorage.getItem(key);
      if (value) { defaultValue = JSON.parse(value); }
   }
   catch (err) { /**/ }

   const store = writable$1(key, defaultValue);


   store.get = () => get(store);

   return store;
}

// src/session.ts
var storage = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage);
var writable = g.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} SSStore - The backing Svelte store; a writable w/ get method attached.
 */

class SessionStorage$1
{
   /**
    * @type {Map<string, SSStore>}
    */
   #stores = new Map();

   /**
    * Get value from the sessionstorage.
    *
    * @param {string}   key - Key to lookup in sessionstorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {*} Value from session storage or if not defined any default value provided.
    */
   getItem(key, defaultValue)
   {
      let value = defaultValue;

      const storageValue = sessionStorage.getItem(key);

      if (storageValue !== void 0)
      {
         value = JSON.parse(storageValue);
      }

      return value;
   }

   /**
    * Returns the backing Svelte store for the given key; potentially sets a default value if the key
    * is not already set.
    *
    * @param {string}   key - Key to lookup in sessionstorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {LSStore} The Svelte store for this key.
    */
   getStore(key, defaultValue)
   {
      return s_GET_STORE(this.#stores, key, defaultValue);
   }

   /**
    * Sets the value for the given key in sessionstorage.
    *
    * @param {string}   key - Key to lookup in sessionstorage.
    *
    * @param {*}        value - A value to set for this key.
    */
   setItem(key, value)
   {
      const store = s_GET_STORE(this.#stores, key);
      store.set(value);
   }

   /**
    * Convenience method to swap a boolean value stored in session storage.
    *
    * @param {string}   key - Key to lookup in sessionstorage.
    *
    * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {boolean} The boolean swap for the given key.
    */
   swapItemBoolean(key, defaultValue)
   {
      const store = s_GET_STORE(this.#stores, key, defaultValue);
      const value = store.get();
      const newValue = typeof value === 'boolean' ? !value : false;

      store.set(newValue);
      return newValue;
   }
}

/**
 * Gets a store from the SSStore Map or creates a new store for the key and a given default value.
 *
 * @param {Map<string, LSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {boolean}              [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The store for the given key.
 */
function s_GET_STORE(stores, key, defaultValue = void 0)
{
   let store = stores.get(key);
   if (store === void 0)
   {
      store = s_CREATE_STORE(key, defaultValue);
      stores.set(key, store);
   }

   return store;
}

/**
 * Creates a new SSStore for the given key.
 *
 * @param {string}   key - Key to lookup in stores map.
 *
 * @param {boolean}  [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The new LSStore.
 */
function s_CREATE_STORE(key, defaultValue = void 0)
{
   try
   {
      const value = sessionStorage.getItem(key);
      if (value) { defaultValue = JSON.parse(value); }
   }
   catch (err) { /**/ }

   const store = writable(key, defaultValue);
   store.get = () => get(store);

   return store;
}

class LocalStorage
{
   #storage = new LocalStorage$1();

   onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:local:item:get`, this.#storage.getItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:boolean:swap`, this.#storage.swapItemBoolean, this.#storage,
       { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:set`, this.#storage.setItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:store:get`, this.#storage.getStore, this.#storage, { guard: true });
   }
}

class SessionStorage
{
   #storage = new SessionStorage$1();

   onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:session:item:get`, this.#storage.getItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:boolean:swap`, this.#storage.swapItemBoolean, this.#storage,
       { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:set`, this.#storage.setItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:store:get`, this.#storage.getStore, this.#storage, { guard: true });
   }
}

/**
 * Defines if logging setting changes to the console occurs.
 *
 * @type {boolean}
 */
let loggingEnabled = false;

/**
 * Defines a base class for dispatch handling from events triggered from the TJSGameSettings plugin. This is a
 * convenience mechanism and is not the only way to handle game settings related events. Use this for small to medium
 * scoped apps that do not have a lot of cross-cutting concerns.
 *
 * SettingsControl listens for all setting change events and attempts to invoke a method with the same name as the
 * setting located in the implementing child class.
 *
 * There is one additional event handled by SettingsControl:
 * `tjs:system:settings:control:log:enable` - When passed a truthy value console logging of setting changes occurs.
 */
class TJSSettingsControl
{
   #handleDispatch(data)
   {
      if (typeof data.setting !== 'string') { return; }

      if (loggingEnabled)
      {
         console.log(`SettingsControl - handleDispatch - data:\n`, data);
      }

      const dispatchFunction = this[data.setting];

      if (typeof dispatchFunction === 'function')
      {
         dispatchFunction.call(this, data.value);
      }
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      const opts = { guard: true };

      ev.eventbus.on('tjs:system:game:settings:change:any', this.#handleDispatch, this, opts);

      // Enables local logging of setting changes.
      ev.eventbus.on('tjs:system:settings:control:log:enable', (enabled) => loggingEnabled = enabled, void 0, opts);
   }
}

/**
 * Provides a TyphonJS plugin to add TJSGameSettings to the plugin eventbus.
 *
 * The following events are available for registration:
 *
 * `tjs:system:game:settings:store:get`          - Invokes `getWritableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:store:writable:get` - Invokes `getWritableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:store:readable:get` - Invokes `getReadableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:register`           - Registers a setting adding a callback to fire an event on change.
 * `tjs:system:game:settings:register:all`       - Registers multiple settings.
 *
 * The following events are triggered on change of a game setting.
 *
 * `tjs:system:game:settings:change:any`           - Provides an object containing the setting and value.
 * `tjs:system:game:settings:change:<SETTING KEY>` - Provides the value of the keyed event.
 */
class TJSGameSettings
{
   #gameSettings = new TJSGameSettings$1();

   /**
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    */
   register(setting)
   {
      if (typeof setting !== 'object') { throw new TypeError(`TJSGameSettings - register: setting is not an object.`); }

      if (typeof setting.moduleId !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'moduleId' attribute is not a string.`);
      }

      if (typeof setting.key !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'key' attribute is not a string.`);
      }

      if (typeof setting.options !== 'object')
      {
         throw new TypeError(`TJSGameSettings - register: 'options' attribute is not an object.`);
      }

      const moduleId = setting.moduleId;
      const key = setting.key;

      /**
       * @type {GameSettingOptions}
       */
      const options = setting.options;

      const onChange = typeof options?.onChange === 'function' ? [options.onChange] : [];

      onChange.push((value) =>
      {
         if (this._eventbus)
         {
            this._eventbus.trigger(`tjs:system:game:settings:change:any`, { setting: key, value });
            this._eventbus.trigger(`tjs:system:game:settings:change:${key}`, value);
         }
      });

      this.#gameSettings.register({ moduleId, key, options: { ...options, onChange } });
   }

   /**
    * Registers multiple settings.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    */
   registerAll(settings)
   {
      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings) { this.register(entry); }
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      const opts = { guard: true };

      ev.eventbus.on(`tjs:system:game:settings:store:get`, this.#gameSettings.getWritableStore, this.#gameSettings,
       opts);

      ev.eventbus.on(`tjs:system:game:settings:store:readable:get`, this.#gameSettings.getReadableStore,
       this.#gameSettings, opts);

      ev.eventbus.on(`tjs:system:game:settings:store:writable:get`, this.#gameSettings.getWritableStore,
       this.#gameSettings, opts);

      ev.eventbus.on(`tjs:system:game:settings:register`, this.register, this, opts);

      ev.eventbus.on(`tjs:system:game:settings:register:all`, this.registerAll, this, opts);
   }
}

/**
 * @typedef {object} GameSettingOptions
 *
 * @property {object} [choices] - If choices are defined, the resulting setting will be a select menu.
 *
 * @property {boolean} [config=true] - Specifies that the setting appears in the configuration view.
 *
 * @property {string} [hint] - A description of the registered setting and its behavior.
 *
 * @property {string} name - The displayed name of the setting.
 *
 * @property {Function} [onChange] - An onChange callback to directly receive callbacks from Foundry on setting change.
 *
 * @property {object} [range] - If range is specified, the resulting setting will be a range slider.
 *
 * @property {('client' | 'world')} [scope='client'] - Scope for setting.
 *
 * @property {Object|Function} type - A constructable object or function.
 */

/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {GameSettingOptions} options - Configuration for setting data.
 */

export { LocalStorage, SessionStorage, TJSGameSettings, TJSSettingsControl };
//# sourceMappingURL=index.js.map
