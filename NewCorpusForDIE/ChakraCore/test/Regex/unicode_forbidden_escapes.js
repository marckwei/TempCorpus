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

let forbidden = [
    '\\p',
    '\\P',
    '\\a',
    '\\A',
    '\\e',
    '\\E',
    '\\y',
    '\\Y',
    '\\z',
    '\\Z',
];

let identity = [
    "^",
    "$",
    "\\",
    ".",
    "*",
    "+",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
    "/",
];

let pseudoIdentity = [
    ["f", "\f"],
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["v", "\v"],
]

var tests = [
    {
        name: "Unicode-mode RegExp Forbidden Escapes (RegExp constructor)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { new RegExp(re, 'u') }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { new RegExp(re) });
            }
        }
    },
    {
        name: "Unicode-mode RegExp Forbidden Escapes (literal)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { eval(`/${re}/u`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { eval(`/${re}/`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
            }
        }
    },
    {
        name: "Allow IdentityEscapes (RegExp constructor)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { new RegExp(`\\${c}`, 'u') });
                assert.doesNotThrow(function () { new RegExp(`\\${c}`) });
            }
        }
    },
    {
        name: "Allow IdentityEscapes (literal)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { eval(`/\\${c}/u`); });
                assert.doesNotThrow(function () { eval(`/\\${c}/`); });
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (RegExpconstructor)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`, 'u') });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (literal)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = eval(`/\\${c}/u`) });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = eval(`/\\${c}/`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

let forbidden = [
    '\\p',
    '\\P',
    '\\a',
    '\\A',
    '\\e',
    '\\E',
    '\\y',
    '\\Y',
    '\\z',
    '\\Z',
];

let identity = [
    "^",
    "$",
    "\\",
    ".",
    "*",
    "+",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
    "/",
];

let pseudoIdentity = [
    ["f", "\f"],
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["v", "\v"],
]

var tests = [
    {
        name: "Unicode-mode RegExp Forbidden Escapes (RegExp constructor)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { new RegExp(re, 'u') }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { new RegExp(re) });
            }
        }
    },
    {
        name: "Unicode-mode RegExp Forbidden Escapes (literal)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { eval(`/${re}/u`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { eval(`/${re}/`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
            }
        }
    },
    {
        name: "Allow IdentityEscapes (RegExp constructor)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { new RegExp(`\\${c}`, 'u') });
                assert.doesNotThrow(function () { new RegExp(`\\${c}`) });
            }
        }
    },
    {
        name: "Allow IdentityEscapes (literal)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { eval(`/\\${c}/u`); });
                assert.doesNotThrow(function () { eval(`/\\${c}/`); });
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (RegExpconstructor)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`, 'u') });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (literal)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = eval(`/\\${c}/u`) });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = eval(`/\\${c}/`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

let forbidden = [
    '\\p',
    '\\P',
    '\\a',
    '\\A',
    '\\e',
    '\\E',
    '\\y',
    '\\Y',
    '\\z',
    '\\Z',
];

let identity = [
    "^",
    "$",
    "\\",
    ".",
    "*",
    "+",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
    "/",
];

let pseudoIdentity = [
    ["f", "\f"],
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["v", "\v"],
]

var tests = [
    {
        name: "Unicode-mode RegExp Forbidden Escapes (RegExp constructor)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { new RegExp(re, 'u') }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { new RegExp(re) });
            }
        }
    },
    {
        name: "Unicode-mode RegExp Forbidden Escapes (literal)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { eval(`/${re}/u`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { eval(`/${re}/`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
            }
        }
    },
    {
        name: "Allow IdentityEscapes (RegExp constructor)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { new RegExp(`\\${c}`, 'u') });
                assert.doesNotThrow(function () { new RegExp(`\\${c}`) });
            }
        }
    },
    {
        name: "Allow IdentityEscapes (literal)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { eval(`/\\${c}/u`); });
                assert.doesNotThrow(function () { eval(`/\\${c}/`); });
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (RegExpconstructor)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`, 'u') });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (literal)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = eval(`/\\${c}/u`) });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = eval(`/\\${c}/`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

let forbidden = [
    '\\p',
    '\\P',
    '\\a',
    '\\A',
    '\\e',
    '\\E',
    '\\y',
    '\\Y',
    '\\z',
    '\\Z',
];

let identity = [
    "^",
    "$",
    "\\",
    ".",
    "*",
    "+",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
    "/",
];

let pseudoIdentity = [
    ["f", "\f"],
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["v", "\v"],
]

var tests = [
    {
        name: "Unicode-mode RegExp Forbidden Escapes (RegExp constructor)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { new RegExp(re, 'u') }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { new RegExp(re) });
            }
        }
    },
    {
        name: "Unicode-mode RegExp Forbidden Escapes (literal)",
        body: function () {
            for (re of forbidden) {
                assert.throws(function () { eval(`/${re}/u`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
                assert.doesNotThrow(function () { eval(`/${re}/`); }, SyntaxError, 'Invalid regular expression: invalid escape in unicode pattern');
            }
        }
    },
    {
        name: "Allow IdentityEscapes (RegExp constructor)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { new RegExp(`\\${c}`, 'u') });
                assert.doesNotThrow(function () { new RegExp(`\\${c}`) });
            }
        }
    },
    {
        name: "Allow IdentityEscapes (literal)",
        body: function () {
            for (c of identity) {
                assert.doesNotThrow(function () { eval(`/\\${c}/u`); });
                assert.doesNotThrow(function () { eval(`/\\${c}/`); });
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (RegExpconstructor)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`, 'u') });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = new RegExp(`\\${c}`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
    {
        name: "Allow Pseudo-Identity Escapes (literal)",
        body: function () {
            for (test of pseudoIdentity) {
                let c = test[0];
                let rendered = test[1];
                let re;
                assert.doesNotThrow(function () { re = eval(`/\\${c}/u`) });
                assert.isTrue(re.test(rendered));
                assert.doesNotThrow(function () { re = eval(`/\\${c}/`) });
                assert.isTrue(re.test(rendered));
            }
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
