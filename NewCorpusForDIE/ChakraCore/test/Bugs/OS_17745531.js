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

var obj = {};

// create enough pids to pick from
for (let i = 0; i < 20000; i++)
{
    Object.defineProperty(obj, 'prop' + i, {
        value: i,
        writable: true
    });
}

for (let j = 0; j < 127; j++)
{

    var obj1 = {};
    // fill with pids that prone to collisions - to have some empty buckets when inserting 127th property
    for (let i = 0; i < 127; i++)
    {
        Object.defineProperty(obj1, 'prop' + i * 144, {
            value: i,
            writable: true
        });
    }

    // hopefully 'prop<j>' will hash into an empty bucket and it is also a 127th property.
    // we will try multiple j - just in case the empty bucket moves due to minor changes in 
    // hashing or how pids are assigned.
    Object.defineProperty(obj1, 'prop' + j, {
        value: obj['prop' + j],
        writable: true
    });


    // compare the values, also keeps objects alive
    if (obj['prop' + j] != obj1['prop' + j])
    {
        console.log("fail");
    }

    // just check for asserts when doing lookups
    for (let i = 0; i < 500; i++) {
        if (obj1['prop' + i] == "qq") {
            console.log("hmm");
        }
    }
}

console.log("pass");
