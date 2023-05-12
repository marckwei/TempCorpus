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

// -maxinterpretcount:1 -off:objtypespec
function test0(o2) {
    var o = {};
    var a = [1];
    var sum = a[0];
    sum += a[0];
    o.a = a;
    if(!o2)
        o.a = [];
    o2.b = a;
    var b = o.a;
    b[0] = 2;
    sum += b[0];
    return sum;
}
var o2 = {};
Object.defineProperty(
    o2,
    "b",
    {
        configurable: true,
        enumerable: true,
        set: function(a) {
            Object.defineProperty(
                a,
                "0",
                {
                    configurable: true,
                    enumerable: true,
                    writable: false,
                    value: 999
                });
        }
    });
WScript.Echo(test0({}));
WScript.Echo(test0(o2));

// -maxinterpretcount:1 -off:objtypespec
function test1() {
    test1a({ p: 2 }, { p2: 0 }, 0);
    var o = { p: 2 };
    var o2 = {};
    Object.defineProperty(
        o2,
        'p2',
        {
            configurable: true,
            enumerable: true,
            set: function() {
                o.p = 2;
            }
        });
    test1a(o, o2, 0);

    function test1a(o, o2, b) {
        o.p = true;
        if(b)
            o.p = true;
        o2.p2 = o2;
        return o.p >>> 2147483647;
    }
};
test1();
