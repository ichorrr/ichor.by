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

},{"react-refresh/runtime":"786KC","react-error-overlay":"1dldy"}],"4S5sM":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "e3f6d8355b2ba96a";
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

},{}],"2dfnR":[function(require,module,exports) {
var $parcel$ReactRefreshHelpers$7ba6 = require("@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js");
var prevRefreshReg = window.$RefreshReg$;
var prevRefreshSig = window.$RefreshSig$;
$parcel$ReactRefreshHelpers$7ba6.prelude(module);

try {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _jsxDevRuntime = require("react/jsx-dev-runtime");
var _fiber = require("@react-three/fiber");
var _react = require("react");
var _three = require("three");
var _styledComponents = require("styled-components");
var _styledComponentsDefault = parcelHelpers.interopDefault(_styledComponents);
var _vertexShader = require("../shaders/63addba80407bc4b94f5d964/vertexShader");
var _vertexShaderDefault = parcelHelpers.interopDefault(_vertexShader);
var _fragmentShader = require("../shaders/63addba80407bc4b94f5d964/fragmentShader");
var _fragmentShaderDefault = parcelHelpers.interopDefault(_fragmentShader);
var _s = $RefreshSig$();
const LabyRinths = ()=>{
    _s();
    const mesh = (0, _react.useRef)();
    const uniforms = (0, _react.useMemo)(()=>({
            u_resolution: {
                value: new (0, _three.Vector2)(550, 550)
            },
            u_time: {
                type: "f"
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
                fileName: "src/arts/63addba80407bc4b94f5d964.js",
                lineNumber: 26,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("shaderMaterial", {
                fragmentShader: (0, _fragmentShaderDefault.default),
                vertexShader: (0, _vertexShaderDefault.default),
                uniforms: uniforms
            }, void 0, false, {
                fileName: "src/arts/63addba80407bc4b94f5d964.js",
                lineNumber: 27,
                columnNumber: 7
            }, undefined)
        ]
    }, void 0, true, {
        fileName: "src/arts/63addba80407bc4b94f5d964.js",
        lineNumber: 24,
        columnNumber: 5
    }, undefined);
};
_s(LabyRinths, "apk6iU8MIK+bStLtCblN6DBJbgQ=");
_c = LabyRinths;
const Arts63addba80407bc4b94f5d964 = ()=>{
    return /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)("div", {
        className: "htcanvas",
        children: /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)((0, _fiber.Canvas), {
            children: /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)(LabyRinths, {}, void 0, false, {
                fileName: "src/arts/63addba80407bc4b94f5d964.js",
                lineNumber: 40,
                columnNumber: 7
            }, undefined)
        }, void 0, false, {
            fileName: "src/arts/63addba80407bc4b94f5d964.js",
            lineNumber: 39,
            columnNumber: 5
        }, undefined)
    }, void 0, false, {
        fileName: "src/arts/63addba80407bc4b94f5d964.js",
        lineNumber: 38,
        columnNumber: 5
    }, undefined);
};
_c1 = Arts63addba80407bc4b94f5d964;
exports.default = Arts63addba80407bc4b94f5d964;
var _c, _c1;
$RefreshReg$(_c, "LabyRinths");
$RefreshReg$(_c1, "Arts63addba80407bc4b94f5d964");

  $parcel$ReactRefreshHelpers$7ba6.postlude(module);
} finally {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
},{"react/jsx-dev-runtime":"iTorj","react":"21dqq","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js":"km3Ru","@react-three/fiber":"iFo5u","three":"ktPTu","styled-components":"1U3k6","../shaders/63addba80407bc4b94f5d964/vertexShader":"2jsGI","../shaders/63addba80407bc4b94f5d964/fragmentShader":"6GyNe"}],"2jsGI":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const vertexShader = `
void main() {
    gl_Position = vec4( position, 1.0 );
}
`;
exports.default = vertexShader;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6GyNe":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const fragmentShader = `

// Author: @patriciogv - 2015
// Title: Metaballs

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


vec3 crcl(vec2 v, vec2 _st, float n){
  float rr = length(_st - v);
  return vec3(smoothstep(-0.265, -0.210, rr*n-0.33) - smoothstep(-0.16, -0.096, rr*n-.376));
}

