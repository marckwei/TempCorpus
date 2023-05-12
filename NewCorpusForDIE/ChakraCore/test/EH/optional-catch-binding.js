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

// Tests optional catch binding syntax

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Try-catch with no catch binding",
    body: function() {
      try {} catch {}
    },
  },
  {
    name: "Try-catch-finally with no catch binding",
    body: function() {
      try {} catch {} finally {}
    },
  },
  {
    name: "Try-catch with no catching binding lexical scope",
    body: function() {
      let x = 1;
      let ranCatch = false;

      try {
        x = 2;
        throw new Error();
      } catch {
        let x = 3;
        let y = true;
        ranCatch = true;
      }

      assert.isTrue(ranCatch, 'executed `catch` block');
      assert.areEqual(x, 2);

      assert.throws(function() { y; }, ReferenceError);
    },
  },
  {
    name: "Optional catch must not have empty parens",
    body: function() {
      assert.throws(function() { eval("try {} catch () {}"); }, SyntaxError);
    },
  },
  {
    name: "Errors are correctly thrown from catch",
    body: function() {
      class Err {}
      assert.throws(function() {
        try {
          throw new Error();
        } catch {
          throw new Err();
        }
      }, Err);
    },
  },
  {
    name: "Variables in catch block are properly scoped",
    body: function() {
      let x = 1;
      try {
        throw 1;
      } catch {
        let x = 2;
        var f1 = function () { return 'f1'; }
        function f2() { return 'f2'; }
      }
      assert.areEqual(x, 1);
      assert.areEqual(f1(), 'f1');
      assert.areEqual(f2(), 'f2');
    },
  },
  {
    name: "With scope in catch block",
    body: function() {
      function f() {
        try {
          throw 1;
        } catch {
          with ({ x: 1 }) {
            return function() { return x };
          }
        }
      }
      assert.areEqual(f()(), 1);
    },
  },
  {
    name: "Eval in catch block",
    body: function() {
      function f() {
        let x = 1;
        try {
          throw 1;
        } catch {
          let x = 2;
          return eval('function g() { return x }; g');
        }
      }
      assert.areEqual(f()(), 2);
    },
  },
  {
    name: "Async function with catch block with no binding",
    body: function() {
        async function foo() {
            try { throw "anything" } catch { await 5;}
        }
        assert.isTrue(foo() instanceof Promise, "await returns a promise");
    }
  },
  {
    name: "Async function with catch block with no binding",
    body: function() {
        function* foo() {
            try { throw "anything" } catch { yield 5;}
        }
        assert.areEqual(5, foo().next().value, "generator returns an object with yielded value");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
