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
// META: script=/wasm/jsapi/assertions.js

let emptyModuleBinary;
setup(() => {
  emptyModuleBinary = new WasmModuleBuilder().toBuffer();
});

test(() => {
  assert_function_name(WebAssembly.Module, "Module", "WebAssembly.Module");
}, "name");

test(() => {
  assert_function_length(WebAssembly.Module, 1, "WebAssembly.Module");
}, "length");

test(() => {
  assert_throws(new TypeError(), () => new WebAssembly.Module());
}, "No arguments");

test(() => {
  assert_throws(new TypeError(), () => WebAssembly.Module(emptyModuleBinary));
}, "Calling");

test(() => {
  const invalidArguments = [
    undefined,
    null,
    true,
    "test",
    Symbol(),
    7,
    NaN,
    {},
    ArrayBuffer,
    ArrayBuffer.prototype,
    Array.from(emptyModuleBinary),
  ];
  for (const argument of invalidArguments) {
    assert_throws(new TypeError(), () => new WebAssembly.Module(argument),
                  `new Module(${format_value(argument)})`);
  }
}, "Invalid arguments");

test(() => {
  const buffer = new Uint8Array();
  assert_throws(new WebAssembly.CompileError(), () => new WebAssembly.Module(buffer));
}, "Empty buffer");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_equals(Object.getPrototypeOf(module), WebAssembly.Module.prototype);
}, "Prototype");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_true(Object.isExtensible(module));
}, "Extensibility");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary, {});
  assert_equals(Object.getPrototypeOf(module), WebAssembly.Module.prototype);
}, "Stray argument");
