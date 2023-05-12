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
    var GiantPrintArray = [];
    function makeArrayLength() {
    }
    var obj0 = {};
    var obj1 = {};
    var func0 = function () {
        protoObj0 = obj0;
        var __loopvar2 = 3;
        for (; ; __loopvar2++) {
            if (__loopvar2 === 3 + 3) {
                break;
            }
            function __f() {
                if (obj0.prop0) {
                    GiantPrintArray.push(__loopvar2);
                    Math.sin(Error());
                } else {
                    litObj1 = obj0;
                }
            }
            function __g() {
                __f();
            }
            __f();
        }
    };
    var func1 = function () {
        litObj1.prop0 = obj1;
    };
    var func2 = function () {
        return func0();
    };
    var func3 = function () {
        ary.push(func1(), func0() ? (uniqobj3) : func2());
    };
    obj0.method1 = func3;
    var ary = Array();
    makeArrayLength(func2());
    protoObj0.method1();
    WScript.Echo(GiantPrintArray);
}
test0();
