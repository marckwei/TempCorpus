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

write(new String('he' + 'llo') == new Object());
write(new String('he' + 'llo') == new Object());
write(new String('he' + 'llo') == [1, 2, 3]);
write(new String('he' + 'llo') == [1 ,2 , 3]);
write(new String('he' + 'llo') == new Array(3));
write(new String('he' + 'llo') == Array(3));
write(new String('he' + 'llo') == new Array(1 ,2 ,3));
write(new String('he' + 'llo') == Array(1));
write(new String('he' + 'llo') == foo);
write(new Object() == undefined);
write(new Object() == null);
write(new Object() == true);
write(new Object() == false);
write(new Object() == Boolean(true));
write(new Object() == Boolean(false));
write(new Object() == new Boolean(true));
write(new Object() == new Boolean(false));
write(new Object() == NaN);
write(new Object() == +0);
write(new Object() == -0);
write(new Object() == 0);
write(new Object() == 0.0);
write(new Object() == -0.0);
write(new Object() == +0.0);
write(new Object() == 1);
write(new Object() == 10);
write(new Object() == 10.0);
write(new Object() == 10.1);
write(new Object() == -1);
write(new Object() == -10);
write(new Object() == -10.0);
write(new Object() == -10.1);
write(new Object() == Number.MAX_VALUE);
write(new Object() == Number.MIN_VALUE);
write(new Object() == Number.NaN);
write(new Object() == Number.POSITIVE_INFINITY);
write(new Object() == Number.NEGATIVE_INFINITY);
write(new Object() == new Number(NaN));
write(new Object() == new Number(+0));
write(new Object() == new Number(-0));
write(new Object() == new Number(0));
write(new Object() == new Number(0.0));
write(new Object() == new Number(-0.0));
write(new Object() == new Number(+0.0));
write(new Object() == new Number(1));
write(new Object() == new Number(10));
write(new Object() == new Number(10.0));
write(new Object() == new Number(10.1));
write(new Object() == new Number(-1));
write(new Object() == new Number(-10));
write(new Object() == new Number(-10.0));
write(new Object() == new Number(-10.1));
write(new Object() == new Number(Number.MAX_VALUE));
write(new Object() == new Number(Number.MIN_VALUE));
write(new Object() == new Number(Number.NaN));
write(new Object() == new Number(Number.POSITIVE_INFINITY));
write(new Object() == new Number(Number.NEGATIVE_INFINITY));
write(new Object() == '');
write(new Object() == 0xa);
write(new Object() == 04);
write(new Object() == 'hello');
write(new Object() == 'hel' + 'lo');
write(new Object() == String(''));
write(new Object() == String('hello'));
write(new Object() == String('h' + 'ello'));
write(new Object() == new String(''));
write(new Object() == new String('hello'));
write(new Object() == new String('he' + 'llo'));
write(new Object() == new Object());
write(new Object() == new Object());
write(new Object() == [1, 2, 3]);
write(new Object() == [1 ,2 , 3]);
write(new Object() == new Array(3));
write(new Object() == Array(3));
write(new Object() == new Array(1 ,2 ,3));
write(new Object() == Array(1));
write(new Object() == foo);
write(new Object() == undefined);
write(new Object() == null);
write(new Object() == true);
write(new Object() == false);
write(new Object() == Boolean(true));
write(new Object() == Boolean(false));
write(new Object() == new Boolean(true));
write(new Object() == new Boolean(false));
write(new Object() == NaN);
write(new Object() == +0);
write(new Object() == -0);
write(new Object() == 0);
write(new Object() == 0.0);
write(new Object() == -0.0);
write(new Object() == +0.0);
write(new Object() == 1);
write(new Object() == 10);
write(new Object() == 10.0);
write(new Object() == 10.1);
write(new Object() == -1);
write(new Object() == -10);
write(new Object() == -10.0);
write(new Object() == -10.1);
write(new Object() == Number.MAX_VALUE);
write(new Object() == Number.MIN_VALUE);
write(new Object() == Number.NaN);
write(new Object() == Number.POSITIVE_INFINITY);
write(new Object() == Number.NEGATIVE_INFINITY);
write(new Object() == new Number(NaN));
write(new Object() == new Number(+0));
write(new Object() == new Number(-0));
write(new Object() == new Number(0));
write(new Object() == new Number(0.0));
write(new Object() == new Number(-0.0));
write(new Object() == new Number(+0.0));
write(new Object() == new Number(1));
write(new Object() == new Number(10));
write(new Object() == new Number(10.0));
write(new Object() == new Number(10.1));
write(new Object() == new Number(-1));
write(new Object() == new Number(-10));
write(new Object() == new Number(-10.0));
write(new Object() == new Number(-10.1));
write(new Object() == new Number(Number.MAX_VALUE));
write(new Object() == new Number(Number.MIN_VALUE));
write(new Object() == new Number(Number.NaN));
write(new Object() == new Number(Number.POSITIVE_INFINITY));
write(new Object() == new Number(Number.NEGATIVE_INFINITY));
write(new Object() == '');
write(new Object() == 0xa);
write(new Object() == 04);
write(new Object() == 'hello');
write(new Object() == 'hel' + 'lo');
write(new Object() == String(''));
write(new Object() == String('hello'));
write(new Object() == String('h' + 'ello'));
write(new Object() == new String(''));
write(new Object() == new String('hello'));
write(new Object() == new String('he' + 'llo'));
write(new Object() == new Object());
write(new Object() == new Object());
write(new Object() == [1, 2, 3]);
write(new Object() == [1 ,2 , 3]);
write(new Object() == new Array(3));
write(new Object() == Array(3));
write(new Object() == new Array(1 ,2 ,3));
write(new Object() == Array(1));
write(new Object() == foo);
write([1, 2, 3] == undefined);
write([1, 2, 3] == null);
write([1, 2, 3] == true);
write([1, 2, 3] == false);
write([1, 2, 3] == Boolean(true));
write([1, 2, 3] == Boolean(false));
write([1, 2, 3] == new Boolean(true));
write([1, 2, 3] == new Boolean(false));
write([1, 2, 3] == NaN);
write([1, 2, 3] == +0);
write([1, 2, 3] == -0);
write([1, 2, 3] == 0);
write([1, 2, 3] == 0.0);
write([1, 2, 3] == -0.0);
write([1, 2, 3] == +0.0);
write([1, 2, 3] == 1);
write([1, 2, 3] == 10);
write([1, 2, 3] == 10.0);
write([1, 2, 3] == 10.1);
write([1, 2, 3] == -1);
write([1, 2, 3] == -10);
write([1, 2, 3] == -10.0);
write([1, 2, 3] == -10.1);
write([1, 2, 3] == Number.MAX_VALUE);
write([1, 2, 3] == Number.MIN_VALUE);
write([1, 2, 3] == Number.NaN);
write([1, 2, 3] == Number.POSITIVE_INFINITY);
write([1, 2, 3] == Number.NEGATIVE_INFINITY);
write([1, 2, 3] == new Number(NaN));
write([1, 2, 3] == new Number(+0));
write([1, 2, 3] == new Number(-0));
write([1, 2, 3] == new Number(0));
write([1, 2, 3] == new Number(0.0));
write([1, 2, 3] == new Number(-0.0));
write([1, 2, 3] == new Number(+0.0));
write([1, 2, 3] == new Number(1));
write([1, 2, 3] == new Number(10));
write([1, 2, 3] == new Number(10.0));
write([1, 2, 3] == new Number(10.1));
write([1, 2, 3] == new Number(-1));
write([1, 2, 3] == new Number(-10));
write([1, 2, 3] == new Number(-10.0));
write([1, 2, 3] == new Number(-10.1));
write([1, 2, 3] == new Number(Number.MAX_VALUE));
write([1, 2, 3] == new Number(Number.MIN_VALUE));
write([1, 2, 3] == new Number(Number.NaN));
write([1, 2, 3] == new Number(Number.POSITIVE_INFINITY));
write([1, 2, 3] == new Number(Number.NEGATIVE_INFINITY));
write([1, 2, 3] == '');
write([1, 2, 3] == 0xa);
write([1, 2, 3] == 04);
write([1, 2, 3] == 'hello');
write([1, 2, 3] == 'hel' + 'lo');
write([1, 2, 3] == String(''));
write([1, 2, 3] == String('hello'));
write([1, 2, 3] == String('h' + 'ello'));
write([1, 2, 3] == new String(''));
write([1, 2, 3] == new String('hello'));
write([1, 2, 3] == new String('he' + 'llo'));
write([1, 2, 3] == new Object());
write([1, 2, 3] == new Object());
write([1, 2, 3] == [1, 2, 3]);
write([1, 2, 3] == [1 ,2 , 3]);
write([1, 2, 3] == new Array(3));
write([1, 2, 3] == Array(3));
write([1, 2, 3] == new Array(1 ,2 ,3));
write([1, 2, 3] == Array(1));
write([1, 2, 3] == foo);
write([1 ,2 , 3] == undefined);
write([1 ,2 , 3] == null);
write([1 ,2 , 3] == true);
write([1 ,2 , 3] == false);
write([1 ,2 , 3] == Boolean(true));
write([1 ,2 , 3] == Boolean(false));
write([1 ,2 , 3] == new Boolean(true));
write([1 ,2 , 3] == new Boolean(false));
write([1 ,2 , 3] == NaN);
write([1 ,2 , 3] == +0);
write([1 ,2 , 3] == -0);
write([1 ,2 , 3] == 0);
write([1 ,2 , 3] == 0.0);
write([1 ,2 , 3] == -0.0);
write([1 ,2 , 3] == +0.0);
write([1 ,2 , 3] == 1);
write([1 ,2 , 3] == 10);
write([1 ,2 , 3] == 10.0);
write([1 ,2 , 3] == 10.1);
write([1 ,2 , 3] == -1);
write([1 ,2 , 3] == -10);
write([1 ,2 , 3] == -10.0);
write([1 ,2 , 3] == -10.1);
write([1 ,2 , 3] == Number.MAX_VALUE);
write([1 ,2 , 3] == Number.MIN_VALUE);
write([1 ,2 , 3] == Number.NaN);
write([1 ,2 , 3] == Number.POSITIVE_INFINITY);
write([1 ,2 , 3] == Number.NEGATIVE_INFINITY);
write([1 ,2 , 3] == new Number(NaN));
write([1 ,2 , 3] == new Number(+0));
write([1 ,2 , 3] == new Number(-0));
write([1 ,2 , 3] == new Number(0));
write([1 ,2 , 3] == new Number(0.0));
write([1 ,2 , 3] == new Number(-0.0));
write([1 ,2 , 3] == new Number(+0.0));
write([1 ,2 , 3] == new Number(1));
write([1 ,2 , 3] == new Number(10));
write([1 ,2 , 3] == new Number(10.0));
write([1 ,2 , 3] == new Number(10.1));
write([1 ,2 , 3] == new Number(-1));
write([1 ,2 , 3] == new Number(-10));
write([1 ,2 , 3] == new Number(-10.0));
write([1 ,2 , 3] == new Number(-10.1));
write([1 ,2 , 3] == new Number(Number.MAX_VALUE));
write([1 ,2 , 3] == new Number(Number.MIN_VALUE));
write([1 ,2 , 3] == new Number(Number.NaN));
write([1 ,2 , 3] == new Number(Number.POSITIVE_INFINITY));
write([1 ,2 , 3] == new Number(Number.NEGATIVE_INFINITY));
write([1 ,2 , 3] == '');
write([1 ,2 , 3] == 0xa);
write([1 ,2 , 3] == 04);
write([1 ,2 , 3] == 'hello');
write([1 ,2 , 3] == 'hel' + 'lo');
write([1 ,2 , 3] == String(''));
write([1 ,2 , 3] == String('hello'));
write([1 ,2 , 3] == String('h' + 'ello'));
write([1 ,2 , 3] == new String(''));
write([1 ,2 , 3] == new String('hello'));
write([1 ,2 , 3] == new String('he' + 'llo'));
write([1 ,2 , 3] == new Object());
write([1 ,2 , 3] == new Object());
write([1 ,2 , 3] == [1, 2, 3]);
write([1 ,2 , 3] == [1 ,2 , 3]);
write([1 ,2 , 3] == new Array(3));
write([1 ,2 , 3] == Array(3));
write([1 ,2 , 3] == new Array(1 ,2 ,3));
write([1 ,2 , 3] == Array(1));
write([1 ,2 , 3] == foo);
write(new Array(3) == undefined);
write(new Array(3) == null);
write(new Array(3) == true);
write(new Array(3) == false);
write(new Array(3) == Boolean(true));
write(new Array(3) == Boolean(false));
write(new Array(3) == new Boolean(true));
write(new Array(3) == new Boolean(false));
write(new Array(3) == NaN);
write(new Array(3) == +0);
write(new Array(3) == -0);
write(new Array(3) == 0);
write(new Array(3) == 0.0);
write(new Array(3) == -0.0);
write(new Array(3) == +0.0);
write(new Array(3) == 1);
write(new Array(3) == 10);
write(new Array(3) == 10.0);
write(new Array(3) == 10.1);
write(new Array(3) == -1);
write(new Array(3) == -10);
write(new Array(3) == -10.0);
write(new Array(3) == -10.1);
write(new Array(3) == Number.MAX_VALUE);
write(new Array(3) == Number.MIN_VALUE);
write(new Array(3) == Number.NaN);
write(new Array(3) == Number.POSITIVE_INFINITY);
write(new Array(3) == Number.NEGATIVE_INFINITY);
write(new Array(3) == new Number(NaN));
write(new Array(3) == new Number(+0));
write(new Array(3) == new Number(-0));
write(new Array(3) == new Number(0));
write(new Array(3) == new Number(0.0));
write(new Array(3) == new Number(-0.0));
write(new Array(3) == new Number(+0.0));
write(new Array(3) == new Number(1));
write(new Array(3) == new Number(10));
write(new Array(3) == new Number(10.0));
write(new Array(3) == new Number(10.1));
write(new Array(3) == new Number(-1));
write(new Array(3) == new Number(-10));
write(new Array(3) == new Number(-10.0));
write(new Array(3) == new Number(-10.1));
write(new Array(3) == new Number(Number.MAX_VALUE));
write(new Array(3) == new Number(Number.MIN_VALUE));
write(new Array(3) == new Number(Number.NaN));
write(new Array(3) == new Number(Number.POSITIVE_INFINITY));
write(new Array(3) == new Number(Number.NEGATIVE_INFINITY));
write(new Array(3) == '');
write(new Array(3) == 0xa);
write(new Array(3) == 04);
write(new Array(3) == 'hello');
write(new Array(3) == 'hel' + 'lo');
write(new Array(3) == String(''));
write(new Array(3) == String('hello'));
write(new Array(3) == String('h' + 'ello'));
write(new Array(3) == new String(''));
write(new Array(3) == new String('hello'));
write(new Array(3) == new String('he' + 'llo'));
write(new Array(3) == new Object());
write(new Array(3) == new Object());
write(new Array(3) == [1, 2, 3]);
write(new Array(3) == [1 ,2 , 3]);
write(new Array(3) == new Array(3));
write(new Array(3) == Array(3));
write(new Array(3) == new Array(1 ,2 ,3));
write(new Array(3) == Array(1));
write(new Array(3) == foo);
write(Array(3) == undefined);
write(Array(3) == null);
write(Array(3) == true);
write(Array(3) == false);
write(Array(3) == Boolean(true));
write(Array(3) == Boolean(false));
write(Array(3) == new Boolean(true));
write(Array(3) == new Boolean(false));
write(Array(3) == NaN);
write(Array(3) == +0);
write(Array(3) == -0);
write(Array(3) == 0);
write(Array(3) == 0.0);
write(Array(3) == -0.0);
write(Array(3) == +0.0);
write(Array(3) == 1);
write(Array(3) == 10);
write(Array(3) == 10.0);
write(Array(3) == 10.1);
write(Array(3) == -1);
write(Array(3) == -10);
write(Array(3) == -10.0);
write(Array(3) == -10.1);
write(Array(3) == Number.MAX_VALUE);
write(Array(3) == Number.MIN_VALUE);
write(Array(3) == Number.NaN);
write(Array(3) == Number.POSITIVE_INFINITY);
write(Array(3) == Number.NEGATIVE_INFINITY);
write(Array(3) == new Number(NaN));
write(Array(3) == new Number(+0));
write(Array(3) == new Number(-0));
write(Array(3) == new Number(0));
write(Array(3) == new Number(0.0));
write(Array(3) == new Number(-0.0));
write(Array(3) == new Number(+0.0));
write(Array(3) == new Number(1));
write(Array(3) == new Number(10));
write(Array(3) == new Number(10.0));
write(Array(3) == new Number(10.1));
write(Array(3) == new Number(-1));
write(Array(3) == new Number(-10));
write(Array(3) == new Number(-10.0));
write(Array(3) == new Number(-10.1));
write(Array(3) == new Number(Number.MAX_VALUE));
write(Array(3) == new Number(Number.MIN_VALUE));
write(Array(3) == new Number(Number.NaN));
write(Array(3) == new Number(Number.POSITIVE_INFINITY));
write(Array(3) == new Number(Number.NEGATIVE_INFINITY));
write(Array(3) == '');
write(Array(3) == 0xa);
write(Array(3) == 04);
write(Array(3) == 'hello');
write(Array(3) == 'hel' + 'lo');
write(Array(3) == String(''));
write(Array(3) == String('hello'));
write(Array(3) == String('h' + 'ello'));
write(Array(3) == new String(''));
write(Array(3) == new String('hello'));
write(Array(3) == new String('he' + 'llo'));
write(Array(3) == new Object());
write(Array(3) == new Object());
write(Array(3) == [1, 2, 3]);
write(Array(3) == [1 ,2 , 3]);
write(Array(3) == new Array(3));
write(Array(3) == Array(3));
write(Array(3) == new Array(1 ,2 ,3));
write(Array(3) == Array(1));
write(Array(3) == foo);
write(new Array(1 ,2 ,3) == undefined);
write(new Array(1 ,2 ,3) == null);
write(new Array(1 ,2 ,3) == true);
write(new Array(1 ,2 ,3) == false);
write(new Array(1 ,2 ,3) == Boolean(true));
write(new Array(1 ,2 ,3) == Boolean(false));
write(new Array(1 ,2 ,3) == new Boolean(true));
write(new Array(1 ,2 ,3) == new Boolean(false));
write(new Array(1 ,2 ,3) == NaN);
write(new Array(1 ,2 ,3) == +0);
write(new Array(1 ,2 ,3) == -0);
write(new Array(1 ,2 ,3) == 0);
write(new Array(1 ,2 ,3) == 0.0);
write(new Array(1 ,2 ,3) == -0.0);
write(new Array(1 ,2 ,3) == +0.0);
write(new Array(1 ,2 ,3) == 1);
write(new Array(1 ,2 ,3) == 10);
write(new Array(1 ,2 ,3) == 10.0);
write(new Array(1 ,2 ,3) == 10.1);
write(new Array(1 ,2 ,3) == -1);
write(new Array(1 ,2 ,3) == -10);
write(new Array(1 ,2 ,3) == -10.0);
write(new Array(1 ,2 ,3) == -10.1);
write(new Array(1 ,2 ,3) == Number.MAX_VALUE);
write(new Array(1 ,2 ,3) == Number.MIN_VALUE);
write(new Array(1 ,2 ,3) == Number.NaN);
write(new Array(1 ,2 ,3) == Number.POSITIVE_INFINITY);
write(new Array(1 ,2 ,3) == Number.NEGATIVE_INFINITY);
write(new Array(1 ,2 ,3) == new Number(NaN));
write(new Array(1 ,2 ,3) == new Number(+0));
write(new Array(1 ,2 ,3) == new Number(-0));
write(new Array(1 ,2 ,3) == new Number(0));
write(new Array(1 ,2 ,3) == new Number(0.0));
write(new Array(1 ,2 ,3) == new Number(-0.0));
write(new Array(1 ,2 ,3) == new Number(+0.0));
write(new Array(1 ,2 ,3) == new Number(1));
write(new Array(1 ,2 ,3) == new Number(10));
write(new Array(1 ,2 ,3) == new Number(10.0));
write(new Array(1 ,2 ,3) == new Number(10.1));
write(new Array(1 ,2 ,3) == new Number(-1));
write(new Array(1 ,2 ,3) == new Number(-10));
write(new Array(1 ,2 ,3) == new Number(-10.0));
write(new Array(1 ,2 ,3) == new Number(-10.1));
write(new Array(1 ,2 ,3) == new Number(Number.MAX_VALUE));
write(new Array(1 ,2 ,3) == new Number(Number.MIN_VALUE));
write(new Array(1 ,2 ,3) == new Number(Number.NaN));
write(new Array(1 ,2 ,3) == new Number(Number.POSITIVE_INFINITY));
write(new Array(1 ,2 ,3) == new Number(Number.NEGATIVE_INFINITY));
write(new Array(1 ,2 ,3) == '');
write(new Array(1 ,2 ,3) == 0xa);
write(new Array(1 ,2 ,3) == 04);
write(new Array(1 ,2 ,3) == 'hello');
write(new Array(1 ,2 ,3) == 'hel' + 'lo');
write(new Array(1 ,2 ,3) == String(''));
write(new Array(1 ,2 ,3) == String('hello'));
write(new Array(1 ,2 ,3) == String('h' + 'ello'));
write(new Array(1 ,2 ,3) == new String(''));
write(new Array(1 ,2 ,3) == new String('hello'));
write(new Array(1 ,2 ,3) == new String('he' + 'llo'));
write(new Array(1 ,2 ,3) == new Object());
write(new Array(1 ,2 ,3) == new Object());
write(new Array(1 ,2 ,3) == [1, 2, 3]);
write(new Array(1 ,2 ,3) == [1 ,2 , 3]);
write(new Array(1 ,2 ,3) == new Array(3));
write(new Array(1 ,2 ,3) == Array(3));
write(new Array(1 ,2 ,3) == new Array(1 ,2 ,3));
write(new Array(1 ,2 ,3) == Array(1));
write(new Array(1 ,2 ,3) == foo);
write(Array(1) == undefined);
write(Array(1) == null);
write(Array(1) == true);
write(Array(1) == false);
write(Array(1) == Boolean(true));
write(Array(1) == Boolean(false));
write(Array(1) == new Boolean(true));
write(Array(1) == new Boolean(false));
write(Array(1) == NaN);
write(Array(1) == +0);
write(Array(1) == -0);
write(Array(1) == 0);
write(Array(1) == 0.0);
write(Array(1) == -0.0);
write(Array(1) == +0.0);
write(Array(1) == 1);
write(Array(1) == 10);
write(Array(1) == 10.0);
write(Array(1) == 10.1);
write(Array(1) == -1);
write(Array(1) == -10);
write(Array(1) == -10.0);
write(Array(1) == -10.1);
write(Array(1) == Number.MAX_VALUE);
write(Array(1) == Number.MIN_VALUE);
write(Array(1) == Number.NaN);
write(Array(1) == Number.POSITIVE_INFINITY);
write(Array(1) == Number.NEGATIVE_INFINITY);
write(Array(1) == new Number(NaN));
write(Array(1) == new Number(+0));
write(Array(1) == new Number(-0));
write(Array(1) == new Number(0));
write(Array(1) == new Number(0.0));
write(Array(1) == new Number(-0.0));
write(Array(1) == new Number(+0.0));
write(Array(1) == new Number(1));
write(Array(1) == new Number(10));
write(Array(1) == new Number(10.0));
write(Array(1) == new Number(10.1));
write(Array(1) == new Number(-1));
write(Array(1) == new Number(-10));
write(Array(1) == new Number(-10.0));
write(Array(1) == new Number(-10.1));
write(Array(1) == new Number(Number.MAX_VALUE));
write(Array(1) == new Number(Number.MIN_VALUE));
write(Array(1) == new Number(Number.NaN));
write(Array(1) == new Number(Number.POSITIVE_INFINITY));
write(Array(1) == new Number(Number.NEGATIVE_INFINITY));
write(Array(1) == '');
write(Array(1) == 0xa);
write(Array(1) == 04);
write(Array(1) == 'hello');
write(Array(1) == 'hel' + 'lo');
write(Array(1) == String(''));
write(Array(1) == String('hello'));
write(Array(1) == String('h' + 'ello'));
write(Array(1) == new String(''));
write(Array(1) == new String('hello'));
write(Array(1) == new String('he' + 'llo'));
write(Array(1) == new Object());
write(Array(1) == new Object());
write(Array(1) == [1, 2, 3]);
write(Array(1) == [1 ,2 , 3]);
write(Array(1) == new Array(3));
write(Array(1) == Array(3));
write(Array(1) == new Array(1 ,2 ,3));
write(Array(1) == Array(1));
write(Array(1) == foo);
write(foo == undefined);
write(foo == null);
write(foo == true);
write(foo == false);
write(foo == Boolean(true));
write(foo == Boolean(false));
write(foo == new Boolean(true));
write(foo == new Boolean(false));
write(foo == NaN);
write(foo == +0);
write(foo == -0);
write(foo == 0);
write(foo == 0.0);
write(foo == -0.0);
write(foo == +0.0);
write(foo == 1);
write(foo == 10);
write(foo == 10.0);
write(foo == 10.1);
write(foo == -1);
write(foo == -10);
write(foo == -10.0);
write(foo == -10.1);
write(foo == Number.MAX_VALUE);
write(foo == Number.MIN_VALUE);
write(foo == Number.NaN);
write(foo == Number.POSITIVE_INFINITY);
write(foo == Number.NEGATIVE_INFINITY);
write(foo == new Number(NaN));
write(foo == new Number(+0));
write(foo == new Number(-0));
write(foo == new Number(0));
write(foo == new Number(0.0));
write(foo == new Number(-0.0));
write(foo == new Number(+0.0));
write(foo == new Number(1));
write(foo == new Number(10));
write(foo == new Number(10.0));
write(foo == new Number(10.1));
write(foo == new Number(-1));
write(foo == new Number(-10));
write(foo == new Number(-10.0));
write(foo == new Number(-10.1));
write(foo == new Number(Number.MAX_VALUE));
write(foo == new Number(Number.MIN_VALUE));
write(foo == new Number(Number.NaN));
write(foo == new Number(Number.POSITIVE_INFINITY));
write(foo == new Number(Number.NEGATIVE_INFINITY));
write(foo == '');
write(foo == 0xa);
write(foo == 04);
write(foo == 'hello');
write(foo == 'hel' + 'lo');
write(foo == String(''));
write(foo == String('hello'));
write(foo == String('h' + 'ello'));
write(foo == new String(''));
write(foo == new String('hello'));
write(foo == new String('he' + 'llo'));
write(foo == new Object());
write(foo == new Object());
write(foo == [1, 2, 3]);
write(foo == [1 ,2 , 3]);
write(foo == new Array(3));
write(foo == Array(3));
write(foo == new Array(1 ,2 ,3));
write(foo == Array(1));
write(foo == foo);
