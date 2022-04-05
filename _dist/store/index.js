import { get, derived, writable as writable$2 } from 'svelte/store';
import { noop, run_all, is_function } from 'svelte/internal';
import { uuidv4, getUUIDFromDataTransfer, isObject, isIterable } from '@typhonjs-fvtt/svelte/util';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classPrivateFieldDestructureSet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  return _classApplyDescriptorDestructureSet(receiver, descriptor);
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

function _classApplyDescriptorDestructureSet(receiver, descriptor) {
  if (descriptor.set) {
    if (!("__destrObj" in descriptor)) {
      descriptor.__destrObj = {
        set value(v) {
          descriptor.set.call(receiver, v);
        }

      };
    }

    return descriptor.__destrObj;
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    return descriptor;
  }
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return fn;
}

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

function _classPrivateMethodInitSpec(obj, privateSet) {
  _checkPrivateRedeclaration(obj, privateSet);

  privateSet.add(obj);
}

let _Symbol$iterator, _Symbol$iterator2;

var _filtersAdapter = /*#__PURE__*/new WeakMap();

var _indexUpdate = /*#__PURE__*/new WeakMap();

var _mapUnsubscribe = /*#__PURE__*/new WeakMap();

_Symbol$iterator = Symbol.iterator;

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link FilterData} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main DynArrayReducer instance.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 *
 * @template T
 */
class AdapterFilters {
  /**
   * @param {Function} indexUpdate - update function for the indexer.
   *
   * @returns {[AdapterFilters<T>, {filters: FilterData<T>[]}]} Returns this and internal storage for filter adapters.
   */
  constructor(indexUpdate) {
    _classPrivateFieldInitSpec(this, _filtersAdapter, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _indexUpdate, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _mapUnsubscribe, {
      writable: true,
      value: new Map()
    });

    _classPrivateFieldSet(this, _indexUpdate, indexUpdate);

    _classPrivateFieldSet(this, _filtersAdapter, {
      filters: []
    });

    Object.seal(this);
    return [this, _classPrivateFieldGet(this, _filtersAdapter)];
  }
  /**
   * @returns {number} Returns the length of the
   */


  get length() {
    return _classPrivateFieldGet(this, _filtersAdapter).filters.length;
  }
  /**
   * Provides an iterator for filters.
   *
   * @returns {Generator<number|undefined, FilterData<T>, *>} Generator / iterator of filters.
   * @yields {FilterData<T>}
   */


  *[_Symbol$iterator]() {
    if (_classPrivateFieldGet(this, _filtersAdapter).filters.length === 0) {
      return;
    }

    for (const entry of _classPrivateFieldGet(this, _filtersAdapter).filters) {
      yield _objectSpread2({}, entry);
    }
  }
  /**
   * @param {...(FilterFn<T>|FilterData<T>)}   filters -
   */


