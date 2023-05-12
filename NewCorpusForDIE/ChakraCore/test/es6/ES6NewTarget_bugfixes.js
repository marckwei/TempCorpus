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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "OS4497597: ScopeInfo::FromScope() should increment scope symbol count to accomodate 'new.target'",
        body: function () {
            (function (){
                function f() {}
                eval("");
                () =>new.target;
            })();
            // Repro:
            // ASSERTION : (jscript\core\lib\Runtime\ByteCode\ScopeInfo.h, line 68)
            // Failure: (i >= 0 && i < symbolCount)
        }
    },
    {
        name: "OS5427497: Parser mistakes 'new.target' as in global function under -forceundodefer",
        body: function () {
            new.target;  // bug repro: SyntaxError: Invalid use of the 'new.target' keyword
        }
    },
    {
        name: "OS8806229: eval in default parameter of arrow function",
        body: function() {
            assert.doesNotThrow(()=>(function() { (a = eval(undefined)) => {}; }));
        }
    },
    {
        name: "[MSRC35208] parameter type confusion in eval",
        body: function ()
        {
            var proxy = new Proxy(eval, {});
            assert.areEqual(0, proxy("Math.sin(0)"));
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
