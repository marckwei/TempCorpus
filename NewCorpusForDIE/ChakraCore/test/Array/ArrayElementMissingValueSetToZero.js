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

//flags: -maxinterpretcount:1 -maxsimplejitruncount:2 -force:rejit -ForceArrayBTree
//Bug number:  109395
var shouldBailout = false;
function test0(){
function makeArrayLength(x) { if(x < 1 || x > 4294967295 || x != x || isNaN(x) || !isFinite(x)) return 100; else return Math.floor(x) & 0xffff; };;
var obj0 = {};
var obj1 = {};
var IntArr0 = new Array();
var FloatArr0 = [1079966239,-2,-97174468.9,4.71984429732334E+18,373475323,516830569.1];
obj1.prop2 = 1434939730.1;
Object.prototype.prop1 = 1;
Object.prototype.prop2 = 1;
Object.prototype.length = makeArrayLength(1);
    for(var _strvar20 in Object.prototype )
    {
        (FloatArr0[(((((shouldBailout ? (FloatArr0[((((obj1.prop2-- )) >= 0 ? ( (obj1.prop2-- )) : 0) & 0xF)] = 'x') : undefined ), (obj1.prop2-- )) >= 0 ? (obj1.prop2-- ) : 0)) & 0XF)]);
        obj0.prop1 = IntArr0[((shouldBailout ? (IntArr0[1] = 'x') : undefined ), 1)];
    }
};


// generate profile
test0();
// Run Simple JIT
test0();
test0();


// run JITted code
runningJITtedCode = true;
test0();


// run code with bailouts enabled
shouldBailout = true;
test0();
WScript.Echo("PASS");
