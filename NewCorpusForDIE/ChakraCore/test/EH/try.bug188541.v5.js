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

function foo() {
    try {
        throw "foo error";
    } catch (e) {
        WScript.Echo("Caught e=" + e);
        {
            let e = 10;
            WScript.Echo("Caught e=" + e);
        }

        WScript.Echo("Caught e=" + e);
    }
}

function foo2() {
    try {
        throw "foo error";
    } catch (e) {
        WScript.Echo("Caught e=" + e);
        var e = 10;
        WScript.Echo("Caught e=" + e);
    }
}

function foo3() {
    try {
        throw "foo error";
    } catch (e) {
        WScript.Echo("Caught e=" + e);
        var e = 10;
        {
            try {
                e = 0;
            }
            catch(err) {
                WScript.Echo("Caught expected err=" + err);
            }

            let e = 20;
            WScript.Echo("Caught e=" + e);
        }

        WScript.Echo("Caught e=" + e);
    }
}

function foo4() {
    try {
        throw "foo error";
    } catch (e) {
        WScript.Echo("Caught e=" + e);
        {
            let e = 20;
            WScript.Echo("Caught e=" + e);
        }

        WScript.Echo("Caught e=" + e);
    }
}

function foo5() {
    try {
        throw "foo error";
    } catch (e) {
        WScript.Echo("Caught e=" + e);
        e = 10;
        {
            try {
                e = 0;
            }
            catch(err) {
                WScript.Echo("Caught expected err=" + err);
            }
            let e = 20;
            WScript.Echo("Caught e=" + e);
        }

        WScript.Echo("Caught e=" + e);
    }
}

WScript.Echo("foo():");
foo();
WScript.Echo("");

WScript.Echo("foo2():");
foo2();
WScript.Echo("");

WScript.Echo("foo3():");
foo3();
WScript.Echo("");

WScript.Echo("foo4():");
foo4();
WScript.Echo("");

WScript.Echo("foo5():");
foo5();
WScript.Echo("");

WScript.Echo("PASSED");
