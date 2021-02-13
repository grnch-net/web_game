function test_modification() {
  console.group('Modifications');

  class A {
    a() {
      return 'A';
    }
  }

  @UTILS.modifiable
  class B extends A {
    a() {
      return 'B' + super.a();
    }
  }

  class C extends B {
    a() {
      return 'C' + super.a();
    }
  }

  console.groupCollapsed('modifications');
  class Ba extends (B as any).Latest {
    a() {
      return 'Ba' + super.a();
    }
  }
  (B as any).modify(Ba, 'Ba');

  class Bb extends (B as any).Latest {
    a() {
      return 'Bb' + super.a();
    }
  }
  (B as any).modify(Bb);

  function modCall(Latest: typeof B) {
    class Baa extends Latest {
      a() {
        return 'Baa' + super.a();
      }
    }
    return Baa;
  }
  (B as any).modifyAfter('Ba', modCall);
  console.groupEnd();

  const result = (new B).a();
  if (result !== 'BaaBbBaBA') {
    console.error('Failed', result);
  }
  const result2 = (new C).a();
  if (result2 !== 'CBaaBbBaBA') {
    console.error('Failed', result2);
  }

  console.info('Successful');
  console.groupEnd();
}

export {
  test_modification
}
