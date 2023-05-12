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

var shouldBailout = false;
var caught = false;

function test0() {
  function func0() {
    if (shouldBailout) {
      throw new Error('oops');
    }
  }

  function func1() { func0() }
  function func2() { func1() }
  function func3() { shouldBailout ? obj0 : null }

  var obj0 = { method0: func1 };
  var obj1 = { method0: func2 };

  try {
    try {} finally { func3(); }
  } catch {
    caught = true;
  }

  func2();
}

// generate profile
test0();
test0();

// run code with bailouts enabled
shouldBailout = true;
try {
  test0();
} catch {}
if (!caught) {
  print('Passed');
}
