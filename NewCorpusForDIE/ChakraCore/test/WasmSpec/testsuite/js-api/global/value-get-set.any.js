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
    WebAssembly.Global,
    WebAssembly.Global.prototype,
  ];

  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Global.prototype, "value");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  const setter = desc.set;
  assert_equals(typeof setter, "function");

  for (const thisValue of thisValues) {
    assert_throws(new TypeError(), () => getter.call(thisValue), `getter with this=${format_value(thisValue)}`);
    assert_throws(new TypeError(), () => setter.call(thisValue, 1), `setter with this=${format_value(thisValue)}`);
  }
}, "Branding");

for (const type of ["i32", "f32", "f64"]) {
  const immutableOptions = [
    [{}, "missing"],
    [{ "mutable": undefined }, "undefined"],
    [{ "mutable": null }, "null"],
    [{ "mutable": false }, "false"],
    [{ "mutable": "" }, "empty string"],
    [{ "mutable": 0 }, "zero"],
  ];
  for (const [opts, name] of immutableOptions) {
    test(() => {
      opts.value = type;
      const global = new WebAssembly.Global(opts);
      assert_equals(global.value, 0, "initial value");
      assert_equals(global.valueOf(), 0, "initial valueOf");

      assert_throws(new TypeError(), () => global.value = 1);

      assert_equals(global.value, 0, "post-set value");
      assert_equals(global.valueOf(), 0, "post-set valueOf");
    }, `Immutable ${type} (${name})`);
  }

  const mutableOptions = [
    [{ "mutable": true }, "true"],
    [{ "mutable": 1 }, "one"],
    [{ "mutable": "x" }, "string"],
    [Object.create({ "mutable": true }), "true on prototype"],
  ];
  for (const [opts, name] of mutableOptions) {
    test(() => {
      opts.value = type;
      const global = new WebAssembly.Global(opts);
      assert_equals(global.value, 0, "initial value");
      assert_equals(global.valueOf(), 0, "initial valueOf");

      global.value = 1;

      assert_equals(global.value, 1, "post-set value");
      assert_equals(global.valueOf(), 1, "post-set valueOf");
    }, `Mutable ${type} (${name})`);
  }
}

test(() => {
  const argument = { "value": "i64", "mutable": true };
  const global = new WebAssembly.Global(argument);
  assert_throws(new TypeError(), () => global.value);
  assert_throws(new TypeError(), () => global.value = 0);
  assert_throws(new TypeError(), () => global.valueOf());
}, "i64 with default");


test(() => {
  const argument = { "value": "i32", "mutable": true };
  const global = new WebAssembly.Global(argument);
  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Global.prototype, "value");
  assert_equals(typeof desc, "object");

  const setter = desc.set;
  assert_equals(typeof setter, "function");

  assert_throws(new TypeError(), () => setter.call(global));
}, "Calling setter without argument");

test(() => {
  const argument = { "value": "i32", "mutable": true };
  const global = new WebAssembly.Global(argument);
  const desc = Object.getOwnPropertyDescriptor(WebAssembly.Global.prototype, "value");
  assert_equals(typeof desc, "object");

  const getter = desc.get;
  assert_equals(typeof getter, "function");

  const setter = desc.set;
  assert_equals(typeof setter, "function");

  assert_equals(getter.call(global, {}), 0);
  assert_equals(setter.call(global, 1, {}), undefined);
  assert_equals(global.value, 1);
}, "Stray argument");
