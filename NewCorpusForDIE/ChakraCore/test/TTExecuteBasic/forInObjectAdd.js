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
var largeObj = {};

var outerObj = { a: 3, b: 4, c: 5 };
var innerObj = { a: 3, b: 4, c: 5 };

var objWithNumber= { a: 12, b: 13, c:23 };
objWithNumber[13] = "Number13";
objWithNumber[15] = "Number15";

var undef;
var nullValue = null;
var integer = 3;
var double = 3.4;

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog("Scenario 1: Adding properties on the fly", true);
    for(var i in x)
    {
        if(x[i] == 2)
        {
            x.c = 3;
            x.d = 4;
        }

        telemetryLog(`${x[i]}`, true);
    }

    telemetryLog("Scenario 2: Large number of properties in forin", true);
    for(var k=0; k < 25; k++)
    {
        largeObj["p"+k] = k + 0.3;
    }

    for(var i in largeObj)
    {
        telemetryLog(`${largeObj[i]}`, true);
    }

    telemetryLog("Sceanrio 3: Nested Forin", true);
    for(var i in outerObj)
    {
        telemetryLog(`${i}`, true);
        for(var j in innerObj)
        {
            telemetryLog(`${j}`, true);
        }
    }

    telemetryLog("Scenario 4: Properties and numerical indices in object", true);

    for(var i in objWithNumber)
    {
        telemetryLog(`${objWithNumber[i]}`, true);
    }

    for(var i in undef)
    {
        telemetryLog("FAILED: Entering enumeration of undefined", true);
    }

    for(var i in nullValue)
    {
        telemetryLog("FAILED: Entering enumeration of null value", true);
    }

    for(var i in integer)
    {
        telemetryLog("FAILED: Entering enumeration of integer", true);
    }

    for(var i in double)
    {
        telemetryLog("FAILED: Entering enumeration of double", true);
    }

    emitTTDLog(ttdLogURI);
}
