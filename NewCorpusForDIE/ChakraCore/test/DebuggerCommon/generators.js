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

function* gf1 () {
    yield 10;
    yield 20;
    yield 30;

    function a() { }
    function b() { }
    function c() { }

    yield a();

    yield b() + (yield c());
}

// Try step-into on gf(), shouldn't step into native code, skip to next statement.
// Try step-into g.next() and step-out, step-over, and step-into across yield expressions.
// Also when resuming gf, instruction pointer remains at previous yield after stepping in.
// Then try step-into on yield expressions with function calls, should step into the calls
// in correct order, and then step-out returns to the yield expression right before yielding.
let g = gf1(); /**bp:
                stack();resume('step_into');

                stack();resume('step_into');
                stack();resume('step_out');

                stack();resume('step_into');
                stack();resume('step_over');
                stack();resume('step_over');

                stack();resume('step_into');
                stack();resume('step_over');
                stack();resume('step_into');

                stack();resume('step_into');
                stack();resume('step_over');
                stack();resume('step_into');
                stack();resume('step_out');
                stack();resume('step_into');

                stack();resume('step_into');
                stack();resume('step_over');
                stack();resume('step_into');
                stack();resume('step_out');
                stack();resume('step_into');
                stack();resume('step_out');
                stack();resume('step_into');

                stack();
               **/

g.next(1);
g.next(2);
g.next(3);
g.next(4);
g.next(5);
g.next(6);
g;

function* gf2(p, q) {
    var a = 1;
    yield a; /**bp: locals();**/

    let b = 2;
    yield b; /**bp: locals();**/
}

g = gf2(10, 20);
g.next();
g.next();
g.next();

function* gf3() {
    yield 1;
    yield 2;
    yield 3;
}
function* gf4() {
    yield* gf3();
}

g = gf4(); /**bp:
                stack();resume('step_into');
                stack();resume('step_into');
                stack();resume('step_into');
                stack();resume('step_out');
                stack();resume('step_out');

                stack();resume('step_into');
                stack();resume('step_over');

                stack();resume('step_into');
                stack();resume('step_into');
                stack();resume('step_out');
                stack();resume('step_out');
                stack();
            **/

g.next(1);
g.next(2);
g.next(3);

g = gf3(); /**bp:
                resume('step_over');

                resume('step_over');

                stack();resume('step_into');
                stack();resume('step_into');
                stack();resume('step_into');

                stack();
            **/
g.next();
g.return(1);

g = gf4(); /**bp:
                resume('step_over');

                resume('step_over');

                stack();resume('step_into');
                stack();resume('step_into');
            **/

g.next(1);
g.return(2);

function* gf5() {
    try {
        yield 32;
    } catch (e) {
    }
}

g = gf5(); /**bp:
                stack();resume('step_over');

                resume('step_over');

                stack();resume('step_into');
                stack();resume('step_out');
                stack();
            **/
g.next();
g.return(1);

WScript.Echo("PASS");
