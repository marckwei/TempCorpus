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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

// TrimStackTracePath is needed because same file is run in version 1/2 where LoadScriptFile is not defined
function TrimStackTracePath(obj)
{
    return obj;
}
if (this.WScript && typeof this.WScript.LoadScriptFile === "function")
{
    this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js");
}

function PadString(i)
{
    var s = "";
    if (i === null) {
        s = "null";
    } else if (i === undefined) {
        s = "undefined";
    } else {
        s = i.toString();
    } 
    
    while (s.length < 12) {
        s += ' ';
    }
    return s;
}

function DumpProperty(pname, p)
{
    if (pname === "stack")
    {
        p = TrimStackTracePath(p);
    }
    WScript.Echo(PadString(pname) + " = " + PadString(p) + "(" + typeof(p) + ")");
}

function DumpObject(e)
{
    // "message" and "name" are not enumerable in ES5
    DumpProperty("message", e.message);
    DumpProperty("name", e.name);

    var a = new Array();
    for (var i in e)
    {
        a[a.length] = i;
    }
    a[a.length] = "number";
    a[a.length] = "stack";
    a.sort();
    for (var j = 0; j < a.length; j++)
    {
        i = a[j];
        DumpProperty(i, e[i]);
    }
}

function Test(typename, s)
{
    WScript.Echo("-----------------------------------------");
    WScript.Echo(typename + "(" + s + ")");
    var e = eval("new " + typename + "(" + s + ")");
    DumpObject(e);
}

function TestCtor(typename)
{
    // No param
    Test(typename, "");

    // 2 primitive type param
    Test(typename, "NaN, NaN");
    Test(typename, "1, 1");
    Test(typename, "1.1, 1.1");
    Test(typename, "undefined, undefined");
    Test(typename, "null, null");
    Test(typename, "true, true");
    Test(typename, "false, false");
    Test(typename, "'blah', 'blah'");

    // 2 object param
    Test(typename, "new Object(), new Object()");
    Test(typename, "new String('blah'), new String('blah')");
    Test(typename, "new Number(1.1), new Number(1.1)");
    Test(typename, "new Boolean(true), new Boolean(true)");
    Test(typename, "Test, Test");

    // 1 primitive param
    Test(typename, "NaN");
    Test(typename, "1");
    Test(typename, "undefined");
    Test(typename, "null");
    Test(typename, "true");
    Test(typename, "false");
    Test(typename, "'blah'");

    // 1 object param
    Test(typename, "new Object()");
    Test(typename, "new String('blah')");
    Test(typename, "new Number(1.1)");
    Test(typename, "new Boolean(1.1)");
    Test(typename, "Test");
}

TestCtor("Error");
TestCtor("TypeError");
