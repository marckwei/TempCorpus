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

var shouldBailout = false;
function test0() {
    var obj1 = {};
    var arrObj0 = {};
    var ary = new Array(10);
    var ui16 = new Uint16Array(256);
    var c = 1;
    var f = 1;
    arrObj0.prop0 = -254;
    for(var __loopvar0 = 0; __loopvar0 < 3 && f < ((-arrObj0.prop0)) ; __loopvar0++ + f++) {
        for(var __loopvar1 = 0; ; __loopvar1++) {
            if(__loopvar1 > 3) break;
            var __loopvar4 = 0;
            while((1) && __loopvar4 < 3) {
                __loopvar4++;
                if(c) {
                    break;
                }
                var __loopvar5 = 0;
                while((1) && __loopvar5 < 3) {
                    __loopvar5++;
                    if(shouldBailout) {
                        func1 = obj0.method0;
                    }
                    obj1.prop1 = ui16[(1) & 255];
                }
            }
            obj0 = obj1;
            obj0.length = ary[((shouldBailout ? (ary[1] = "x") : undefined), 1)];
        }
    }
};
test0();
test0();
test0();
test0();
shouldBailout = true;
test0();

WScript.Echo("pass");
