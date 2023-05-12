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

function assert_Module(module) {
  assert_equals(Object.getPrototypeOf(module), WebAssembly.Module.prototype,
                "Prototype");
  assert_true(Object.isExtensible(module), "Extensibility");
}

let emptyModuleBinary;
setup(() => {
  emptyModuleBinary = new WasmModuleBuilder().toBuffer();
});

promise_test(t => {
  return promise_rejects(t, new TypeError(), WebAssembly.compile());
}, "Missing argument");

promise_test(t => {
  const invalidArguments = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    ArrayBuffer,
    ArrayBuffer.prototype,
    Array.from(emptyModuleBinary),
  ];
  return Promise.all(invalidArguments.map(argument => {
    return promise_rejects(t, new TypeError(), WebAssembly.compile(argument),
                           `compile(${format_value(argument)})`);
  }));
}, "Invalid arguments");

promise_test(() => {
  const fn = WebAssembly.compile;
  const thisValues = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    WebAssembly,
  ];
  return Promise.all(thisValues.map(thisValue => {
    return fn.call(thisValue, emptyModuleBinary).then(assert_Module);
  }));
}, "Branding");

test(() => {
  const promise = WebAssembly.compile(emptyModuleBinary);
  assert_equals(Object.getPrototypeOf(promise), Promise.prototype, "prototype");
  assert_true(Object.isExtensible(promise), "extensibility");
}, "Promise type");

promise_test(t => {
  const buffer = new Uint8Array();
  return promise_rejects(t, new WebAssembly.CompileError(), WebAssembly.compile(buffer));
}, "Invalid code");

promise_test(() => {
  return WebAssembly.compile(emptyModuleBinary).then(assert_Module);
}, "Result type");

promise_test(() => {
  return WebAssembly.compile(emptyModuleBinary, {}).then(assert_Module);
}, "Stray argument");

promise_test(() => {
  const buffer = new WasmModuleBuilder().toBuffer();
  assert_equals(buffer[0], 0);
  const promise = WebAssembly.compile(buffer);
  buffer[0] = 1;
  return promise.then(assert_Module);
}, "Changing the buffer");