  add(...filters) {
    var _filter$filter$subscr;

    /**
     * Tracks the number of filters added that have subscriber functionality.
     *
     * @type {number}
     */
    let subscribeCount = 0;

    for (const filter of filters) {
      const filterType = typeof filter;

      if (filterType !== 'function' && filterType !== 'object' || filter === null) {
        throw new TypeError(`DynArrayReducer error: 'filter' is not a function or object.`);
      }

      let data = void 0;
      let subscribeFn = void 0;

      switch (filterType) {
        case 'function':
          data = {
            id: void 0,
            filter,
            weight: 1
          };
          subscribeFn = filter.subscribe;
          break;

        case 'object':
          if (typeof filter.filter !== 'function') {
            throw new TypeError(`DynArrayReducer error: 'filter' attribute is not a function.`);
          }

          if (filter.weight !== void 0 && typeof filter.weight !== 'number' || filter.weight < 0 || filter.weight > 1) {
            throw new TypeError(`DynArrayReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
          }

          data = {
            id: filter.id !== void 0 ? filter.id : void 0,
            filter: filter.filter,
            weight: filter.weight || 1
          };
          subscribeFn = (_filter$filter$subscr = filter.filter.subscribe) !== null && _filter$filter$subscr !== void 0 ? _filter$filter$subscr : filter.subscribe;
          break;
      } // Find the index to insert where data.weight is less than existing values weight.


      const index = _classPrivateFieldGet(this, _filtersAdapter).filters.findIndex(value => {
        return data.weight < value.weight;
      }); // If an index was found insert at that location.


      if (index >= 0) {
        _classPrivateFieldGet(this, _filtersAdapter).filters.splice(index, 0, data);
      } else // push to end of filters.
        {
          _classPrivateFieldGet(this, _filtersAdapter).filters.push(data);
        }

      if (typeof subscribeFn === 'function') {
        const unsubscribe = subscribeFn(_classPrivateFieldGet(this, _indexUpdate)); // Ensure that unsubscribe is a function.

        if (typeof unsubscribe !== 'function') {
          throw new TypeError('DynArrayReducer error: Filter has subscribe function, but no unsubscribe function is returned.');
        } // Ensure that the same filter is not subscribed to multiple times.


        if (_classPrivateFieldGet(this, _mapUnsubscribe).has(data.filter)) {
          throw new Error('DynArrayReducer error: Filter added already has an unsubscribe function registered.');
        }

        _classPrivateFieldGet(this, _mapUnsubscribe).set(data.filter, unsubscribe);

        subscribeCount++;
      }
    } // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
    // subscriber count is less than the amount of filters added then automatically trigger an index update manually.


    if (subscribeCount < filters.length) {
      _classPrivateFieldGet(this, _indexUpdate).call(this);
    }
  }

  clear() {
    _classPrivateFieldGet(this, _filtersAdapter).filters.length = 0; // Unsubscribe from all filters with subscription support.

    for (const unsubscribe of _classPrivateFieldGet(this, _mapUnsubscribe).values()) {
      unsubscribe();
    }

    _classPrivateFieldGet(this, _mapUnsubscribe).clear();

    _classPrivateFieldGet(this, _indexUpdate).call(this);
  }
  /**
   * @param {...(FilterFn<T>|FilterData<T>)}   filters -
   */


  remove(...filters) {
    const length = _classPrivateFieldGet(this, _filtersAdapter).filters.length;

    if (length === 0) {
      return;
    }

    for (const data of filters) {
      // Handle the case that the filter may either be a function or a filter entry / object.
      const actualFilter = typeof data === 'function' ? data : data !== null && typeof data === 'object' ? data.filter : void 0;

      if (!actualFilter) {
        continue;
      }

      for (let cntr = _classPrivateFieldGet(this, _filtersAdapter).filters.length; --cntr >= 0;) {
        if (_classPrivateFieldGet(this, _filtersAdapter).filters[cntr].filter === actualFilter) {
          _classPrivateFieldGet(this, _filtersAdapter).filters.splice(cntr, 1); // Invoke any unsubscribe function for given filter then remove from tracking.


          let unsubscribe = void 0;

          if (typeof (unsubscribe = _classPrivateFieldGet(this, _mapUnsubscribe).get(actualFilter)) === 'function') {
            unsubscribe();

            _classPrivateFieldGet(this, _mapUnsubscribe).delete(actualFilter);
          }
        }
      }
    } // Update the index a filter was removed.


    if (length !== _classPrivateFieldGet(this, _filtersAdapter).filters.length) {
      _classPrivateFieldGet(this, _indexUpdate).call(this);
    }
  }
  /**
   * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
   * Any truthy value returned will remove that filter.
   *
   * @param {function(*, FilterFn<T>, number): boolean} callback - Callback function to evaluate each filter entry.
   */


  removeBy(callback) {
    const length = _classPrivateFieldGet(this, _filtersAdapter).filters.length;

    if (length === 0) {
      return;
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`DynArrayReducer error: 'callback' is not a function.`);
    }

    _classPrivateFieldGet(this, _filtersAdapter).filters = _classPrivateFieldGet(this, _filtersAdapter).filters.filter(data => {
      const remove = callback.call(callback, _objectSpread2({}, data));

      if (remove) {
        let unsubscribe;

        if (typeof (unsubscribe = _classPrivateFieldGet(this, _mapUnsubscribe).get(data.filter)) === 'function') {
          unsubscribe();

          _classPrivateFieldGet(this, _mapUnsubscribe).delete(data.filter);
        }
      } // Reverse remove boolean to properly filter / remove this filter.


      return !remove;
    });

    if (length !== _classPrivateFieldGet(this, _filtersAdapter).filters.length) {
      _classPrivateFieldGet(this, _indexUpdate).call(this);
    }
  }

  removeById(...ids) {
    const length = _classPrivateFieldGet(this, _filtersAdapter).filters.length;

    if (length === 0) {
      return;
    }

    _classPrivateFieldGet(this, _filtersAdapter).filters = _classPrivateFieldGet(this, _filtersAdapter).filters.filter(data => {
      let remove = false;

      for (const id of ids) {
        remove |= data.id === id;
      } // If not keeping invoke any unsubscribe function for given filter then remove from tracking.


      if (remove) {
        let unsubscribe;

        if (typeof (unsubscribe = _classPrivateFieldGet(this, _mapUnsubscribe).get(data.filter)) === 'function') {
          unsubscribe();

          _classPrivateFieldGet(this, _mapUnsubscribe).delete(data.filter);
        }
      }

      return !remove; // Swap here to actually remove the item via array filter method.
    });

    if (length !== _classPrivateFieldGet(this, _filtersAdapter).filters.length) {
      _classPrivateFieldGet(this, _indexUpdate).call(this);
    }
  }

}
/**
 * @template T
 */


var _sortAdapter = /*#__PURE__*/new WeakMap();

var _indexUpdate2 = /*#__PURE__*/new WeakMap();

var _unsubscribe = /*#__PURE__*/new WeakMap();

class AdapterSort {
  /**
   * @param {Function} indexUpdate - Function to update indexer.
   *
   * @returns {[AdapterSort<T>, {compareFn: CompareFn<T>}]} This and the internal sort adapter data.
   */
  constructor(indexUpdate) {
    _classPrivateFieldInitSpec(this, _sortAdapter, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _indexUpdate2, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _unsubscribe, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _indexUpdate2, indexUpdate);

    _classPrivateFieldSet(this, _sortAdapter, {
      compareFn: null
    });

    Object.seal(this);
    return [this, _classPrivateFieldGet(this, _sortAdapter)];
  }
  /**
   * @param {CompareFn<T>|SortData<T>}  data -
   *
   * A callback function that compares two values. Return > 0 to sort b before a;
   * < 0 to sort a before b; or 0 to keep original order of a & b.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
   */


  set(data) {
    var _data$compare$subscri;

    if (typeof _classPrivateFieldGet(this, _unsubscribe) === 'function') {
      _classPrivateFieldGet(this, _unsubscribe).call(this);

      _classPrivateFieldSet(this, _unsubscribe, void 0);
    }

    let compareFn = void 0;
    let subscribeFn = void 0;

    switch (typeof data) {
      case 'function':
        compareFn = data;
        subscribeFn = data.subscribe;
        break;

      case 'object':
        // Early out if data is null / noop.
        if (data === null) {
          break;
        }

        if (typeof data.compare !== 'function') {
          throw new TypeError(`DynArrayReducer error: 'compare' attribute is not a function.`);
        }

        compareFn = data.compare;
        subscribeFn = (_data$compare$subscri = data.compare.subscribe) !== null && _data$compare$subscri !== void 0 ? _data$compare$subscri : data.subscribe;
        break;
    }

    if (typeof compareFn === 'function') {
      _classPrivateFieldGet(this, _sortAdapter).compareFn = compareFn;
    } else {
      const oldCompareFn = _classPrivateFieldGet(this, _sortAdapter).compareFn;

      _classPrivateFieldGet(this, _sortAdapter).compareFn = null; // Update index if the old compare function exists.

      if (typeof oldCompareFn === 'function') {
        _classPrivateFieldGet(this, _indexUpdate2).call(this);
      }

      return;
    }

    if (typeof subscribeFn === 'function') {
      _classPrivateFieldSet(this, _unsubscribe, subscribeFn(_classPrivateFieldGet(this, _indexUpdate2))); // Ensure that unsubscribe is a function.


      if (typeof _classPrivateFieldGet(this, _unsubscribe) !== 'function') {
        throw new Error(`DynArrayReducer error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
      }
    } else {
      // A sort function with subscriber functionality are assumed to immediately invoke the `subscribe` callback.
      // Only manually update the index if there is no subscriber functionality.
      _classPrivateFieldGet(this, _indexUpdate2).call(this);
    }
  }

  reset() {
    const oldCompareFn = _classPrivateFieldGet(this, _sortAdapter).compareFn;

    _classPrivateFieldGet(this, _sortAdapter).compareFn = null;

    if (typeof _classPrivateFieldGet(this, _unsubscribe) === 'function') {
      _classPrivateFieldGet(this, _unsubscribe).call(this);

      _classPrivateFieldSet(this, _unsubscribe, void 0);
    } // Only update index if an old compare function is set.


    if (typeof oldCompareFn === 'function') {
      _classPrivateFieldGet(this, _indexUpdate2).call(this);
    }
  }

}

class Indexer {
  constructor(hostItems, hostUpdate) {
    this.hostItems = hostItems;
    this.hostUpdate = hostUpdate;
    const indexAdapter = {
      index: null,
      hash: null
    };
    const publicAPI = {
      update: this.update.bind(this),

      /**
       * Provides an iterator over the index array.
       *
       * @returns {Generator<any, void, *>} Iterator.
       * @yields
       */
      [Symbol.iterator]: function* () {
        if (!indexAdapter.index) {
          return;
        }

        for (const index of indexAdapter.index) {
          yield index;
        }
      }
    }; // Define a getter on the public API to get the length / count of index array.

    Object.defineProperties(publicAPI, {
      hash: {
        get: () => indexAdapter.hash
      },
      isActive: {
        get: () => this.isActive()
      },
      length: {
        get: () => Array.isArray(indexAdapter.index) ? indexAdapter.index.length : 0
      }
    });
    Object.freeze(publicAPI);
    indexAdapter.publicAPI = publicAPI;
    this.indexAdapter = indexAdapter;
    return [this, indexAdapter];
  }
  /**
   * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
   * is set to null. Set calculated new hash value to the index adapter hash value.
   *
   * After hash generation compare old and new hash values and perform an update if they are different. If they are
   * equal check for array equality between the old and new index array and perform an update if they are not equal.
   *
   * @param {number[]}    oldIndex - Old index array.
   *
   * @param {number|null} oldHash - Old index hash value.
   */


  calcHashUpdate(oldIndex, oldHash) {
    let newHash = null;
    const newIndex = this.indexAdapter.index;

    if (newIndex) {
      for (let cntr = newIndex.length; --cntr >= 0;) {
        newHash ^= newIndex[cntr] + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
      }
    }

    this.indexAdapter.hash = newHash;

    if (oldHash === newHash ? !s_ARRAY_EQUALS(oldIndex, newIndex) : true) {
      this.hostUpdate();
    }
  }

  initAdapters(filtersAdapter, sortAdapter) {
    this.filtersAdapter = filtersAdapter;
    this.sortAdapter = sortAdapter;

    this.sortFn = (a, b) => {
      return this.sortAdapter.compareFn(this.hostItems[a], this.hostItems[b]);
    };
  }

  isActive() {
    return this.filtersAdapter.filters.length > 0 || this.sortAdapter.compareFn !== null;
  }
  /**
   * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
   *
   * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
   * but the maintenance factor is not worth the extra complication.
   *
   * @returns {number[]} New filtered index array.
   */


  reduceImpl() {
    const data = [];
    const filters = this.filtersAdapter.filters;
    let include = true;

    for (let cntr = 0, length = this.hostItems.length; cntr < length; cntr++) {
      include = true;

      for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
        if (!filters[filCntr].filter(this.hostItems[cntr])) {
          include = false;
          break;
        }
      }

      if (include) {
        data.push(cntr);
      }
    }

    return data;
  }

  update() {
    const oldIndex = this.indexAdapter.index;
    const oldHash = this.indexAdapter.hash; // Clear index if there are no filters and no sort function or the index length doesn't match the item length.

    if (this.filtersAdapter.filters.length === 0 && !this.sortAdapter.compareFn || this.indexAdapter.index && this.hostItems.length !== this.indexAdapter.index.length) {
      this.indexAdapter.index = null;
    } // If there are filters build new index.


    if (this.filtersAdapter.filters.length > 0) {
      this.indexAdapter.index = this.reduceImpl();
    }

    if (this.sortAdapter.compareFn) {
      // If there is no index then create one with keys matching host item length.
      if (!this.indexAdapter.index) {
        this.indexAdapter.index = [...Array(this.hostItems.length).keys()];
      }

      this.indexAdapter.index.sort(this.sortFn);
    }

    this.calcHashUpdate(oldIndex, oldHash);
  }

}
/**
 * Checks for array equality between two arrays of numbers.
 *
 * @param {number[]} a - Array A
 *
 * @param {number[]} b - Array B
 *
 * @returns {boolean} Arrays equal
 */


function s_ARRAY_EQUALS(a, b) {
  if (a === b) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }
  /* c8 ignore next */


