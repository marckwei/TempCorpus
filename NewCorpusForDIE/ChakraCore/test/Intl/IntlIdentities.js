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

let staticMethods = [
    Intl.getCanonicalLocales,
    Intl.Collator.supportedLocalesOf,
    Intl.DateTimeFormat.supportedLocalesOf,
    Intl.NumberFormat.supportedLocalesOf
];
let longNames = [
    "Intl.getCanonicalLocales",
    "Intl.Collator.supportedLocalesOf",
    "Intl.DateTimeFormat.supportedLocalesOf",
    "Intl.NumberFormat.supportedLocalesOf"
];
let shortNames = [
    "getCanonicalLocales",
    "supportedLocalesOf",
    "supportedLocalesOf",
    "supportedLocalesOf"
];

let expectedToString =
`function() {
    [native code]
}`;

let tests = [
    {
        name: "Short names",
        body: function () {
            for (let i in staticMethods) {
                assert.areEqual(staticMethods[i].name, shortNames[i]);
            }
        }
    },
    {
        name: "Invoking built-in static methods with `new` fails (check name in error message)",
        body: function () {
            for (let i in staticMethods) {
                const expectedMessage = WScript.Platform.INTL_LIBRARY === "icu"
                    ? "Function is not a constructor"
                    : `Function '${longNames[i]}' is not a constructor`;
                assert.throws(() => new staticMethods[i](), TypeError, "", expectedMessage);
            }
        }
    },
    {
        name: "toString of built-in static methods",
        body: function () {
            for (let i in staticMethods) {
                const expectedMessage = WScript.Platform.INTL_LIBRARY === "icu"
                    ? `function ${shortNames[i]}() { [native code] }`
                    : expectedToString;
                assert.areEqual(expectedMessage, "" + staticMethods[i]);
                assert.areEqual(expectedMessage, staticMethods[i].toString());
            }
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
