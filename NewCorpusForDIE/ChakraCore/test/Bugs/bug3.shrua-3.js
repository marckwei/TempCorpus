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
  function makeArrayLength(x) {
    
    if (!(x < 1)) {
      return Math.floor();
    }
    
  }
  
  var obj2 = {};
  
  var func1 = function () {
    y = ~(++this.prop5 >>> protoObj1.prop3)
    protoObj1.length = makeArrayLength(y);

  };
  
  obj2.method0 = func1;
  protoObj1 = Object();
  Object.prototype.prop5 = -1921245026.9;
  obj2.method0();
  WScript.Echo(protoObj1.length);
}
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();

test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
test0();
