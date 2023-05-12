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

function assert_ModuleImportDescriptor(import_, expected) {
  assert_equals(Object.getPrototypeOf(import_), Object.prototype, "Prototype");
  assert_true(Object.isExtensible(import_), "isExtensible");

  const module = Object.getOwnPropertyDescriptor(import_, "module");
  assert_true(module.writable, "module: writable");
  assert_true(module.enumerable, "module: enumerable");
  assert_true(module.configurable, "module: configurable");
  assert_equals(module.value, expected.module);

  const name = Object.getOwnPropertyDescriptor(import_, "name");
  assert_true(name.writable, "name: writable");
  assert_true(name.enumerable, "name: enumerable");
  assert_true(name.configurable, "name: configurable");
  assert_equals(name.value, expected.name);

  const kind = Object.getOwnPropertyDescriptor(import_, "kind");
  assert_true(kind.writable, "kind: writable");
  assert_true(kind.enumerable, "kind: enumerable");
  assert_true(kind.configurable, "kind: configurable");
  assert_equals(kind.value, expected.kind);
}

function assert_imports(imports, expected) {
  assert_true(Array.isArray(imports), "Should be array");
  assert_equals(Object.getPrototypeOf(imports), Array.prototype, "Prototype");
  assert_true(Object.isExtensible(imports), "isExtensible");

  assert_equals(imports.length, expected.length);
  for (let i = 0; i < expected.length; ++i) {
    assert_ModuleImportDescriptor(imports[i], expected[i]);
  }
}

let emptyModuleBinary;
setup(() => {
  emptyModuleBinary = new WasmModuleBuilder().toBuffer();
});

test(() => {
  assert_throws(new TypeError(), () => WebAssembly.Module.imports());
}, "Missing arguments");

test(() => {
  const invalidArguments = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    WebAssembly.Module,
    WebAssembly.Module.prototype,
  ];
  for (const argument of invalidArguments) {
    assert_throws(new TypeError(), () => WebAssembly.Module.imports(argument),
                  `imports(${format_value(argument)})`);
  }
}, "Non-Module arguments");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const fn = WebAssembly.Module.imports;
  const thisValues = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    WebAssembly.Module,
    WebAssembly.Module.prototype,
  ];
  for (const thisValue of thisValues) {
    assert_array_equals(fn.call(thisValue, module), []);
  }
}, "Branding");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const imports = WebAssembly.Module.imports(module);
  assert_true(Array.isArray(imports));
}, "Return type");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const imports = WebAssembly.Module.imports(module);
  assert_imports(imports, []);
}, "Empty module");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_not_equals(WebAssembly.Module.imports(module), WebAssembly.Module.imports(module));
}, "Empty module: array caching");

test(() => {
  const builder = new WasmModuleBuilder();

  builder.addImport("module", "fn", kSig_v_v);
  builder.addImportedGlobal("module", "global", kWasmI32);
  builder.addImportedMemory("module", "memory", 0, 128);
  builder.addImportedTable("module", "table", 0, 128);

  const buffer = builder.toBuffer()
  const module = new WebAssembly.Module(buffer);
  const imports = WebAssembly.Module.imports(module);
  const expected = [
    { "module": "module", "kind": "function", "name": "fn" },
    { "module": "module", "kind": "global", "name": "global" },
    { "module": "module", "kind": "memory", "name": "memory" },
    { "module": "module", "kind": "table", "name": "table" },
  ];
  assert_imports(imports, expected);
}, "imports");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const imports = WebAssembly.Module.imports(module, {});
  assert_imports(imports, []);
}, "Stray argument");
