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

// test custom GetSystemTime caching on xplat
function rand() {
    return parseInt(Math.random() * 1e2) + 50;
}

for (var j = 0; j < 1e2; j++) {
    var pre_time = Date.now(), now;
    for (var i = 0; i < 1e6; i++) {
        now = Date.now();
        var diff = now - pre_time

        // INTERVAL_FOR_TICK_BACKUP = 5
        // So, anything beyond 5ms is not subject to our testing here.
        if (diff < 0 && Math.abs(diff) <= 5) {
            throw new Error("Timer interval has failed. diff < 0 -> " + diff);
        }

        pre_time = now;
    }

    // wait rand time until next trial
    for (var i = 0, to = rand(); i < to; i++) {
        now = Date.now();
    }

    // INTERVAL_FOR_TICK_BACKUP = 5
    // So, anything beyond 5ms is not subject to our testing here.
    if (now < pre_time && Math.abs(now - pre_time) <= 5) {
        throw new Error("Timer interval has failed. now < pre_time");
    }
}

print("PASS");
