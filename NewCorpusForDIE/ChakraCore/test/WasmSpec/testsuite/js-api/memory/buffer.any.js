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

test(() => {
  const thisValues = [
    undefined,
    null,
    true,
    "",
    Symbol(),
    1,
    {},
    WebAssembly.Memory,
    WebAssembly.Memory.prototype,
  ];

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Memory.prototype, "buffer");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(typeof desc.set, "undefined");

  for (const thisValue of thisValues) {
    assert_throws(new TypeError(), () => getter.call(thisValue), `this=${format_value(thisValue)}`);
  }
}, "Branding");

test(() => {
  const argument = { "initial": 0 };
  const memory = new WebAssembly.Memory(argument);
  const buffer = memory.buffer;

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Memory.prototype, "buffer");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(getter.call(memory, {}), buffer);
}, "Stray argument");

test(() => {
  const argument = { "initial": 0 };
  const memory = new WebAssembly.Memory(argument);
  const memory2 = new WebAssembly.Memory(argument);
  const buffer = memory.buffer;
  assert_not_equals(buffer, memory2.buffer, "Need two distinct buffers");
  memory.buffer = memory2.buffer;
  assert_equals(memory.buffer, buffer, "Should not change the buffer");
}, "Setting (sloppy mode)");

test(() => {
  const argument = { "initial": 0 };
  const memory = new WebAssembly.Memory(argument);
  const memory2 = new WebAssembly.Memory(argument);
  const buffer = memory.buffer;
  assert_not_equals(buffer, memory2.buffer, "Need two distinct buffers");
  assert_throws(new TypeError(), () => {
    "use strict";
    memory.buffer = memory2.buffer;
  });
  assert_equals(memory.buffer, buffer, "Should not change the buffer");
}, "Setting (strict mode)");
