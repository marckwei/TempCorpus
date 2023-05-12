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

function verify(x,y)
{
    if(x != y)
    {
        WScript.Echo("ERROR: " + x + " != " + y );
    }
    else
    {
        WScript.Echo(x + " == " + y);
    }
}

WScript.Echo(parseFloat());
WScript.Echo(parseFloat("a"));
WScript.Echo(parseFloat("o12345"));
WScript.Echo(parseFloat("e10"));
WScript.Echo(parseFloat("+b"));

verify(0, parseFloat("0"));
verify(0, parseFloat("-0"));
verify(0, parseFloat(0));
verify(0, parseFloat(-0)); // -0 to "0" to 0

// Verify again with 1 / 0 because 0 === -0 and we want to make sure that the sign is correct
verify(1 / 0, 1 / parseFloat("0"));
verify(1 / -0, 1 / parseFloat("-0"));
verify(1 / 0, 1 / parseFloat(0));
verify(1 / 0, 1 / parseFloat(-0)); // 1 / (-0 to "0" to 0) == +Infinity

verify(17.3, parseFloat(new String("17.3")));
verify(17.3, parseFloat(new Number(17.3)));

verify(0,parseFloat("\n\r\n\r\t\t\t0"));
verify(1,parseFloat("    1"));
verify(-1,parseFloat("    -1"));

verify(15, parseFloat("   15  ", 1, 1, 1, 1, 1));
verify(3.14159, parseFloat("+.0000314159e5"));
verify(3.14159, parseFloat("314159e-5"));

verify(12345.67, parseFloat("+12345.67"));
verify(-12345.67, parseFloat("-12345.67"));

verify(1.7976931348623158e+308, parseFloat("1.7976931348623158e+308"));
verify(2.2250738585072014e-308, parseFloat("2.2250738585072014e-308"));

verify(-1.7976931348623158e+308, parseFloat("-1.7976931348623158e+308"));
verify(-2.2250738585072014e-308, parseFloat("-2.2250738585072014e-308"));

verify(8128, parseFloat(parseFloat(parseFloat(".8128e+00004"))));
