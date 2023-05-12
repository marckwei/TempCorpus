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
    var obj0 = {};
    var protoObj0 = {};
    var func0 = function () {
        ({
            prop0: typeof Error ? Error : Object,
            prop5: (shouldBailout ? (Object.defineProperty(this, 'prop5', {
                set: function () {
                },
                configurable: true
            })) : -216, shouldBailout ? (Object.defineProperty(this, 'prop5', {
                set: function () {
                }
            })) : -216)
        });
    };
    var func1 = function () {
        return func0(func0()) < protoObj0 >= 0 ? func0(func0()) : 0;
    };
    var func2 = function () {
    };
    var func4 = function () {
        return func1();
    };
    obj0.method0 = func4;
    obj0.method1 = obj0.method0;
    function func7() {
        func2(func0());
    }
    func2(func0());
    obj0.method1();
    var uniqobj0 = func7();
}
test0();
shouldBailout = true;
test0();

WScript.Echo('pass');