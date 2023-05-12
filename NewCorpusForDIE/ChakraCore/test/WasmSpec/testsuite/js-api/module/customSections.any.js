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

function assert_ArrayBuffer(buffer, expected) {
  assert_equals(Object.getPrototypeOf(buffer), ArrayBuffer.prototype, "Prototype");
  assert_true(Object.isExtensible(buffer), "isExtensible");
  assert_array_equals(new Uint8Array(buffer), expected);
}

function assert_sections(sections, expected) {
  assert_true(Array.isArray(sections), "Should be array");
  assert_equals(Object.getPrototypeOf(sections), Array.prototype, "Prototype");
  assert_true(Object.isExtensible(sections), "isExtensible");

  assert_equals(sections.length, expected.length);
  for (let i = 0; i < expected.length; ++i) {
    assert_ArrayBuffer(sections[i], expected[i]);
  }
}

let emptyModuleBinary;
setup(() => {
  emptyModuleBinary = new WasmModuleBuilder().toBuffer();
});

test(() => {
  assert_throws(new TypeError(), () => WebAssembly.Module.customSections());
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_throws(new TypeError(), () => WebAssembly.Module.customSections(module));
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
    assert_throws(new TypeError(), () => WebAssembly.Module.customSections(argument, ""),
                  `customSections(${format_value(argument)})`);
  }
}, "Non-Module arguments");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  const fn = WebAssembly.Module.customSections;
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
    assert_sections(fn.call(thisValue, module, ""), []);
  }
}, "Branding");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_sections(WebAssembly.Module.customSections(module, ""), []);
}, "Empty module");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_not_equals(WebAssembly.Module.customSections(module, ""),
                    WebAssembly.Module.customSections(module, ""));
}, "Empty module: array caching");

test(() => {
  const bytes1 = [87, 101, 98, 65, 115, 115, 101, 109, 98, 108, 121];
  const bytes2 = [74, 83, 65, 80, 73];

  const binary = new Binary;
  binary.emit_section(kUnknownSectionCode, section => {
    section.emit_string("name");
    section.emit_bytes(bytes1);
  });
  binary.emit_section(kUnknownSectionCode, section => {
    section.emit_string("name");
    section.emit_bytes(bytes2);
  });
  binary.emit_section(kUnknownSectionCode, section => {
    section.emit_string("foo");
    section.emit_bytes(bytes1);
  });

  const builder = new WasmModuleBuilder();
  builder.addExplicitSection(binary);
  const buffer = builder.toBuffer()
  const module = new WebAssembly.Module(buffer);

  assert_sections(WebAssembly.Module.customSections(module, "name"), [
    bytes1,
    bytes2,
  ])

  assert_sections(WebAssembly.Module.customSections(module, "foo"), [
    bytes1,
  ])

  assert_sections(WebAssembly.Module.customSections(module, ""), [])
  assert_sections(WebAssembly.Module.customSections(module, "\0"), [])
  assert_sections(WebAssembly.Module.customSections(module, "name\0"), [])
  assert_sections(WebAssembly.Module.customSections(module, "foo\0"), [])
}, "Custom sections");

test(() => {
  const bytes = [87, 101, 98, 65, 115, 115, 101, 109, 98, 108, 121];
  const name = "yee\uD801\uDC37eey"

  const binary = new Binary;
  binary.emit_section(kUnknownSectionCode, section => {
    section.emit_string(name);
    section.emit_bytes(bytes);
  });

  const builder = new WasmModuleBuilder();
  builder.addExplicitSection(binary);
  const buffer = builder.toBuffer();
  const module = new WebAssembly.Module(buffer);

  assert_sections(WebAssembly.Module.customSections(module, name), [
    bytes,
  ]);
  assert_sections(WebAssembly.Module.customSections(module, "yee\uFFFDeey"), []);
  assert_sections(WebAssembly.Module.customSections(module, "yee\uFFFD\uFFFDeey"), []);
}, "Custom sections with surrogate pairs");

test(() => {
  const bytes = [87, 101, 98, 65, 115, 115, 101, 109, 98, 108, 121];

  const binary = new Binary;
  binary.emit_section(kUnknownSectionCode, section => {
    section.emit_string("na\uFFFDme");
    section.emit_bytes(bytes);
  });

  const builder = new WasmModuleBuilder();
  builder.addExplicitSection(binary);
  const buffer = builder.toBuffer();
  const module = new WebAssembly.Module(buffer);

  assert_sections(WebAssembly.Module.customSections(module, "name"), []);
  assert_sections(WebAssembly.Module.customSections(module, "na\uFFFDme"), [
    bytes,
  ]);
  assert_sections(WebAssembly.Module.customSections(module, "na\uDC01me"), [
    bytes,
  ]);
}, "Custom sections with U+FFFD");

test(() => {
  const module = new WebAssembly.Module(emptyModuleBinary);
  assert_sections(WebAssembly.Module.customSections(module, "", {}), []);
}, "Stray argument");
