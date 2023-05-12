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

function earlyReturnTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      if (num > 5) return;
    }finally {
        WScript.Echo("return outer finally");
    }
  }
}

function earlyBreakTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      if (num > 5) break;
    }finally {
        WScript.Echo("break outer finally");
    }
  }
}

function earlyContinueTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      if (i < 3) continue;
    }finally {
      WScript.Echo("continue outer finally " + i);
    }
  }
}

function earlyReturnNestedTFTC(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (num > 5) return;
      }
      catch(e) {
        WScript.Echo("inner catch");
      }
    }finally {
        WScript.Echo("outer finally");
    }
  }
}

function earlyReturnNestedTFTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (num > 5) return;
      }
      finally {
        WScript.Echo("inner finally");
      }
    }finally {
        WScript.Echo("outer finally");
    }
  }
}

function earlyBreakNestedTFTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (num > 5) break;
      }
      finally {
        WScript.Echo("inner finally");
      }
    }finally {
        WScript.Echo("outer finally");
    }
  }
}

function earlyContinueNestedTFTF(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (i > 3) continue;
      }
      finally {
        WScript.Echo("inner finally");
      }
    }finally {
        WScript.Echo("continue outer finally " + i);
    }
  }
}

function earlyBreakNestedTFTC(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (num > 5) break;
      }
      catch(e) {
        WScript.Echo("inner catch");
      }
    }finally {
        WScript.Echo("break outer finally");
    }
  }
}

function earlyContinueNestedTFTC(num) {
  for (var i = 0; i < num; i++) {
    try {
      try {
        if (num > 5) continue;
      }
      catch(e) {
        WScript.Echo("inner catch");
      }
    }finally {
        WScript.Echo("continue outer finally " + i);
    }
  }
}

function test0() {
  earlyReturnTF(7);
  earlyBreakTF(7);
  earlyContinueTF(7);
  earlyReturnNestedTFTC(7);
  earlyReturnNestedTFTF(7);
  earlyBreakNestedTFTF(7);
  earlyContinueNestedTFTF(7);
  earlyReturnNestedTFTC(7);
  earlyBreakNestedTFTC(7);
  earlyContinueNestedTFTC(7);
}

test0();
test0();
test0();
