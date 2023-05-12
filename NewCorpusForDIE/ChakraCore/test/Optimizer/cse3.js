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

﻿//Switches:  -macinterpretcount:1 -loopinterpretcount:1 -bgjit-
var GiantPrintArray = [];
function test0() {
    var obj0 = {};
    var arrObj0 = {};
    var func0 = function () {
    }
    var func2 = function () {
        GiantPrintArray.push("hello");
    }
    obj0.method0 = func0;
    Object.prototype.method0 = func2;
    var ui32 = new Uint32Array(256);
    var __loopvar0 = 0;
    for (var strvar23 in ui32) {
        if (__loopvar0++ > 3) break;
        function func8() { }
        arrObj0.method0(1, 1, 1, 1);
    }
    var __loopvar0 = 0;
    for (var strvar23 in ui32) {
        if (__loopvar0++ > 3) break;
        var __loopvar2 = 0;
        do {
            __loopvar2++;
            (obj0 > (new obj0.method0()))
        } while (__loopvar2 < 3)
        (function () {
            eval("")
        })();
        var __loopvar2 = 0;
        do {
            __loopvar2++;
            // Simple Javascript OO pattern
            var a = (function () {
            })(new obj0.method0(new obj0.method0()));
            obj0;

        } while (__loopvar2 < 3)
    }
    WScript.Echo(GiantPrintArray.length);
};
// generate profile
test0();

