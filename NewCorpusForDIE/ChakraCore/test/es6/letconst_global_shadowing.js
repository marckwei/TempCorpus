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

function print(x) { WScript.Echo(x + ''); }
function filter(p) { return /^[a-z]$/.test(p); }
function printfilteredprops(o) { printprops(o, filter); }
function printprops(o, filter) {
    var s = "{",
        prependComma = false;

    for (var p in o)
    {
        if (!filter || filter(p))
        {
            if (prependComma) {
                s += "\n";
            } else {
                s += "\n";
                prependComma = true;
            }
            s += "    " + p + ": " + o[p];
        }
    }
    if (prependComma) {
        s += "\n}";
    } else {
        s += " }";
    }
    print(s);
}


// ====================================================================================================================
//
print('\n==== Let/const globals should not show up in for-in enumeration ====\n');


// Let/const globals should not show up in list of global
// properties in for-in enumeration.  They should also not
// cause global properties to no longer show up in
// enumeration (Blue bug 217657)
print('\nBefore x, y, z, w declarations and globals\n');
try { print(x); } catch (e) { print(e); }
try { print(y); } catch (e) { print(e); }
try { print(z); } catch (e) { print(e); }
try { print(w); } catch (e) { print(e); }
print(this.x);
print(this.y);
print(this.z);
print(this.w);
printfilteredprops(this);

let x = "let x";
this.y = "this.y";
const z = "const z";
this.w = "this.w";

print('\nAfter let x, this.y, const z, this.w\n');
try { print(x); } catch (e) { print(e); }
try { print(y); } catch (e) { print(e); }
try { print(z); } catch (e) { print(e); }
try { print(w); } catch (e) { print(e); }
print(this.x);
print(this.y);
print(this.z);
print(this.w);
printfilteredprops(this);

this.x = "this.x";
let y = "let y";
this.z = "this.z";
const w = "const w";

print('\nAfter this.x, let y, this.z, const w\n');
try { print(x); } catch (e) { print(e); }
try { print(y); } catch (e) { print(e); }
try { print(z); } catch (e) { print(e); }
try { print(w); } catch (e) { print(e); }
print(this.x);
print(this.y);
print(this.z);
print(this.w);
printfilteredprops(this);


// ====================================================================================================================
//
print('\n==== Attributes on global properties should not be lost with let/const shadowing ====\n');


Object.defineProperty(this, "p", { configurable: false, enumerable: false, writable: false, value: 'this.p' });

try { print(p); } catch (e) { print(e); }
print(this.p);
printprops(Object.getOwnPropertyDescriptor(this, "p"));

let p = 'let p';

try { print(p); } catch (e) { print(e); }
print(this.p);
printprops(Object.getOwnPropertyDescriptor(this, "p"));


// ====================================================================================================================
//
print('\n==== Global properties added after const should not destroy const-ness ====\n');


const q = 'const q';
this.q = 'this.q';

try { eval("q = 'assigned to const??';"); } catch (e) { print(e); }
print(q);
print(this.q);


// ====================================================================================================================
//
print('\n==== Attributes on shadowing let properties should not be lost with Object.defineProperty() ====\n');

let r=0;
print(r);
print(this.r);
r=1;
print(r);
print(this.r);
Object.defineProperty(this, "r", {} );
print(r);
print(this.r);
r=2; // bug289741 assertion failure at this point
print(r);
print(this.r);

// test against bug 929017
Object.defineProperty(this, "s", {} );
let s=0;
s=3; // bug 929017:assertion:cacheoperators.cpp:info->IsWritable()
print(s);
print(this.s);

