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

function foo() {} 
function bar() {} ;

var fncs = [ "Object", "Function", "Array", "String", "Number", "Boolean", "Date", "RegExp", "foo", "bar"] ;

var f = new foo();
var b = new bar();

var objs = [ "new Object()",
            "f", "b", "foo", "String.fromCharCode", "Array.prototype.concat",            
            "[1,2,3]", "new Array()", "fncs",
            "'hello'", "new String('world')",
            "10", "10.2", "NaN", "new Number(3)", 
            "true", "false", "new Boolean(true)", "new Boolean(false)",
            "new Date()",
            "/a+/"
           ];

function check(str)
{
    try {
        write(str + " : " + eval(str));
    } catch (e) {
        write(" Exception: " + str + ". " + e.message);
    }
}

for (var i=0; i<objs.length ; i++) {
    for (var j=0; j<fncs.length; j++) {
        check(objs[i] + " instanceof " + fncs[j]);
    }
}

var count = 0;

for (var i=0; i<objs.length ; i++) {
    for (var j=0; j<objs.length; j++) {
        check(objs[i] + " instanceof " + objs[j]);
    }
}