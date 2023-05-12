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


var o = new Array();
var a = new Object();

// Generate getter that will return a constructed string
function propString(i)
{
    return function() { var ret = "a" + i; return ret; };
}

function init(o, a)
{
    for (var i = 0; i < 21; i++)
    {
        // Create a replacer array that doesn't hold the string reference by using a getter to create
        // the string.
        Object.defineProperty(o, i, { get: propString(i) } );


        // Initialize the object to be stringify
        a["a" + i] = i;
    }
}

init(o,a);

WScript.Echo(JSON.stringify(a,o));

// Bug 30349 - invalid replacer array element after valid element causes crash regardless of input
WScript.Echo(JSON.stringify(true, [new Number(1.5), true])); // Original repro
WScript.Echo(JSON.stringify(false, [new Number(1.5), true]));
WScript.Echo(JSON.stringify(null, [new Number(1.5), true]));
// Valid input should just ignore any bad replacer array elements
WScript.Echo(JSON.stringify(a, [false, "a0", true, "a10", false]));