  if (a.length !== b.length) {
    return false;
  }

  for (let cntr = a.length; --cntr >= 0;) {
    /* c8 ignore next */
    if (a[cntr] !== b[cntr]) {
      return false;
    }
  }

  return true;
}
/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template T
 */


var _items = /*#__PURE__*/new WeakMap();

var _index = /*#__PURE__*/new WeakMap();

var _indexAdapter = /*#__PURE__*/new WeakMap();

var _filters = /*#__PURE__*/new WeakMap();

var _filtersAdapter2 = /*#__PURE__*/new WeakMap();

var _sort = /*#__PURE__*/new WeakMap();

var _sortAdapter2 = /*#__PURE__*/new WeakMap();

var _subscriptions = /*#__PURE__*/new WeakMap();

var _notify = /*#__PURE__*/new WeakSet();

_Symbol$iterator2 = Symbol.iterator;

class DynArrayReducer {
  /**
   * @type {AdapterFilters<T>}
   */

  /**
   * @type {{filters: FilterFn<T>[]}}
   */

  /**
   * @type {AdapterSort<T>}
   */

  /**
   * @type {{compareFn: CompareFn<T>}}
   */

  /**
   * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
   * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
   *
   * @param {Iterable<T>|DynData<T>}   data - Data iterable to store if array or copy otherwise.
   */
  constructor(data = void 0) {
    _classPrivateMethodInitSpec(this, _notify);

    _classPrivateFieldInitSpec(this, _items, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _index, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _indexAdapter, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _filters, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _filtersAdapter2, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _sort, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _sortAdapter2, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _subscriptions, {
      writable: true,
      value: []
    });

    let dataIterable = void 0;
    let filters = void 0;
    let sort = void 0; // Potentially working with DynData.

    if (!s_IS_ITERABLE(data) && typeof data === 'object') {
      if (!s_IS_ITERABLE(data.data)) {
        throw new TypeError(`DynArrayReducer error (DynData): 'data' attribute is not iterable.`);
      }

      dataIterable = data.data;

      if (data.filters !== void 0) {
        if (s_IS_ITERABLE(data.filters)) {
          filters = data.filters;
        } else {
          throw new TypeError(`DynArrayReducer error (DynData): 'filters' attribute is not iterable.`);
        }
      }

      if (data.sort !== void 0) {
        if (typeof data.sort === 'function') {
          sort = data.sort;
        } else {
          throw new TypeError(`DynArrayReducer error (DynData): 'sort' attribute is not a function.`);
        }
      }
    } else {
      if (!s_IS_ITERABLE(data)) {
        throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
      }

      dataIterable = data;
    } // In the case of the main data being an array directly use the array otherwise create a copy.


    _classPrivateFieldSet(this, _items, Array.isArray(dataIterable) ? dataIterable : [...dataIterable]);

    [_classPrivateFieldDestructureSet(this, _index).value, _classPrivateFieldDestructureSet(this, _indexAdapter).value] = new Indexer(_classPrivateFieldGet(this, _items), _classPrivateMethodGet(this, _notify, _notify2).bind(this));
    [_classPrivateFieldDestructureSet(this, _filters).value, _classPrivateFieldDestructureSet(this, _filtersAdapter2).value] = new AdapterFilters(_classPrivateFieldGet(this, _indexAdapter).publicAPI.update);
    [_classPrivateFieldDestructureSet(this, _sort).value, _classPrivateFieldDestructureSet(this, _sortAdapter2).value] = new AdapterSort(_classPrivateFieldGet(this, _indexAdapter).publicAPI.update);

    _classPrivateFieldGet(this, _index).initAdapters(_classPrivateFieldGet(this, _filtersAdapter2), _classPrivateFieldGet(this, _sortAdapter2)); // Add any filters and sort function defined by DynData.


    if (filters) {
      this.filters.add(...filters);
    }

    if (sort) {
      this.sort.set(sort);
    }
  }
  /**
   * @returns {AdapterFilters<T>} The filters adapter.
   */


