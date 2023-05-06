import * as svelte from 'svelte';
import * as _typhonjs_fvtt_svelte_store_storage_web from '@typhonjs-fvtt/svelte/store/storage/web';
import * as _typhonjs_fvtt_svelte_store_position from '@typhonjs-fvtt/svelte/store/position';
import { TJSPosition } from '@typhonjs-fvtt/svelte/store/position';
import * as _typhonjs_fvtt_svelte_util from '@typhonjs-fvtt/svelte/util';
import * as svelte_store from 'svelte/store';

/**
 * Provides the ability the save / restore application state for positional and UI state such as minimized status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
declare class ApplicationState {
    /**
     * @param {SvelteApplication}   application - The application.
     */
    constructor(application: SvelteApplication);
    /**
     * Returns current application state along with any extra data passed into method.
     *
     * @param {object} [extra] - Extra data to add to application state.
     *
     * @returns {ApplicationStateData} Passed in object with current application state.
     */
    get(extra?: object): ApplicationStateData;
    /**
     * Returns any stored save state by name.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - Saved data set name.
     *
     * @returns {ApplicationStateData} The saved data set.
     */
    getSave({ name }: {
        name: string;
    }): ApplicationStateData;
    /**
     * Removes and returns any application state by name.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - Name to remove and retrieve.
     *
     * @returns {ApplicationStateData} Saved application data.
     */
    remove({ name }: {
        name: string;
    }): ApplicationStateData;
    /**
     * Restores a saved application state returning the data. Several optional parameters are available
     * to control whether the restore action occurs silently (no store / inline styles updates), animates
     * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
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
     * @param {number}            [params.duration=0.1] - Duration in seconds.
     *
     * @param {Function}          [params.ease=linear] - Easing function.
     *
     * @param {Function}          [params.interpolate=lerp] - Interpolation function.
     *
     * @returns {ApplicationStateData|Promise<ApplicationStateData>} Saved application data.
     */
    restore({ name, remove, async, animateTo, duration, ease, interpolate }: {
        name: string;
        remove?: boolean;
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): ApplicationStateData | Promise<ApplicationStateData>;
    /**
     * Saves current application state with the opportunity to add extra data to the saved state.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - name to index this saved data.
     *
     * @param {...*}     [options.extra] - Extra data to add to saved data.
     *
     * @returns {ApplicationStateData} Current application data
     */
    save({ name, ...extra }: {
        name: string;
        extra?: any[];
    }): ApplicationStateData;
    /**
     * Restores a saved application state returning the data. Several optional parameters are available
     * to control whether the restore action occurs silently (no store / inline styles updates), animates
     * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
     * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
     * returned if awaiting the end of the animation.
     *
     * Note: If serializing application state any minimized apps will use the before minimized state on initial render
     * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
     *
     * TODO: THIS METHOD NEEDS TO BE REFACTORED WHEN TRL IS MADE INTO A STANDALONE FRAMEWORK.
     *
     * @param {ApplicationStateData}   data - Saved data set name.
     *
     * @param {object}            [opts] - Optional parameters
     *
     * @param {boolean}           [opts.async=false] - If animating return a Promise that resolves with any saved data.
     *
     * @param {boolean}           [opts.animateTo=false] - Animate to restore data.
     *
     * @param {number}            [opts.duration=0.1] - Duration in seconds.
     *
     * @param {Function}          [opts.ease=linear] - Easing function.
     *
     * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {SvelteApplication|Promise<SvelteApplication>} When synchronous the application or Promise when
     *                                                             animating resolving with application.
     */
    set(data: ApplicationStateData, { async, animateTo, duration, ease, interpolate }?: {
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): SvelteApplication | Promise<SvelteApplication>;
    #private;
}
type ApplicationStateData = {
    /**
     * - Application position.
     */
    position: _typhonjs_fvtt_svelte_store_position.TJSPositionDataExtended;
    /**
     * - Any application saved position state for #beforeMinimized
     */
    beforeMinimized: object;
    /**
     * - Application options.
     */
    options: object;
    /**
     * - Application UI state.
     */
    ui: object;
};

/**
 * Provides a helper class for {@link SvelteApplication} by combining all methods that work on the {@link SvelteData[]}
 * of mounted components. This class is instantiated and can be retrieved by the getter `svelte` via SvelteApplication.
 */
declare class GetSvelteData {
    /**
     * Keep a direct reference to the SvelteData array in an associated {@link SvelteApplication}.
     *
     * @param {MountedAppShell[]|null[]}  applicationShellHolder - A reference to the MountedAppShell array.
     *
     * @param {SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
     */
    constructor(applicationShellHolder: MountedAppShell[] | null[], svelteData: SvelteData[]);
    /**
     * Returns any mounted {@link MountedAppShell}.
     *
     * @returns {MountedAppShell|null} Any mounted application shell.
     */
    get applicationShell(): any;
    /**
     * Returns the indexed Svelte component.
     *
     * @param {number}   index -
     *
     * @returns {object} The loaded Svelte component.
     */
    component(index: number): object;
    /**
     * Returns the Svelte component entries iterator.
     *
     * @returns {Generator<Array<number|import('svelte').SvelteComponent>>} Svelte component entries iterator.
     * @yields
     */
    componentEntries(): Generator<Array<number | svelte.SvelteComponent>>;
    /**
     * Returns the Svelte component values iterator.
     *
     * @returns {Generator<import('svelte').SvelteComponent>} Svelte component values iterator.
     * @yields
     */
    componentValues(): Generator<svelte.SvelteComponent>;
    /**
     * Returns the indexed SvelteData entry.
     *
     * @param {number}   index -
     *
     * @returns {SvelteData} The loaded Svelte config + component.
     */
    data(index: number): SvelteData;
    /**
     * Returns the {@link SvelteData} instance for a given component.
     *
     * @param {object} component - Svelte component.
     *
     * @returns {SvelteData} -  The loaded Svelte config + component.
     */
    dataByComponent(component: object): SvelteData;
    /**
     * Returns the SvelteData entries iterator.
     *
     * @returns {IterableIterator<[number, SvelteData]>} SvelteData entries iterator.
     */
    dataEntries(): IterableIterator<[number, SvelteData]>;
    /**
     * Returns the SvelteData values iterator.
     *
     * @returns {IterableIterator<SvelteData>} SvelteData values iterator.
     */
    dataValues(): IterableIterator<SvelteData>;
    /**
     * Returns the length of the mounted Svelte component list.
     *
     * @returns {number} Length of mounted Svelte component list.
     */
    get length(): number;
    #private;
}

/**
 * Contains the reactive functionality / Svelte stores associated with SvelteApplication and retrievable by
 * {@link SvelteApplication.reactive}.
 *
 * There are several reactive getters for UI state such and for two-way bindings / stores see
 * {@link SvelteReactive.storeUIState}:
 * - {@link SvelteReactive.dragging}
 * - {@link SvelteReactive.minimized}
 * - {@link SvelteReactive.resizing}
 *
 * There are also reactive getters / setters for {@link SvelteApplicationOptions} and Foundry
 * {@link ApplicationOptions}. You can use the following as one way bindings and update the associated stores. For
 * two-way bindings / stores see {@link SvelteReactive.storeAppOptions}.
 *
 * - {@link SvelteReactive.draggable}
 * - {@link SvelteReactive.focusAuto}
 * - {@link SvelteReactive.focusKeep}
 * - {@link SvelteReactive.focusTrap}
 * - {@link SvelteReactive.headerButtonNoClose}
 * - {@link SvelteReactive.headerButtonNoLabel}
 * - {@link SvelteReactive.headerIcon}
 * - {@link SvelteReactive.headerNoTitleMinimized}
 * - {@link SvelteReactive.minimizable}
 * - {@link SvelteReactive.popOut}
 * - {@link SvelteReactive.positionable}
 * - {@link SvelteReactive.resizable}
 * - {@link SvelteReactive.title}
 *
 * An instance of TJSSessionStorage is accessible via {@link SvelteReactive.sessionStorage}. Optionally you can pass
 * in an existing instance that can be shared across multiple SvelteApplications by setting
 * {@link SvelteApplicationOptions.sessionStorage}.
 *
 * -------------------------------------------------------------------------------------------------------------------
 *
 * This API is not sealed, and it is recommended that you extend it with accessors to get / set data that is reactive
 * in your application. An example of setting an exported prop `document` from the main mounted application shell.
 *
 * @example
 * import { hasSetter } from '@typhonjs-fvtt/runtime/svelte/util';
 *
 * // Note: make a normal comment.
 * //  * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
 * //  *                             Document with the mounted application shell Svelte component.
 * //  *
 * //  * @memberof SvelteReactive#
 * //  *
 * Object.defineProperty(this.reactive, 'document', {
 *    get: () => this.svelte?.applicationShell?.document,
 *    set: (document) =>
 *    {
 *       const component = this.svelte?.applicationShell;
 *       if (hasSetter(component, 'document')) { component.document = document; }
 *    }
 * });
 */
declare class SvelteReactive {
    /**
     * @param {SvelteApplication} application - The host Foundry application.
     */
    constructor(application: SvelteApplication);
    /**
     * Initializes reactive support. Package private for internal use.
     *
     * @returns {SvelteStores|void} Internal methods to interact with Svelte stores.
     * @package
     */
    initialize(): SvelteStores | void;
    /**
     * @returns {import('@typhonjs-fvtt/svelte/store').TJSSessionStorage} Returns TJSSessionStorage instance.
     */
    get sessionStorage(): any;
    /**
     * Returns the store for app options.
     *
     * @returns {StoreAppOptions} App options store.
     */
    get storeAppOptions(): StoreAppOptions;
    /**
     * Returns the store for UI options.
     *
     * @returns {StoreUIOptions} UI options store.
     */
    get storeUIState(): StoreUIOptions;
    /**
     * Returns the current dragging UI state.
     *
     * @returns {boolean} Dragging UI state.
     */
    get dragging(): boolean;
    /**
     * Returns the current minimized UI state.
     *
     * @returns {boolean} Minimized UI state.
     */
    get minimized(): boolean;
    /**
     * Returns the current resizing UI state.
     *
     * @returns {boolean} Resizing UI state.
     */
    get resizing(): boolean;
    /**
     * Sets `this.options.draggable` which is reactive for application shells.
     *
     * @param {boolean}  draggable - Sets the draggable option.
     */
    set draggable(arg: boolean);
    /**
     * Returns the draggable app option.
     *
     * @returns {boolean} Draggable app option.
     */
    get draggable(): boolean;
    /**
     * Sets `this.options.focusAuto` which is reactive for application shells.
     *
     * @param {boolean}  focusAuto - Sets the focusAuto option.
     */
    set focusAuto(arg: boolean);
    /**
     * Returns the focusAuto app option.
     *
     * @returns {boolean} When true auto-management of app focus is enabled.
     */
    get focusAuto(): boolean;
    /**
     * Sets `this.options.focusKeep` which is reactive for application shells.
     *
     * @param {boolean}  focusKeep - Sets the focusKeep option.
     */
    set focusKeep(arg: boolean);
    /**
     * Returns the focusKeep app option.
     *
     * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    get focusKeep(): boolean;
    /**
     * Sets `this.options.focusTrap` which is reactive for application shells.
     *
     * @param {boolean}  focusTrap - Sets the focusTrap option.
     */
    set focusTrap(arg: boolean);
    /**
     * Returns the focusTrap app option.
     *
     * @returns {boolean} When true focus trapping / wrapping is enabled keeping focus inside app.
     */
    get focusTrap(): boolean;
    /**
     * Sets `this.options.headerButtonNoClose` which is reactive for application shells.
     *
     * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
     */
    set headerButtonNoClose(arg: boolean);
    /**
     * Returns the headerButtonNoClose app option.
     *
     * @returns {boolean} Remove the close the button in header app option.
     */
    get headerButtonNoClose(): boolean;
    /**
     * Sets `this.options.headerButtonNoLabel` which is reactive for application shells.
     *
     * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
     */
    set headerButtonNoLabel(arg: boolean);
    /**
     * Returns the headerButtonNoLabel app option.
     *
     * @returns {boolean} Remove the labels from buttons in header app option.
     */
    get headerButtonNoLabel(): boolean;
    /**
     * Sets `this.options.headerIcon` which is reactive for application shells.
     *
     * @param {string|void}  headerIcon - Sets the headerButtonNoLabel option.
     */
    set headerIcon(arg: string | void);
    /**
     * Returns the headerIcon app option.
     *
     * @returns {string|void} URL for header app icon.
     */
    get headerIcon(): string | void;
    /**
     * Sets `this.options.headerNoTitleMinimized` which is reactive for application shells.
     *
     * @param {boolean}  headerNoTitleMinimized - Sets the headerNoTitleMinimized option.
     */
    set headerNoTitleMinimized(arg: boolean);
    /**
     * Returns the headerNoTitleMinimized app option.
     *
     * @returns {boolean} When true removes the header title when minimized.
     */
    get headerNoTitleMinimized(): boolean;
    /**
     * Sets `this.options.minimizable` which is reactive for application shells that are also pop out.
     *
     * @param {boolean}  minimizable - Sets the minimizable option.
     */
    set minimizable(arg: boolean);
    /**
     * Returns the minimizable app option.
     *
     * @returns {boolean} Minimizable app option.
     */
    get minimizable(): boolean;
    /**
     * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
     * from `ui.windows`.
     *
     * @param {boolean}  popOut - Sets the popOut option.
     */
    set popOut(arg: boolean);
    /**
     * Returns the Foundry popOut state; {@link Application.popOut}
     *
     * @returns {boolean} Positionable app option.
     */
    get popOut(): boolean;
    /**
     * Sets `this.options.positionable` enabling / disabling {@link SvelteApplication.position.set}.
     *
     * @param {boolean}  positionable - Sets the positionable option.
     */
    set positionable(arg: boolean);
    /**
     * Returns the positionable app option; {@link SvelteApplicationOptions.positionable}
     *
     * @returns {boolean} Positionable app option.
     */
    get positionable(): boolean;
    /**
     * Sets `this.options.resizable` which is reactive for application shells.
     *
     * @param {boolean}  resizable - Sets the resizable option.
     */
    set resizable(arg: boolean);
    /**
     * Returns the resizable option.
     *
     * @returns {boolean} Resizable app option.
     */
    get resizable(): boolean;
    /**
     * Sets `this.options.title` which is reactive for application shells.
     *
     * Note: Will set empty string if title is undefined or null.
     *
     * @param {string|undefined|null}   title - Application title; will be localized, so a translation key is fine.
     */
    set title(arg: string);
    /**
     * Returns the title accessor from the parent Application class; {@link Application.title}
     * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.
     *
     * @returns {string} Title.
     */
    get title(): string;
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
    getOptions(accessor: string, defaultValue?: any): any;
    /**
     * Provides a way to merge `options` into this applications options and update the appOptions store.
     *
     * @param {object}   options - The options object to merge with `this.options`.
     */
    mergeOptions(options: object): void;
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
    setOptions(accessor: string, value: any): void;
    /**
     * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
     * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
     * Hooks fired return a new button array and the uiOptions store is updated and the application shell will render
     * the new buttons.
     *
     * Optionally you can set in the SvelteApplication app options {@link SvelteApplicationOptions.headerButtonNoClose}
     * to remove the close button and {@link SvelteApplicationOptions.headerButtonNoLabel} to true and labels will be
     * removed from the header buttons.
     *
     * @param {object} opts - Optional parameters (for internal use)
     *
     * @param {boolean} opts.headerButtonNoClose - The value for `headerButtonNoClose`.
     *
     * @param {boolean} opts.headerButtonNoLabel - The value for `headerButtonNoLabel`.
     */
    updateHeaderButtons({ headerButtonNoClose, headerButtonNoLabel }?: {
        headerButtonNoClose: boolean;
        headerButtonNoLabel: boolean;
    }): void;
    #private;
}
/**
 * - Provides a custom readable Svelte store for Application options state.
 */
type StoreAppOptions = {
    /**
     * - Subscribe to all app options updates.
     */
    subscribe: svelte_store.Readable<object>;
    /**
     * - Derived store for `draggable` updates.
     */
    draggable: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `focusAuto` updates.
     */
    focusAuto: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `focusKeep` updates.
     */
    focusKeep: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `focusTrap` updates.
     */
    focusTrap: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `headerButtonNoClose`
     *   updates.
     */
    headerButtonNoClose: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `headerButtonNoLabel`
     *   updates.
     */
    headerButtonNoLabel: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `headerIcon` updates.
     */
    headerIcon: svelte_store.Writable<string>;
    /**
     * - Derived store for
     *   `headerNoTitleMinimized` updates.
     */
    headerNoTitleMinimized: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `minimizable` updates.
     */
    minimizable: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `popOut` updates.
     */
    popOut: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `positionable` updates.
     */
    positionable: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `resizable` updates.
     */
    resizable: svelte_store.Writable<boolean>;
    /**
     * - Derived store for `title` updates.
     */
    title: svelte_store.Writable<string>;
};
/**
 * - Provides a custom readable Svelte store for UI options state.
 */
type StoreUIOptions = {
    /**
     * - Subscribe to all UI options updates.
     */
    subscribe: any;
    /**
     * - Derived store for `dragging` updates.
     */
    dragging: svelte_store.Writable<boolean>;
    /**
     * - Derived store for
     * `headerButtons` updates.
     */
    headerButtons: svelte_store.Readable<globalThis.ApplicationHeaderButton[]>;
    /**
     * - Derived store for `minimized` updates.
     */
    minimized: svelte_store.Readable<boolean>;
    /**
     * - Derived store for `resizing` updates.
     */
    resizing: svelte_store.Writable<boolean>;
};

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately. You can declaratively
 * load one or more components from `defaultOptions`.
 */
declare class SvelteApplication {
    /**
     * @param {SvelteApplicationOptions} options - The options for the application.
     *
     * @inheritDoc
     */
    constructor(options?: SvelteApplicationOptions);
    /**
     * Returns the content element if an application shell is mounted.
     *
     * @returns {HTMLElement} Content element.
     */
    get elementContent(): HTMLElement;
    /**
     * Returns the target element or main element if no target defined.
     *
     * @returns {HTMLElement} Target element.
     */
    get elementTarget(): HTMLElement;
    /**
     * Returns the reactive accessors & Svelte stores for SvelteApplication.
     *
     * @returns {SvelteReactive} The reactive accessors & Svelte stores.
     */
    get reactive(): SvelteReactive;
    /**
     * Returns the application state manager.
     *
     * @returns {ApplicationState} The application state manager.
     */
    get state(): ApplicationState;
    /**
     * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
     *
     * @returns {GetSvelteData} GetSvelteData
     */
    get svelte(): GetSvelteData;
    /**
     * Provides a mechanism to update the UI options store for maximized.
     *
     * Note: the sanity check is duplicated from {@link Application.maximize} the store is updated _before_
     * performing the rest of animations. This allows application shells to remove / show any resize handlers
     * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
     * to animate the content area.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.animate=true] - When true perform default maximizing animation.
     *
     * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
     */
    maximize({ animate, duration }?: {
        animate?: boolean;
        duration?: number;
    }): Promise<void>;
    /**
     * Provides a mechanism to update the UI options store for minimized.
     *
     * Note: the sanity check is duplicated from {@link Application.minimize} the store is updated _before_
     * performing the rest of animations. This allows application shells to remove / show any resize handlers
     * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
     * to animate the content area.
     *
     * @param {object}   [opts] - Optional parameters
     *
     * @param {boolean}  [opts.animate=true] - When true perform default minimizing animation.
     *
     * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
     */
    minimize({ animate, duration }?: {
        animate?: boolean;
        duration?: number;
    }): Promise<void>;
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
    onSvelteMount({ element, elementContent, elementTarget }?: {
        element?: HTMLElement;
        elementContent?: HTMLElement;
        elementTarget?: HTMLElement;
    }): void;
    /**
     * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
     * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
     * context.
     *
     * @param {object}      [opts] - Optional parameters.
     *
     * @param {HTMLElement} [opts.element] - HTMLElement container for main application element.
     *
     * @param {HTMLElement} [opts.elementContent] - HTMLElement container for content area of application shells.
     *
     * @param {HTMLElement} [opts.elementTarget] - HTMLElement container for main application target element.
     */
    onSvelteRemount({ element, elementContent, elementTarget }?: {
        element?: HTMLElement;
        elementContent?: HTMLElement;
        elementTarget?: HTMLElement;
    }): void;
    /**
     * All calculation and updates of position are implemented in {@link TJSPosition.set}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
     * to update to using the {@link TJSPosition.validators} functionality.
     *
     * @param {import('@typhonjs-fvtt/svelte/store/position').TJSPositionDataExtended}   [position] - TJSPosition data.
     *
     * @returns {TJSPosition} The updated position object for the application containing the new values
     */
    setPosition(position?: _typhonjs_fvtt_svelte_store_position.TJSPositionDataExtended): TJSPosition;
    #private;
}

/**
 * Provides storage for all dialog options adding `get`, `merge` and `set` methods that safely access and update
 * data changed to the mounted DialogShell component reactively.
 */
declare class TJSDialogData {
    /**
     * @param {SvelteApplication} application - The host Foundry application.
     */
    constructor(application: SvelteApplication);
    /**
     * Provides configuration of the dialog button bar.
     *
     * @type {Record<string, TJSDialogButtonData>}
     */
    buttons: Record<string, TJSDialogButtonData>;
    /**
     * A Svelte configuration object or HTML string content.
     *
     * @type {object|string}
     */
    content: object | string;
    /**
     * The default button ID to focus initially.
     *
     * @type {string}
     */
    default: string;
    /**
     * The dialog is draggable when true.
     *
     * @type {boolean}
     */
    draggable: boolean;
    /**
     * When true auto-management of app focus is enabled.
     *
     * @type {boolean}
     */
    focusAuto: boolean;
    /**
     * When true the first focusable element that isn't a button is focused.
     *
     * @type {boolean}
     */
    focusFirst: boolean;
    /**
     * When `focusAuto` and `focusKeep` is true; keeps internal focus.
     *
     * @type {boolean}
     */
    focusKeep: boolean;
    /**
     * When true the dialog is minimizable.
     *
     * @type {boolean}
     */
    minimizable: boolean;
    /**
     * When true a modal dialog is displayed.
     *
     * @type {boolean}
     */
    modal: boolean;
    /**
     * Additional options for modal dialog display.
     *
     * @type {object}
     * TODO: Better specify type / options.
     */
    modalOptions: object;
    /**
     * When true and an error is raised in dialog callback functions post a UI error notification.
     *
     * @type {boolean}
     */
    notifyError: boolean;
    /**
     * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
     * by name exported from content Svelte component is invoked.
     *
     * @type {string|((application: TJSDialog) => any)}
     */
    onClose: string | ((application: TJSDialog$1) => any);
    /**
     * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
     * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
     * will cause the Promise to then be rejected.
     *
     * @type {boolean}
     */
    rejectClose: boolean;
    /**
     * When true the dialog is resizable.
     *
     * @type {boolean}
     */
    resizable: boolean;
    /**
     * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
     * resolved.
     *
     * @type {boolean}
     */
    resolveId: boolean;
    /**
     * The dialog window title.
     *
     * @type {string}
     */
    title: string;
    /**
     * Transition options for the dialog.
     *
     * @type {object}
     * TODO: Better specify type / options.
     */
    transition: object;
    /**
     * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
     * top when activated.
     *
     * @type {number|null}
     */
    zIndex: number | null;
    /**
     * Provides a way to safely get this dialogs data given an accessor string which describes the
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
    get(accessor: string, defaultValue?: any): any;
    /**
     * @param {object} data - Merge provided data object into Dialog data.
     */
    merge(data: object): void;
    /**
     * Provides a way to safely set this dialogs data given an accessor string which describes the
     * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
     * to walk.
     *
     * Automatically the dialog data will be updated in the associated DialogShell Svelte component.
     *
     * // TODO DOCUMENT the accessor in more detail.
     *
     * @param {string}   accessor - The path / key to set. You can set multiple levels.
     *
     * @param {*}        value - Value to set.
     *
     * @returns {boolean} True if successful.
     */
    set(accessor: string, value: any): boolean;
    #private;
}

/**
 * Provides a reactive dialog implementation configured from a unique dialog options object. The dialog features a
 * bottom button bar for user selection.
 *
 * A glasspane / modal option with various styling and transition capabilities is available when setting `modal: true`.
 *
 * Most importantly the `content` attribute of dialog data can be a Svelte component configuration object to render
 * your custom component as the dialog content. When using a Svelte component as the content you can assign a string
 * to the various `on<XXX>` dialog callbacks and an exported function from your component will be invoked to handle the
 * button callback. All dialog button callbacks and `onClose` callback receive a single argument which is the dialog /
 * application instance.
 *
 * When making a form with form validation or other dialog that you don't want to close immediately on button press you
 * can set `autoClose: false`, however you are 100% in control of resolving any Promise callbacks from button presses
 * and also closing the application. Each button can also be configured with `autoClose: false` in the button data.
 *
 * There is a handy Promise management capability to track a single Promise for the lifetime of a dialog available
 * at {@link TJSDialog.managedPromise}. By default when the user closes the dialog / application any managed Promise is
 * resolved with `null`. The managed Promise is available in any Svelte content component by using
 * `const managedPromise = getContext('#managedPromise')`. When handling any custom resolution particularly when
 * setting `autoClose: false` for a given button you are 100% in control of resolving or rejecting asynchronous data to
 * return from the dialog.
 *
 * To create and wait upon a managed promise for asynchronous return results use the static or member variation of
 * {@link TJSDialog.wait}.
 *
 * Please refer to {@link TJSDialogOptions} for the various options used to construct the dialog.
 *
 * There are a couple of static helper methods to quickly create standard dialogs such as a 'yes' / 'no' confirmation
 * dialog with {@link TJSDialog.confirm} and an 'ok' single button dialog with {@link TJSDialog.prompt}.
 *
 * TODO: document all extended dialog data parameters such as transition options / modal transitions.
 */
declare class TJSDialog$1 extends SvelteApplication {
    /**
     * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
     * If you require more flexibility, a custom TJSDialog instance is preferred. The default focused button is 'yes'.
     * You can change the default focused button by setting `default` to `yes` or `no`.
     *
     * @template T
     *
     * @param {TJSDialogOptions & {
     *    onYes?: string|((application: TJSDialog) => any),
     *    onNo?: string|((application: TJSDialog) => any)
     * }} [data] - Confirm dialog options.
     *
     * @param {string|((application: TJSDialog) => any)} [data.onYes] - Callback function upon `yes`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {string|((application: TJSDialog) => any)} [data.onNo] - Callback function upon `no`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} A promise which resolves with result of yes / no callbacks or true / false.
     *
     * @example
     * const result = await TJSDialog.confirm({
     *  title: 'A Yes or No Question',
     *  content: '<p>Choose wisely.</p>',
     *  onYes: () => 'YES Result'
     *  onNo: () => 'NO Result'
     * });
     *
     * // Logs 'YES result', 'NO Result', or null if the user closed the dialog without making a selection.
     * console.log(result);
     */
    static confirm<T_1>({ onYes, onNo, ...data }?: any, options?: SvelteApplicationOptions): Promise<T_1>;
    /**
     * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
     *
     * @template T
     *
     * @param {TJSDialogOptions & {
     *    onOk?: string|((application: TJSDialog) => any),
     *    label?: string,
     *    icon?: string
     * }} [data] - Prompt dialog options that includes any TJSDialog options along with the following optional fields:
     *
     * @param {string|((application: TJSDialog) => any)} [data.onOk] - Callback function upon `ok`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {string}   [data.label] - The OK prompt button text.
     *
     * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} The returned value from the provided callback function or `true` if the button
     *          is pressed.
     *
     * @example
     * const result = await TJSDialog.prompt({
     *  title: 'Are you OK?',
     *  content: '<p>Are you OK?.</p>',
     *  label: 'Feeling Fine!'
     *  onOk: () => 'OK'
     * });
     *
     * // Logs 'OK' or null if the user closed the dialog without making a selection.
     * console.log(result);
     */
    static prompt<T_2>({ onOk, label, icon, ...data }?: any, options?: SvelteApplicationOptions): Promise<T_2>;
    /**
     * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
     * choice.
     *
     * Note: By default `null` is returned if the dialog is closed without a user making a choice.
     *
     * @template T
     *
     * @param {TJSDialogOptions}  data - Dialog data passed to the TJSDialog constructor.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} A Promise that resolves to the chosen result.
     */
    static wait<T_3>(data: TJSDialogOptions, options?: SvelteApplicationOptions): Promise<T_3>;
    /**
     * @param {TJSDialogOptions}           data - Dialog options.
     *
     * @param {SvelteApplicationOptions}   [options] - SvelteApplication options.
     */
    constructor(data: TJSDialogOptions, options?: SvelteApplicationOptions);
    /**
     * Sets the dialog data; this is reactive.
     *
     * @param {object}   data - Dialog data.
     */
    set data(arg: TJSDialogData);
    /**
     * Returns the dialog data.
     *
     * @returns {TJSDialogData} Dialog data.
     */
    get data(): TJSDialogData;
    /**
     * @returns {import('@typhonjs-fvtt/svelte/util').ManagedPromise} Returns the managed promise.
     */
    get managedPromise(): _typhonjs_fvtt_svelte_util.ManagedPromise;
    /**
     * Brings to top or renders this dialog returning a Promise that is resolved any button pressed or when the dialog
     * is closed.
     *
     * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
     * choice.
     *
     * Note: `null` is returned if the dialog is closed without a user making a choice.
     *
     * @template T
     *
     * @param {object}   [options] - Options.
     *
     * @param {boolean}  [options.reuse=false] - When true if there is an existing managed Promise this allows multiple
     *        sources to await on the same result.
     *
     * @returns {Promise<T>} A promise for dialog resolution.
     */
    wait<T>(options?: {
        reuse?: boolean;
    }): Promise<T>;
    #private;
}

/**
 * - Application shell contract for Svelte components.
 */
type MountedAppShell$1 = {
    /**
     * - The root element / exported prop.
     */
    elementRoot: HTMLElement;
    /**
     * - The content element / exported prop.
     */
    elementContent?: HTMLElement;
    /**
     * - The target element / exported prop.
     */
    elementTarget?: HTMLElement;
};
type SvelteApplicationOptions$1 = {
    /**
     * - If false the default slide close animation is not run.
     */
    defaultCloseAnimation?: boolean;
    /**
     * - If true then application shells are draggable.
     */
    draggable?: boolean;
    /**
     * - When true auto-management of app focus is enabled.
     */
    focusAuto?: boolean;
    /**
     * - When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    focusKeep?: boolean;
    /**
     * - Defines A11yHelper focus source to
     * apply when application closes.
     */
    focusSource?: _typhonjs_fvtt_svelte_util.A11yFocusSource;
    /**
     * - If true then the close header button is removed.
     */
    headerButtonNoClose?: boolean;
    /**
     * - If true then header button labels are removed.
     */
    headerButtonNoLabel?: boolean;
    /**
     * - If true then header title is hidden when minimized.
     */
    headerNoTitleMinimized?: boolean;
    /**
     * - Assigned to position. Number specifying minimum
     * window height.
     */
    minHeight?: number;
    /**
     * - Assigned to position. Number specifying minimum
     * window width.
     */
    minWidth?: number;
    /**
     * - If false then `position.set` does not take effect.
     */
    positionable?: boolean;
    /**
     * - A helper
     * for initial position placement.
     */
    positionInitial?: _typhonjs_fvtt_svelte_store_position.TJSPositionInitialHelper;
    /**
     * - When true TJSPosition is optimized for orthographic use.
     */
    positionOrtho?: boolean;
    /**
     * - A
     * validator function or data or list of validators.
     */
    positionValidator?: _typhonjs_fvtt_svelte_store_position.TJSPositionValidatorOptions;
    /**
     * - An instance of
     * TJSSessionStorage to share across SvelteApplications.
     */
    sessionStorage?: _typhonjs_fvtt_svelte_store_storage_web.TJSSessionStorage;
    /**
     * - A Svelte configuration object defining
     * the main component.
     */
    svelte?: _typhonjs_fvtt_svelte_util.TJSSvelteConfig;
    /**
     * - By
     * default, 'top / left' respects rotation when minimizing.
     */
    transformOrigin?: _typhonjs_fvtt_svelte_store_position.TJSTransformOrigin;
};
type SvelteData$1 = {
    /**
     * -
     */
    config: object;
    /**
     * -
     */
    component: svelte.SvelteComponent;
    /**
     * -
     */
    element: HTMLElement;
    /**
     * -
     */
    injectHTML: boolean;
};
type SvelteStores$1 = {
    /**
     * - Update function for app options store.
     */
    appOptionsUpdate: any;
    /**
     * - Subscribes to local stores.
     */
    subscribe: Function;
    /**
     * - Update function for UI options store.
     */
    uiOptionsUpdate: any;
    /**
     * - Unsubscribes from local stores.
     */
    unsubscribe: Function;
};
/**
 * - Defines the common dialog configuration data.
 */
type TJSDialogOptions$1 = {
    /**
     * - Provides configuration of the dialog button bar.
     */
    buttons?: Record<string, TJSDialogButtonData$1>;
    /**
     * - A Svelte configuration object or HTML string content.
     */
    content: object | string;
    /**
     * - The default button ID to focus initially.
     */
    default?: string;
    /**
     * - The dialog is draggable when true.
     */
    draggable?: boolean;
    /**
     * - When true auto-management of app focus is enabled.
     */
    focusAuto?: boolean;
    /**
     * - When true the first focusable element that isn't a button is focused.
     */
    focusFirst?: boolean;
    /**
     * - When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    focusKeep?: boolean;
    /**
     * - When true focus trapping / wrapping is enabled keeping focus inside app.
     */
    focusTrap?: boolean;
    /**
     * - When true the dialog is minimizable.
     */
    minimizable?: boolean;
    /**
     * - When true a modal dialog is displayed.
     */
    modal?: boolean;
    /**
     * - Additional options for modal dialog display.
     */
    modalOptions?: object;
    /**
     * - When true and an error is raised in dialog callback functions post a UI
     * error notification.
     */
    notifyError?: boolean;
    /**
     * - Callback invoked when dialog is closed; no button
     * option selected. When defined as a string any matching function by name exported from content Svelte
     * component is invoked.
     */
    onClose?: string | ((application: TJSDialog) => any);
    /**
     * - When true and a Promise has been created by {@link TJSDialog.wait } and
     * the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
     * function is invoked and any result that is undefined will cause the Promise to then be rejected.
     */
    rejectClose?: boolean;
    /**
     * - When true the dialog is resizable.
     */
    resizable?: boolean;
    /**
     * - When true and resolving any Promises and there are undefined results from
     * any button callbacks the button ID is resolved.
     */
    resolveId?: boolean;
    /**
     * - The dialog window title.
     */
    title?: string;
    /**
     * - Transition options for the dialog.
     */
    transition?: object;
    /**
     * - A specific z-index for the dialog. Pass null for the dialog to act like other
     * applications in regard bringing to top when activated.
     */
    zIndex?: number | null;
};
/**
 * - TJSDialog button data.
 */
type TJSDialogButtonData$1 = {
    /**
     * - When false the dialog does not automatically close when button selected.
     */
    autoClose?: boolean;
    /**
     * - Determines if the button is accessible providing a truthy value.
     */
    condition?: boolean | (() => boolean);
    /**
     * - Button label; will be localized.
     */
    label?: string;
    /**
     * - Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
     */
    icon?: string;
    /**
     * - Callback for button press. When defined as a
     * string any matching function by name exported from content Svelte component is invoked.
     */
    onPress?: string | ((application: TJSDialog) => any);
    /**
     * - Inline styles to apply to the button.
     */
    styles?: Record<string, string>;
};

export { MountedAppShell$1 as MountedAppShell, SvelteApplication, SvelteApplicationOptions$1 as SvelteApplicationOptions, SvelteData$1 as SvelteData, SvelteStores$1 as SvelteStores, TJSDialog$1 as TJSDialog, TJSDialogButtonData$1 as TJSDialogButtonData, TJSDialogOptions$1 as TJSDialogOptions };
