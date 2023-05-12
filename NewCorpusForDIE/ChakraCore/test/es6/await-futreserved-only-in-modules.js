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

// ES6 spec says that `await` is a FutureReservedWord but only
// when Module is the goal symbol of the syntatic grammar.
// That is only when parsing a module script.
// See http://www.ecma-international.org/ecma-262/6.0/#sec-future-reserved-words
// or https://tc39.github.io/ecma262/#sec-future-reserved-words

var await = 0; // shouldn't cause syntax error
if (await !== 0) {
    print('fail');
}

function f() {
    "use strict";
    var await = 1;

    if (await !== 1) {
        print('fail');
    }
}
f();

function test(awaitStr)
{
    try {
        WScript.LoadModule('var ' + awaitStr + ' = 0;', 'samethread');
    } catch (e) {
        return e.message === 'The use of a keyword for an identifier is invalid';
    }
    print("Failed: no syntax error of identifier '" + awaitStr + "'");
    return false;
}

print(test("await") & test("\\u0061wait")? 'pass' : '');
