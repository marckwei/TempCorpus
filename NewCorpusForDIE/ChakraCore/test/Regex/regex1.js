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

function write(v) { WScript.Echo(v + ""); }

var groups = {};

function Assert(condition, category)
{
    if (!groups[category]) {
        groups[category] = 1;
    } else {
        groups[category]++;
    }

    if (!condition) {
        write(category + " test " + groups[category] + " failed");
    } else {
        write(category + " test " + groups[category] + " passed");
    }
}

write("regex test1");

var re = /a/;
var str = new String("abcda");
if (re.test(str)) {
    write("  regex.test pass");
}
else {
    write(" regex.test fail");
}

if (str.match(re)) {
    write("  string.match pass");
}
else {
    write(" string.match fail");
}
var array = re.exec(str);
write(" string.exec : " + array);


var s = "";
var a = s.split(/\s+/);
write("a.length : " + a.length);
write("a[0]:" + a[0]);

var reTemp = /abc/i;
var re = new RegExp(reTemp, "g");
var tmp = "abcdef".replace(re, "");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/i, "g");
var tmp = "abcdef".match(re);
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g);
re.exec("abcdef");
Assert(re.lastIndex == 3, "lastIndex");

var re = /abc/;
re.exec("abcdef");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g, "i");
Assert(re.global == false, "global");
Assert(re.ignoreCase == true, "ignoreCase");

var re = /abc/i;
var re1 = new RegExp(re, "gm");
Assert(re.global == false, "global");
Assert(re.multiline == false, "multiline");
Assert(re.ignoreCase == true, "ignoreCase");
Assert(re1.global == true, "global");
Assert(re1.multiline == true, "multiline");
Assert(re1.ignoreCase == false, "ignoreCase");

var exceptionThrown = false;
try 
{
    var re = new RegExp(/a/g, "ab");
} 
catch (ex) 
{
    exceptionThrown = true;
}
Assert(exceptionThrown, "invalid flags");

var re = /(ab)/g

"abc     ".match(re);
Assert(RegExp.$1 == "ab", "lastIndex");

var re = /test/;
var exceptionThrown = false;
try
{
    re.lastIndex = { toString: function() { throw "an exception string"; } }
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == false, "lastIndex");

exceptionThrown = false;

try
{
    Write("LastIndex is " + re.lastIndex);
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == true, "lastIndex");

function testsc(r, s) {
    if (!r.test(s))
        write("invalid interpretation of '" + r + "'");
}

testsc(/^\cA$/, "\x01");
testsc(/^[\cA]$/, "\x01");
testsc(/^\c1$/, "\\c1");
testsc(/^\c$/, "\\c");
testsc(/\c/, "\\c");
testsc(/^\c\1$/, "\\c\x01");
testsc(/\c/, "\\c");
testsc(/^[\c1]$/, "\x11");
testsc(/^[\c]$/, "c");
testsc(/^[\c]]$/, "c]");
testsc(/^[\c-e]+$/, "cde");

//Octal handling
testsc(/^\777$/, "\x3F7");
testsc(/^\777$/, "\777");
testsc(/^\170$/, "x");

//Octal handling test for values > 127
c=[/[\300-\306]/g,"A",/[\340-\346]/g,"a",/\307/g,"C",/\347/g,"c",/[\310-\313]/g,"E",/[\350-\353]/g,"e",/[\314-\317]/g,"I",/[\354-\357]/g,"i",/\321/g,"N",/\361/g,"n",/[\322-\330]/g,"O",/[\362-\370]/g,"o",/[\331-\334]/g,"U",/[\371-\374]/g,"u"];

//Negation of empty char set [^] test
write("aa".match(/([^])(\1)/));

write(/^.+ ab/g.exec(" ab"))
write(/^.+a /.exec("a "))
write(/^.+ax/.exec("ax"))




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

var groups = {};

function Assert(condition, category)
{
    if (!groups[category]) {
        groups[category] = 1;
    } else {
        groups[category]++;
    }

    if (!condition) {
        write(category + " test " + groups[category] + " failed");
    } else {
        write(category + " test " + groups[category] + " passed");
    }
}

write("regex test1");

var re = /a/;
var str = new String("abcda");
if (re.test(str)) {
    write("  regex.test pass");
}
else {
    write(" regex.test fail");
}

if (str.match(re)) {
    write("  string.match pass");
}
else {
    write(" string.match fail");
}
var array = re.exec(str);
write(" string.exec : " + array);


var s = "";
var a = s.split(/\s+/);
write("a.length : " + a.length);
write("a[0]:" + a[0]);

var reTemp = /abc/i;
var re = new RegExp(reTemp, "g");
var tmp = "abcdef".replace(re, "");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/i, "g");
var tmp = "abcdef".match(re);
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g);
re.exec("abcdef");
Assert(re.lastIndex == 3, "lastIndex");

var re = /abc/;
re.exec("abcdef");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g, "i");
Assert(re.global == false, "global");
Assert(re.ignoreCase == true, "ignoreCase");

