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

var a = Object.create(Object.prototype, {
    foo: {
        configurable: true,
        get: function () {
            Object.defineProperty(this, "foo", {
                value: "new prop"
            });
            return "old prop";
        },
    }
});
var b = Object.create(a);
WScript.Echo(b.foo);
WScript.Echo(b.foo);

var c = Object.create(Object.prototype, {
    foo: {
        configurable: true,
        get: function () {
            Object.defineProperty(this, "foo", {
                value: "new prop"
            });
            return "old prop";
        },
    }
});
var d = Object.create(c);
d.x = 123;
WScript.Echo(d.foo);
WScript.Echo(d.foo);

var x = Object.create(Object.prototype, {
    foo: {
        configurable: true,
        get: function () {
            Object.defineProperty(y, "foo", {
                value: "new prop"
            });
            return "old prop";
        },
    }
});
var y = Object.create(x);
var z = Object.create(y);
WScript.Echo(z.foo);
WScript.Echo(z.foo);

var e = Object.create(Object.prototype, {
    foo: {
        configurable: true,
        get: function () {
            Object.defineProperty(this, "foo", {
                value: "new prop"
            });
            return "old prop";
        },
    }
});
WScript.Echo(e.foo);
WScript.Echo(e.foo);