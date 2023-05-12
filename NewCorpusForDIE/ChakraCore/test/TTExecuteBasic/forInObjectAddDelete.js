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

//
//NOTE: this may break if enumeration order policy is changed in Chakra but that doesn't mean we have a bug in TTD
//

var x = { a: 1, b: 2};
var obj = { a: 1, b: 2, c: 15};

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog("1st enumeration", true);
    for(var i in x)
    {
        if(x[i] == 1)
        {
            delete x.a;
            delete x.b;
            x.c = 3;
            x.d = 4;
        }
        else
            telemetryLog(`${x[i]}`, true);
    }

    telemetryLog("2nd enumeration", true);
    for (var i in obj) {
        if (obj[i] == 1) {
            delete obj.a;
            delete obj.b;
            obj.c = 3;
            obj.d = 4;
        }
        else
            telemetryLog(`${obj[i]}`, true);
    }

    emitTTDLog(ttdLogURI);
}

