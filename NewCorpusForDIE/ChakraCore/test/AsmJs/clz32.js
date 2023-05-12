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

function AsmModule(glob, imp, b) {
    "use asm"
    var clz = glob.Math.clz32;

    function f1(a)
    {
        a = a|0;
        return clz(a|0)|0;
    }

    function f2()
    {
        return clz(0)|0;
    }
    function f3()
    {
        return clz(0x80000000)|0;
    }
    function f4()
    {
        return clz(32768)|0;
    }
    return {
        f1:f1,
        f2:f2,
        f3:f3,
        f4:f4
    }
}

var global = this;
var env = {}
var heap = new ArrayBuffer(1<<20);
var asmModule = AsmModule(global, env, heap);

print(asmModule.f1(0));
print(asmModule.f1(0x80000000));
print(asmModule.f1(32768));
print(asmModule.f2());
print(asmModule.f3());
print(asmModule.f4());
