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

function test0() {
    var GiantPrintArray = [];
    // AddFastPath2: Monomorphic Inline Set or Add
    function v2() {
        var v3 = 10;
        var v4 = new Array(v3);
        for (var v5 = 0; v5 < v3; v5++) {
            // 4 inlined slots
            var v6 = { a: 0 };

            if (v5 % 2)
                v6.p = 1;

            // Profile data indicate set or add
            v6.p = 1;
            v6.z = 1;
            v4[v5] = v6;
        }

        for (var v5 = 0; v5 < v3; v5++) {
            GiantPrintArray.push("{ a: " + v4[v5].a + ", p: " + v4[v5].p + ", z: " + v4[v5].z + "}");
        }
    }

    v2();

};

test0();
test0();

// run JITted code
runningJITtedCode = true;
test0();

WScript.Echo('pass');
