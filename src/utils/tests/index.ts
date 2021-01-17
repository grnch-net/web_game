function test_modification() {
  console.group('Modification');

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

  class Ba extends (B as any).Latest {
    a() {
      return 'Ba' + super.a();
    }
  }
  (B as any).modify(Ba);

  class Bb extends (B as any).Latest {
    a() {
      return 'Bb' + super.a();
    }
  }
  (B as any).modify(Bb);

  const result = (new B).a();
  if (result !== 'BbBaBA') {
    console.error('Failed', result);
  }
  const result2 = (new C).a();
  if (result2 !== 'CBbBaBA') {
    console.error('Failed', result2);
  }

  console.info('Successful');
  console.groupEnd();
}



console.group('test utils');
test_modification();
console.groupEnd();
