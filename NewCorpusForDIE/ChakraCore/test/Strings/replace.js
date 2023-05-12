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

function doEval(str) {
    var r;
    try {
        r = eval(str);
        write(str + ": result = " + r);
    } catch (e) {
        write("Exception: " + e);
    }

}

function f0()
{
    write("f0");

    return "f0";
}

function f1(x)
{
    write("f1 x: " + x);

    return "f1";
}

function f2(x,y)
{
    write("f2 x: " + x + " y: " + y);

    return "f2";
}

function f3(x,y,z)
{
    write("f3 x: " + x + " y: " + y + " z: " + z);
    write(z.substring(y, x.length));

    return "f3";
}

var s1 = new String("This is a some string value. 12.34");
var s2 = "This is a some string value. 12.34";

var search = ['"some"', 12, 34, "/[0-9]/", "/[0-9]+/", "/[0-9]+/g", "undefined", "null" ];
var replace= ['"any"', '""', "undefined", "null", "f0", "f1", "f2", "f3"];

for (var i=0; i<search.length; i++)
{
    for (var j=0; j<replace.length; j++)
    {
        doEval("s1.replace(" + search[i] + ", " + replace[j] + ");");
        doEval("s2.replace(" + search[i] + ", " + replace[j] + ");");
    }
}

//implicit calls
var called = false;
var replaceobj = {toString: function() { called = true; }};
"ABC".replace("D", replaceobj);
WScript.Echo (called);

