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
    function leaf() {
    }
    var obj1 = {};
    var func0 = function () {
        WScript.Echo(a);
    };
    var func2 = function (argMath0) {
        var __loopvar2 = 5;
        for (; a < (argMath0 >>>= test0) ; a++) {
            __loopvar2 += 2;
            if (__loopvar2 >= 5 + 6) {
                break;
            }
        }
        func0();
        return 65535;
    };
    obj1.method1 = func2;
    var IntArr1 = [
      -198980986,
      476677656118063740
    ];
    var a = 2147483647;
    var __loopvar0 = 5;
    do {
        __loopvar0 += 4;
        if (__loopvar0 == 5 + 16) {
            break;
        }
    } while (obj1.method1((IntArr1.pop())));
}
test0();
test0();
