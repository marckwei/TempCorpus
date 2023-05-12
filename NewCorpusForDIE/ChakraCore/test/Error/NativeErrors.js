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

// TrimStackTracePath is needed because same file is run in version 1/2 where LoadScriptFile is not defined
function TrimStackTracePath(obj)
{
    return obj;
}
if (this.WScript && typeof this.WScript.LoadScriptFile === "function")
{
    this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js");
}

function PadString(s, l)
{
    while (s.length < l)
    {
        s += ' ';
    }
    return s;
}
function DumpObject(o)
{
    var a = new Array();
    for (var i in o)
    {
        a[a.length] = i;
    }
    a[a.length] = "description"; // Explicitly adding the known non-enumerable members
    a[a.length] = "number";
    a[a.length] = "stack";
    a.sort();
    for (var i = 0; i < a.length; i++)
    {
        if (a[i] === "stack")
        {
            o[a[i]] = TrimStackTracePath(o[a[i]]);
        }
        WScript.Echo(PadString(a[i], 15) + "= " + PadString("(" + typeof(o[a[i]]) + ")", 10) + o[a[i]]);
    }
    WScript.Echo(PadString("toString()", 15) + "= " + o.toString());
}

function Test(s)
{
    WScript.Echo(s);
    DumpObject(eval("new " + s));
    WScript.Echo();
}

function safeCall(f)
{
    var args = [];
    for (var a = 1; a < arguments.length; ++a)
        args.push(arguments[a]);
    try
    {
        return f.apply(this, args);
    }
    catch (ex)
    {
        WScript.Echo(ex.name + ": " + ex.message);
    }
}

Test("EvalError");
Test("RangeError('This is a range error')");
Test("ReferenceError");
Test("SyntaxError");
Test("TypeError('This is a type error')");
Test("URIError");
safeCall(Test, "RegExpError");
safeCall(Test, "ConversionError");
