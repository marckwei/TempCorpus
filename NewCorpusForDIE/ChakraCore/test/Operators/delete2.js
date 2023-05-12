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

function write(v) { WScript.Echo(v + ""); }

var r;

var globalX;
var a = new Array(10);
var o = { x : 1, y : 2 };

// Delete a uninitialized global variable
r = delete globalX;  
write("delete uninitialized variable globalX: " + r);
write("globalX : " + globalX);

var explicitVar = 10;

r = delete explicitVar;
write("delete explicitVar       : " + r);
write("value  explicitVar       : " + explicitVar);

implicitVar = 20;
r = delete implicitVar;
write("delete implicitVar       : " + r);
try {
    write("value  implicitVar       : " + implicitVar);
} catch (e) {
    write("value  implicitVar       : Exception");
}

eval("var explicitVarInEval = 30;")
r = delete explicitVarInEval;
write("delete explicitVarInEval : " + r);
try {
    write("value explicitVarInEval : " + explicitVarInEval);
} catch (e) {
    write("value  explicitVarInEval : Exception");
}

eval("implicitVarInEval = 40;")
r = delete implicitVarInEval;
write("delete implicitVarInEval : " + r);
try {
    write("value implicitVarInEval : " + implicitVarInEval);
} catch (e) {
    write("value  implicitVarInEval : Exception");
}

Array.prototype[2] = 100;
a[1] = 200;

write("a[1] = " + a[1]);
r = delete a[1];
write("delete a[1] : " + r);
write("a[1] = " + a[1]);

write("a[2] = " + a[2]);
r = delete a[2];
write("delete a[2] : " + r);
write("a[2] = " + a[2]);

write("o.x = " + o.x);
r = delete o.x;
write("delete o.x : " + r);
write("o.x = " + o.x);

r = delete o.x;
write("delete o.x (again): " + r);

write("o.z = " + o.z);
r = delete o.z;
write("delete o.z (non existing property): " + r);
write("o.z = " + o.z);
