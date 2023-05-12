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
    var obj0 = {};
    var obj1 = {};
    var ary = new Array(10);
    var ui32 = new Uint32Array(256);
    var c = 1;
    var d = 1;
    obj1.length = (function(x, y, z) {
        var __loopvar3 = 0;
        while(((d -= ary[(1)])) && __loopvar3 < 3) {
            __loopvar3++;
        }
        return 1;
    })((obj0.length++), 1, 1);
    var __loopvar2 = 0;
    LABEL0:
    LABEL1:
        for(var strvar0 in ui32) {
            if(strvar0.indexOf('method') != -1) continue;
            if(__loopvar2++ > 3) break;
            switch((1 ? (c ? (d * 1) : 1) : 1)) {
                case 1:
                    break;
                case 1:
                    break;
                case 1:
                    break;
                case 1:
                    break LABEL0;
                case 1:
                    break;
                case 1:
                    break;
                default:
                    break;
                case 1:
                    break LABEL1;
                case 1:
                    break LABEL0;
                case 1:
                    break LABEL1;
                case 1:
                    break;
                case 1:
                    break;
                case 1:
                    break;
            }
            d ^= 1;
        }
};
test0();
test0();

function test7() {
    var e = -1458200662;
    for(var i = 0; i < 1; ++i) {
        new Int16Array()[e, {}, 2147483650] ? new Int16Array()[(-1458200662, 2147483650) & 255] : 0;
    }
    function test7a() { e; }
}
test7();

function test8() {
    var a = new Int32Array();
    for(var i = 0; i < 1; ++i) {
        for(var j = 0; j < 1; ++j)
            a[0x7fffffff];
        a[0];
    }
}
test8();

WScript.Echo("pass");
