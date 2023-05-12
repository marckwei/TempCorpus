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

function compare(locale, opt1, opt2) {
    if ( locale == opt1 ) {
        WScript.Echo("Passed");
    } else {
        if ( opt2 && locale == opt2 ) {
            WScript.Echo("Passed");
        } else {
            WScript.Echo("Failed - " + locale);
        }
    }
}

var sample = (1000.234).toLocaleString();

var decimal = ".", thousands = ",";

if (sample == "1.000,234") {
    decimal = ",";
    thousands = ".";
} else if ( sample == "1000.234" ) {
    // we can't be sure whether system locale has thousands char or
    // toLocaleString has failed.
    if ( (1234567).toLocaleString() == "1234567" ) {
        // looks like it is more likely that system locale doesn't have thousands char
        // or there is something terribly wrong with toLocaleString implementation
        thousands = "";
    }
} else if ( sample == "1000,234" ) {
    decimal = ",";
    thousands = "";
}

WScript.Echo ( "|| 999.9996 -> 1,000 or 1.000" );
compare ( (999.9996).toLocaleString(), "1" + thousands + "000" );

WScript.Echo ( "|| -999.9996 -> -1,000 or -1.000" );
compare ( (-999.9996).toLocaleString(), "-1" + thousands + "000" );

WScript.Echo ( "|| -1999.9996 -> -2,000 or -2.000" );
compare ( (-1999.9996).toLocaleString(), "-2" + thousands + "000" );

WScript.Echo ( "|| 0.9996 -> 1 or 1.00 or 1,00" );
compare (    (0.9996).toLocaleString(), "1", "1" + decimal + "00");

WScript.Echo ( "|| 0.1996 -> 0.2" );
compare ( (0.1996).toLocaleString(), "0" + decimal + "2" );

WScript.Echo ( "|| -0.1996 -> -0.2" );
compare ( (-0.1996).toLocaleString(), "-0" + decimal + "2" );

WScript.Echo ( "|| -0.1996 -> -0.2" );
compare ( (-0.1996).toLocaleString(), "-0" + decimal + "2" );

WScript.Echo ( "|| 1/3 -> 0.333 or 0,333" );
compare ( (1/3).toLocaleString(), "0" + decimal + "333" );

WScript.Echo ( "|| 1234567890.123456 ->1,234,567,890.123 or 1.234.567.890,123" );
compare ( (1234567890.12345).toLocaleString(), "1" + thousands + "234" +
                                               thousands + "567" + thousands +
                                               "890" + decimal + "123" );

WScript.Echo ( "|| 10 -> 10 or 10.00 or 10,00" );
compare ( (10).toLocaleString(), "10" + decimal + "00", "10" );

WScript.Echo ( "" );
