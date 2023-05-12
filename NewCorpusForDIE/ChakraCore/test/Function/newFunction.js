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

// No arguments
var f = new Function();
write(f());

// Just the body
var f0 = new Function("return 10;");
write(f0());


var f1 = new Function("a", "return a;");
write(f1());
write(f1(100));


var f2 = new Function("a", "b", "return a+b;");
write(f2());
write(f2(10));
write(f2(10,20));


// All of f3? should be the same
var f31 = new Function("a", "b", "c", "return a+b+c;");
var f32 = new Function("a,b,c", "return a+b+c;");
var f33 = new Function("a,b", "c", "return a+b+c;");

write(f31());
write(f32());
write(f33());

write(f31(10,20,30));
write(f32(10,20,30));
write(f33(10,20,30));


// Check the name binding
var x = "global";
function fNameBinding() {
    var x = "local";
    var y = new Function("return x;");
    
    write(y());
    
    return x + " " + y();
}

write(fNameBinding());

