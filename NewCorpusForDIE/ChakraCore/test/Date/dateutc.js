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

function write(v) { WScript.Echo(v + ""); }

var d;

d = Date.UTC("1974"); write(d);
d = Date.UTC(1974); write(d);
d = Date.UTC(1974, 9); write(d);
d = Date.UTC(1974, 9, 24); write(d);
d = Date.UTC(1974, 9, 24, 0); write(d);
d = Date.UTC(1974, 9, 24, 0, 20); write(d);
d = Date.UTC(1974, 9, 24, 0, 20, 30); write(d);
d = Date.UTC(1974, 9, 24, 0, 20, 30, 40); write(d);
d = Date.UTC(1974, 9, 24, 0, 20, 30, 40, 50); write(d);
d = Date.UTC(1, 9, 24, 0, 20, 30, 40); write(d);
d = Date.UTC(74, 9, 24, 0, 20, 30, 40, 50); write(d);
d = Date.UTC("hello"); write(d);
d = Date.UTC(); write(d);

function assert(p, message) {
    if (!message) {
        message = 'assert(true)';
    }

    if (p) {
        console.log('PASS');
    } else {
        console.log(`FAIL: ${message}`);
    }
}

assert(isNaN(Date.UTC()), "expected: Date.UTC() is NaN");
assert(!isNaN(Date.UTC(2017)), "expected: Date.UTC(2017) is not NaN");
assert(!isNaN(Date.UTC(2017, 0)), "expected: Date.UTC(2017, 0) is not NaN;");
assert(!isNaN(Date.UTC(2017, 0, 1)), "expected: Date.UTC(2017, 0, 1) is not NaN;");
assert(isNaN(Date.UTC(2017, undefined)), "expected: Date.UTC(2017, undefined) is NaN");
assert(Date.UTC(2017) === Date.UTC(2017, 0), "expected: Date.UTC(2017) === Date.UTC(2017, 0)");
assert(Date.UTC(2017, 0) === Date.UTC(2017, 0, 1), "expected: Date.UTC(2017, 0) === Date.UTC(2017, 0, 1)");

// Date.UTC should return NaN if the time value is larger than 8.64*10^15:
assert(isNaN(Date.UTC(2001, 1, 5e+9)), "expected: Date.UTC(2001, 1, 5e+9) is NaN");
assert(isNaN(Date.UTC(2001, 1e+7, 5)), "expected: Date.UTC(2001, 1e+7, 5) is NaN");
assert(isNaN(Date.UTC(2001000, 1, 5)), "expected: Date.UTC(2001000, 1, 5) is NaN");
assert(isNaN(Date.UTC(2001, 1, Number.MAX_VALUE)), "expected: Date.UTC(2001, 1, Number.MAX_VALUE) is NaN");
assert(isNaN(Date.UTC(2001, 1, Number.MAX_VALUE / 2e+9)), "expected: Date.UTC(2001, 1, Number.MAX_VALUE/2e+9) is NaN");

try {
    Date.UTC({ valueOf: function() { throw "hey!" } });
    console.log("FAIL: expected: throws");
} catch (e) {
    if (e.toString() === "hey!") {
        console.log("PASS");
    } else {
        console.log("expected: e.toString() === 'hey!'");
    }
}

try {
    Date.UTC({ valueOf: function() { throw "hey!" } }, 0);
    console.log("FAIL: expected: throws");
} catch (e) {
    if (e.toString() === "hey!") {
        console.log("PASS");
    } else {
        console.log("expected: e.toString() === 'hey!'");
    }
}

try {
    Date.UTC({ valueOf: function() { throw "hey!" } }, 0, 1);
    console.log("FAIL: expected: throws");
} catch (e) {
    if (e.toString() === "hey!") {
        console.log("PASS");
    } else {
        console.log("expected: e.toString() === 'hey!'");
    }
}
