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
*   Test with switch expressions as math exp.
*   Contains 3 switch cases
*/
function f(x)
{
    switch(x++) // post increment
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
        case 5:
            WScript.Echo(5);
            break;
        case 6:
            WScript.Echo(6);
            break;
        case 7:
            WScript.Echo(7);
            break;
        case 8:
            WScript.Echo(8);
            break;
        case 9:
            WScript.Echo(9);
            break;
        case 10:
            WScript.Echo(10);
            break;
        default:
            WScript.Echo('default');
            break;
    }

    switch(++x) //pre increment
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
        case 5:
            WScript.Echo(5);
            break;
        case 6:
            WScript.Echo(6);
            break;
        case 7:
            WScript.Echo(7);
            break;
        case 8:
            WScript.Echo(8);
            break;
        case 9:
            WScript.Echo(9);
            break;
        case 10:
            WScript.Echo(10);
            break;
        default:
            WScript.Echo('default');
            break;
    }

    switch(x+10) //math expression - adds 10 to x
    {
        case 11:
           WScript.Echo(11);
           break;
        case 12:
            WScript.Echo(12);
           break;
        case 13:
            WScript.Echo(13);
            break;
        case 14:
            WScript.Echo(14);
            break;
        case 15:
            WScript.Echo(15);
            break;
        case 16:
            WScript.Echo(16);
            break;
        case 17:
            WScript.Echo(17);
            break;
        case 18:
            WScript.Echo(18);
            break;
        case 19:
            WScript.Echo(19);
            break;
        case 20:
            WScript.Echo(20);
            break;
        default:
            WScript.Echo('default');
            break;
    }

}

for (i = 1; i <= 11; i++)
{
    f(i);
}

//causing bail out to happen
for(i=0;i<200;i++)
{
    f(new Object);
    f(100);
    f(5);
}

