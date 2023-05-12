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

//reduced switches: -maxsimplejitruncount:2 -maxinterpretcount:1

var arr=[];
var obj0 = {};
var func0 = function () {
};
obj0.method0 = func0;
var f32 = new Float32Array(256);
protoObj0 = Object(obj0);
for (var _strvar30 in f32) {
  function v9() {
    var v13 = {
      v14: function () {
        return function bar() {
          protoObj0.method0.apply(protoObj0, arguments);
          this.method0.apply(this.method0.apply(this, arguments), arguments);
        };
      }
    };
    protoObj0.v16 = v13.v14();
    protoObj0.v16.prototype = {
      method0: function (v20) {
        this.v20 = v20;
      }
    };

    new protoObj0.v16(f32[11]);
  }
  v9();
}
WScript.Echo("PASSED");
