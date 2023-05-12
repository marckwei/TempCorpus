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

var log = Array(1000000);
var i = 0;

function test() {
    var cqjmyu;
    for (var wetavm = 0; wetavm < 1000; ++wetavm) {
        cqjmyu = new Uint16Array([1, 1, 1, 1, 1, 1, 1, 1, 1]);
        cqjmyu_0 = new Uint8ClampedArray(cqjmyu);
        cqjmyu_0[8] = "5";
        log[i++] = cqjmyu_0[0];
    }
    return cqjmyu[0];
}
for(var j =0;j<100;j++) test();
test();
test();
test();
test();
test();
test();
test();
test();
test();
test();
test();

var failed = false;
for(var k = 0; k < i; k++) {
    if(log[k] != 1) {
        WScript.Echo("failed at " + k);
        failed = true;
        break;
    }
}
if(!failed)
{
    WScript.Echo("PASSED");
}