var re = /abc/i;
var re1 = new RegExp(re, "gm");
Assert(re.global == false, "global");
Assert(re.multiline == false, "multiline");
Assert(re.ignoreCase == true, "ignoreCase");
Assert(re1.global == true, "global");
Assert(re1.multiline == true, "multiline");
Assert(re1.ignoreCase == false, "ignoreCase");

var exceptionThrown = false;
try 
{
    var re = new RegExp(/a/g, "ab");
} 
catch (ex) 
{
    exceptionThrown = true;
}
Assert(exceptionThrown, "invalid flags");

var re = /(ab)/g

"abc     ".match(re);
Assert(RegExp.$1 == "ab", "lastIndex");

var re = /test/;
var exceptionThrown = false;
try
{
    re.lastIndex = { toString: function() { throw "an exception string"; } }
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == false, "lastIndex");

exceptionThrown = false;

try
{
    Write("LastIndex is " + re.lastIndex);
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == true, "lastIndex");

function testsc(r, s) {
    if (!r.test(s))
        write("invalid interpretation of '" + r + "'");
}

testsc(/^\cA$/, "\x01");
testsc(/^[\cA]$/, "\x01");
testsc(/^\c1$/, "\\c1");
testsc(/^\c$/, "\\c");
testsc(/\c/, "\\c");
testsc(/^\c\1$/, "\\c\x01");
testsc(/\c/, "\\c");
testsc(/^[\c1]$/, "\x11");
testsc(/^[\c]$/, "c");
testsc(/^[\c]]$/, "c]");
testsc(/^[\c-e]+$/, "cde");

//Octal handling
testsc(/^\777$/, "\x3F7");
testsc(/^\777$/, "\777");
testsc(/^\170$/, "x");

//Octal handling test for values > 127
c=[/[\300-\306]/g,"A",/[\340-\346]/g,"a",/\307/g,"C",/\347/g,"c",/[\310-\313]/g,"E",/[\350-\353]/g,"e",/[\314-\317]/g,"I",/[\354-\357]/g,"i",/\321/g,"N",/\361/g,"n",/[\322-\330]/g,"O",/[\362-\370]/g,"o",/[\331-\334]/g,"U",/[\371-\374]/g,"u"];

//Negation of empty char set [^] test
write("aa".match(/([^])(\1)/));

write(/^.+ ab/g.exec(" ab"))
write(/^.+a /.exec("a "))
write(/^.+ax/.exec("ax"))




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

var groups = {};

function Assert(condition, category)
{
    if (!groups[category]) {
        groups[category] = 1;
    } else {
        groups[category]++;
    }

    if (!condition) {
        write(category + " test " + groups[category] + " failed");
    } else {
        write(category + " test " + groups[category] + " passed");
    }
}

write("regex test1");

var re = /a/;
var str = new String("abcda");
if (re.test(str)) {
    write("  regex.test pass");
}
else {
    write(" regex.test fail");
}

if (str.match(re)) {
    write("  string.match pass");
}
else {
    write(" string.match fail");
}
var array = re.exec(str);
write(" string.exec : " + array);


var s = "";
var a = s.split(/\s+/);
write("a.length : " + a.length);
write("a[0]:" + a[0]);

var reTemp = /abc/i;
var re = new RegExp(reTemp, "g");
var tmp = "abcdef".replace(re, "");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/i, "g");
var tmp = "abcdef".match(re);
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g);
re.exec("abcdef");
Assert(re.lastIndex == 3, "lastIndex");

var re = /abc/;
re.exec("abcdef");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g, "i");
Assert(re.global == false, "global");
Assert(re.ignoreCase == true, "ignoreCase");

var re = /abc/i;
var re1 = new RegExp(re, "gm");
Assert(re.global == false, "global");
Assert(re.multiline == false, "multiline");
Assert(re.ignoreCase == true, "ignoreCase");
Assert(re1.global == true, "global");
Assert(re1.multiline == true, "multiline");
Assert(re1.ignoreCase == false, "ignoreCase");

var exceptionThrown = false;
try 
{
    var re = new RegExp(/a/g, "ab");
} 
catch (ex) 
{
    exceptionThrown = true;
}
Assert(exceptionThrown, "invalid flags");

var re = /(ab)/g

"abc     ".match(re);
Assert(RegExp.$1 == "ab", "lastIndex");

var re = /test/;
var exceptionThrown = false;
try
{
    re.lastIndex = { toString: function() { throw "an exception string"; } }
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == false, "lastIndex");

exceptionThrown = false;

try
{
    Write("LastIndex is " + re.lastIndex);
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == true, "lastIndex");

function testsc(r, s) {
    if (!r.test(s))
        write("invalid interpretation of '" + r + "'");
}

