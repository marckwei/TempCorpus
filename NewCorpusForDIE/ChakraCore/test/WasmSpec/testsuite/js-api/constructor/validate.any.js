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
  assert_throws(new TypeError(), () => WebAssembly.validate());
}, "Missing argument");

test(() => {
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
  for (const argument of invalidArguments) {
    assert_throws(new TypeError(), () => WebAssembly.validate(argument),
                  `validate(${format_value(argument)})`);
  }
}, "Invalid arguments");

test(() => {
  const fn = WebAssembly.validate;
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
  for (const thisValue of thisValues) {
    assert_true(fn.call(thisValue, emptyModuleBinary), `this=${format_value(thisValue)}`);
  }
}, "Branding");

const modules = [
  // Incomplete header.
  [[], false],
  [[0x00], false],
  [[0x00, 0x61], false],
  [[0x00, 0x61, 0x73], false],
  [[0x00, 0x61, 0x73, 0x6d], false],
  [[0x00, 0x61, 0x73, 0x6d, 0x01], false],
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00], false],
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00], false],

  // Complete header.
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00], true],

  // Invalid version.
  [[0x00, 0x61, 0x73, 0x6d, 0x00, 0x00, 0x00, 0x00], false],
  [[0x00, 0x61, 0x73, 0x6d, 0x02, 0x00, 0x00, 0x00], false],

  // Nameless custom section.
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00], false],

  // Custom section with empty name.
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00], true],

  // Custom section with name "a".
  [[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x01, 0x61], true],
];
const bufferTypes = [
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
];
for (const [module, expected] of modules) {
  const name = module.map(n => n.toString(16)).join(" ");
  for (const bufferType of bufferTypes) {
    if (module.length % bufferType.BYTES_PER_ELEMENT === 0) {
      test(() => {
        const bytes = new Uint8Array(module);
        const moduleBuffer = new bufferType(bytes.buffer);
        assert_equals(WebAssembly.validate(moduleBuffer), expected);
      }, `Validating module [${name}] in ${bufferType.name}`);
    }
  }
}

test(() => {
  assert_true(WebAssembly.validate(emptyModuleBinary, {}));
}, "Stray argument");
