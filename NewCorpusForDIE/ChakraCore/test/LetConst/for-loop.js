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

function print(x) { WScript.Echo(x) }

let a = 'global';

for (let a = 'for'; f = function() { a += ' loop' }; ) {
    f();
    print(a);
    break;
}
print(a);

for (let a in this) {
    let f = function() { a = 'for-in loop'; };
    f();
    print(a);
    break;
}
print(a);

try { eval('for (let a = 123 in this) { }'); print('fail'); } catch (e) { print(e); }
try { eval('for (const a = 123 in this) { }'); print('fail'); } catch (e) { print(e); }
try { eval('function foo() { for (let a = 123 in this) { } } foo();'); print('fail'); } catch (e) { print(e); }
try { eval('function foo() { for (const a = 123 in this) { } } foo();'); print('fail'); } catch (e) { print(e); }
try { eval('function foo() { { for (var a = 123 in []) { } let a; } } foo();'); print('fail'); } catch (e) { print(e); }

function test3() {
    eval('');

    v2;
    let v1;
    for (let v2; false;) {
        // this var should get a slot before v1 via EnsureScopeSlot
        // to ensure that the slot order is the same as the SlotArray
        var v2 = 0;
    }
}
test3();

// Should allow (implicit) initialization of const in for-in/for-of
function for_in() {
    for (const x in {a:'a',b:'b'}) {
        WScript.Echo(x);
    }
}
for_in();

function for_of() {
    for (const x of ['a', 'b']) {
        WScript.Echo(x);
    }
}
for_of();

// Should not allow const without initializer in standard for loop header
try { eval('for (const x; x < 0;) { WScript.Echo(x); }'); } catch (e) { print(e); }
