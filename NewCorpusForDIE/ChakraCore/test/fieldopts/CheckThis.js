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

// Flavors of inlined LdThis, some of which will bail out if we force the optimization.

(function () {
    function f() {
        return this.foo();
    }

    var t = this;
    var x = { foo: function () { WScript.Echo(this); } };
    x.f = f;
    x.f();

    try {
        f();
    }
    catch (e) {
        WScript.Echo(e.message);
    }

    WScript.Echo(t === this);
})();

(function () {
    function f(o) {
        return o.foo();
    }

    var x = { foo: function () { WScript.Echo(this); } };
    f(x);
})();

function test() {
    Object.prototype['foo'] = function () {return this};
    var c = {}
    var x;
    x + c.foo("a");
    ((function(){
        return 1;
    })()).foo()
};

WScript.Echo(test());
WScript.Echo(test());
