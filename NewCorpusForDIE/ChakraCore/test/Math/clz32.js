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

// intended to test inlining of Math.clz32
// compliance tests are in es6 UT folder
function module(glob, imp, b) {
    var clz = glob.Math.clz32;
    
    function f1(a)
    {
        a = a|0;
        return clz(a);
    }
    
    function f2()
    {
        return clz(0);
    }
    function f3()
    {
        return clz(0x80000000);
    }
    function f4()
    {
        return clz(32768);
    }
    function f5()
    {
        return clz(NaN);
    }
    function f6()
    {
        return clz(Infinity);
    }
    function f7()
    {
        return clz(undefined);
    }
    function f8()
    {
        return clz(true);
    }
    function f9()
    {
        return clz();
    }
    return {
        f1:f1,
        f2:f2,
        f3:f3,
        f4:f4,
        f5:f5,
        f6:f6,
        f7:f7,
        f8:f8,
        f9:f9
    }
}

var global = this;
var env = {}
var heap = new ArrayBuffer(1<<20);
var m = module(global, env, heap);

print(m.f1(0));
print(m.f1(0));
print(m.f1(0x80000000));
print(m.f1(32768));
print(m.f1(NaN));
print(m.f1(Infinity));
print(m.f1(undefined));
print(m.f1(true));
print(m.f2());
print(m.f2());
print(m.f3());
print(m.f3());
print(m.f4());
print(m.f4());
print(m.f5());
print(m.f5());
print(m.f6());
print(m.f6());
print(m.f7());
print(m.f7());
print(m.f8());
print(m.f8());
print(m.f9());
print(m.f9());
