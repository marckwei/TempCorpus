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
    'use strict';
    try {
        var obj0 = {};
        var ary = new Array(10);
        obj0.length = 1;
        var __loopvar3 = 0;
        while ((1) && __loopvar3 < 3) {
            __loopvar3++;
            ary.length = -804513990;
        }
        //Snippet 3: fewer arguments than formal parameters
        obj0.length = (function (x, y, z, w, r) {
            e *= obj0.prop0;
            var temp = x + y + z + w + r;
            return temp + ary[(1)];
        })(1, 1, 1);
    }
    catch(e) {
        WScript.Echo(e);
    }
};

// generate profile
test0();

// run JITted code
test0();

var shouldBailout = false;
function test1() {
    'use strict';
    try {
        var obj0 = {};
        var obj1 = {};
        var func2 = function (p0) {
            switch ((d)) {
                case 1:
                    break;
                case (a--):
                    break;
                default:
                    obj1.prop0 -= 1;
                    break;
                case 1:
                    break;
                case 1:
                    break;
            }
            (shouldBailout ? (Object.defineProperty(obj0, 'prop0', { writable: false, enumerable: true, configurable: true }), 1) : 1);
        }
        obj1.method0 = func2;
        var a = 1;
        var d = -27;
        obj1.method0();
        var __loopvar0 = 0;
        do {
            __loopvar0++;
        } while (((obj0.length & (shouldBailout ? (obj0.prop0 = { valueOf: function () { WScript.Echo('obj0.prop0 valueOf'); return 3; } }, 1) : 1))) && __loopvar0 < 3)
    }
    catch (e) {
        WScript.Echo(e);
    }
    WScript.Echo("obj1.prop0 = " + (obj1.prop0 | 0));
};

// generate profile
test1();

// run JITted code
test1();

// run code with bailouts enabled
shouldBailout = true;
test1();
