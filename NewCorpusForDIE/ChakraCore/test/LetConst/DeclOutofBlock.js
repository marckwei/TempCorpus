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

// Tests for ERRDeclOutOfBlock "Const and let must be declared inside of block"
var a = 1;

(function () {
    try { eval(
        "if (a) \
            let b = 5;" // error
    );} catch (e) { WScript.Echo(e); }
    try { eval(
        "if (a) \
            const b = 5;" // error
    );} catch (e) { WScript.Echo(e); }
})();

(function () {
    try { eval(
    "if (a) { \
        let c = 3; /* no error */ \
        const x = 42; /* no error */ \
    }"
    );} catch (e) { WScript.Echo(e); }
})();

(function () {
    try { eval(
    "while (a) \
         let d = 5;" // error
    );} catch (e) { WScript.Echo(e); }
    try { eval(
    "while (a) \
         let d = 5;" // error
    );} catch (e) { WScript.Echo(e); }
})();

(function () {
    try { eval(
    "while (a) { \
        let e = 10; /* no error */ \
        const y = 10; /* no error */ \
        break; \
    }"
    );} catch (e) { WScript.Echo(e); }
})();

(function () {
    try { eval(
    "if (a) \
        while (a) \
            if (a) { \
                let x = 3; /* no error */ \
                const z = x; /* no error */ \
                while (a) \
                    let f = 5; /* error */ \
            }"
    );} catch (e) { WScript.Echo(e); }
})();

function test() {
    if (a)
        for (let x in [1]) {    /* no error */
            break;
        };

    for (var y in [1])
        for (let x in [1]) {    /* no error */
            break;
        };

    do
        for (let x in [1]) {    /* no error */
            break;
        }
    while (!a);

    if (a)
        for (let x = 0; x < 1; x++) {    /* no error */
            break;
        };

    for (var y in [1])
        for (let x = 0; x < 1; x++) {    /* no error */
            break;
        };

    do
        for (let x = 0; x < 1; x++) {    /* no error */
            break;
        }
    while (!a);

    WScript.Echo('success');
};
test();

