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
    WebAssembly.Table,
    WebAssembly.Table.prototype,
  ];

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Table.prototype, "length");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(typeof desc.set, "undefined");

  for (const thisValue of thisValues) {
    assert_throws(new TypeError(), () => getter.call(thisValue), `this=${format_value(thisValue)}`);
  }
}, "Branding");

test(() => {
  const argument = { "element": "anyfunc", "initial": 2 };
  const table = new WebAssembly.Table(argument);
  assert_equals(table.length, 2, "Initial length");

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Table.prototype, "length");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  assert_equals(getter.call(table, {}), 2);
}, "Stray argument");

test(() => {
  const argument = { "element": "anyfunc", "initial": 2 };
  const table = new WebAssembly.Table(argument);
  assert_equals(table.length, 2, "Initial length");
  table.length = 4;
  assert_equals(table.length, 2, "Should not change the length");
}, "Setting (sloppy mode)");

test(() => {
  const argument = { "element": "anyfunc", "initial": 2 };
  const table = new WebAssembly.Table(argument);
  assert_equals(table.length, 2, "Initial length");
  assert_throws(new TypeError(), () => {
    "use strict";
    table.length = 4;
  });
  assert_equals(table.length, 2, "Should not change the length");
}, "Setting (strict mode)");
