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

// Let/const redecl/reassign cases in presence of eval.
// Eval creates its own block scope, preventing let and const variables from leaking out.

function write(x) { WScript.Echo(x) }

// Global scope.
const z = 'global z';
let w = 'global w';

eval('let x = "global x"; const y = "global y"; write(z);');

try { write(x); } catch (e) { write(e); }
try { write(y); } catch (e) { write(e); }

// Try redeclaration at global scope.
try {
    eval('var z = "global var z";');
}
catch(e) {
    write(e);
}
try {
    eval('var w = "global var w";');
}
catch(e) {
    write(e);
}

// Block scope in global function.
try {
    const z = 'global block z';

    eval('let x = "global block x"; const y = "global block y"; write(z);');

    try { write(x); } catch (e) { write(e); }
    try { write(y); } catch (e) { write(e); }

    // function declared in global block.
    outer();

    function outer() {
        let w = 'outer w';

        // Try redeclaration at function scope.
        try {
            eval('var w = "outer var w";');
        }
        catch(e) {
            write(e);
        }
        write(w);

        try {
            const z = 'outer z';

            eval('let x = "outer x"; const y = "outer y"; write(z);');

            try { write(x); } catch (e) { write(e); }
            try { write(y); } catch (e) { write(e); }

            // Try assigning const y; shouldn't see const y and instead create function var y
            eval('y = "outer var y";');
            write(y);

            // function nested within function body.
            inner();
            write(y);

            function inner() {
                let w = 'inner w';

                // Try redeclaration at function scope.
                try {
                    eval('var w = "inner var w";');
                }
                catch(e) {
                    write(e);
                }
                write(w);

                try {
                    const z = 'inner z';

                    // const y shouldn't affect outer y
                    eval('let x = "inner x"; const y = "inner y"; write(z);');

                    try { write(x); } catch (e) { write(e); }
                    write(y); // outer var y
                }
                catch(e) {
                    write(e);
                }

                function foo() {
                    let yy = "b";
                    const yx = "a";
                    yy += "a";
                    eval("WScript.Echo(yy);")
                    WScript.Echo(yy);
                }
                foo();
            }
        }
        catch(e) {
            write(e);
        }
    }
}
catch(e) {
    write(e);
}

// BLUE Bug 454963 (shouldn't crash)
{
    with ({})
        eval("");
    function f() { x; }
    let x;
}

this.eval('let x = 0; function f() { return x; }; WScript.Echo(f());');
