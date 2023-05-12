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

function write(v) { WScript.Echo(v + ""); }

function foo() {}

write(+0.0 == '');
write(+0.0 == 0xa);
write(+0.0 == 04);
write(+0.0 == 'hello');
write(+0.0 == 'hel' + 'lo');
write(+0.0 == String(''));
write(+0.0 == String('hello'));
write(+0.0 == String('h' + 'ello'));
write(+0.0 == new String(''));
write(+0.0 == new String('hello'));
write(+0.0 == new String('he' + 'llo'));
write(+0.0 == new Object());
write(+0.0 == new Object());
write(+0.0 == [1, 2, 3]);
write(+0.0 == [1 ,2 , 3]);
write(+0.0 == new Array(3));
write(+0.0 == Array(3));
write(+0.0 == new Array(1 ,2 ,3));
write(+0.0 == Array(1));
write(+0.0 == foo);
write(1 == undefined);
write(1 == null);
write(1 == true);
write(1 == false);
write(1 == Boolean(true));
write(1 == Boolean(false));
write(1 == new Boolean(true));
write(1 == new Boolean(false));
write(1 == NaN);
write(1 == +0);
write(1 == -0);
write(1 == 0);
write(1 == 0.0);
write(1 == -0.0);
write(1 == +0.0);
write(1 == 1);
write(1 == 10);
write(1 == 10.0);
write(1 == 10.1);
write(1 == -1);
write(1 == -10);
write(1 == -10.0);
write(1 == -10.1);
write(1 == Number.MAX_VALUE);
write(1 == Number.MIN_VALUE);
write(1 == Number.NaN);
write(1 == Number.POSITIVE_INFINITY);
write(1 == Number.NEGATIVE_INFINITY);
write(1 == new Number(NaN));
write(1 == new Number(+0));
write(1 == new Number(-0));
write(1 == new Number(0));
write(1 == new Number(0.0));
write(1 == new Number(-0.0));
write(1 == new Number(+0.0));
write(1 == new Number(1));
write(1 == new Number(10));
write(1 == new Number(10.0));
write(1 == new Number(10.1));
write(1 == new Number(-1));
write(1 == new Number(-10));
write(1 == new Number(-10.0));
write(1 == new Number(-10.1));
write(1 == new Number(Number.MAX_VALUE));
write(1 == new Number(Number.MIN_VALUE));
write(1 == new Number(Number.NaN));
write(1 == new Number(Number.POSITIVE_INFINITY));
write(1 == new Number(Number.NEGATIVE_INFINITY));
write(1 == '');
write(1 == 0xa);
write(1 == 04);
write(1 == 'hello');
write(1 == 'hel' + 'lo');
write(1 == String(''));
write(1 == String('hello'));
write(1 == String('h' + 'ello'));
write(1 == new String(''));
write(1 == new String('hello'));
write(1 == new String('he' + 'llo'));
write(1 == new Object());
write(1 == new Object());
write(1 == [1, 2, 3]);
write(1 == [1 ,2 , 3]);
write(1 == new Array(3));
write(1 == Array(3));
write(1 == new Array(1 ,2 ,3));
write(1 == Array(1));
write(1 == foo);
write(10 == undefined);
write(10 == null);
write(10 == true);
write(10 == false);
write(10 == Boolean(true));
write(10 == Boolean(false));
write(10 == new Boolean(true));
write(10 == new Boolean(false));
write(10 == NaN);
write(10 == +0);
write(10 == -0);
write(10 == 0);
write(10 == 0.0);
write(10 == -0.0);
write(10 == +0.0);
write(10 == 1);
write(10 == 10);
write(10 == 10.0);
write(10 == 10.1);
write(10 == -1);
write(10 == -10);
write(10 == -10.0);
write(10 == -10.1);
write(10 == Number.MAX_VALUE);
write(10 == Number.MIN_VALUE);
write(10 == Number.NaN);
write(10 == Number.POSITIVE_INFINITY);
write(10 == Number.NEGATIVE_INFINITY);
write(10 == new Number(NaN));
write(10 == new Number(+0));
write(10 == new Number(-0));
write(10 == new Number(0));
write(10 == new Number(0.0));
write(10 == new Number(-0.0));
write(10 == new Number(+0.0));
write(10 == new Number(1));
write(10 == new Number(10));
write(10 == new Number(10.0));
write(10 == new Number(10.1));
write(10 == new Number(-1));
write(10 == new Number(-10));
write(10 == new Number(-10.0));
write(10 == new Number(-10.1));
write(10 == new Number(Number.MAX_VALUE));
write(10 == new Number(Number.MIN_VALUE));
write(10 == new Number(Number.NaN));
write(10 == new Number(Number.POSITIVE_INFINITY));
write(10 == new Number(Number.NEGATIVE_INFINITY));
write(10 == '');
write(10 == 0xa);
write(10 == 04);
write(10 == 'hello');
write(10 == 'hel' + 'lo');
write(10 == String(''));
write(10 == String('hello'));
write(10 == String('h' + 'ello'));
write(10 == new String(''));
write(10 == new String('hello'));
write(10 == new String('he' + 'llo'));
write(10 == new Object());
write(10 == new Object());
write(10 == [1, 2, 3]);
write(10 == [1 ,2 , 3]);
write(10 == new Array(3));
write(10 == Array(3));
write(10 == new Array(1 ,2 ,3));
write(10 == Array(1));
write(10 == foo);
write(10.0 == undefined);
write(10.0 == null);
write(10.0 == true);
write(10.0 == false);
write(10.0 == Boolean(true));
write(10.0 == Boolean(false));
write(10.0 == new Boolean(true));
write(10.0 == new Boolean(false));
write(10.0 == NaN);
write(10.0 == +0);
write(10.0 == -0);
write(10.0 == 0);
write(10.0 == 0.0);
write(10.0 == -0.0);
write(10.0 == +0.0);
write(10.0 == 1);
write(10.0 == 10);
write(10.0 == 10.0);
write(10.0 == 10.1);
write(10.0 == -1);
write(10.0 == -10);
write(10.0 == -10.0);
write(10.0 == -10.1);
write(10.0 == Number.MAX_VALUE);
write(10.0 == Number.MIN_VALUE);
write(10.0 == Number.NaN);
write(10.0 == Number.POSITIVE_INFINITY);
write(10.0 == Number.NEGATIVE_INFINITY);
write(10.0 == new Number(NaN));
write(10.0 == new Number(+0));
write(10.0 == new Number(-0));
write(10.0 == new Number(0));
write(10.0 == new Number(0.0));
write(10.0 == new Number(-0.0));
write(10.0 == new Number(+0.0));
write(10.0 == new Number(1));
write(10.0 == new Number(10));
write(10.0 == new Number(10.0));
write(10.0 == new Number(10.1));
write(10.0 == new Number(-1));
write(10.0 == new Number(-10));
write(10.0 == new Number(-10.0));
write(10.0 == new Number(-10.1));
write(10.0 == new Number(Number.MAX_VALUE));
write(10.0 == new Number(Number.MIN_VALUE));
write(10.0 == new Number(Number.NaN));
write(10.0 == new Number(Number.POSITIVE_INFINITY));
write(10.0 == new Number(Number.NEGATIVE_INFINITY));
write(10.0 == '');
write(10.0 == 0xa);
write(10.0 == 04);
write(10.0 == 'hello');
write(10.0 == 'hel' + 'lo');
write(10.0 == String(''));
write(10.0 == String('hello'));
write(10.0 == String('h' + 'ello'));
write(10.0 == new String(''));
write(10.0 == new String('hello'));
write(10.0 == new String('he' + 'llo'));
write(10.0 == new Object());
write(10.0 == new Object());
write(10.0 == [1, 2, 3]);
write(10.0 == [1 ,2 , 3]);
write(10.0 == new Array(3));
write(10.0 == Array(3));
write(10.0 == new Array(1 ,2 ,3));
write(10.0 == Array(1));
write(10.0 == foo);
write(10.1 == undefined);
write(10.1 == null);
write(10.1 == true);
write(10.1 == false);
write(10.1 == Boolean(true));
write(10.1 == Boolean(false));
write(10.1 == new Boolean(true));
write(10.1 == new Boolean(false));
write(10.1 == NaN);
write(10.1 == +0);
write(10.1 == -0);
write(10.1 == 0);
write(10.1 == 0.0);
write(10.1 == -0.0);
write(10.1 == +0.0);
write(10.1 == 1);
write(10.1 == 10);
write(10.1 == 10.0);
write(10.1 == 10.1);
write(10.1 == -1);
write(10.1 == -10);
write(10.1 == -10.0);
write(10.1 == -10.1);
write(10.1 == Number.MAX_VALUE);
write(10.1 == Number.MIN_VALUE);
write(10.1 == Number.NaN);
write(10.1 == Number.POSITIVE_INFINITY);
write(10.1 == Number.NEGATIVE_INFINITY);
write(10.1 == new Number(NaN));
write(10.1 == new Number(+0));
write(10.1 == new Number(-0));
write(10.1 == new Number(0));
write(10.1 == new Number(0.0));
write(10.1 == new Number(-0.0));
write(10.1 == new Number(+0.0));
write(10.1 == new Number(1));
write(10.1 == new Number(10));
write(10.1 == new Number(10.0));
write(10.1 == new Number(10.1));
write(10.1 == new Number(-1));
write(10.1 == new Number(-10));
write(10.1 == new Number(-10.0));
write(10.1 == new Number(-10.1));
write(10.1 == new Number(Number.MAX_VALUE));
write(10.1 == new Number(Number.MIN_VALUE));
write(10.1 == new Number(Number.NaN));
write(10.1 == new Number(Number.POSITIVE_INFINITY));
write(10.1 == new Number(Number.NEGATIVE_INFINITY));
write(10.1 == '');
write(10.1 == 0xa);
write(10.1 == 04);
write(10.1 == 'hello');
write(10.1 == 'hel' + 'lo');
write(10.1 == String(''));
write(10.1 == String('hello'));
write(10.1 == String('h' + 'ello'));
write(10.1 == new String(''));
write(10.1 == new String('hello'));
write(10.1 == new String('he' + 'llo'));
write(10.1 == new Object());
write(10.1 == new Object());
write(10.1 == [1, 2, 3]);
write(10.1 == [1 ,2 , 3]);
write(10.1 == new Array(3));
write(10.1 == Array(3));
write(10.1 == new Array(1 ,2 ,3));
write(10.1 == Array(1));
write(10.1 == foo);
write(-1 == undefined);
write(-1 == null);
write(-1 == true);
write(-1 == false);
write(-1 == Boolean(true));
write(-1 == Boolean(false));
write(-1 == new Boolean(true));
write(-1 == new Boolean(false));
write(-1 == NaN);
write(-1 == +0);
write(-1 == -0);
write(-1 == 0);
write(-1 == 0.0);
write(-1 == -0.0);
write(-1 == +0.0);
write(-1 == 1);
write(-1 == 10);
write(-1 == 10.0);
write(-1 == 10.1);
write(-1 == -1);
write(-1 == -10);
write(-1 == -10.0);
write(-1 == -10.1);
write(-1 == Number.MAX_VALUE);
write(-1 == Number.MIN_VALUE);
write(-1 == Number.NaN);
write(-1 == Number.POSITIVE_INFINITY);
write(-1 == Number.NEGATIVE_INFINITY);
write(-1 == new Number(NaN));
write(-1 == new Number(+0));
write(-1 == new Number(-0));
write(-1 == new Number(0));
write(-1 == new Number(0.0));
write(-1 == new Number(-0.0));
write(-1 == new Number(+0.0));
write(-1 == new Number(1));
write(-1 == new Number(10));
write(-1 == new Number(10.0));
write(-1 == new Number(10.1));
write(-1 == new Number(-1));
write(-1 == new Number(-10));
write(-1 == new Number(-10.0));
write(-1 == new Number(-10.1));
write(-1 == new Number(Number.MAX_VALUE));
write(-1 == new Number(Number.MIN_VALUE));
write(-1 == new Number(Number.NaN));
write(-1 == new Number(Number.POSITIVE_INFINITY));
write(-1 == new Number(Number.NEGATIVE_INFINITY));
write(-1 == '');
write(-1 == 0xa);
write(-1 == 04);
write(-1 == 'hello');
write(-1 == 'hel' + 'lo');
write(-1 == String(''));
write(-1 == String('hello'));
write(-1 == String('h' + 'ello'));
write(-1 == new String(''));
write(-1 == new String('hello'));
write(-1 == new String('he' + 'llo'));
write(-1 == new Object());
write(-1 == new Object());
write(-1 == [1, 2, 3]);
write(-1 == [1 ,2 , 3]);
write(-1 == new Array(3));
write(-1 == Array(3));
write(-1 == new Array(1 ,2 ,3));
write(-1 == Array(1));
write(-1 == foo);
write(-10 == undefined);
write(-10 == null);
write(-10 == true);
write(-10 == false);
write(-10 == Boolean(true));
write(-10 == Boolean(false));
write(-10 == new Boolean(true));
write(-10 == new Boolean(false));
write(-10 == NaN);
write(-10 == +0);
write(-10 == -0);
write(-10 == 0);
write(-10 == 0.0);
write(-10 == -0.0);
write(-10 == +0.0);
write(-10 == 1);
write(-10 == 10);
write(-10 == 10.0);
write(-10 == 10.1);
write(-10 == -1);
write(-10 == -10);
write(-10 == -10.0);
write(-10 == -10.1);
write(-10 == Number.MAX_VALUE);
write(-10 == Number.MIN_VALUE);
write(-10 == Number.NaN);
write(-10 == Number.POSITIVE_INFINITY);
write(-10 == Number.NEGATIVE_INFINITY);
write(-10 == new Number(NaN));
write(-10 == new Number(+0));
write(-10 == new Number(-0));
write(-10 == new Number(0));
write(-10 == new Number(0.0));
write(-10 == new Number(-0.0));
write(-10 == new Number(+0.0));
write(-10 == new Number(1));
write(-10 == new Number(10));
write(-10 == new Number(10.0));
write(-10 == new Number(10.1));
write(-10 == new Number(-1));
write(-10 == new Number(-10));
write(-10 == new Number(-10.0));
write(-10 == new Number(-10.1));
write(-10 == new Number(Number.MAX_VALUE));
write(-10 == new Number(Number.MIN_VALUE));
write(-10 == new Number(Number.NaN));
write(-10 == new Number(Number.POSITIVE_INFINITY));
write(-10 == new Number(Number.NEGATIVE_INFINITY));
write(-10 == '');
write(-10 == 0xa);
write(-10 == 04);
write(-10 == 'hello');
write(-10 == 'hel' + 'lo');
write(-10 == String(''));
write(-10 == String('hello'));
write(-10 == String('h' + 'ello'));
write(-10 == new String(''));
write(-10 == new String('hello'));
write(-10 == new String('he' + 'llo'));
write(-10 == new Object());
write(-10 == new Object());
write(-10 == [1, 2, 3]);
write(-10 == [1 ,2 , 3]);
write(-10 == new Array(3));
write(-10 == Array(3));
write(-10 == new Array(1 ,2 ,3));
write(-10 == Array(1));
write(-10 == foo);
write(-10.0 == undefined);
write(-10.0 == null);
write(-10.0 == true);
write(-10.0 == false);
write(-10.0 == Boolean(true));
write(-10.0 == Boolean(false));
write(-10.0 == new Boolean(true));
write(-10.0 == new Boolean(false));
write(-10.0 == NaN);
write(-10.0 == +0);
write(-10.0 == -0);
write(-10.0 == 0);
write(-10.0 == 0.0);
write(-10.0 == -0.0);
write(-10.0 == +0.0);
write(-10.0 == 1);
write(-10.0 == 10);
write(-10.0 == 10.0);
write(-10.0 == 10.1);
write(-10.0 == -1);
write(-10.0 == -10);
write(-10.0 == -10.0);
write(-10.0 == -10.1);
write(-10.0 == Number.MAX_VALUE);
write(-10.0 == Number.MIN_VALUE);
write(-10.0 == Number.NaN);
write(-10.0 == Number.POSITIVE_INFINITY);
write(-10.0 == Number.NEGATIVE_INFINITY);
write(-10.0 == new Number(NaN));
write(-10.0 == new Number(+0));
write(-10.0 == new Number(-0));
write(-10.0 == new Number(0));
write(-10.0 == new Number(0.0));
write(-10.0 == new Number(-0.0));
write(-10.0 == new Number(+0.0));
write(-10.0 == new Number(1));
write(-10.0 == new Number(10));
write(-10.0 == new Number(10.0));
write(-10.0 == new Number(10.1));
write(-10.0 == new Number(-1));
write(-10.0 == new Number(-10));
write(-10.0 == new Number(-10.0));
write(-10.0 == new Number(-10.1));
write(-10.0 == new Number(Number.MAX_VALUE));
write(-10.0 == new Number(Number.MIN_VALUE));
write(-10.0 == new Number(Number.NaN));
write(-10.0 == new Number(Number.POSITIVE_INFINITY));
write(-10.0 == new Number(Number.NEGATIVE_INFINITY));
write(-10.0 == '');
write(-10.0 == 0xa);
write(-10.0 == 04);
write(-10.0 == 'hello');
write(-10.0 == 'hel' + 'lo');
write(-10.0 == String(''));
write(-10.0 == String('hello'));
write(-10.0 == String('h' + 'ello'));
write(-10.0 == new String(''));
write(-10.0 == new String('hello'));
write(-10.0 == new String('he' + 'llo'));
write(-10.0 == new Object());
write(-10.0 == new Object());
write(-10.0 == [1, 2, 3]);
write(-10.0 == [1 ,2 , 3]);
write(-10.0 == new Array(3));
write(-10.0 == Array(3));
write(-10.0 == new Array(1 ,2 ,3));
write(-10.0 == Array(1));
write(-10.0 == foo);
write(-10.1 == undefined);
write(-10.1 == null);
write(-10.1 == true);
write(-10.1 == false);
write(-10.1 == Boolean(true));
write(-10.1 == Boolean(false));
write(-10.1 == new Boolean(true));
write(-10.1 == new Boolean(false));
write(-10.1 == NaN);
write(-10.1 == +0);
write(-10.1 == -0);
write(-10.1 == 0);
write(-10.1 == 0.0);
write(-10.1 == -0.0);
write(-10.1 == +0.0);
write(-10.1 == 1);
write(-10.1 == 10);
write(-10.1 == 10.0);
write(-10.1 == 10.1);
write(-10.1 == -1);
write(-10.1 == -10);
write(-10.1 == -10.0);
write(-10.1 == -10.1);
write(-10.1 == Number.MAX_VALUE);
write(-10.1 == Number.MIN_VALUE);
write(-10.1 == Number.NaN);
write(-10.1 == Number.POSITIVE_INFINITY);
write(-10.1 == Number.NEGATIVE_INFINITY);
write(-10.1 == new Number(NaN));
write(-10.1 == new Number(+0));
write(-10.1 == new Number(-0));
write(-10.1 == new Number(0));
write(-10.1 == new Number(0.0));
write(-10.1 == new Number(-0.0));
write(-10.1 == new Number(+0.0));
write(-10.1 == new Number(1));
write(-10.1 == new Number(10));
write(-10.1 == new Number(10.0));
write(-10.1 == new Number(10.1));
write(-10.1 == new Number(-1));
write(-10.1 == new Number(-10));
write(-10.1 == new Number(-10.0));
write(-10.1 == new Number(-10.1));
write(-10.1 == new Number(Number.MAX_VALUE));
write(-10.1 == new Number(Number.MIN_VALUE));
write(-10.1 == new Number(Number.NaN));
write(-10.1 == new Number(Number.POSITIVE_INFINITY));
write(-10.1 == new Number(Number.NEGATIVE_INFINITY));
write(-10.1 == '');
write(-10.1 == 0xa);
write(-10.1 == 04);
write(-10.1 == 'hello');
write(-10.1 == 'hel' + 'lo');
write(-10.1 == String(''));
write(-10.1 == String('hello'));
write(-10.1 == String('h' + 'ello'));
write(-10.1 == new String(''));
write(-10.1 == new String('hello'));
write(-10.1 == new String('he' + 'llo'));
write(-10.1 == new Object());
write(-10.1 == new Object());
write(-10.1 == [1, 2, 3]);
write(-10.1 == [1 ,2 , 3]);
write(-10.1 == new Array(3));
write(-10.1 == Array(3));
write(-10.1 == new Array(1 ,2 ,3));
write(-10.1 == Array(1));
write(-10.1 == foo);
write(Number.MAX_VALUE == undefined);
write(Number.MAX_VALUE == null);
write(Number.MAX_VALUE == true);
write(Number.MAX_VALUE == false);
write(Number.MAX_VALUE == Boolean(true));
write(Number.MAX_VALUE == Boolean(false));
write(Number.MAX_VALUE == new Boolean(true));
write(Number.MAX_VALUE == new Boolean(false));
write(Number.MAX_VALUE == NaN);
write(Number.MAX_VALUE == +0);
write(Number.MAX_VALUE == -0);
write(Number.MAX_VALUE == 0);
write(Number.MAX_VALUE == 0.0);
write(Number.MAX_VALUE == -0.0);
write(Number.MAX_VALUE == +0.0);
write(Number.MAX_VALUE == 1);
write(Number.MAX_VALUE == 10);
write(Number.MAX_VALUE == 10.0);
write(Number.MAX_VALUE == 10.1);
write(Number.MAX_VALUE == -1);
write(Number.MAX_VALUE == -10);
write(Number.MAX_VALUE == -10.0);
write(Number.MAX_VALUE == -10.1);
write(Number.MAX_VALUE == Number.MAX_VALUE);
write(Number.MAX_VALUE == Number.MIN_VALUE);
write(Number.MAX_VALUE == Number.NaN);
write(Number.MAX_VALUE == Number.POSITIVE_INFINITY);
write(Number.MAX_VALUE == Number.NEGATIVE_INFINITY);
write(Number.MAX_VALUE == new Number(NaN));
write(Number.MAX_VALUE == new Number(+0));
write(Number.MAX_VALUE == new Number(-0));
write(Number.MAX_VALUE == new Number(0));
write(Number.MAX_VALUE == new Number(0.0));
write(Number.MAX_VALUE == new Number(-0.0));
write(Number.MAX_VALUE == new Number(+0.0));
write(Number.MAX_VALUE == new Number(1));
write(Number.MAX_VALUE == new Number(10));
write(Number.MAX_VALUE == new Number(10.0));
write(Number.MAX_VALUE == new Number(10.1));
write(Number.MAX_VALUE == new Number(-1));
write(Number.MAX_VALUE == new Number(-10));
write(Number.MAX_VALUE == new Number(-10.0));
write(Number.MAX_VALUE == new Number(-10.1));
write(Number.MAX_VALUE == new Number(Number.MAX_VALUE));
write(Number.MAX_VALUE == new Number(Number.MIN_VALUE));
write(Number.MAX_VALUE == new Number(Number.NaN));
write(Number.MAX_VALUE == new Number(Number.POSITIVE_INFINITY));
write(Number.MAX_VALUE == new Number(Number.NEGATIVE_INFINITY));
write(Number.MAX_VALUE == '');
write(Number.MAX_VALUE == 0xa);
write(Number.MAX_VALUE == 04);
write(Number.MAX_VALUE == 'hello');
write(Number.MAX_VALUE == 'hel' + 'lo');
write(Number.MAX_VALUE == String(''));
write(Number.MAX_VALUE == String('hello'));
write(Number.MAX_VALUE == String('h' + 'ello'));
write(Number.MAX_VALUE == new String(''));
write(Number.MAX_VALUE == new String('hello'));
write(Number.MAX_VALUE == new String('he' + 'llo'));
write(Number.MAX_VALUE == new Object());
write(Number.MAX_VALUE == new Object());
write(Number.MAX_VALUE == [1, 2, 3]);
write(Number.MAX_VALUE == [1 ,2 , 3]);
write(Number.MAX_VALUE == new Array(3));
write(Number.MAX_VALUE == Array(3));
write(Number.MAX_VALUE == new Array(1 ,2 ,3));
write(Number.MAX_VALUE == Array(1));
write(Number.MAX_VALUE == foo);
write(Number.MIN_VALUE == undefined);
write(Number.MIN_VALUE == null);
write(Number.MIN_VALUE == true);
write(Number.MIN_VALUE == false);
write(Number.MIN_VALUE == Boolean(true));
write(Number.MIN_VALUE == Boolean(false));
write(Number.MIN_VALUE == new Boolean(true));
write(Number.MIN_VALUE == new Boolean(false));
write(Number.MIN_VALUE == NaN);
write(Number.MIN_VALUE == +0);
write(Number.MIN_VALUE == -0);
write(Number.MIN_VALUE == 0);
write(Number.MIN_VALUE == 0.0);
write(Number.MIN_VALUE == -0.0);
write(Number.MIN_VALUE == +0.0);
write(Number.MIN_VALUE == 1);
write(Number.MIN_VALUE == 10);
write(Number.MIN_VALUE == 10.0);
write(Number.MIN_VALUE == 10.1);
write(Number.MIN_VALUE == -1);
write(Number.MIN_VALUE == -10);
write(Number.MIN_VALUE == -10.0);
write(Number.MIN_VALUE == -10.1);
write(Number.MIN_VALUE == Number.MAX_VALUE);
write(Number.MIN_VALUE == Number.MIN_VALUE);
write(Number.MIN_VALUE == Number.NaN);
write(Number.MIN_VALUE == Number.POSITIVE_INFINITY);
write(Number.MIN_VALUE == Number.NEGATIVE_INFINITY);
write(Number.MIN_VALUE == new Number(NaN));
write(Number.MIN_VALUE == new Number(+0));
write(Number.MIN_VALUE == new Number(-0));
write(Number.MIN_VALUE == new Number(0));
write(Number.MIN_VALUE == new Number(0.0));
write(Number.MIN_VALUE == new Number(-0.0));
write(Number.MIN_VALUE == new Number(+0.0));
write(Number.MIN_VALUE == new Number(1));
write(Number.MIN_VALUE == new Number(10));
write(Number.MIN_VALUE == new Number(10.0));
write(Number.MIN_VALUE == new Number(10.1));
write(Number.MIN_VALUE == new Number(-1));
write(Number.MIN_VALUE == new Number(-10));
write(Number.MIN_VALUE == new Number(-10.0));
write(Number.MIN_VALUE == new Number(-10.1));
write(Number.MIN_VALUE == new Number(Number.MAX_VALUE));
write(Number.MIN_VALUE == new Number(Number.MIN_VALUE));
write(Number.MIN_VALUE == new Number(Number.NaN));
write(Number.MIN_VALUE == new Number(Number.POSITIVE_INFINITY));
write(Number.MIN_VALUE == new Number(Number.NEGATIVE_INFINITY));
write(Number.MIN_VALUE == '');
write(Number.MIN_VALUE == 0xa);
write(Number.MIN_VALUE == 04);
write(Number.MIN_VALUE == 'hello');
write(Number.MIN_VALUE == 'hel' + 'lo');
write(Number.MIN_VALUE == String(''));
write(Number.MIN_VALUE == String('hello'));
write(Number.MIN_VALUE == String('h' + 'ello'));
write(Number.MIN_VALUE == new String(''));
write(Number.MIN_VALUE == new String('hello'));
write(Number.MIN_VALUE == new String('he' + 'llo'));
write(Number.MIN_VALUE == new Object());
write(Number.MIN_VALUE == new Object());
write(Number.MIN_VALUE == [1, 2, 3]);
write(Number.MIN_VALUE == [1 ,2 , 3]);
write(Number.MIN_VALUE == new Array(3));
write(Number.MIN_VALUE == Array(3));
write(Number.MIN_VALUE == new Array(1 ,2 ,3));
write(Number.MIN_VALUE == Array(1));
write(Number.MIN_VALUE == foo);
write(Number.NaN == undefined);
write(Number.NaN == null);
write(Number.NaN == true);
write(Number.NaN == false);
write(Number.NaN == Boolean(true));
write(Number.NaN == Boolean(false));
write(Number.NaN == new Boolean(true));
write(Number.NaN == new Boolean(false));
write(Number.NaN == NaN);
write(Number.NaN == +0);
write(Number.NaN == -0);
write(Number.NaN == 0);
write(Number.NaN == 0.0);
write(Number.NaN == -0.0);
write(Number.NaN == +0.0);
write(Number.NaN == 1);
write(Number.NaN == 10);
write(Number.NaN == 10.0);
write(Number.NaN == 10.1);
write(Number.NaN == -1);
write(Number.NaN == -10);
write(Number.NaN == -10.0);
write(Number.NaN == -10.1);
write(Number.NaN == Number.MAX_VALUE);
write(Number.NaN == Number.MIN_VALUE);
write(Number.NaN == Number.NaN);
write(Number.NaN == Number.POSITIVE_INFINITY);
write(Number.NaN == Number.NEGATIVE_INFINITY);
write(Number.NaN == new Number(NaN));
write(Number.NaN == new Number(+0));
write(Number.NaN == new Number(-0));
write(Number.NaN == new Number(0));
write(Number.NaN == new Number(0.0));
write(Number.NaN == new Number(-0.0));
write(Number.NaN == new Number(+0.0));
write(Number.NaN == new Number(1));
write(Number.NaN == new Number(10));
write(Number.NaN == new Number(10.0));
write(Number.NaN == new Number(10.1));
write(Number.NaN == new Number(-1));
write(Number.NaN == new Number(-10));
write(Number.NaN == new Number(-10.0));
write(Number.NaN == new Number(-10.1));
write(Number.NaN == new Number(Number.MAX_VALUE));
write(Number.NaN == new Number(Number.MIN_VALUE));
write(Number.NaN == new Number(Number.NaN));
write(Number.NaN == new Number(Number.POSITIVE_INFINITY));
write(Number.NaN == new Number(Number.NEGATIVE_INFINITY));
write(Number.NaN == '');
write(Number.NaN == 0xa);
write(Number.NaN == 04);
write(Number.NaN == 'hello');
write(Number.NaN == 'hel' + 'lo');
write(Number.NaN == String(''));
write(Number.NaN == String('hello'));
write(Number.NaN == String('h' + 'ello'));
write(Number.NaN == new String(''));
write(Number.NaN == new String('hello'));
write(Number.NaN == new String('he' + 'llo'));
write(Number.NaN == new Object());
write(Number.NaN == new Object());
write(Number.NaN == [1, 2, 3]);
write(Number.NaN == [1 ,2 , 3]);
write(Number.NaN == new Array(3));
write(Number.NaN == Array(3));
write(Number.NaN == new Array(1 ,2 ,3));
write(Number.NaN == Array(1));
write(Number.NaN == foo);
write(Number.POSITIVE_INFINITY == undefined);
write(Number.POSITIVE_INFINITY == null);
write(Number.POSITIVE_INFINITY == true);
write(Number.POSITIVE_INFINITY == false);
write(Number.POSITIVE_INFINITY == Boolean(true));
write(Number.POSITIVE_INFINITY == Boolean(false));
write(Number.POSITIVE_INFINITY == new Boolean(true));
write(Number.POSITIVE_INFINITY == new Boolean(false));
write(Number.POSITIVE_INFINITY == NaN);
write(Number.POSITIVE_INFINITY == +0);
write(Number.POSITIVE_INFINITY == -0);
write(Number.POSITIVE_INFINITY == 0);
write(Number.POSITIVE_INFINITY == 0.0);
write(Number.POSITIVE_INFINITY == -0.0);
write(Number.POSITIVE_INFINITY == +0.0);
write(Number.POSITIVE_INFINITY == 1);
write(Number.POSITIVE_INFINITY == 10);
write(Number.POSITIVE_INFINITY == 10.0);
write(Number.POSITIVE_INFINITY == 10.1);
write(Number.POSITIVE_INFINITY == -1);
write(Number.POSITIVE_INFINITY == -10);
write(Number.POSITIVE_INFINITY == -10.0);
write(Number.POSITIVE_INFINITY == -10.1);
write(Number.POSITIVE_INFINITY == Number.MAX_VALUE);
write(Number.POSITIVE_INFINITY == Number.MIN_VALUE);
write(Number.POSITIVE_INFINITY == Number.NaN);
write(Number.POSITIVE_INFINITY == Number.POSITIVE_INFINITY);
write(Number.POSITIVE_INFINITY == Number.NEGATIVE_INFINITY);
write(Number.POSITIVE_INFINITY == new Number(NaN));
write(Number.POSITIVE_INFINITY == new Number(+0));
write(Number.POSITIVE_INFINITY == new Number(-0));
write(Number.POSITIVE_INFINITY == new Number(0));
write(Number.POSITIVE_INFINITY == new Number(0.0));
write(Number.POSITIVE_INFINITY == new Number(-0.0));
write(Number.POSITIVE_INFINITY == new Number(+0.0));
write(Number.POSITIVE_INFINITY == new Number(1));
write(Number.POSITIVE_INFINITY == new Number(10));
write(Number.POSITIVE_INFINITY == new Number(10.0));
write(Number.POSITIVE_INFINITY == new Number(10.1));
write(Number.POSITIVE_INFINITY == new Number(-1));
write(Number.POSITIVE_INFINITY == new Number(-10));
write(Number.POSITIVE_INFINITY == new Number(-10.0));
write(Number.POSITIVE_INFINITY == new Number(-10.1));
write(Number.POSITIVE_INFINITY == new Number(Number.MAX_VALUE));
write(Number.POSITIVE_INFINITY == new Number(Number.MIN_VALUE));
write(Number.POSITIVE_INFINITY == new Number(Number.NaN));
write(Number.POSITIVE_INFINITY == new Number(Number.POSITIVE_INFINITY));
write(Number.POSITIVE_INFINITY == new Number(Number.NEGATIVE_INFINITY));
write(Number.POSITIVE_INFINITY == '');
write(Number.POSITIVE_INFINITY == 0xa);
write(Number.POSITIVE_INFINITY == 04);
write(Number.POSITIVE_INFINITY == 'hello');
write(Number.POSITIVE_INFINITY == 'hel' + 'lo');
write(Number.POSITIVE_INFINITY == String(''));
write(Number.POSITIVE_INFINITY == String('hello'));
write(Number.POSITIVE_INFINITY == String('h' + 'ello'));
write(Number.POSITIVE_INFINITY == new String(''));
write(Number.POSITIVE_INFINITY == new String('hello'));
write(Number.POSITIVE_INFINITY == new String('he' + 'llo'));
write(Number.POSITIVE_INFINITY == new Object());
write(Number.POSITIVE_INFINITY == new Object());
write(Number.POSITIVE_INFINITY == [1, 2, 3]);
write(Number.POSITIVE_INFINITY == [1 ,2 , 3]);
write(Number.POSITIVE_INFINITY == new Array(3));
write(Number.POSITIVE_INFINITY == Array(3));
write(Number.POSITIVE_INFINITY == new Array(1 ,2 ,3));
write(Number.POSITIVE_INFINITY == Array(1));
write(Number.POSITIVE_INFINITY == foo);
write(Number.NEGATIVE_INFINITY == undefined);
write(Number.NEGATIVE_INFINITY == null);
write(Number.NEGATIVE_INFINITY == true);
write(Number.NEGATIVE_INFINITY == false);
write(Number.NEGATIVE_INFINITY == Boolean(true));
write(Number.NEGATIVE_INFINITY == Boolean(false));
write(Number.NEGATIVE_INFINITY == new Boolean(true));
write(Number.NEGATIVE_INFINITY == new Boolean(false));
write(Number.NEGATIVE_INFINITY == NaN);
write(Number.NEGATIVE_INFINITY == +0);
write(Number.NEGATIVE_INFINITY == -0);
write(Number.NEGATIVE_INFINITY == 0);
write(Number.NEGATIVE_INFINITY == 0.0);
write(Number.NEGATIVE_INFINITY == -0.0);
write(Number.NEGATIVE_INFINITY == +0.0);
write(Number.NEGATIVE_INFINITY == 1);
write(Number.NEGATIVE_INFINITY == 10);
write(Number.NEGATIVE_INFINITY == 10.0);
write(Number.NEGATIVE_INFINITY == 10.1);
write(Number.NEGATIVE_INFINITY == -1);
write(Number.NEGATIVE_INFINITY == -10);
write(Number.NEGATIVE_INFINITY == -10.0);
write(Number.NEGATIVE_INFINITY == -10.1);
write(Number.NEGATIVE_INFINITY == Number.MAX_VALUE);
write(Number.NEGATIVE_INFINITY == Number.MIN_VALUE);
write(Number.NEGATIVE_INFINITY == Number.NaN);
write(Number.NEGATIVE_INFINITY == Number.POSITIVE_INFINITY);
write(Number.NEGATIVE_INFINITY == Number.NEGATIVE_INFINITY);
write(Number.NEGATIVE_INFINITY == new Number(NaN));
write(Number.NEGATIVE_INFINITY == new Number(+0));
write(Number.NEGATIVE_INFINITY == new Number(-0));
write(Number.NEGATIVE_INFINITY == new Number(0));
write(Number.NEGATIVE_INFINITY == new Number(0.0));
write(Number.NEGATIVE_INFINITY == new Number(-0.0));
write(Number.NEGATIVE_INFINITY == new Number(+0.0));
write(Number.NEGATIVE_INFINITY == new Number(1));
write(Number.NEGATIVE_INFINITY == new Number(10));
write(Number.NEGATIVE_INFINITY == new Number(10.0));
write(Number.NEGATIVE_INFINITY == new Number(10.1));
write(Number.NEGATIVE_INFINITY == new Number(-1));
write(Number.NEGATIVE_INFINITY == new Number(-10));
write(Number.NEGATIVE_INFINITY == new Number(-10.0));
write(Number.NEGATIVE_INFINITY == new Number(-10.1));
write(Number.NEGATIVE_INFINITY == new Number(Number.MAX_VALUE));
write(Number.NEGATIVE_INFINITY == new Number(Number.MIN_VALUE));
write(Number.NEGATIVE_INFINITY == new Number(Number.NaN));
write(Number.NEGATIVE_INFINITY == new Number(Number.POSITIVE_INFINITY));
write(Number.NEGATIVE_INFINITY == new Number(Number.NEGATIVE_INFINITY));
write(Number.NEGATIVE_INFINITY == '');
write(Number.NEGATIVE_INFINITY == 0xa);
write(Number.NEGATIVE_INFINITY == 04);
write(Number.NEGATIVE_INFINITY == 'hello');
write(Number.NEGATIVE_INFINITY == 'hel' + 'lo');
write(Number.NEGATIVE_INFINITY == String(''));
write(Number.NEGATIVE_INFINITY == String('hello'));
write(Number.NEGATIVE_INFINITY == String('h' + 'ello'));
write(Number.NEGATIVE_INFINITY == new String(''));
write(Number.NEGATIVE_INFINITY == new String('hello'));
write(Number.NEGATIVE_INFINITY == new String('he' + 'llo'));
write(Number.NEGATIVE_INFINITY == new Object());
write(Number.NEGATIVE_INFINITY == new Object());
write(Number.NEGATIVE_INFINITY == [1, 2, 3]);
write(Number.NEGATIVE_INFINITY == [1 ,2 , 3]);
write(Number.NEGATIVE_INFINITY == new Array(3));
write(Number.NEGATIVE_INFINITY == Array(3));
write(Number.NEGATIVE_INFINITY == new Array(1 ,2 ,3));
write(Number.NEGATIVE_INFINITY == Array(1));
write(Number.NEGATIVE_INFINITY == foo);
write(new Number(NaN) == undefined);
write(new Number(NaN) == null);
write(new Number(NaN) == true);
write(new Number(NaN) == false);
write(new Number(NaN) == Boolean(true));
write(new Number(NaN) == Boolean(false));
write(new Number(NaN) == new Boolean(true));
write(new Number(NaN) == new Boolean(false));
write(new Number(NaN) == NaN);
write(new Number(NaN) == +0);
write(new Number(NaN) == -0);
write(new Number(NaN) == 0);
write(new Number(NaN) == 0.0);
write(new Number(NaN) == -0.0);
write(new Number(NaN) == +0.0);
write(new Number(NaN) == 1);
write(new Number(NaN) == 10);
write(new Number(NaN) == 10.0);
write(new Number(NaN) == 10.1);
write(new Number(NaN) == -1);
write(new Number(NaN) == -10);
write(new Number(NaN) == -10.0);
write(new Number(NaN) == -10.1);
write(new Number(NaN) == Number.MAX_VALUE);
write(new Number(NaN) == Number.MIN_VALUE);
write(new Number(NaN) == Number.NaN);
write(new Number(NaN) == Number.POSITIVE_INFINITY);
write(new Number(NaN) == Number.NEGATIVE_INFINITY);
write(new Number(NaN) == new Number(NaN));
write(new Number(NaN) == new Number(+0));
write(new Number(NaN) == new Number(-0));
write(new Number(NaN) == new Number(0));
write(new Number(NaN) == new Number(0.0));
write(new Number(NaN) == new Number(-0.0));
write(new Number(NaN) == new Number(+0.0));
write(new Number(NaN) == new Number(1));
write(new Number(NaN) == new Number(10));
write(new Number(NaN) == new Number(10.0));
write(new Number(NaN) == new Number(10.1));
write(new Number(NaN) == new Number(-1));
write(new Number(NaN) == new Number(-10));
write(new Number(NaN) == new Number(-10.0));
write(new Number(NaN) == new Number(-10.1));
write(new Number(NaN) == new Number(Number.MAX_VALUE));
write(new Number(NaN) == new Number(Number.MIN_VALUE));
write(new Number(NaN) == new Number(Number.NaN));
write(new Number(NaN) == new Number(Number.POSITIVE_INFINITY));
write(new Number(NaN) == new Number(Number.NEGATIVE_INFINITY));
write(new Number(NaN) == '');
write(new Number(NaN) == 0xa);
write(new Number(NaN) == 04);
write(new Number(NaN) == 'hello');
write(new Number(NaN) == 'hel' + 'lo');
write(new Number(NaN) == String(''));
write(new Number(NaN) == String('hello'));
write(new Number(NaN) == String('h' + 'ello'));
write(new Number(NaN) == new String(''));
write(new Number(NaN) == new String('hello'));
write(new Number(NaN) == new String('he' + 'llo'));
write(new Number(NaN) == new Object());
write(new Number(NaN) == new Object());
write(new Number(NaN) == [1, 2, 3]);
write(new Number(NaN) == [1 ,2 , 3]);
write(new Number(NaN) == new Array(3));
write(new Number(NaN) == Array(3));
write(new Number(NaN) == new Array(1 ,2 ,3));
write(new Number(NaN) == Array(1));
write(new Number(NaN) == foo);
write(new Number(+0) == undefined);
write(new Number(+0) == null);
write(new Number(+0) == true);
write(new Number(+0) == false);
write(new Number(+0) == Boolean(true));
write(new Number(+0) == Boolean(false));
write(new Number(+0) == new Boolean(true));
write(new Number(+0) == new Boolean(false));
write(new Number(+0) == NaN);
write(new Number(+0) == +0);
write(new Number(+0) == -0);
write(new Number(+0) == 0);
write(new Number(+0) == 0.0);
write(new Number(+0) == -0.0);
write(new Number(+0) == +0.0);
write(new Number(+0) == 1);
write(new Number(+0) == 10);
write(new Number(+0) == 10.0);
write(new Number(+0) == 10.1);
write(new Number(+0) == -1);
write(new Number(+0) == -10);
write(new Number(+0) == -10.0);
write(new Number(+0) == -10.1);
write(new Number(+0) == Number.MAX_VALUE);
write(new Number(+0) == Number.MIN_VALUE);
write(new Number(+0) == Number.NaN);
write(new Number(+0) == Number.POSITIVE_INFINITY);
write(new Number(+0) == Number.NEGATIVE_INFINITY);
write(new Number(+0) == new Number(NaN));