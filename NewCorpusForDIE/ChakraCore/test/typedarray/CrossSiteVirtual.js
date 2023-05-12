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

function foo(type)
{
    var arrBuffer = new ArrayBuffer(16);
    var arr = new this[type](arrBuffer);
    var g = WScript.LoadScript("a = new " + type + "(16777216);" + `
    function arrayBufferTest1(arr2) { 
        var buf = arr2.buffer; 
        var name = buf.constructor.name; 
    }` + `
    function arrayBufferTest2(type, arrBuffer2) { 
        var arr2 = new this[type](arrBuffer2);
        var buf = arr2.buffer; 
        var name = buf.constructor.name; 
    }` + `
    function arrayBufferTest3(type, arr3) { 
        var arrBuffer3 = new ArrayBuffer(16);
        arr3 = new this[type](arrBuffer3);
        var buf = arr3.buffer; 
        var name = buf.constructor.name; 
    }`, "samethread");
    g.a[0] = 0;
    g.a[0];

    // Test to make sure the TypedArray's underlying ArrayBuffer gets marshalled correctly along with it's prototype chain.
    g.arrayBufferTest1(arr);
    g.arrayBufferTest2(type, arrBuffer);
    var arr3;
    g.arrayBufferTest3(type, arr3);
}

foo("Int8Array");
foo("Uint8Array");
foo("Uint8ClampedArray");
foo("Int16Array");
foo("Uint16Array");
foo("Int32Array");
foo("Uint32Array");
foo("Float32Array");
foo("Float64Array");

WScript.Echo("PASSED");
