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
* Test with three switch statements.
*/
function f(x,y)
{
    switch(x)
    {
        case 'abc':
           WScript.Echo('abc');
           break;
        case 'def':
            WScript.Echo('def');
           break;
        case 'ghi':
            WScript.Echo('ghi');
            break;
        case 'jkl':
            WScript.Echo('jkl');
            break;
        case 'mno':
            WScript.Echo('mno');
            break;
        case 'pqr':
            WScript.Echo('pqr');
            break;
        case 'stu':
            WScript.Echo('stu');
            break;
        case 'vxy':
            WScript.Echo('vxy');
            break;
        case 'z':
            WScript.Echo('z');
            break;
        default:
            WScript.Echo('default');
            break;
    }

    /* Switch with one case statement*/
    switch(y)
    {
        case 'abc':
            WScript.Echo('abc');
            break;
    }

}

f('abc','abc');
f('def','def');
f('ghi','ghi');
f('jkl','jkl');
f('mno','mno');
f('pqr','pqr');
f('stu','stu');
f('vxy','vxy');
f('z','z');
f('saf','asf');

