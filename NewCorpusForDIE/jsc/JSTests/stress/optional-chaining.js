function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldThrowSyntaxError(script) {
    let error;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }

    if (!(error instanceof SyntaxError))
        throw new Error('Expected SyntaxError!');
}

function shouldThrowTypeError(func, messagePrefix) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof TypeError))
        throw new Error('Expected TypeError!');

    if (!error.message.startsWith(messagePrefix))
        throw new Error('TypeError has wrong message!');
}

const masquerader = makeMasquerader();
masquerader.foo = 3;

function testBasicSuccessCases() {
    shouldBe(undefined?.valueOf(), undefined);
    shouldBe(null?.valueOf(), undefined);
    shouldBe(true?.valueOf(), true);
    shouldBe(false?.valueOf(), false);
    shouldBe(0?.valueOf(), 0);
    shouldBe(1?.valueOf(), 1);
    shouldBe(''?.valueOf(), '');
    shouldBe('hi'?.valueOf(), 'hi');
    shouldBe(({})?.constructor, Object);
    shouldBe(({ x: 'hi' })?.x, 'hi');
    shouldBe([]?.length, 0);
    shouldBe(['hi']?.length, 1);
    shouldBe(masquerader?.foo, 3);

    shouldBe(undefined?.['valueOf'](), undefined);
    shouldBe(null?.['valueOf'](), undefined);
    shouldBe(true?.['valueOf'](), true);
    shouldBe(false?.['valueOf'](), false);
    shouldBe(0?.['valueOf'](), 0);
    shouldBe(1?.['valueOf'](), 1);
    shouldBe(''?.['valueOf'](), '');
    shouldBe('hi'?.['valueOf'](), 'hi');
    shouldBe(({})?.['constructor'], Object);
    shouldBe(({ x: 'hi' })?.['x'], 'hi');
    shouldBe([]?.['length'], 0);
    shouldBe(['hi']?.[0], 'hi');
    shouldBe(masquerader?.['foo'], 3);

    shouldBe(undefined?.(), undefined);
    shouldBe(null?.(), undefined);
    shouldBe((() => 3)?.(), 3);
}
noInline(testBasicSuccessCases);

function testBasicFailureCases() {
    shouldThrowTypeError(() => true?.(), 'true is not a function');
    shouldThrowTypeError(() => false?.(), 'false is not a function');
    shouldThrowTypeError(() => 0?.(), '0 is not a function');
    shouldThrowTypeError(() => 1?.(), '1 is not a function');
    shouldThrowTypeError(() => ''?.(), '\'\' is not a function');
    shouldThrowTypeError(() => 'hi'?.(), '\'hi\' is not a function');
    shouldThrowTypeError(() => ({})?.(), '({}) is not a function');
    shouldThrowTypeError(() => ({ x: 'hi' })?.(), '({ x: \'hi\' }) is not a function');
    shouldThrowTypeError(() => []?.(), '[] is not a function');
    shouldThrowTypeError(() => ['hi']?.(), '[\'hi\'] is not a function');
}
noInline(testBasicFailureCases);

for (let i = 0; i < 1e5; i++)
    testBasicSuccessCases();

for (let i = 0; i < 100; i++)
    testBasicFailureCases();

shouldThrowTypeError(() => ({})?.i(), '({})?.i is not a function');
shouldBe(({}).i?.(), undefined);
shouldBe(({})?.i?.(), undefined);
shouldThrowTypeError(() => ({})?.['i'](), '({})?.[\'i\'] is not a function');
shouldBe(({})['i']?.(), undefined);
shouldBe(({})?.['i']?.(), undefined);

shouldThrowTypeError(() => ({}).i()?.x, '({}).i is not a function');
shouldThrowTypeError(() => ({})['i']()?.['x'], '({})[\'i\'] is not a function');

shouldThrowTypeError(() => ({})?.a['b'], 'undefined is not an object');
shouldBe(({})?.a?.['b'], undefined);
shouldBe(null?.a['b']().c, undefined);
shouldThrowTypeError(() => ({})?.['a'].b, 'undefined is not an object');
shouldBe(({})?.['a']?.b, undefined);
shouldBe(null?.['a'].b()['c'], undefined);
shouldThrowTypeError(() => (() => {})?.()(), '(() => {})?.() is not a function');
shouldBe((() => {})?.()?.(), undefined);
shouldBe(null?.()().a['b'], undefined);
shouldBe(masquerader?.(), null);

