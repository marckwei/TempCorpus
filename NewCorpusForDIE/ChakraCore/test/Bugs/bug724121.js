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
  var GiantPrintArray = [];
  var v26 = {};
  Object.defineProperty(Object.prototype, '__getterprop4', {
    get: function () {
      function v0() {
      }
      v0.prototype.v2 = function () {
      };
      var v3 = new v0();
      function v4() {
      }
      v4.prototype.v2 = function () {
      };
      var v6 = new v4();
      function v17(v18) {
        v18.v2();
      }
      v17(v3);
      v17(v6);
    }, configurable:true
  });
  GiantPrintArray.push(v26.__getterprop4);
  for (;;) {
    break;

    for (var _strvar0 in IntArr0) {
    }
    GiantPrintArray.push(v30.__getterprop4);
  }
}
test0();
test0();
test0();
WScript.Echo("PASS");
