'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var emotionElement = require('./emotion-element-25f9958c.browser.cjs.js');
var React = require('react');
var utils = require('@emotion/utils');
var useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
var serialize = require('@emotion/serialize');
require('@emotion/cache');
require('@babel/runtime/helpers/extends');
require('@emotion/weak-memoize');
require('../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.cjs.js');
require('hoist-non-react-statics');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

exports.jsx = function jsx(type, props) {
  // eslint-disable-next-line prefer-rest-params
  var args = arguments;

  if (props == null || !emotionElement.hasOwn.call(props, 'css')) {
    return React__namespace.createElement.apply(undefined, args);
  }

  var argsLength = args.length;
  var createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = emotionElement.Emotion;
  createElementArgArray[1] = emotionElement.createEmotionProps(type, props);

  for (var i = 2; i < argsLength; i++) {
    createElementArgArray[i] = args[i];
  }

  return React__namespace.createElement.apply(null, createElementArgArray);
};

(function (_jsx) {
  var JSX;

  (function (_JSX) {})(JSX || (JSX = _jsx.JSX || (_jsx.JSX = {})));
})(exports.jsx || (exports.jsx = {}));

// initial render from browser, insertBefore context.sheet.tags[0] or if a style hasn't been inserted there yet, appendChild
// initial client-side render from SSR, use place of hydrating tag

var Global = /* #__PURE__ */emotionElement.withEmotionCache(function (props, cache) {

  var styles = props.styles;
  var serialized = serialize.serializeStyles([styles], undefined, React__namespace.useContext(emotionElement.ThemeContext));
  // but it is based on a constant that will never change at runtime
  // it's effectively like having two implementations and switching them out
  // so it's not actually breaking anything


  var sheetRef = React__namespace.useRef();
  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(function () {
    var key = cache.key + "-global"; // use case of https://github.com/emotion-js/emotion/issues/2675

    var sheet = new cache.sheet.constructor({
      key: key,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy
    });
    var rehydrating = false;
    var node = document.querySelector("style[data-emotion=\"" + key + " " + serialized.name + "\"]");

    if (cache.sheet.tags.length) {
      sheet.before = cache.sheet.tags[0];
    }

    if (node !== null) {
      rehydrating = true; // clear the hash so this node won't be recognizable as rehydratable by other <Global/>s

      node.setAttribute('data-emotion', key);
      sheet.hydrate([node]);
    }

    sheetRef.current = [sheet, rehydrating];
    return function () {
      sheet.flush();
    };
  }, [cache]);
  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(function () {
    var sheetRefCurrent = sheetRef.current;
    var sheet = sheetRefCurrent[0],
        rehydrating = sheetRefCurrent[1];

    if (rehydrating) {
      sheetRefCurrent[1] = false;
      return;
    }

    if (serialized.next !== undefined) {
      // insert keyframes
      utils.insertStyles(cache, serialized.next, true);
    }

    if (sheet.tags.length) {
      // if this doesn't exist then it will be null so the style element will be appended
      var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
      sheet.before = element;
      sheet.flush();
    }

    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);
  return null;
});

function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return serialize.serializeStyles(args);
}

function keyframes() {
  var insertable = css.apply(void 0, arguments);
  var name = "animation-" + insertable.name;
  return {
    name: name,
    styles: "@keyframes " + name + "{" + insertable.styles + "}",
    anim: 1,
    toString: function toString() {
      return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
    }
  };
}

var classnames = function classnames(args) {
  var len = args.length;
  var i = 0;
  var cls = '';

  for (; i < len; i++) {
    var arg = args[i];
    if (arg == null) continue;
    var toAdd = void 0;

    switch (typeof arg) {
      case 'boolean':
        break;

      case 'object':
        {
          if (Array.isArray(arg)) {
            toAdd = classnames(arg);
          } else {

            toAdd = '';

            for (var k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += ' ');
                toAdd += k;
              }
            }
          }

          break;
        }

      default:
        {
          toAdd = arg;
        }
    }

    if (toAdd) {
      cls && (cls += ' ');
      cls += toAdd;
    }
  }

  return cls;
};

function merge(registered, css, className) {
  var registeredStyles = [];
  var rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

var Insertion = function Insertion(_ref) {
  var cache = _ref.cache,
      serializedArr = _ref.serializedArr;
  useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(function () {

    for (var i = 0; i < serializedArr.length; i++) {
      utils.insertStyles(cache, serializedArr[i], false);
    }
  });

  return null;
};

var ClassNames = /* #__PURE__ */emotionElement.withEmotionCache(function (props, cache) {
  var hasRendered = false;
  var serializedArr = [];

  var css = function css() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('css can only be used during render');
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var serialized = serialize.serializeStyles(args, cache.registered);
    serializedArr.push(serialized); // registration has to happen here as the result of this might get consumed by `cx`

    utils.registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  var cx = function cx() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('cx can only be used during render');
    }

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return merge(cache.registered, css, classnames(args));
  };

  var content = {
    css: css,
    cx: cx,
    theme: React__namespace.useContext(emotionElement.ThemeContext)
  };
  var ele = props.children(content);
  hasRendered = true;
  return /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, /*#__PURE__*/React__namespace.createElement(Insertion, {
    cache: cache,
    serializedArr: serializedArr
  }), ele);
});

exports.CacheProvider = emotionElement.CacheProvider;
exports.ThemeContext = emotionElement.ThemeContext;
exports.ThemeProvider = emotionElement.ThemeProvider;
exports.__unsafe_useEmotionCache = emotionElement.__unsafe_useEmotionCache;
exports.useTheme = emotionElement.useTheme;
exports.withEmotionCache = emotionElement.withEmotionCache;
exports.withTheme = emotionElement.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = exports.jsx;
exports.css = css;
exports.keyframes = keyframes;