testsc(/^\cA$/, "\x01");
testsc(/^[\cA]$/, "\x01");
testsc(/^\c1$/, "\\c1");
testsc(/^\c$/, "\\c");
testsc(/\c/, "\\c");
testsc(/^\c\1$/, "\\c\x01");
testsc(/\c/, "\\c");
testsc(/^[\c1]$/, "\x11");
testsc(/^[\c]$/, "c");
testsc(/^[\c]]$/, "c]");
testsc(/^[\c-e]+$/, "cde");

//Octal handling
testsc(/^\777$/, "\x3F7");
testsc(/^\777$/, "\777");
testsc(/^\170$/, "x");

//Octal handling test for values > 127
c=[/[\300-\306]/g,"A",/[\340-\346]/g,"a",/\307/g,"C",/\347/g,"c",/[\310-\313]/g,"E",/[\350-\353]/g,"e",/[\314-\317]/g,"I",/[\354-\357]/g,"i",/\321/g,"N",/\361/g,"n",/[\322-\330]/g,"O",/[\362-\370]/g,"o",/[\331-\334]/g,"U",/[\371-\374]/g,"u"];

//Negation of empty char set [^] test
write("aa".match(/([^])(\1)/));

write(/^.+ ab/g.exec(" ab"))
write(/^.+a /.exec("a "))
write(/^.+ax/.exec("ax"))




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

var groups = {};

function Assert(condition, category)
{
    if (!groups[category]) {
        groups[category] = 1;
    } else {
        groups[category]++;
    }

    if (!condition) {
        write(category + " test " + groups[category] + " failed");
    } else {
        write(category + " test " + groups[category] + " passed");
    }
}

write("regex test1");

var re = /a/;
var str = new String("abcda");
if (re.test(str)) {
    write("  regex.test pass");
}
else {
    write(" regex.test fail");
}

if (str.match(re)) {
    write("  string.match pass");
}
else {
    write(" string.match fail");
}
var array = re.exec(str);
write(" string.exec : " + array);


var s = "";
var a = s.split(/\s+/);
write("a.length : " + a.length);
write("a[0]:" + a[0]);

var reTemp = /abc/i;
var re = new RegExp(reTemp, "g");
var tmp = "abcdef".replace(re, "");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/i, "g");
var tmp = "abcdef".match(re);
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g);
re.exec("abcdef");
Assert(re.lastIndex == 3, "lastIndex");

var re = /abc/;
re.exec("abcdef");
Assert(re.lastIndex == 0, "lastIndex");

var re = new RegExp(/abc/g, "i");
Assert(re.global == false, "global");
Assert(re.ignoreCase == true, "ignoreCase");

var re = /abc/i;
var re1 = new RegExp(re, "gm");
Assert(re.global == false, "global");
Assert(re.multiline == false, "multiline");
Assert(re.ignoreCase == true, "ignoreCase");
Assert(re1.global == true, "global");
Assert(re1.multiline == true, "multiline");
Assert(re1.ignoreCase == false, "ignoreCase");

var exceptionThrown = false;
try 
{
    var re = new RegExp(/a/g, "ab");
} 
catch (ex) 
{
    exceptionThrown = true;
}
Assert(exceptionThrown, "invalid flags");

var re = /(ab)/g

"abc     ".match(re);
Assert(RegExp.$1 == "ab", "lastIndex");

var re = /test/;
var exceptionThrown = false;
try
{
    re.lastIndex = { toString: function() { throw "an exception string"; } }
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == false, "lastIndex");

exceptionThrown = false;

try
{
    Write("LastIndex is " + re.lastIndex);
}
catch (ex)
{
    exceptionThrown = true;
}

Assert(exceptionThrown == true, "lastIndex");

function testsc(r, s) {
    if (!r.test(s))
        write("invalid interpretation of '" + r + "'");
}

testsc(/^\cA$/, "\x01");
testsc(/^[\cA]$/, "\x01");
testsc(/^\c1$/, "\\c1");
testsc(/^\c$/, "\\c");
testsc(/\c/, "\\c");
testsc(/^\c\1$/, "\\c\x01");
testsc(/\c/, "\\c");
testsc(/^[\c1]$/, "\x11");
testsc(/^[\c]$/, "c");
testsc(/^[\c]]$/, "c]");
testsc(/^[\c-e]+$/, "cde");

//Octal handling
testsc(/^\777$/, "\x3F7");
testsc(/^\777$/, "\777");
testsc(/^\170$/, "x");

//Octal handling test for values > 127
c=[/[\300-\306]/g,"A",/[\340-\346]/g,"a",/\307/g,"C",/\347/g,"c",/[\310-\313]/g,"E",/[\350-\353]/g,"e",/[\314-\317]/g,"I",/[\354-\357]/g,"i",/\321/g,"N",/\361/g,"n",/[\322-\330]/g,"O",/[\362-\370]/g,"o",/[\331-\334]/g,"U",/[\371-\374]/g,"u"];

//Negation of empty char set [^] test
write("aa".match(/([^])(\1)/));

write(/^.+ ab/g.exec(" ab"))
write(/^.+a /.exec("a "))
write(/^.+ax/.exec("ax"))



