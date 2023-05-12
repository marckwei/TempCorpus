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

// Object Spread unit tests

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    // Disabled for now until decision on whether this should be included
    // {
    //     name: "Test Maximum Spread size",
    //     body: function() {
    //         let maxSize = 243019865;
    //         let arr = new Array(maxSize);
    //         for (i = 0; i < maxSize; i++) {
    //             arr[i] = i;
    //         }
    //         let obj = {...arr};
    //         assert.areEqual(maxSize, Object.keys(obj).length);
    //         for(var propName in obj) {
    //             propValue = obj[propName];
    //             assert.areEqual(propName, propValue.toString());
    //         }
    //     }
    // },
    {
        name: "Test Spread near array limits",
        body: function() {
            function testRange(start, end) {
                let arr = [] ;
                for (i = start; i < end; i++) {
                    arr[i] = i;
                }
                let obj = {...arr};
                assert.areEqual(end-start, Object.keys(obj).length);
                for(var propName in obj) {
                    propValue = obj[propName];
                    assert.areEqual(propName, propValue.toString());
                }
            };
            testRange(2**31-100, 2**31+100);
            testRange(2**32-100, 2**32+100);
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
