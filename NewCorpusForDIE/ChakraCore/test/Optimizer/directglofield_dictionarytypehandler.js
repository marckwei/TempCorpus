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

function test() {
    Object.prototype['create'] = function () {};
    Object.prototype['yoyo'] = function () {};
    Object.prototype['splice'] = function () {};
    Object.prototype['watch'] = function () {};
    Object.prototype['setInt8'] = function () {};
    Object.prototype['unwatch'] = function () {};
    Object.prototype['eval'] = function () {};

    (function () {
        function foo() {
            Object.defineProperty(this, "b", ({
                    set : isNaN,
                    configurable : true
                }));
            Object.defineProperty(this, "w", ({
                    configurable : true
                }));
        }
        try {
            foo();
        } catch (e) {
            WScript.Echo(1);
        }
    })();
    for (var y in[true, true, true, true, true, true, true, true, true, true, true, true, true, true, new Boolean(false), true,  true]) {
        w;
    }
    function bar() {
        Object.defineProperty(this, "a", ({
                configurable : false
            }));
        delete this.w;
        this.w = false;
        Object.preventExtensions(this);
    };
    bar();
};

//Interpreter call
test();

//JIT call
test();
test();





