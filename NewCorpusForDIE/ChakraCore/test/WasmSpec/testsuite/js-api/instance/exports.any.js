function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

// META: global=jsshell
// META: script=/wasm/jsapi/wasm-constants.js
// META: script=/wasm/jsapi/wasm-module-builder.js

let emptyModuleBinary;
setup(() => {
  emptyModuleBinary = new WasmModuleBuilder().toBuffer();
});

test(() => {
  const thisValues = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    WebAssembly.Instance,
    WebAssembly.Instance.prototype,
  ];

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Instance.prototype, "exports");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(typeof desc.set, "undefined");

  for (const thisValue of thisValues) {
    assert_throws(new TypeError(), () => getter.call(thisValue), `this=${format_value(thisValue)}`);
  }
}, "Branding");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const instance = new WebAssembly.Instance(module);
  const exports = instance.exports;

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Instance.prototype, "exports");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(getter.call(instance, {}), exports);
}, "Stray argument");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const instance = new WebAssembly.Instance(module);
  const exports = instance.exports;
  instance.exports = {};
  assert_equals(instance.exports, exports, "Should not change the exports");
}, "Setting (sloppy mode)");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const instance = new WebAssembly.Instance(module);
  const exports = instance.exports;
  assert_throws(new TypeError(), () => {
    "use strict";
    instance.exports = {};
  });
  assert_equals(instance.exports, exports, "Should not change the exports");
}, "Setting (strict mode)");
