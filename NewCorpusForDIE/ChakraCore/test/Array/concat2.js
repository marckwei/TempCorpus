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

function echo(v) {
    WScript.Echo(v);
}

function guarded_call(func) {
    try {
        func();
    } catch (e) {
        echo(e.name + " : " + e.message);
    }
}

function dump_array(arr) {
    echo("length: " + arr.length);
    for (var p in arr) {
        echo("  " + p + ": " + arr[p]);
    }
}

function test_concat(size) {
    guarded_call(function () {
        var arr = new Array(size);
        arr[size - 1] = 100;

        echo("- concat 101, 102, 103, 104, 105");
        arr = arr.concat(101, 102, 103, 104, 105);
        dump_array(arr);

        echo("- arr.concat(arr)");
        arr = arr.concat(arr);
        dump_array(arr);
    });
}

echo("-------concat Small-------------");
test_concat(500);

// Fix for MSRC 33319 changes concat to skip a fast path if the index we're copying into is a BigIndex.
// Disable the large portion of this test since this change makes such a test run for hours.
//echo("-------concat Large-------------");
//test_concat(4294967294);

echo("-------test prototype lookup-------------");
for (var i = 0; i < 10; i++) {
    Array.prototype[i] = 100 + i;
}
delete Array.prototype[3];

var a = [200, 201, 202, 203, 204];
delete a[1];
a[7] = 207;

echo("a: " + a);

var r = a.concat(300, 301, 302, 303, 304);
echo("r: " + r);

delete r[8];
echo("r: " + r); // Now r[8] should come from prototype

for (var i = 0; i < 10; i++) {
    delete Array.prototype[i];
}
echo("r: " + r); // r[8] gone, other entries not affected (verify not from prototype)