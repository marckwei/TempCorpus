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
    function makeArrayLength(x) { if(x < 1 || x > 4294967295 || x != x || isNaN(x) || !isFinite(x)) return 100; else return Math.floor(x) & 0xffff; };;
    var obj0 = {};
    var arrObj0 = {};
    var func2 = function(argObj3, argArrObj4, argArr5) {
        return ary.length;
    }
    var ary = new Array(10);
    var e = 1;
    var h = -1945829900.9;
    obj0.length = makeArrayLength(1);
    ary[ary.length - 1] = 1;
    ary.length = makeArrayLength(506767877);
    for(var __loopvar0 = 0; __loopvar0 < 3 && h < (1) ; __loopvar0++ + h++) {
        var __loopvar1 = 0;
        do {
            __loopvar1++;
            for(var __loopvar2 = 0; __loopvar2 < 3 && obj0.length < (func2(1, 1, 1)) ; 1) {
                __loopvar2++;
                var w = e;
            }
        } while((1) && __loopvar1 < 3)
        e *= arrObj0.prop0;
    }
};
test0();
test0();
test0();

WScript.Echo("pass");
