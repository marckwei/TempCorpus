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
***************PERF TEST********************
* Test for last case hit with few empty cases.
*/
function g(x)
{
    switch(x)
    {
        /*empty case statements*/
        case 20:
        case 19:
        case 18:
        case 17:break;
        case 16:break;
        case 15:break;
        case 14:break;
        case 13:break;
            /*empty case statements*/
        case 12:
        case 11:
        case 10:
        case 9:break;
        case 8:break;
        case 7:break;
        case 6:break;
            /*empty case statements*/
        case 5:
        case 4:
        case 3:
        case 2:
        case 1:
            /* No default statement and no break at the end of the switch */
    }

}

var _switchStatementStartDate = new Date();

for(i=0;i<10000000;i++)
{
    g(1); //testing the last case
}

var _switchStatementInterval = new Date() - _switchStatementStartDate;

WScript.Echo("### TIME:", _switchStatementInterval, "ms");