  get filters() {
    return _classPrivateFieldGet(this, _filters);
  }
  /**
   * Returns the Indexer public API.
   *
   * @returns {IndexerAPI & Iterable<number>} Indexer API - is also iterable.
   */


  get index() {
    return _classPrivateFieldGet(this, _indexAdapter).publicAPI;
  }
  /**
   * Gets the main data / items length.
   *
   * @returns {number} Main data / items length.
   */


  get length() {
    return _classPrivateFieldGet(this, _items).length;
  }
  /**
   * @returns {AdapterSort<T>} The sort adapter.
   */


  get sort() {
    return _classPrivateFieldGet(this, _sort);
  }
  /**
   *
   * @param {function(DynArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
   *                                                       Receives `this` reference.
   *
   * @returns {(function(): void)} Unsubscribe function.
   */


  subscribe(handler) {
    _classPrivateFieldGet(this, _subscriptions).push(handler); // add handler to the array of subscribers


    handler(this); // call handler with current value
    // Return unsubscribe function.

    return () => {
      const index = _classPrivateFieldGet(this, _subscriptions).findIndex(sub => sub === handler);

      if (index >= 0) {
        _classPrivateFieldGet(this, _subscriptions).splice(index, 1);
      }
    };
  }
  /**
   *
   */


