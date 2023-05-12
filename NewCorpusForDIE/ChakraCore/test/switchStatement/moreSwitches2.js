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

/*
*******************************UNIT TEST FOR SWITCH CASE OPTIMIZATION*******************************
*   Test for 3 switch cases bailing out during different times of the execution.
*/
function f(x,y,z)
{
    switch(x)
    {
        case 1:
           WScript.Echo(1);
           break;
        case 2:
           WScript.Echo(2);
           break;
        case 3:
           WScript.Echo(3);
           break;
        case 4:
           WScript.Echo(4);
           break;
        default:
            WScript.Echo('default-x');
            break;
    }

    switch(y)
    {
        case 1:
            WScript.Echo(1);
            break;
        case 2:
           WScript.Echo(2);
           break;
        case 3:
           WScript.Echo(3);
           break;
        case 4:
           WScript.Echo(4);
           break;
        default:
            WScript.Echo('default-y');
            break;
    }

    switch(z)
    {
        case 1:
            WScript.Echo(1);
            break;
        default:
            WScript.Echo('default-z');
            break;
    }
}

//making the first switch to get profiled as object during first run in the interpreter
f(1,2,new Object);
f(1,2,3);
f(1,2,3);
f(1,2,3);
f(1,2,3);

//making the second and third to bail out.
for(i=0;i<30;i++)
{
    f(1,new Object,3);
    f(new Object,new Object,3);
}
