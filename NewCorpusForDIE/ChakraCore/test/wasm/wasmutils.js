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

function i64ToString(val, optHigh = 0) {
  let high, low;
  if (typeof val === "object") {
    high = val.high;
    low = val.low;
  } else {
    low = val;
    high = optHigh;
  }
  const convert = (a, doPad) => {
    let s = (a >>> 0).toString(16);
    if (doPad) {
      s = s.padStart(8, "0");
    }
    return s;
  }
  if (high !== 0) {
    return `0x${convert(high)}${convert(low, true)}`;
  }
  return `0x${convert(low)}`;
}

function fixupI64Return(exports, fnNames) {
  if (!Array.isArray(fnNames)) {
    fnNames = [fnNames];
  }
  fnNames.forEach(name => {
    const oldI64Fn = exports[name];
    exports[name] = function(...args) {
      const val = oldI64Fn(...args);
      return i64ToString(val);
    };
  })
}
