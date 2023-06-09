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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Rest parsing and errors",
    body: function () {
      assert.throws(function () { eval("function foo(...a, ...b) {}")},          SyntaxError,    "More than one rest parameter throws", "The rest parameter must be the last parameter in a formals list.");
      assert.throws(function () { eval("function foo(...[a], ...b) {}")},          SyntaxError,    "More than one rest parameter throws", "The rest parameter must be the last parameter in a formals list.");
      assert.throws(function () { eval("function foo(...a, ...[b]) {}")},          SyntaxError,    "More than one rest parameter throws", "The rest parameter must be the last parameter in a formals list.");
      assert.throws(function () { eval("function foo(a, ...b, c) => {}")},       SyntaxError,    "Rest parameter not in the last position throws", "The rest parameter must be the last parameter in a formals list.");
      assert.throws(function () { eval("function foo(a, ...[b], c) => {}")},       SyntaxError,    "Rest pattern parameter not in the last position throws", "The rest parameter must be the last parameter in a formals list.");
      assert.throws(function () { eval("var obj = class { method(a, b = 1, ...c = [2,3]) {} };")},         SyntaxError, "Rest parameter cannot have a default value");
      assert.throws(function () { eval("function f(c, a, ...a) { }")},           SyntaxError,    "Duplicate parameters are not allowed for non-simple parameter list with only rest", "Duplicate formal parameter names not allowed in this context");
      assert.throws(function () { eval("function f(c, a, ...[a]) { }")},           SyntaxError,    "Duplicate parameters are not allowed for non-simple parameter list with rest array pattern", "Let/Const redeclaration");
      assert.throws(function () { eval("function f(c, a, ...{b:a}) { }")},           SyntaxError,    "Duplicate parameters are not allowed for non-simple parameter list with rest object pattern", "Let/Const redeclaration");
      assert.throws(function () { eval("function f(c = 10, a, ...a) { }")},      SyntaxError,    "Duplicate parameters are not allowed for non-simple parameter list with both rest and default", "Duplicate formal parameter names not allowed in this context");
      assert.throws(function () { eval("function f(...a) { 'use strict'; }"); },          SyntaxError, "Strict mode cannot be applied to functions with rest parameter", "Illegal 'use strict' directive in function with non-simple parameter list");
      assert.throws(function () { eval("function f(a, ...b) { 'use strict'; }"); },       SyntaxError, "Strict mode cannot be applied to functions with rest parameter", "Illegal 'use strict' directive in function with non-simple parameter list");
      assert.throws(function () { eval("function f(a, ...[b]) { 'use strict'; }"); },       SyntaxError, "Strict mode cannot be applied to functions with rest parameter", "Illegal 'use strict' directive in function with non-simple parameter list");
      assert.throws(function () { eval("function f() { \"use strict\"; function g(a, b, c, ...a) { } }")}, SyntaxError, "Cannot have duplicate parameters for a function with non-simple parameter list, which is already in strict mode", "Duplicate formal parameter names not allowed in strict mode");
      assert.throws(function () { eval("function f() { \"use strict\"; function g(a, b, a, ...c) { } }")}, SyntaxError, "Cannot have duplicate parameters for a function with non-simple parameter list with rest, which is already in strict mode", "Duplicate formal parameter names not allowed in strict mode");

      assert.throws(function () { eval("function foo(a = b, ...b) {}; foo();")}, ReferenceError, "Rest parameters cannot be referenced in default expressions (use before declaration)", "Use before declaration");
      assert.throws(function () { eval("function foo(a = b, ...[b]) {}; foo();")}, ReferenceError, "Rest parameters cannot be referenced in default expressions (use before declaration)", "Use before declaration");
      assert.throws(function () { eval("function foo(a = b, ...{c:b}) {}; foo();")}, ReferenceError, "Rest parameters cannot be referenced in default expressions (use before declaration)", "Use before declaration");

      // Redeclaration errors - non-simple in this case means any parameter list with a rest parameter
      assert.doesNotThrow(function () { eval("function foo(...a) { var a; }"); },
                    "Var redeclaration does not throw with a non-simple parameter list");
      assert.doesNotThrow(function () { eval("function foo(...[a]) { var a; }"); },
                    "Var redeclaration does not throw with a non-simple parameter list");
      assert.doesNotThrow(function () { eval("function foo(a, ...b) { var a; }"); },
                    "Var redeclaration does not throw with a non-simple parameter list on a non-rest parameter");
      assert.throws(function () { function foo(...a) { eval('var a;'); }; foo(); },
          ReferenceError,
          "Var redeclaration throws with a non-simple parameter list inside an eval",
          "Let/Const redeclaration");
      assert.throws(function () { function foo(...[a]) { eval('var a;'); }; foo(); },
          ReferenceError,
          "Var redeclaration throws with a non-simple parameter list inside an eval",
          "Let/Const redeclaration");
      assert.throws(function () { function foo(a, ...b) { eval('var b;'); }; foo(); },
          ReferenceError,
          "Var redeclaration throws with a non-simple parameter list inside an eval",
          "Let/Const redeclaration");
      assert.throws(function () { function foo(a = 1, ...b) { eval('var b;'); }; foo(); },
          ReferenceError,
          "Var redeclaration throws with a non-simple parameter list inside an eval",
          "Let/Const redeclaration");
      assert.throws(function () { function foo(a, b = 1, ...c) { eval('var c;'); }; foo(); },
          ReferenceError,
          "Var redeclaration throws with a non-simple parameter list inside an eval",
          "Let/Const redeclaration");

      assert.doesNotThrow(function () { function foo(...a) { eval('let a;'); }; foo(); }, "Let redeclaration inside an eval does not throw with a non-simple parameter list");
      assert.doesNotThrow(function () { function foo(...[a]) { eval('let a;'); }; foo(); }, "Let redeclaration inside an eval does not throw with a non-simple parameter list");
      assert.doesNotThrow(function () { function foo(...a) { eval('const a = "str";'); }; foo() }, "Const redeclaration inside an eval does not throw with a non-simple parameter list");
      assert.throws(function () { function foo(a, ...b) { eval('var a;'); }; foo(); },
                    ReferenceError,
                    "Var redeclaration throws with a non-simple parameter list on a non-rest parameter inside eval",
                    "Let/Const redeclaration");
      assert.doesNotThrow(function () { function foo(...a) { eval('let a;'); }; foo(); }, "Let redeclaration of a non-default parameter inside an eval does not throw with a non-simple parameter list");
      assert.doesNotThrow(function () { function foo(...a) { eval('const a = 0;'); }; foo(); }, "Const redeclaration of a non-default parameter inside an eval does not throw with a non-simple parameter list");

      assert.doesNotThrow(function () { eval("function foo(a, ...args) { function args() { } }"); }, "Nested function redeclaration of a rest parameter does not throw");
      
      assert.throws(function () { eval("var x = { set setter(...x) {} }"); },
                    SyntaxError,
                    "Setter methods cannot have a rest parameter",
                    "Unexpected ... operator");
      assert.throws(function () { eval("var x = { set setter(...[x]) {} }"); },
                    SyntaxError,
                    "Setter methods cannot have a rest pattern parameter",
                    "Unexpected ... operator");
      assert.throws(function () { eval("var x = class { set setter(...x) {} }"); },
                    SyntaxError,
                    "Class setter methods cannot have a rest parameter",
                    "Unexpected ... operator");
      assert.throws(function () { eval("var x = class { set setter(...[x]) {} }"); },
                    SyntaxError,
                    "Class setter methods cannot have a rest parameter",
                    "Unexpected ... operator");

      // Default evaluation of 'this' should happen after the rest formal is assigned a register
      assert.doesNotThrow(function () { eval("function foo(a = this, ...b) {}"); }, "'this' referenced in formal defaults should not affect rest parameter");
      assert.doesNotThrow(function () { eval("function foo(a = this, ...[b]) {}"); }, "'this' referenced in formal defaults should not affect rest parameter");
    }
  },
  {
    name: "Rest basic uses and sanity checks",
    body: function () {
      function foo(a, b, c, ...rest) { return [a, b, c, ...rest]; }

      var bar = (a, b, c, ...rest) => [a, b, c, ...rest];

      class restClass {
        method(a, b, c, ...rest) { return [a, b, c, ...rest]; }
      };
      var baz = new restClass();

      var obj = {
        method(a, b, c, ...rest) { return [a, b, c, ...rest]; },
        evalMethod(a, b, c, ...rest) { return eval("[a, b, c, ...rest]"); }
      };

      var funcObj = new Function("a, b, c, ...rest", "return [a, b, c, ...rest]");

      function singleRest(...rest) { return rest; }

      assert.areEqual([1,2,undefined], foo(1,2),                    "Rest is an empty array with too few parameters to a function");
      assert.areEqual([1,2,3],         foo(1,2,3),                  "Rest is an empty array with the exact number of parameters to a function");
      assert.areEqual([1,2,3,4,5,6],   foo(1,2,3,4,5,6),            "Rest is a non-empty array with too many parameters to a function");

      assert.areEqual([1,2,undefined], bar(1,2),                    "Rest is an empty array with too few parameters to a lambda");
      assert.areEqual([1,2,3],         bar(1,2,3),                  "Rest is an empty array with the exact number of parameters to a lambda");
      assert.areEqual([1,2,3,4,5,6],   bar(1,2,3,4,5,6),            "Rest is a non-empty array with too many parameters to a lambda");

      assert.areEqual([1,2,undefined], baz.method(1,2),             "Rest is an empty array with too few parameters to a class method");
      assert.areEqual([1,2,3],         baz.method(1,2,3),           "Rest is an empty array with the exact number of parameters to a class method");
      assert.areEqual([1,2,3,4,5,6],   baz.method(1,2,3,4,5,6),     "Rest is a non-empty array with too many parameters to a class method");

      assert.areEqual([1,2,undefined], obj.method(1,2),             "Rest is an empty array with too few parameters to a method");
      assert.areEqual([1,2,3],         obj.method(1,2,3),           "Rest is an empty array with the exact number of parameters to a method");
      assert.areEqual([1,2,3,4,5,6],   obj.method(1,2,3,4,5,6),     "Rest is a non-empty array with too many parameters to a method");

      assert.areEqual([1,2,undefined], obj.method(1,2),             "Rest is an empty array with too few parameters to a method with an eval");
      assert.areEqual([1,2,3],         obj.method(1,2,3),           "Rest is an empty array with the exact number of parameters to a method with an eval");
      assert.areEqual([1,2,3,4,5,6],   obj.method(1,2,3,4,5,6),     "Rest is a non-empty array with too many parameters to a method with an eval");

      assert.areEqual([1,2,undefined], funcObj(1,2),                "Rest is an empty array with too few parameters to a function object");
      assert.areEqual([1,2,3],         funcObj(1,2,3),              "Rest is an empty array with the exact number of parameters to a function object");
      assert.areEqual([1,2,3,4,5,6],   funcObj(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a method with a function object");

      // The following takes a different path in the JIT
      assert.areEqual([1,2,3,4,5,6],   singleRest(1,2,3,4,5,6),     "Rest is a non-empty array with any parameters to a function with only a rest parameter");
    }
  },
  {
    name: "Rest pattern basic uses and sanity checks",
    body: function () {
      function foo(a, b, c, ...[d]) { return [a, b, c, d]; }

      var bar = (a, b, c, ...[d]) => [a, b, c, d];

      class restClass {
        method(a, b, c, ...[d]) { return [a, b, c, d]; }
      };
      var baz = new restClass();

      var obj = {
        method(a, b, c, ...[d]) { return [a, b, c, d]; },
        evalMethod(a, b, c, ...[d]) { return eval("[a, b, c, d]"); }
      };

      var funcObj = new Function("a, b, c, ...[d]", "return [a, b, c, d]");

      function singleRest(...[d]) { return d; }

      function objRest(...{'0': a, '1': b, length}) { return [a, b, length]; }

      assert.areEqual([1,2,undefined,undefined], foo(1,2),
        "Rest is an empty array with too few parameters to a function");
      assert.areEqual([1,2,3,undefined], foo(1,2,3),                  
        "Rest is an empty array with the exact number of parameters to a function");
      assert.areEqual([1,2,3,4], foo(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a function");

      assert.areEqual([1,2,undefined,undefined], bar(1,2),
        "Rest is an empty array with too few parameters to a lambda");
      assert.areEqual([1,2,3,undefined], bar(1,2,3),
        "Rest is an empty array with the exact number of parameters to a lambda");
      assert.areEqual([1,2,3,4], bar(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a lambda");

      assert.areEqual([1,2,undefined,undefined], baz.method(1,2),
        "Rest is an empty array with too few parameters to a class method");
      assert.areEqual([1,2,3, undefined], baz.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a class method");
      assert.areEqual([1,2,3,4], baz.method(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a class method");

      assert.areEqual([1,2,undefined,undefined], obj.method(1,2),
        "Rest is an empty array with too few parameters to a method");
      assert.areEqual([1,2,3,undefined], obj.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a method");
      assert.areEqual([1,2,3,4], obj.method(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a method");

      assert.areEqual([1,2,undefined, undefined], obj.method(1,2),
        "Rest is an empty array with too few parameters to a method with an eval");
      assert.areEqual([1,2,3, undefined], obj.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a method with an eval");
      assert.areEqual([1,2,3,4], obj.method(1,2,3,4,5,6), 
        "Rest is a non-empty array with too many parameters to a method with an eval");

      assert.areEqual([1,2,undefined,undefined], funcObj(1,2),
        "Rest is an empty array with too few parameters to a function object");
      assert.areEqual([1,2,3,undefined], funcObj(1,2,3),
        "Rest is an empty array with the exact number of parameters to a function object");
      assert.areEqual([1,2,3,4], funcObj(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a method with a function object");

      // The following takes a different path in the JIT
      assert.areEqual(1, singleRest(1,2,3,4,5,6),
        "Rest is a non-empty array with any parameters to a function with only a rest parameter");
      
      assert.areEqual([1, 2, 4], objRest(1, 2, 3, 4),
        "Rest with an object pattern destructures the rest array");
    }
  },
  {
    name: "Rest pattern uses with arguments and this references",
    body: function () {
      function foo(a, b, c, ...[d]) { arguments; return [a, b, c, d]; }
      function fooThis(a, b, c, ...[d]) { this; return [a, b, c, d]; }

      var bar = (a, b, c, ...[d]) => { arguments; return [a, b, c, d] };

      class restClass {
        method(a, b, c, ...[d]) { arguments; return [a, b, c, d]; }
      };
      var baz = new restClass();

      var obj = {
        method(a, b, c, ...[d]) { arguments; return [a, b, c, d]; },
        evalMethod(a, b, c, ...[d]) { arguments; return eval("[a, b, c, d]"); }
      };

      function testScopeSlots(a, b, c, ...[d]) {
        function sub() {
          return [a, b, c, d];
        }
        arguments;
        return sub();
      }

      assert.areEqual([1,2,undefined,undefined], foo(1,2),
        "Rest is an empty array with too few parameters to a function");
      assert.areEqual([1,2,3,undefined], foo(1,2,3),                  
        "Rest is an empty array with the exact number of parameters to a function");
      assert.areEqual([1,2,3,4], foo(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a function");
      
      assert.areEqual([1,2,undefined,undefined], fooThis(1,2),
        "Rest is an empty array with too few parameters to a function");
      assert.areEqual([1,2,3,undefined], fooThis(1,2,3),                  
        "Rest is an empty array with the exact number of parameters to a function");
      assert.areEqual([1,2,3,4], fooThis(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a function");

      assert.areEqual([1,2,undefined,undefined], bar(1,2),
        "Rest is an empty array with too few parameters to a lambda");
      assert.areEqual([1,2,3,undefined], bar(1,2,3),
        "Rest is an empty array with the exact number of parameters to a lambda");
      assert.areEqual([1,2,3,4], bar(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a lambda");

      assert.areEqual([1,2,undefined,undefined], baz.method(1,2),
        "Rest is an empty array with too few parameters to a class method");
      assert.areEqual([1,2,3, undefined], baz.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a class method");
      assert.areEqual([1,2,3,4], baz.method(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a class method");

      assert.areEqual([1,2,undefined,undefined], obj.method(1,2),
        "Rest is an empty array with too few parameters to a method");
      assert.areEqual([1,2,3,undefined], obj.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a method");
      assert.areEqual([1,2,3,4], obj.method(1,2,3,4,5,6),
        "Rest is a non-empty array with too many parameters to a method");

      assert.areEqual([1,2,undefined, undefined], obj.method(1,2),
        "Rest is an empty array with too few parameters to a method with an eval");
      assert.areEqual([1,2,3, undefined], obj.method(1,2,3),
        "Rest is an empty array with the exact number of parameters to a method with an eval");
      assert.areEqual([1,2,3,4], obj.method(1,2,3,4,5,6), 
        "Rest is a non-empty array with too many parameters to a method with an eval");

      assert.areEqual([1,2,undefined,undefined], testScopeSlots(1,2),
        "Rest is an empty array with too few parameters to a function with a " +
        "reference to arguments using a sub function");
      assert.areEqual([1,2,3,undefined], testScopeSlots(1,2,3),
        "Rest is an empty array with the exact number of parameters to a function " +
        "with a reference to arguments using a sub function");
      assert.areEqual([1,2,3,4], testScopeSlots(1,2,3,4,5,6), 
        "Rest is a non-empty array with too many parameters to a function with a " +
        "reference to arguments using a sub function");
    }
  },
  {
    name: "Rest basic uses and sanity checks with an arguments reference",
    body: function () {
      function fooArgs(a, b, c, ...rest) { arguments; return [a, b, c, ...rest]; }

      var barArgs = (a, b, c, ...rest) => { arguments; return [a, b, c, ...rest]; }

      class restClass {
        methodArgs(a, b, c, ...rest) { arguments; return [a, b, c, ...rest]; }
      };
      var baz = new restClass();

      var obj = {
        methodArgs(a, b, c, ...rest) { arguments; return [a, b, c, ...rest]; },
        evalMethodArgs(a, b, c, ...rest) { arguments; return eval("[a, b, c, ...rest]"); }
      };

      function testScopeSlots(a, b, c, ...rest) {
        function sub() {
          return [a, b, c, ...rest];
        }
        arguments;
        return sub();
      }

      assert.areEqual([1,2,undefined], fooArgs(1,2),                "Rest is an empty array with too few parameters to a function with a reference to arguments");
      assert.areEqual([1,2,3],         fooArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a function with a reference to arguments");
      assert.areEqual([1,2,3,4,5,6],   fooArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a function with a reference to arguments");

      assert.areEqual([1,2,undefined], barArgs(1,2),                "Rest is an empty array with too few parameters to a lambda with a reference to arguments");
      assert.areEqual([1,2,3],         barArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a lambda with a reference to arguments");
      assert.areEqual([1,2,3,4,5,6],   barArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a lambda with a reference to arguments");

      assert.areEqual([1,2,undefined], baz.methodArgs(1,2),         "Rest is an empty array with too few parameters to a class method with a reference to arguments");
      assert.areEqual([1,2,3],         baz.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a class method with a reference to arguments");
      assert.areEqual([1,2,3,4,5,6],   baz.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a class method with a reference to arguments");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with a reference to arguments");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with a reference to arguments");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with a reference to arguments");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with eval and a reference to arguments");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with eval and  a reference to arguments");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with eval and a reference to arguments");

      assert.areEqual([1,2,undefined], testScopeSlots(1,2),         "Rest is an empty array with too few parameters to a function with a reference to arguments using a sub function");
      assert.areEqual([1,2,3],         testScopeSlots(1,2,3),       "Rest is an empty array with the exact number of parameters to a function with a reference to arguments using a sub function");
      assert.areEqual([1,2,3,4,5,6],   testScopeSlots(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a function with a reference to arguments using a sub function");
    }
  },
  {
    name: "Rest basic uses and sanity checks with a this reference",
    body: function () {
      function fooArgs(a, b, c, ...rest) { this; return [a, b, c, ...rest]; }

      var barArgs = (a, b, c, ...rest) => { this; return [a, b, c, ...rest]; }

      class restClass {
        methodArgs(a, b, c, ...rest) { this; return [a, b, c, ...rest]; }
      };
      var baz = new restClass();

      var obj = {
        methodArgs(a, b, c, ...rest) { this; return [a, b, c, ...rest]; },
        evalMethodArgs(a, b, c, ...rest) { this; return eval("[a, b, c, ...rest]"); }
      };

      assert.areEqual([1,2,undefined], fooArgs(1,2),                "Rest is an empty array with too few parameters to a function with a reference to this");
      assert.areEqual([1,2,3],         fooArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a function with a reference to this");
      assert.areEqual([1,2,3,4,5,6],   fooArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a function with a reference to this");

      assert.areEqual([1,2,undefined], barArgs(1,2),                "Rest is an empty array with too few parameters to a lambda with a reference to this");
      assert.areEqual([1,2,3],         barArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a lambda with a reference to this");
      assert.areEqual([1,2,3,4,5,6],   barArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a lambda with a reference to this");

      assert.areEqual([1,2,undefined], baz.methodArgs(1,2),         "Rest is an empty array with too few parameters to a class method with a reference to this");
      assert.areEqual([1,2,3],         baz.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a class method with a reference to this");
      assert.areEqual([1,2,3,4,5,6],   baz.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a class method with a reference to this");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with a reference to this");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with a reference to this");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with a reference to this");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with eval and a reference to this");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with eval and a reference to this");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with eval and a reference to this");
    }
  },
  {
    name: "Rest basic uses and sanity checks with eval",
    body: function () {
      function fooArgs(a, b, c, ...rest) { eval(""); return [a, b, c, ...rest]; }

      var barArgs = (a, b, c, ...rest) => { eval(""); return [a, b, c, ...rest]; }

      class restClass {
        methodArgs(a, b, c, ...rest) { eval(""); return [a, b, c, ...rest]; }
      };
      var baz = new restClass();

      var obj = {
        methodArgs(a, b, c, ...rest) { eval(""); return [a, b, c, ...rest]; },
        evalMethodArgs(a, b, c, ...rest) { eval(""); return eval("[a, b, c, ...rest]"); }
      };

      assert.areEqual([1,2,undefined], fooArgs(1,2),                "Rest is an empty array with too few parameters to a function with an eval");
      assert.areEqual([1,2,3],         fooArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a function with an eval");
      assert.areEqual([1,2,3,4,5,6],   fooArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a function with an eval");

      assert.areEqual([1,2,undefined], barArgs(1,2),                "Rest is an empty array with too few parameters to a lambda with an eval");
      assert.areEqual([1,2,3],         barArgs(1,2,3),              "Rest is an empty array with the exact number of parameters to a lambda with an eval");
      assert.areEqual([1,2,3,4,5,6],   barArgs(1,2,3,4,5,6),        "Rest is a non-empty array with too many parameters to a lambda with an eval");

      assert.areEqual([1,2,undefined], baz.methodArgs(1,2),         "Rest is an empty array with too few parameters to a class method with an eval");
      assert.areEqual([1,2,3],         baz.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a class method with an eval");
      assert.areEqual([1,2,3,4,5,6],   baz.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a class method with an eval");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with an eval");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with an eval");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with an eval");

      assert.areEqual([1,2,undefined], obj.methodArgs(1,2),         "Rest is an empty array with too few parameters to a method with eval and an eval");
      assert.areEqual([1,2,3],         obj.methodArgs(1,2,3),       "Rest is an empty array with the exact number of parameters to a method with eval and an eval");
      assert.areEqual([1,2,3,4,5,6],   obj.methodArgs(1,2,3,4,5,6), "Rest is a non-empty array with too many parameters to a method with eval and an eval");
    }
  },
  {
    name: "Rest inlining",
    body: function () {
      function inlineTest() {
        function fooInline(a, b, c, ...rest) { arguments; this; return [a, b, c, ...rest]; }
        function fooInline2(a, b, ...[c]) { arguments; this; return [a, b, c]; }

        fooInline(1,2);
        assert.areEqual([1,2,undefined], fooInline(1,2), "Inlined rest handles less actuals than formals correctly");
        assert.areEqual([1,2,undefined], fooInline(...[1,2]), "Inlined rest handles less spread actuals than formals correctly");

        fooInline2(1);
        assert.areEqual([1,undefined,undefined], fooInline2(1), "Inlined rest handles less actuals than formals correctly");
        assert.areEqual([1,undefined,undefined], fooInline2(...[1]), "Inlined rest handles less spread actuals than formals correctly");

        fooInline(1,2,3);
        assert.areEqual([1,2,3], fooInline(1,2,3), "Inlined rest handles the same amount of actuals and formals correctly");
        assert.areEqual([1,2,3], fooInline(...[1,2,3]), "Inlined rest handles the same amount of spread actuals and formals correctly");

        fooInline2(1,2);
        assert.areEqual([1,2,undefined], fooInline2(1,2), "Inlined rest handles the same amount of actuals and formals correctly");
        assert.areEqual([1,2,undefined], fooInline2(...[1,2]), "Inlined rest handles the same amount of spread actuals and formals correctly");

        fooInline(1,2,3,4,5,6);
        assert.areEqual([1,2,3,4,5,6], fooInline(1,2,3,4,5,6), "Inlined rest handles the more actuals than formals correctly");
        assert.areEqual([1,2,3,4,5,6], fooInline(...[1,2,3,4,5,6]), "Inlined rest handles the more actuals than formals correctly");

        fooInline2(1,2,3,4,5,6);
        assert.areEqual([1,2,3], fooInline2(1,2,3,4,5,6), "Inlined rest handles the more actuals than formals correctly");
        assert.areEqual([1,2,3], fooInline2(...[1,2,3,4,5,6]), "Inlined rest handles the more actuals than formals correctly");
      }
      inlineTest();
      inlineTest();
      inlineTest();
    }
  },
  {
    name: "OS 264962: Deferred nested function causes an assert",
    body: function () {
      var func4 = function (...argArr13) {
        function foo() {
            eval();
        }
      };
      var func5 = function (...[argArr13]) {
        function foo() {
            eval();
        }
      };
    }
  },
  {
    name: "OS 265363: ArgIn_Rest is emitted in loop bodies",
    body: function () {
      var func4 = function (argArrObj9, ...argArr11) {
        while (false) {
        }
      };
      var func4 = function (argArrObj9, ...[argArr11]) {
        while (false) {
        }
      };
      func4();
    }
  },
  {
    name: "OS 266421: Rest does not create a frame object properly",
    body: function () {
      var func4 = function (...argArr6) {
        for (var _i in arguments) {
        }
      };
    }
  },
  {
    name: "OS 266421: Rest pattern does not create a frame object properly",
    body: function () {
      var func4 = function (...[argArr6]) {
        for (var _i in arguments) {
        }
      };
    }
  },
  {
    name: "OS 645508: Nested function reference to parent rest parameter fails",
    body: function () {
      function foo(...bar) {
        function child() {
          bar;
        }
        child();
      }
      foo();
    }
  },
  {
    name: "OS 645508: Nested function reference to parent rest pattern fails",
    body: function () {
      function foo(...[bar]) {
        function child() {
          bar;
        }
        child();
      }
      foo();
    }
  },
  {
    name: "Rest parameter is incorrectly assumed to be in a scope slot",
    body: function () {
      function test0() {
        var func1 = function (...argArr5) {
          arguments[1];
        };
        do {
          func1();
          _oo2obj2.func1();
        } while (false);
      }
    }
  },
  {
    name: "Rest pattern is incorrectly assumed to be in a scope slot",
    body: function () {
      function test0() {
        var func1 = function (...[argArr5]) {
          arguments[1];
        };
        do {
          func1();
          _oo2obj2.func1();
        } while (false);
      }
    }
  },
  {
    name: "Extra arguments passed to eval should not be visible",
    body: function () {
        var eval = function(...arg) {
            assert.areEqual(1, arg.length, "arg.length == 1");
            assert.areEqual("super()", arg[0], "arg[0] == 'super()'");
        }
        eval("super()");
    }
  },
  {
    name: "OSG 5737917: Create arguments object when the only formal is a rest argument",
    body: function () {
      var func1 = function (...argArr0) {
        eval('');
        return (Object({
          get: function () {
          }
        }));
      }
    }
  },
  {
    name: "OSG 5737917: Create arguments object when the only formal is a rest pattern",
    body: function () {
      var func1 = function (...[argArr0]) {
        eval('');
        return (Object({
          get: function () {
          }
        }));
      }
    }
  },
  {
    name: "OS 7249217: Rest is able to be in a slot in arguments optimization case",
    body: function () {
      function foo(...argArr9) {
        var protoObj0 = {};
        with (protoObj0) {
          arguments;
          var f = function () { assert.areEqual([1,2,3], argArr9, "Arguments scope object optimization allows rest to function correctly inside with"); };
          f();
        }
        assert.areEqual([1,2,3], argArr9, "Arguments scope object optimization allows rest to function correctly");
      }
      function bar(...[argArr9]) {
        var protoObj0 = {};
        with (protoObj0) {
          arguments;
          var f = function () {
            assert.areEqual(1, argArr9, 
              "Arguments scope object optimization allows rest to function correctly inside with");
          };
          f();
        }
        assert.areEqual(1, argArr9,
          "Arguments scope object optimization allows rest to function correctly");
      }
      bar(1,2,3);
    }
  }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

// OS: Bug 269660: [ES6][Rest] ASSERTION 14444: (inetcore\jscript\lib\backend\irbuilder.cpp, line 792) Tried to use an undefined stacksym?
// Serialization bug that needs to be at global scope.
function test0() {
  var func1 = function (...argArr2) {
      if (false) {
          var strvar9 = argArr2;
      }
  };
  func1();
}
test0();
test0();
