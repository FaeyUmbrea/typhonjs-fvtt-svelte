/**
 * Defines the keys of PositionData that are transform keys.
 *
 * @type {string[]}
 */
const transformKeys = ['rotateX', 'rotateY', 'rotateZ', 'scale'];

Object.freeze(transformKeys);

/**
 * Defines bitwise keys for transforms used in {@link Transforms.getMat4FromTransforms}.
 *
 * @type {object}
 */
const transformKeysBitwise = {
   rotateX: 1,
   rotateY: 2,
   rotateZ: 4,
   scale: 8
};

Object.freeze(transformKeysBitwise);

/**
 * Defines the default transform origin.
 *
 * @type {string}
 */
const transformOriginDefault = 'top left';

/**
 * Defines the valid transform origins.
 *
 * @type {string[]}
 */
const transformOrigins = ['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left',
 'bottom center', 'bottom right'];

Object.freeze(transformOrigins);

export { transformKeys, transformKeysBitwise, transformOriginDefault, transformOrigins };