vec3 path(vec2 _st, float xx){
  float r = length(_st);
  return vec3(smoothstep(0.89, 0.906, r - 0.28+0.087*xx-.06) - smoothstep(.989, 1.006, r-0.28+0.087*xx));
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(.0);

  // Scale
  st *= 3.;

  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  st = st - vec2(1.5)+-vec2(0.010,0.010);
float r = length(st);
float a = atan(st.y, st.x);

//12
  color = path(st, -1.);

// 12*1*l
    if(st.x/st.y > -0.074){ color += crcl(vec2(-0.093, 1.211), st, 3.960); }

// 12*1*r
    if(st.x/st.y < 0.074){ color += crcl(vec2(0.087,1.211), st, 3.960); }

// 12*2*r
    if(st.x/st.y < 0.098){ color += crcl(vec2(0.087,.9495), st, 3.960); }

// 12*2*l
    if(st.x/st.y > -0.098){ color += crcl(vec2(-0.093,0.949), st, 3.960); }

// 12*3*r
    if(st.x/st.y < 0.170){ color += crcl(vec2(0.087,0.511), st, 3.960); }

// 12*3*l
    if(st.x/st.y > -0.170){ color += crcl(vec2(-0.093,0.51), st, 3.960); }


// 6*1*l
    if(st.x/st.y < 0.326){ color += crcl(vec2(-0.14,-0.408), st, 3.960); }

// 6*1*r
    if(st.x/st.y > -0.230){ color += crcl(vec2(0.1,-0.419), st, 3.960); }

// 6*2*l
    if(st.x/st.y <0.242){ color += crcl(vec2(-0.140,-0.589), st, 3.960); }

// 6*3*l
    if(st.x/st.y <0.152){ color += crcl(vec2(-0.140,-0.943), st, 3.960); }

// 6*4*l
    if(st.x/st.y <0.126){ color += crcl(vec2(-0.140,-1.119), st, 3.960); }

// 6*2*r
    if(st.x/st.y > -0.288){ color += crcl(vec2(0.19,-0.666), st, 3.960); }

      // 6*3*r
    if(st.x/st.y > -0.188){ color += crcl(vec2(0.190,-1.023), st, 3.960); }

      // 6*4*r
    if(st.x/st.y > -0.160){ color += crcl(vec2(0.190,-1.199), st, 3.960); }

      // 3*1*r*t
    if(st.y/st.x < 0.097){ color += crcl(vec2(0.775,0.080), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x < 0.066){ color += crcl(vec2(1.212,0.080), st, 3.960); }

      // 3*1*r*b
    if(st.y/st.x > -0.114){ color += crcl(vec2(0.774,-0.090), st, 3.960); }

    // 3*2*r*b
    if(st.y/st.x > -0.074){ color += crcl(vec2(1.211,-0.090), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x > -0.114){ color += crcl(vec2(-0.688,0.080), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x > -0.083){ color += crcl(vec2(-1.037,0.084), st, 3.960); }

      // 3*1*r*b
    if(st.y/st.x < 0.14){ color += crcl(vec2(-0.686,-0.094), st, 3.960); }

    // 3*1*r*b
    if(st.y/st.x < 0.0858){ color += crcl(vec2(-1.036,-0.094), st, 3.960); }


  //11
  if(a >0.066 && a < 1.497   || a >1.768 && a < 3.4 || a >1.6446 && a < 3. || a >-1.4124 && a < -0.074 || a >-3.4 && a < -1.57){
  color += path(st, .0);}
    //10
      if(a >0.0662 && a < 1.497   || a >1.688 && a < 3.4 || a >1.644 && a < 3. || a >-1.412 && a < -0.074 || a >-3.4 && a < -1.696){
    color += path(st, 1.);}
          //09
              if(a > .00 && a < 3.059 || a >-3.057 && a < -1.696 || a >-1.385 && a < 0.){
          color += path(st, 2.);}
              //08
              if(a > .00 && a < 1.473 || a > 1.6685 && a < 3.0588 || a >-3.056 && a < -1.72 || a >-1.385 && a < 0.){
              color += path(st, 3.);}
                //07
              if(a >1.668 && a < 3.9 ||  a >0. && a < 1.473 ||  a >-1.526 && a < 0.  ||  a <-1.721 && a > -3.208 ){
                color += path(st, 4.);}
                  //06
                  if(a > 0.0965 || a < -0.1136   && a >-1.5222 || a < -1.568){
                  color += path(st, 5.);}
                    //05
                    if(a > 0.0965 && a < 3.028 || a >- 3.0026 && a < -1.568 || a >- 1.2905 && a < -0.1136){
                    color += path(st, 6.);}
                      //04
                      if(a >- 3.0026 && a < -1.808 || a >- 1.2905 && a < 3.028 ){
                      color += path(st, 7.);}
                      //03
                                              if(a >1.739 || a < 1.403 && a >-1.495 || a < -1.808  ){
                                            color += path(st, 8.);}
                        //02
                                                  if(a >1.7395 || a < 1.404  && a > -1.345 || a < -1.886){
                                                  color += path(st, 9.);}
                        //01
                                                      if(a >-1.345 || a < -1.886 ){
                                                      color += path(st, 10.);}

  color += vec3(smoothstep(.32, 0.31, r));

  color += vec3(step(-.044, st.x) - step(.001, st.x))*vec3(step(-.75, st.y) - step(.02, st.y));

  color += vec3(step(-.044, st.x) - step(.002, st.x))*vec3(step(-1.26, st.y) - step(-0.812, st.y));

  color += vec3(step(.04, st.x) - step(.084, st.x))*vec3(step(-0.828, st.y) - step(-0.540, st.y));

  color += vec3(step(.04, st.x) - step(.084, st.x))*vec3(step(-1.350, st.y) - step(-0.892, st.y));

  gl_FragColor = vec4(color,1.0);
}

`;
exports.default = fragmentShader;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["1xC6H","4S5sM"], null, "parcelRequire716c")

//# sourceMappingURL=63addba80407bc4b94f5d964.5b2ba96a.js.map
