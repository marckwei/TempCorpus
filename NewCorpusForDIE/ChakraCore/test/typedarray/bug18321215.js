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

// OS18321215: Typed array functions need to release the guest arena if errors happen.
// This is added as a seperate file and doesn't use the unittestframework as the test depends
// on certain GC behavior that doesn't trigger otherwise.
try
{
    // Type error in filter function
    WScript.LoadModule(`;`);
    (async () => {
        testArray1 = new Float32Array(1);
        testArray1.filter(function () {
            // type error here
            ArrayBuffer();
        });
    })().then();
    /x/, /x/, /x/, /x/;
}
catch(e){}

try
{
    // Type error in filter function
    WScript.LoadModule(``);
    for (var foo = 0; /x/g && 0; ) {
    }
    /x/g;
    /x/g;
    try {
        testArray2 = new Float64Array(1);
        testArray2.filter(function () {
            // type error here
            ArrayBuffer();
        });
    } catch (e) {
    }
    function bar(baz = /x/g) {
    }
}
catch(e){}

console.log("PASS");
