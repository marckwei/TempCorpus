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

// Global function
var x = 1;
function foo() {
  x = 2;
}
WScript.DumpFunctionPosition(foo);

// Function property
var obj = {
  func : function () {
    WScript.Echo('');
  }
};
WScript.DumpFunctionPosition(obj.func);

var global = WScript.LoadScript("function foo(){}", "samethread", "dummyFileName.js");
WScript.DumpFunctionPosition(global.foo);

var evalFunc = eval('new Function("a", "b", "/*some comments\\r\\n*/    return a + b;")');
WScript.DumpFunctionPosition(evalFunc);

/*some function not at 0 column*/function blah() {
  /* First statement not at 0 */
  var xyz = 1;
}
WScript.DumpFunctionPosition(blah);

// Shouldn't get functionPosition of built-ins
WScript.DumpFunctionPosition(JSON.stringify);
WScript.DumpFunctionPosition(eval);

WScript.Echo("pass");