  /**
   * Provides an iterator for data stored in DynArrayReducer.
   *
   * @returns {Generator<*, T, *>} Generator / iterator of all data.
   * @yields {T}
   */
  *[_Symbol$iterator2]() {
    const items = _classPrivateFieldGet(this, _items);

    if (items.length === 0) {
      return;
    }

    if (_classPrivateFieldGet(this, _index).isActive()) {
      for (const entry of this.index) {
        yield items[entry];
      }
    } else {
      for (const entry of items) {
        yield entry;
      }
    }
  }

}
/**
 * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
 *
 * @param {*}  data - Data to verify as iterable.
 *
 * @returns {boolean} Is data iterable.
 */


function _notify2() {
  // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
  // support until 2023. IE not doing this will require several extra method calls otherwise.
  const subscriptions = _classPrivateFieldGet(this, _subscriptions);

  for (let cntr = 0; cntr < subscriptions.length; cntr++) {
    subscriptions[cntr](this);
  }
}

function s_IS_ITERABLE(data) {
  return data !== null && data !== void 0 && typeof data === 'object' && typeof data[Symbol.iterator] === 'function';
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a store by having a `subscribe` function.
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isStore(store) {
  if (store === null || store === void 0) {
    return false;
  }

  switch (typeof store) {
    case 'function':
    case 'object':
      return typeof store.subscribe === 'function';
  }

  return false;
}
/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */

function subscribeIgnoreFirst(store, update) {
  let firedFirst = false;
  return store.subscribe(value => {
    if (!firedFirst) {
      firedFirst = true;
    } else {
      update(value);
    }
  });
}
/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */

function subscribeFirstRest(store, first, update) {
  let firedFirst = false;
  return store.subscribe(value => {
    if (!firedFirst) {
      firedFirst = true;
      first(value);
    } else {
      update(value);
    }
  });
}

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
      if (storage.getItem(key)) {
        value = JSON.parse(storage.getItem(key));
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

    return {
      set,
      update,
      subscribe
    };
  }

  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;

    if (storage && storage.getItem(key)) {
      initial_value = JSON.parse(storage.getItem(key));
    }

    return readable(key, initial_value, set => {
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

      const unsubscribers = stores_array.map((store, i) => store.subscribe(value => {
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

var storage$1 = typeof window !== "undefined" ? window.localStorage : void 0;
var g$1 = generator(storage$1);
var writable$1 = g$1.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} LSStore - The backing Svelte store; a writable w/ get method attached.
 */

var _stores$1 = /*#__PURE__*/new WeakMap();

class LocalStorage {
  constructor() {
    _classPrivateFieldInitSpec(this, _stores$1, {
      writable: true,
      value: new Map()
    });
  }

  /**
   * Get value from the localstorage.
   *
   * @param {string}   key - Key to lookup in localstorage.
   *
   * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
   *
   * @returns {*} Value from local storage or if not defined any default value provided.
   */
  getItem(key, defaultValue) {
    let value = defaultValue;
    const storageValue = localStorage.getItem(key);

    if (storageValue !== void 0) {
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


  getStore(key, defaultValue) {
    return s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key, defaultValue);
  }
  /**
   * Sets the value for the given key in localstorage.
   *
   * @param {string}   key - Key to lookup in localstorage.
   *
   * @param {*}        value - A value to set for this key.
   */


  setItem(key, value) {
    const store = s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key);
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


  swapItemBoolean(key, defaultValue) {
    const store = s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key, defaultValue);
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

function s_GET_STORE$1(stores, key, defaultValue = void 0) {
  let store = stores.get(key);

  if (store === void 0) {
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


function s_CREATE_STORE$1(key, defaultValue = void 0) {
  try {
    if (localStorage.getItem(key)) {
      defaultValue = JSON.parse(localStorage.getItem(key));
    }
  } catch (err) {
    /**/
  }

  const store = writable$1(key, defaultValue);

  store.get = () => get(store);

  return store;
}

var storage = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage);
var writable = g.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} SSStore - The backing Svelte store; a writable w/ get method attached.
 */

var _stores = /*#__PURE__*/new WeakMap();

class SessionStorage {
  constructor() {
    _classPrivateFieldInitSpec(this, _stores, {
      writable: true,
      value: new Map()
    });
  }

  /**
   * Get value from the sessionstorage.
   *
   * @param {string}   key - Key to lookup in sessionstorage.
   *
   * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
   *
   * @returns {*} Value from session storage or if not defined any default value provided.
   */
  getItem(key, defaultValue) {
    let value = defaultValue;
    const storageValue = sessionStorage.getItem(key);

    if (storageValue !== void 0) {
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


  getStore(key, defaultValue) {
    return s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key, defaultValue);
  }
  /**
   * Sets the value for the given key in sessionstorage.
   *
   * @param {string}   key - Key to lookup in sessionstorage.
   *
   * @param {*}        value - A value to set for this key.
   */


  setItem(key, value) {
    const store = s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key);
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


  swapItemBoolean(key, defaultValue) {
    const store = s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key, defaultValue);
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

function s_GET_STORE$2(stores, key, defaultValue = void 0) {
  let store = stores.get(key);

  if (store === void 0) {
    store = s_CREATE_STORE$2(key, defaultValue);
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


function s_CREATE_STORE$2(key, defaultValue = void 0) {
  try {
    if (sessionStorage.getItem(key)) {
      defaultValue = JSON.parse(sessionStorage.getItem(key));
    }
  } catch (err) {
    /**/
  }

  const store = writable(key, defaultValue);

  store.get = () => get(store);

  return store;
}

/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#Store_contract)
 */

/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#derived), but which
 * has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 * 
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 2nd parameter.
 * @param {!Function|{withOld: !Function}} reflect Called when the
 * derived store gets a new value via its `set` or `update` methods, and determines new values for
 * the origin stores. [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 3rd parameter.
 * 
 * @returns {Store} A writable store.
 */

function writableDerived(origins, derive, reflect, initial) {
  var childDerivedSetter,
      originValues,
      allowDerive = true;
  var reflectOldValues = ("withOld" in reflect);

  var wrappedDerive = (got, set) => {
    childDerivedSetter = set;

    if (reflectOldValues) {
      originValues = got;
    }

    if (allowDerive) {
      let returned = derive(got, set);

      if (derive.length < 2) {
        set(returned);
      } else {
        return returned;
      }
    }
  };

  var childDerived = derived(origins, wrappedDerive, initial);
  var singleOrigin = !Array.isArray(origins);

  var sendUpstream = setWith => {
    allowDerive = false;

    if (singleOrigin) {
      origins.set(setWith);
    } else {
      setWith.forEach((value, i) => {
        origins[i].set(value);
      });
    }

    allowDerive = true;
  };

  if (reflectOldValues) {
    reflect = reflect.withOld;
  }

  var reflectIsAsync = reflect.length >= (reflectOldValues ? 3 : 2);
  var cleanup = null;

  function doReflect(reflecting) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    if (reflectOldValues) {
      var returned = reflect(reflecting, originValues, sendUpstream);
    } else {
      var returned = reflect(reflecting, sendUpstream);
    }

    if (reflectIsAsync) {
      if (typeof returned == "function") {
        cleanup = returned;
      }
    } else {
      sendUpstream(returned);
    }
  }

  var tryingSet = false;

  function update(fn) {
    var isUpdated, mutatedBySubscriptions, oldValue, newValue;

    if (tryingSet) {
      newValue = fn(get(childDerived));
      childDerivedSetter(newValue);
      return;
    }

    var unsubscribe = childDerived.subscribe(value => {
      if (!tryingSet) {
        oldValue = value;
      } else if (!isUpdated) {
        isUpdated = true;
      } else {
        mutatedBySubscriptions = true;
      }
    });
    newValue = fn(oldValue);
    tryingSet = true;
    childDerivedSetter(newValue);
    unsubscribe();
    tryingSet = false;

    if (mutatedBySubscriptions) {
      newValue = get(childDerived);
    }

    if (isUpdated) {
      doReflect(newValue);
    }
  }

  return {
    subscribe: childDerived.subscribe,

    set(value) {
      update(() => value);
    },

    update
  };
}
/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 * 
 * @param {Store} origin The store containing the object to get/set from.
 * @param {string|number|symbol|Array<string|number|symbol>} propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns {Store} A writable store.
 */

function propertyStore(origin, propName) {
  if (!Array.isArray(propName)) {
    return writableDerived(origin, object => object[propName], {
      withOld(reflecting, object) {
        object[propName] = reflecting;
        return object;
      }

    });
  } else {
    let props = propName.concat();
    return writableDerived(origin, value => {
      for (let i = 0; i < props.length; ++i) {
        value = value[props[i]];
      }

      return value;
    }, {
      withOld(reflecting, object) {
        let target = object;

        for (let i = 0; i < props.length - 1; ++i) {
          target = target[props[i]];
        }

        target[props[props.length - 1]] = reflecting;
        return object;
      }

    });
  }
}

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {foundry.abstract.Document} T
 */
class TJSDocument
{
   #document;
   #uuidv4;

   /**
    * @type {TJSDocumentOptions}
    */
   #options = { delete: void 0, notifyOnDelete: false };

   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T}                    [document] - Document to wrap.
    *
    * @param {TJSDocumentOptions}   [options] - TJSDocument options.
    */
   constructor(document, options = {})
   {
      this.#uuidv4 = `tjs-document-${uuidv4()}`;

      this.setOptions(options);
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
   get uuidv4() { return this.#uuidv4; }

   /**
    * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      if (this.#document instanceof foundry.abstract.Document)
      {
         delete this.#document.apps[this.#uuidv4];
         this.#document = void 0;
      }

      this.#updateOptions = void 0;

      if (typeof this.#options.delete === 'function') { await this.#options.delete(); }

      if (this.#options.notifyOnDelete) { this.#notify(); }
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have document update context.
    */
   #notify(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const document = this.#document;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](document, options); }
   }

   /**
    * @returns {T | undefined} Current document
    */
   get() { return this.#document; }

   /**
    * @param {T | undefined}  document - New document to set.
    *
    * @param {object}         [options] - New document update options to set.
    */
   set(document, options = {})
   {
      if (this.#document)
      {
         delete this.#document.apps[this.#uuidv4];
      }

      if (document !== void 0 && !(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined.`);
      }

      if (options === null || typeof options !== 'object')
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (document instanceof foundry.abstract.Document)
      {
         document.apps[this.#uuidv4] = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };
      }

      this.#document = document;
      this.#updateOptions = options;
      this.#notify();
   }

   /**
    * Potentially sets new document from data transfer object.
    *
    * @param {object}   data - Document transfer data.
    *
    * @param {ParseDataTransferOptions & TJSDocumentOptions}   [options] - Optional parameters.
    *
    * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
    */
   async setFromDataTransfer(data, options)
   {
      return this.setFromUUID(getUUIDFromDataTransfer(data, options), options);
   }

   /**
    * Sets the document by Foundry UUID performing a lookup and setting the document if found.
    *
    * @param {string}   uuid - A Foundry UUID to lookup.
    *
    * @param {TJSDocumentOptions}   [options] - New document update options to set.
    *
    * @returns {Promise<boolean>} True if successfully set document from UUID.
    */
   async setFromUUID(uuid, options = {})
   {
      if (typeof uuid !== 'string' || uuid.length === 0) { return false; }

      try
      {
         const doc = await globalThis.fromUuid(uuid);

         if (doc)
         {
            this.set(doc, options);
            return true;
         }
      }
      catch (err) { /**/ }

      return false;
   }

   /**
    * Sets options for this document wrapper / store.
    *
    * @param {TJSDocumentOptions}   options - Options for TJSDocument.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument error: 'options' is not an object.`);
      }

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function.`);
      }

      if (options.notifyOnDelete !== void 0 && typeof options.notifyOnDelete !== 'boolean')
      {
         throw new TypeError(`TJSDocument error: 'notifyOnDelete' attribute in options is not a boolean.`);
      }

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
      }

      if (typeof options.notifyOnDelete === 'boolean')
      {
         this.#options.notifyOnDelete = options.notifyOnDelete;
      }
   }

   /**
    * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);              // Add handler to the array of subscribers.

      handler(this.#document, this.updateOptions);   // Call handler with current value and update options.

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

/**
 * @typedef TJSDocumentOptions
 *
 * @property {Function} delete - Optional delete function to invoke when document is deleted.
 *
 * @property {boolean} notifyOnDelete - When true a subscribers are notified of the deletion of the document.
 */

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {DocumentCollection} T
 */
class TJSDocumentCollection
{
   #collection;
   #collectionCallback;
   #uuid;

   /**
    * @type {TJSDocumentCollectionOptions}
    */
   #options = { delete: void 0, notifyOnDelete: false };

   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T}                             [collection] - Collection to wrap.
    *
    * @param {TJSDocumentCollectionOptions}  [options] - TJSDocumentCollection options.
    */
   constructor(collection, options = {})
   {
      if (options?.delete !== void 0 && typeof options?.delete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function.`);
      }

      this.#uuid = `tjs-collection-${uuidv4()}`;

      this.setOptions(options);
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

      if (typeof this.#options.delete === 'function') { await this.#options.delete(); }

      if (this.#options.notifyOnDelete) { this.#notify(); }
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have collection update context.
    */
   #notify(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const collection = this.#collection;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](collection, options); }
   }

   /**
    * @returns {T | undefined} Current collection
    */
   get() { return this.#collection; }

   /**
    * @param {T | undefined}  collection - New collection to set.
    *
    * @param {object}         [options] - New collection update options to set.
    */
   set(collection, options = {})
   {
      if (this.#collection)
      {
         const index = this.#collection.apps.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { this.#collection.apps.splice(index, 1); }

         this.#collectionCallback = void 0;
      }

      if (collection !== void 0 && !(collection instanceof DocumentCollection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (options === null || typeof options !== 'object')
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (collection instanceof DocumentCollection)
      {
         this.#collectionCallback = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };

         collection.apps.push(this.#collectionCallback);
      }

      this.#collection = collection;
      this.#updateOptions = options;
      this.#notify();
   }

   /**
    * Sets options for this collection wrapper / store.
    *
    * @param {TJSDocumentCollectionOptions}   options - Options for TJSDocumentCollection.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocumentCollection error: 'options' is not an object.`);
      }

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function.`);
      }

      if (options.notifyOnDelete !== void 0 && typeof options.notifyOnDelete !== 'boolean')
      {
         throw new TypeError(`TJSDocumentCollection error: 'notifyOnDelete' attribute in options is not a boolean.`);
      }

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
      }

      if (typeof options.notifyOnDelete === 'boolean')
      {
         this.#options.notifyOnDelete = options.notifyOnDelete;
      }
   }

   /**
    * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);              // Add handler to the array of subscribers.

      handler(this.#collection, this.updateOptions);  // Call handler with current value and update options.

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

/**
 * @typedef TJSDocumentCollectionOptions
 *
 * @property {Function} delete - Optional delete function to invoke when document is deleted.
 *
 * @property {boolean} notifyOnDelete - When true a subscribers are notified of the deletion of the document.
 */

const storeState = writable$2(void 0);

/**
 * @type {GameState} Provides a Svelte store wrapping the Foundry runtime / global game state.
 */
const gameState = {
   subscribe: storeState.subscribe,
   get: () => game
};

Object.freeze(gameState);

Hooks.once('ready', () => storeState.set(game));

/**
 * @typedef {import('svelte/store').Readable} GameState - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Provides the Svelte store subscribe function.
 *
 * @property {Function} get - Provides a mechanism to directly access the Foundry game state without subscribing.
 */

/**
 * Registers game settings and creates a backing Svelte store for each setting. It is possible to add multiple
 * `onChange` callbacks on registration.
 */
class TJSGameSettings
{
   /**
    * @type {Map<string, GSStore>}
    */
   #stores = new Map();

   /**
    * Returns the Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {GSStore|undefined} The associated store for the given game setting key.
    */
   getStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getStore: '${key}' is not a registered setting.`);
         return;
      }

      return s_GET_STORE(this.#stores, key);
   }

   /**
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    */
   register(setting)
   {
      if (typeof setting !== 'object') { throw new TypeError(`TJSGameSettings - register: setting is not an object.`); }

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

      const onchangeFunctions = [];

      // Handle loading any existing `onChange` callbacks.
      if (isIterable(options?.onChange))
      {
         for (const entry of options.onChange)
         {
            if (typeof entry === 'function') { onchangeFunctions.push(entry); }
         }
      }
      else if (typeof options.onChange === 'function')
      {
         onchangeFunctions.push(options.onChange);
      }

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value) =>
      {
         const store = s_GET_STORE(this.#stores, key);
         if (store) { store.set(value); }
      });

      // Provides the final onChange callback that iterates over all the stored onChange callbacks.
      const onChange = (value) =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      game.settings.register(moduleId, key, { ...options, onChange });

      // Set new store value with existing setting or default value.
      const newStore = s_GET_STORE(this.#stores, key, game.settings.get(moduleId, key));

      // Subscribe to self to set associated game setting on updates after verifying that the new value does not match
      // existing game setting.
      newStore.subscribe((value) =>
      {
         if (game.settings.get(moduleId, key) !== value) { game.settings.set(moduleId, key, value); }
      });
   }

   /**
    * Registers multiple settings.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    */
   registerAll(settings)
   {
      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings)
      {
         if (typeof entry !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
         }

         if (typeof entry.moduleId !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'moduleId' attribute.`);
         }

         if (typeof entry.key !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
         }

         if (typeof entry.options !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'options' attribute.`);
         }

         this.register(entry);
      }
   }
}

/**
 * Gets a store from the GSStore Map or creates a new store for the key.
 *
 * @param {Map<string, GSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {string}               [initialValue] - An initial value to set to new stores.
 *
 * @returns {GSStore} The store for the given key.
 */
function s_GET_STORE(stores, key, initialValue)
{
   let store = stores.get(key);
   if (store === void 0)
   {
      store = s_CREATE_STORE(initialValue);
      stores.set(key, store);
   }

   return store;
}

/**
 * Creates a new GSStore for the given key.
 *
 * @param {string}   initialValue - An initial value to set to new stores.
 *
 * @returns {GSStore} The new GSStore.
 */
function s_CREATE_STORE(initialValue)
{
   const store = writable$2(initialValue);
   store.get = () => get(store);

   return store;
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

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} GSStore - The backing Svelte store; a writable w/ get method attached.
 */

export { DynArrayReducer, LocalStorage, SessionStorage, TJSDocument, TJSDocumentCollection, TJSGameSettings, gameState, isStore, propertyStore, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
//# sourceMappingURL=index.js.map
