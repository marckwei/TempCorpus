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

function print(x) { WScript.Echo(x+''); }

function filter(name) {
    return /^[a-z]$/.test(name) || /^shadow_(let|const)$/.test(name);
}

print('\n==== Basic let and const variables at global scope ====\n');
// Since the let/const globals are implemented as special properties
// in the [Simple]DictionaryTypeHandler, try out the other types of
// global properties to sanity check that they are still property-
// like (on global object, enumerable)

var      a = 'global var a';
         b = 'global undecl b';
let      c = 'global let c';
const    d = 'global const d';
function e () { }

print('\nNaked references\n');

print(a);
print(b);
print(c);
print(d);
print(e);

print('\nthis. references\n');

print(this.a);
print(this.b);
print(this.c);
print(this.d);
print(this.e);

print('\nfor-in enumeration of this\n');

for (let p in this)
{
    if (filter(p))
    {
        print(p + ': ' + this[p]);
    }
}

