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

function assert_function_name(fn, name, description) {
  const propdesc = Object.getOwnPropertyDescriptor(fn, "name");
  assert_equals(typeof propdesc, "object", `${description} should have name property`);
  assert_false(propdesc.writable, "writable", `${description} name should not be writable`);
  assert_false(propdesc.enumerable, "enumerable", `${description} name should not be enumerable`);
  assert_true(propdesc.configurable, "configurable", `${description} name should be configurable`);
  assert_equals(propdesc.value, name, `${description} name should be ${name}`);
}

function assert_function_length(fn, length, description) {
  const propdesc = Object.getOwnPropertyDescriptor(fn, "length");
  assert_equals(typeof propdesc, "object", `${description} should have length property`);
  assert_false(propdesc.writable, "writable", `${description} length should not be writable`);
  assert_false(propdesc.enumerable, "enumerable", `${description} length should not be enumerable`);
  assert_true(propdesc.configurable, "configurable", `${description} length should be configurable`);
  assert_equals(propdesc.value, length, `${description} length should be ${length}`);
}

function assert_exported_function(fn, { name, length }, description) {
  assert_equals(Object.getPrototypeOf(fn), Function.prototype,
                `${description}: prototype`);

  assert_function_name(fn, name, description);
  assert_function_length(fn, length, description);
}

function assert_Instance(instance, expected_exports) {
  assert_equals(Object.getPrototypeOf(instance), WebAssembly.Instance.prototype,
                "prototype");
  assert_true(Object.isExtensible(instance), "extensible");

  assert_equals(instance.exports, instance.exports, "exports should be idempotent");
  const exports = instance.exports;

  assert_equals(Object.getPrototypeOf(exports), null, "exports prototype");
  assert_false(Object.isExtensible(exports), "extensible exports");
  for (const [key, expected] of Object.entries(expected_exports)) {
    const property = Object.getOwnPropertyDescriptor(exports, key);
    assert_equals(typeof property, "object", `${key} should be present`);
    assert_false(property.writable, `${key}: writable`);
    assert_true(property.enumerable, `${key}: enumerable`);
    assert_false(property.configurable, `${key}: configurable`);
    const actual = property.value;
    assert_true(Object.isExtensible(actual), `${key}: extensible`);

    switch (expected.kind) {
    case "function":
      assert_exported_function(actual, expected, `value of ${key}`);
      break;
    case "global":
      assert_equals(Object.getPrototypeOf(actual), WebAssembly.Global.prototype,
                    `value of ${key}: prototype`);
      assert_equals(actual.value, expected.value, `value of ${key}: value`);
      assert_equals(actual.valueOf(), expected.value, `value of ${key}: valueOf()`);
      break;
    case "memory":
      assert_equals(Object.getPrototypeOf(actual), WebAssembly.Memory.prototype,
                    `value of ${key}: prototype`);
      assert_equals(Object.getPrototypeOf(actual.buffer), ArrayBuffer.prototype,
                    `value of ${key}: prototype of buffer`);
      assert_equals(actual.buffer.byteLength, 0x10000 * expected.size, `value of ${key}: size of buffer`);
      const array = new Uint8Array(actual.buffer);
      assert_equals(array[0], 0, `value of ${key}: first element of buffer`);
      assert_equals(array[array.byteLength - 1], 0, `value of ${key}: last element of buffer`);
      break;
    case "table":
      assert_equals(Object.getPrototypeOf(actual), WebAssembly.Table.prototype,
                    `value of ${key}: prototype`);
      assert_equals(actual.length, expected.length, `value of ${key}: length of table`);
      break;
    }
  }
}
