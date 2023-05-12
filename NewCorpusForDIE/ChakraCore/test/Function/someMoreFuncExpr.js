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

function write(v) { WScript.Echo(v + ""); }

function global() { write("global"); }
function another() { write("another"); }
function g1() { write("g1"); }
function g2() { write("g2"); }
function g3() { write("g3"); }
function g4() { write("g4"); }

(function () {
    g1();
    var x = function g1() { write("first"); } 
    g1();
    var y = function g1() { write("second"); }
    g1();
})();


(function () {
    try { g2(); } catch (e) { write(e); }

    var g2 = global;
    try { g2(); } catch (e) { write(e); }

    var y = function g2() { write("second"); }
    try { g2(); } catch (e) { write(e); }
})();


(function () {
    try { g3(); } catch (e) { write(e); }

    var x = function g3() { write("first"); }
    try { g3(); } catch (e) { write(e); }

    var g3 = global;
    try { g3(); } catch (e) { write(e); }
})();

(function () {
    try { g4(); } catch (e) { write(e); }

    var g4 = global 
    try { g4(); } catch (e) { write(e); }

    var g4 = another
    try { g4(); } catch (e) { write(e); }
})();
