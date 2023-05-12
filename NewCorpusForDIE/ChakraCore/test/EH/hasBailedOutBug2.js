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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function test0() {
  function func80() {
  }
  var uniqobj22 = new func80();
  try {
    (function () {
      try {
        try {
        } catch (ex) {
        }
        function func104() {
          uniqobj22 >>>= 1;
        }
        func104();
      } catch (ex) {
        WScript.Echo("FAILED");
      } finally {
        protoObj0();
      }
    }());
  } catch (ex) {
  }
}
test0();
test0();

function test1() {
  var obj1 = {};
  var func2 = function () {
    try {
    } catch (ex) {
    }
  };
  obj1.method1 = func2;
  var IntArr0 = new Array();
  function v0() {
    function v2() {
      try {
        obj1.method1();
        function func7() {
          IntArr0[1];
        }
        func7();
      } catch (ex) {
        WScript.Echo("FAILED");
      }
      var v3 = runtime_error;
    }
    try {
      v2();
    } catch (ex) {
    }
  }
  v0();
}
test1();
test1();
test1();

function test2() {
  function makeArrayLength(x) {
    if (x < 1) {
    }
  }
  var func2 = function () {
    try {
    } finally {
      makeArrayLength(393266900 * 1957286472);
    }
  };
  func2();
  try {
    func2();
  } finally {
  }
}
test2();
test2();
test2();

WScript.Echo("Passed");