shouldThrowTypeError(() => (() => {})?.().x, 'undefined is not an object');
shouldThrowTypeError(() => shouldBe?.().x, 'undefined is not an object');

const o0 = { a: { b() { return this._b.bind(this); }, _b() { return this.__b; }, __b: { c: 42 } } };
shouldBe(o0?.a?.['b']?.()?.()?.c, 42);
shouldBe(o0?.i?.['j']?.()?.()?.k, undefined);
shouldBe((o0.a?._b)?.().c, 42);
shouldBe((o0.a?._b)().c, 42);

shouldBe(({ undefined: 3 })?.[null?.a], 3);
shouldBe((() => 3)?.(null?.a), 3);

const o1 = { count: 0, get x() { this.count++; return () => {}; } };
o1.x?.y;
shouldBe(o1.count, 1);
o1.x?.['y'];
shouldBe(o1.count, 2);
o1.x?.();
shouldBe(o1.count, 3);
null?.(o1.x);
shouldBe(o1.count, 3);

shouldBe(delete undefined?.foo, true);
shouldBe(delete null?.foo, true);
shouldBe(delete undefined?.['foo'], true);
shouldBe(delete null?.['foo'], true);
shouldBe(delete undefined?.(), true);
shouldBe(delete null?.(), true);

const o2 = { x: 0, y: 0, z() {} };
shouldBe(delete o2?.x, true);
shouldBe(o2.x, undefined);
shouldBe(delete o2?.x, true);
shouldBe(delete o2?.['y'], true);
shouldBe(o2.y, undefined);
shouldBe(delete o2?.['y'], true);
shouldBe(delete o2.z?.(), true);

function greet(name) { return `hey, ${name}${this.suffix ?? '.'}`; }
shouldBe(eval?.('greet("world")'), 'hey, world.');
shouldBe(greet?.call({ suffix: '!' }, 'world'), 'hey, world!');
shouldBe(greet.call?.({ suffix: '!' }, 'world'), 'hey, world!');
shouldBe(null?.call({ suffix: '!' }, 'world'), undefined);
shouldBe(({}).call?.({ suffix: '!' }, 'world'), undefined);
shouldBe(greet?.apply({ suffix: '?' }, ['world']), 'hey, world?');
shouldBe(greet.apply?.({ suffix: '?' }, ['world']), 'hey, world?');
shouldBe(null?.apply({ suffix: '?' }, ['world']), undefined);
shouldBe(({}).apply?.({ suffix: '?' }, ['world']), undefined);
shouldBe(greet?.hasOwnProperty('name'), true);
shouldBe(greet.hasOwnProperty?.('name'), true);
shouldBe(null?.hasOwnProperty('name'), undefined);
shouldBe(({}).hasOwnProperty?.('name'), false);

shouldThrowTypeError(() => shouldBe.call?.().x, 'undefined is not an object');
shouldThrowTypeError(() => ({}).call()?.x, '({}).call is not a function');
shouldThrowTypeError(() => shouldBe.apply?.().x, 'undefined is not an object');
shouldThrowTypeError(() => ({}).apply()?.x, '({}).apply is not a function');
shouldThrowTypeError(() => Object.create(null).hasOwnProperty()?.x, 'Object.create(null).hasOwnProperty is not a function');

shouldThrowSyntaxError('class C {} class D extends C { foo() { return super?.bar; } }');
shouldThrowSyntaxError('class C {} class D extends C { foo() { return super?.["bar"]; } }');
shouldThrowSyntaxError('class C {} class D extends C { constructor() { super?.(); } }');

shouldThrowSyntaxError('const o = { C: class {} }; new o?.C();')
shouldThrowSyntaxError('const o = { C: class {} }; new o?.["C"]();')
shouldThrowSyntaxError('class C {} new C?.();')
shouldThrowSyntaxError('function foo() { new?.target; }');

shouldThrowSyntaxError('function tag() {} tag?.``;');
shouldThrowSyntaxError('const o = { tag() {} }; o?.tag``;');

// NOT an optional chain
shouldBe(false?.4:5, 5);
