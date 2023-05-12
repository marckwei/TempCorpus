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

// ScriptFunc1()
// ScriptFunc2()
// Script1Func1()
// Script1Func2()
// Script2Func1()
// Script2Func2()
// ScriptFunc3()
// Script1Func3()
// Script2Func3()

var script1 = WScript.LoadScript("\
  var scriptFunc2; \
  var scriptFunc3; \
  function Script1Func1() { scriptFunc2(); } \
  function Script1Func2() { Script1Func1(); } \
  function Script1Func3() { scriptFunc3(); } \
  function setFunc2(func) { scriptFunc2 = func; } \
  function setFunc3(func) { scriptFunc3 = func; }",
  "samethread");

var script2 = WScript.LoadScript(" \
  var script1Func2; \
  var script1Func3; \
  function Script2Func1() { script1Func2(); } \
  function Script2Func2() { Script2Func1(); } \
  function Script2Func3() { script1Func3(); } \
  function setFunc2(func) { script1Func2 = func; } \
  function setFunc3(func) { script1Func3 = func; }",
  "samethread");

function Func2() {
  Func1();
}

function Func3() {
  script2.Script2Func2();
}

function Func1() {
  var x = 1; /**bp:stack();locals(1);**/;
}

script2.setFunc2(script1.Script1Func2);
script1.setFunc2(Func2);
script1.setFunc3(Func3);
script2.setFunc3(script1.Script1Func3);
script2.Script2Func3();
WScript.Echo("pass");
