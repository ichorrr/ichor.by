// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"1xC6H":[function(require,module,exports) {
var Refresh = require("react-refresh/runtime");
var ErrorOverlay = require("react-error-overlay");
Refresh.injectIntoGlobalHook(window);
window.$RefreshReg$ = function() {};
window.$RefreshSig$ = function() {
    return function(type) {
        return type;
    };
};
ErrorOverlay.setEditorHandler(function editorHandler(errorLocation) {
    let file = `${errorLocation.fileName}:${errorLocation.lineNumber || 1}:${errorLocation.colNumber || 1}`;
    fetch(`/__parcel_launch_editor?file=${encodeURIComponent(file)}`);
});
ErrorOverlay.startReportingRuntimeErrors({
    onError: function() {}
});
window.addEventListener("parcelhmraccept", ()=>{
    ErrorOverlay.dismissRuntimeErrors();
});

},{"react-refresh/runtime":"786KC","react-error-overlay":"1dldy"}],"3VakE":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "cdbbd8bbe779df8e";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, globalThis, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome; // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        acceptedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] ✨ Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
             // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) return true;
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}],"cfkOi":[function(require,module,exports) {
var $parcel$ReactRefreshHelpers$3c9d = require("@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js");
var prevRefreshReg = window.$RefreshReg$;
var prevRefreshSig = window.$RefreshSig$;
$parcel$ReactRefreshHelpers$3c9d.prelude(module);

try {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _jsxDevRuntime = require("react/jsx-dev-runtime");
var _fiber = require("@react-three/fiber");
var _react = require("react");
var _three = require("three");
var _styledComponents = require("styled-components");
var _styledComponentsDefault = parcelHelpers.interopDefault(_styledComponents);
var _vertexShader = require("../shaders/vertexShader");
var _vertexShaderDefault = parcelHelpers.interopDefault(_vertexShader);
var _fragmentShader = require("../shaders/fragmentShader");
var _fragmentShaderDefault = parcelHelpers.interopDefault(_fragmentShader);
var _s = $RefreshSig$();
const BritPattern = ()=>{
    _s();
    const mesh = (0, _react.useRef)();
    const uniforms = (0, _react.useMemo)(()=>({
            u_resolution: {
                value: new (0, _three.Vector2)(1050, 1050)
            },
            u_time: {
                value: 1.0
            }
        }), []);
    return /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("mesh", {
        ref: mesh,
        children: [
            /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("planeGeometry", {
                args: [
                    2.,
                    2.
                ]
            }, void 0, false, {
                fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
                lineNumber: 21,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("shaderMaterial", {
                fragmentShader: (0, _fragmentShaderDefault.default),
                vertexShader: (0, _vertexShaderDefault.default),
                uniforms: uniforms
            }, void 0, false, {
                fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
                lineNumber: 22,
                columnNumber: 7
            }, undefined)
        ]
    }, void 0, true, {
        fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
        lineNumber: 19,
        columnNumber: 5
    }, undefined);
};
_s(BritPattern, "apk6iU8MIK+bStLtCblN6DBJbgQ=");
_c = BritPattern;
const Arts63a9a9220ca661227c5fdcc5 = ()=>{
    return /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("div", {
        className: "htcanvas",
        children: /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)((0, _fiber.Canvas), {
            children: /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)(BritPattern, {}, void 0, false, {
                fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
                lineNumber: 35,
                columnNumber: 7
            }, undefined)
        }, void 0, false, {
            fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
            lineNumber: 34,
            columnNumber: 5
        }, undefined)
    }, void 0, false, {
        fileName: "src/arts/63a9a9220ca661227c5fdcc5.js",
        lineNumber: 33,
        columnNumber: 5
    }, undefined);
};
_c1 = Arts63a9a9220ca661227c5fdcc5;
exports.default = Arts63a9a9220ca661227c5fdcc5;
var _c, _c1;
$RefreshReg$(_c, "BritPattern");
$RefreshReg$(_c1, "Arts63a9a9220ca661227c5fdcc5");

  $parcel$ReactRefreshHelpers$3c9d.postlude(module);
} finally {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
},{"react/jsx-dev-runtime":"iTorj","@react-three/fiber":"iFo5u","react":"21dqq","three":"ktPTu","styled-components":"1U3k6","../shaders/vertexShader":"3GpBq","../shaders/fragmentShader":"8Jbme","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js":"km3Ru"}],"3GpBq":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const vertexShader = `
void main() {
    gl_Position = vec4( position, 1.0 );
}
`;
exports.default = vertexShader;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8Jbme":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const fragmentShader = `

      	#ifdef GL_ES
      	precision highp float;
      	#endif

      	#define PI 3.14159265359

      	uniform vec2 u_resolution;
      	uniform float u_time;

      	vec2 rotate2D(vec2 _st, float _angle){
      	    _st -= 0.5;
      	    _st =  mat2(cos(_angle),-sin(_angle),
      	                sin(_angle),cos(_angle)) * _st;
      	    _st += 0.5;
      	    return _st;
      	}

      		vec2 tile (vec2 _st, float _zoom) {
      	    _st *= _zoom;
      	    return fract(_st);
      	}


      	    vec2 zooom(vec2 _st, float zoom) {
      	        _st *= zoom;
      	        _st.x -= floor(_st.y);
      	        return _st;
      	    }

      	    vec2 zooom2(vec2 _st2, float zoom) {
      	        _st2 *= zoom;
      	        _st2.x += floor(_st2.y);
      	        return _st2;
      	    }

      	float bx(vec2 st, vec2 sz, vec2 crt) {
      	    st = st-crt;

      	    vec2 rtl = step(sz, st);
      		float rt = rtl.x*rtl.y;

      	    vec2 rtt = step(sz, 1.-st);
      		float lt = rtt.x*rtt.y;

      	    return lt*rt;
      	}

      void main(){
      	vec2 st = gl_FragCoord.xy/u_resolution.xy;
          	st.x *= u_resolution.x/u_resolution.y;

          	vec3 color = vec3(0.14,0.14,0.15);


            	st = rotate2D(st,PI*0.25);
      		st = tile(st,5.208);

          	float zm = 0.87;
          	vec2 dt = vec2(-0.06,-0.080);
          	st = (st-dt)*zm;

          	vec2 index = vec2(0., 0.);
         		 // Scale up the space by 3


          float size = 90.;
      		vec2 sx = zooom(st,size);
          	index = floor(sx);


              vec2 sz = vec2(0.090);
              vec2 coord = vec2(0.0);


              if(mod(index.x +2.,4.0) < 2.) {
                  // blue box top left
                  color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(-0.32,0.31)));
              }

              if(mod(index.x +3.,4.0) < 2.) {
                  // blue box bottom right
                  color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(0.31,-0.31)));
              }


          	if(mod(index.x +1.,4.0)  < 2. && st.x > 0.5 && st.y < 0.5) {
                  vec2 sz = vec2(0.111,0.122);
                  vec2 coord = vec2(-0.0);
                   color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + vec2(0.022,0.02), coord));
          	}

              	if(mod(index.x + 4.,4.0)  < 2. && st.x < 0.5 && st.y > 0.5) {
                  vec2 sz = vec2(0.122,0.111);
                  vec2 coord = vec2(-0.0);
                   color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + vec2(0.022,0.024), coord));
          	}


          	if(mod(index.x + 5.,4.0) < 2. && st.x > 0.5 && st.y < 0.5) {
      		vec2 sz = vec2(.09, .1);
              //black box bottom right
              color = mix(color, vec3(0.010,0.001,0.001), bx(st, vec2(0.16, .17), vec2(-0.0)));
          	color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
                  color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.425, 0.435), vec2(-0.0)));
          	}

              if(mod(index.x + 4.,4.0) +.5 < 2. && st.x < 0.5 && st.y > 0.5) {
      		vec2 sz = vec2(.1, .09);
              //black box  left top
              color = mix(color, vec3(0.010,0.001,0.001), bx(st, vec2(0.17, .16), vec2(-0.0)));
          	color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
              color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.435, 0.425), vec2(-0.0)));
          	}

          	sx = zooom2(st,size);
          	index = floor(sx);

           	if(mod(index.x + 1.,4.0) < 2.) {
              // blue box right top
              color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.374, .368), vec2(0.31, 0.31)));
          	}

          	if(mod(index.x,4.0) < 2.) {
              // blue box left bottom
              color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(-0.32,-0.31)));
          	}


      		if(mod(index.x + 3.,4.0)  < 2. && st.x > 0.5 && st.y > 0.5) {
      	      vec2 sz = vec2(0.111,0.111);
              color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + 0.022, coord));
          	}

          	if(mod(index.x + 2.,4.0)  < 2. && st.x < 0.5 && st.y < 0.5) {
      	      vec2 sz = vec2(0.122,0.122);
              color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + 0.022, coord));
          	}

              if(mod(index.x + 2.,4.0) < 2. && st.x < 0.5 && st.y < 0.5 ) {
                  vec2 sz = vec2(.1, .1);
               // black box bottom left
              color = mix(color, vec3(0.020,0.020,0.008), bx(st, vec2(0.17), vec2(-0.0)));
              color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
      		    color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.435), vec2(-0.0)));

              }

              if(mod(index.x + 3.,4.0)  < 2. && st.x > 0.5 && st.y > 0.5) {
               // black box   right top
              color = mix(color, vec3(0.), bx(st, vec2(0.160,0.160), vec2(-0.0)));
              color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + 0.02, coord));
              color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.425), vec2(-0.0)));

              }

      	    	float dln =0.468- length(st*0.908 - vec2(0.380,0.290));
      				color *= mix(vec3(1.), vec3(0.), dln);

      	    gl_FragColor = vec4(color,1.0);

      			}

`;
exports.default = fragmentShader;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["1xC6H","3VakE"], null, "parcelRequire716c")

//# sourceMappingURL=63a9a9220ca661227c5fdcc5.e779df8e.js.map
