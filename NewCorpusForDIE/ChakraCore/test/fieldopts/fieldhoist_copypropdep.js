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

(function(){
  var obj0 = new Object();
  var func2 = function(p0,p1,p2){
    c;
  }
  var c = 1;
  var e = 1;
  obj0.prop1 = -1004383636;
  var __loopvar0 = 0;
  while (((a = c)) && __loopvar0 < 3) {
    __loopvar0++;
    if ((c ^= 1)) {
      d = a;
    }
  }
  for (var __loopvar0 = 0; obj0.prop1 < ((a >>= 1)) && __loopvar0 < 3; __loopvar0++, 1) {
    for (var __loopvar3 = 0; e < (1) && __loopvar3 < 3; __loopvar3++, c) {
    }
  }
})();

(function(){
  var obj0 = new Object();
  var obj1 = new Object();
  var obj3 = new Object();
  var func1 = function(p0,p1,p2){
    obj3 = obj0;
  }
  obj0.length = 1;
  obj1.a = -779604180.9;
  for (var __loopvar0 = 0; obj1.a < (1) && __loopvar0 < 3; obj1.a++ + __loopvar0++) {
    var obj7 = obj3;
    var __loopvar1 = 0;
    do {
      __loopvar1++;
      obj4 = obj7;
      obj1 = obj3;
      func1();
      var a = ((Math.pow(1, 1) + obj3.a) * (1 - (obj4.length %= 1)));
    } while ((1) && __loopvar1 < 3)
  }
  if (obj3.length == 1) { WScript.Echo("PASS"); }
})();
