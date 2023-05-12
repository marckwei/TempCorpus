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

function foo() { }
class bar { }
function* baz() { }
function foobar() { }

// Export function expressions
export function fn1 () { };
export function fn2 () { }

// Export generator expressions
export function* gn1 () { };
export function* gn2 () { }

// Export class expressions
export class cl1 { };
export class cl2 { }

// Export let decls
export let let1;
export let let2 = 2;
export let let3, let4, let5;
export let let6 = { }
export let let7 = [ ]

// Export const decls
export const const2 = 'str';
export const const3 = 3, const4 = 4;
export const const5 = { }
export const const6 = [ ]

// Export with export clauses
export {};
export { foo };
export { bar, };
export { foo as foo2, baz }
export { foo as foo3, baz as baz2, }
export { foo as foo4, bar as bar2, foobar }

// Export var decls
export var var1 = 'string';
export var var2;
export var var3 = 5, var4
export var var5, var6, var7

export default 'default';
