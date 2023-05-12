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

var y = Symbol.for('bob');

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    var x = Symbol.for('ted');
    var z = Symbol.for('bob');
    var sym1 = Symbol.for('A\0X');
    var sym2 = Symbol.for('A\0Y');
    var sym3 = Symbol.for('A\0X');

    telemetryLog(`x === y: ${x === y}`, true); //false
    telemetryLog(`z === y: ${z === y}`, true); //true
    telemetryLog(`sym1 === sym2: ${sym1 === sym2}`, true); //false
    telemetryLog(`sym1 === sym3: ${sym1 === sym3}`, true); //true

    var zo = Symbol('bob');

    telemetryLog(`zo === y: ${zo === y}`, true); //false

    emitTTDLog(ttdLogURI);
}
