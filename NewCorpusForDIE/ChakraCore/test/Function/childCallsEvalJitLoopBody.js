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

// Due to the eval, 'a' get put in a slot and should not be assigned a non-temp register. The uses of 'a' in the loop should be
// given a temp register so that they are not loaded/restored from the jitted loop body.
(function(){
  var __loopvar0 = 0;
  while((1) && __loopvar0 < 3) {
    __loopvar0++;
    for(var __loopvar1 = 0; __loopvar1 < 3; ++__loopvar1) {
      (function(){
        (function(){
          eval("");
        })(1, 1, 1, 1);
        var __loopvar3 = 0;
        while((1) && __loopvar3 < 3) {
          __loopvar3++;
          d =Math.sin((-1012552393 * (__loopvar1 << a)));
          var a = 1;
        }
      })(1);
    }
  }
})();
