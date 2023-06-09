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

//Bug number 101772
//flags: -forcejitloopbody -ForceArrayBTree -off:ArrayCheckHoist
var debugOn = false //if this test fails turn this flag on and see if the array is correct
function test0() {
    var ary = new Array(10);
    if(debugOn)
    {
        WScript.Echo("Contents of ary: ",ary.valueOf());
        WScript.Echo("Size of ary: ",ary.length);
    }
    for(var i = 0; i < 2;i++) // looks like just starting a loop is the problem
    {
        ary.indexOf();
        ary[11] = 1;
        ary[12] = 2;

         if(debugOn)
        {
            WScript.Echo("assign index 11 to 1. is it actually set:",ary[11]);
            WScript.Echo("assign index 12 to 2. is it actually set:",ary[12]);
        }
    }
    if(debugOn)
    {
        WScript.Echo("After Loop");
        WScript.Echo("is index 12 still 2? It is actually :",ary[12]);
        WScript.Echo("Contents of ary: ",ary.valueOf());
        WScript.Echo("Size of ary: ",ary.length);
    }
    ary[15] = 5; //if 26 this will pass
    if(debugOn)
    {
        WScript.Echo("assign index 15 to 5. is it actually set:",ary[15]);
        WScript.Echo("Contents of ary: ",ary.valueOf());
        WScript.Echo("Size of ary: ",ary.length);
    }
}
test0();
WScript.Echo("PASS");
