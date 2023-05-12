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


var global = this;
function Dump(s)
{
    var o = global[s];
    if (!o) { return; }
    WScript.Echo("for..in " + s);
    for (var i in o)
    {
        WScript.Echo("  " + i + " = " + o[i]);
    }
    WScript.Echo("for..in " + s + " (with blah)");
    o.blah = "b";
    for (var i in o)
    {
        WScript.Echo("  " + i + " = " + o[i]);
    
    }
    try
    {
        var newobj = new o();
        WScript.Echo("for..in new " + s);
        for (var i in newobj)
        {
            WScript.Echo("  " + i + " = " + newobj[i]);
    
        }

        WScript.Echo("for..in " + s + " (with prototype.blah2)");
        o.prototype.blah2 = s;
        for (var i in newobj)
        {
            WScript.Echo("  " + i + " = " + newobj[i]);
    
        }
    } 
    catch (e)
    {
    }
    WScript.Echo();
}



Dump("Object");
Dump("Array");
Dump("String");
Dump("Function");
Dump("Math");
Dump("JSON");
Dump("Number");
Dump("Boolean");
Dump("Date");
Dump("RegExp");
