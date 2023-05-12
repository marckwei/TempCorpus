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

var shouldReturn = true;
function func3(argMath8){
    try
    {
        var __loopvar6 = 5;
        argMath8++;
        func2.call(protoObj0 , 1);
    }
    catch(ex)
    {
        WScript.Echo(ex.message);
        if(shouldReturn)
        {
            return 1;
        }
    }
    ui32.length;
}

try
{
    func3(0);
    func3(0);
    shouldReturn = false;
    func3(1.1);
}
catch(ex){}

function v14()
{
    return 1;
}

function test0()
{
    var GiantPrintArray = [];
    var ary = new Array(10);
    try
    {
        GiantPrintArray.push(v14(ary[(1)],false));
        GiantPrintArray.push(v14(ary[(1)],1,1));
    }
    catch(ex)
    {
        WScript.Echo(ex.message);
    }
};

test0();
test0();
test0();
