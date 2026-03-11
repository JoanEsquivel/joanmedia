---
title: "Creational Design Patterns: Building Objects the Right Way"
description: "A deep dive into nine creational design patterns — from Singleton and Factory Method to Dependency Injection and Object Pool — with real-world use cases and trade-offs."
pubDate: 2026-03-13
category: "backend"
tags:
  - Creational Patterns
  - Factory Method
  - Singleton
  - Dependency Injection
series: "Software Design Patterns"
seriesOrder: 3
heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=750&h=422&fit=crop"
---

## Table of Contents

1. [Object Creation Is Deceptively Complex](#object-creation-is-deceptively-complex)
2. [Singleton](#1-singleton)
3. [Factory Method](#2-factory-method)
4. [Abstract Factory](#3-abstract-factory)
5. [Builder](#4-builder)
6. [Prototype](#5-prototype)
7. [Object Pool](#6-object-pool)
8. [Lazy Initialization](#7-lazy-initialization)
9. [Dependency Injection](#8-dependency-injection)
10. [Multiton](#9-multiton)
11. [Pattern Comparisons](#pattern-comparisons)
    - [Factory Method vs. Abstract Factory vs. Builder](#factory-method-vs-abstract-factory-vs-builder)
    - [Singleton vs. Dependency Injection](#singleton-vs-dependency-injection)
    - [Prototype vs. Factory Method](#prototype-vs-factory-method)
12. [Summary Table: All Creational Patterns at a Glance](#summary-table-all-creational-patterns-at-a-glance)
13. [Sources and References](#sources-and-references)

---

## Object Creation Is Deceptively Complex

Writing `new MyObject()` looks simple. It is one line of code. It is the first thing most programmers learn in any object-oriented language. And it is the source of some of the most insidious coupling, inflexibility, and maintenance burden in software systems.

The moment you write `new ConcreteProduct()`, you have hardcoded a dependency on a specific class. Your code now knows exactly which class to instantiate, exactly how to configure it, and exactly when to do so. If the product changes, the client changes. If you need a different product for testing, production, or a different platform, you are rewriting client code.

Creational design patterns exist to break this coupling. They provide strategies for deciding *what* gets created, *who* creates it, *how* it is constructed, and *when* the creation happens -- all while keeping the client code blissfully ignorant of the details.

In [Part 2 of this series](./post-02-foundations-grasp-solid-principles.md), we explored the GRASP and SOLID principles that form the conceptual bedrock of design patterns. The creational patterns we examine here are direct applications of those principles: Creator guides basic object construction; Protected Variations and the Open/Closed Principle drive the Factory patterns; the Dependency Inversion Principle motivates Dependency Injection; and the tension between eager and lazy initialization reflects practical engineering trade-offs around performance and resource management.

This post covers all nine creational patterns: the five GoF originals (Singleton, Factory Method, Abstract Factory, Builder, Prototype) and four additional patterns (Object Pool, Lazy Initialization, Dependency Injection, Multiton) that have earned their place in the modern developer's toolkit. Each pattern includes its intent, the problem it solves, the solution structure, when to use it, when NOT to use it, a real-world analogy, a complete code example, trade-offs, related patterns, and common mistakes.

---

## 1. Singleton

### Intent

Ensure that a class has only one instance while providing a global access point to that instance.

### Problem It Solves

Two problems arise simultaneously: (1) controlling access to a shared resource (database, file, logger) so that multiple objects do not create conflicting instances, and (2) providing safe global access to that instance without the dangers of traditional global variables that can be overwritten by any code.

### Solution

- Make the default constructor **private** to prevent instantiation via `new`.
- Create a **static creation method** (or getter) that calls the private constructor on first invocation, caches the result, and returns it on all subsequent calls.

**Participants:**
- `Singleton` class: holds a private static field for the instance, a private constructor, and a public static `getInstance()` method.

### When to Use

- A class must have exactly one instance accessible to all clients (e.g., a configuration manager, logger, connection pool coordinator).
- You need stricter control over global variables than traditional approaches provide.
- The instance should be lazily initialized on first request.

### When NOT to Use

- When the object has no shared state or there is no genuine need for a single instance -- using Singleton "just because" adds unnecessary coupling.
- In heavily multithreaded environments where the synchronization overhead of Singleton access becomes a bottleneck.
- When it masks poor design by becoming a dumping ground for unrelated global state.
- When you need testable code -- Singletons are notoriously hard to mock and create hidden dependencies.

### Real-World Analogy

A government: a country can have only one official government. Regardless of who or what accesses "the government," it is always the same governing body.

### Code Example (TypeScript)

```typescript
class Singleton {
  static #instance: Singleton;

  private constructor() {}

  public static get instance(): Singleton {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }

  public someBusinessLogic(): void {
    // ...
  }
}

// Client code
const s1 = Singleton.instance;
const s2 = Singleton.instance;
console.log(s1 === s2); // true
```

### Trade-offs

| Pros | Cons |
|------|------|
| Guarantees a single instance | Violates Single Responsibility Principle (two concerns) |
| Controlled global access point | Can mask poor design decisions |
| Lazy initialization on first request | Requires special handling for multithreaded environments |
| | Complicates unit testing (private constructor, hidden deps) |
| | Introduces global state |

### Related Patterns

- **Facade** can often be implemented as a Singleton.
- **Flyweight** resembles Singleton but allows multiple instances with different intrinsic states.
- **Abstract Factory, Builder, Prototype** can all be implemented as Singletons.
- Contrast with **Dependency Injection** (see comparisons below).

### Common Mistakes

1. **Not handling thread safety**: In multi-threaded environments, two threads can enter the `if` check simultaneously, creating two instances. Use double-checked locking, eager initialization, or language-specific mechanisms (e.g., `enum` in Java, module scope in TypeScript/JS).
2. **Overusing Singleton as a global variable**: Developers treat it as a convenient global, leading to tight coupling everywhere.
3. **Forgetting about serialization/reflection**: In Java, both can break the Singleton guarantee; `enum`-based Singletons solve this.
4. **Using Singleton when Dependency Injection would be cleaner**: DI frameworks can manage single-instance lifecycle without the pattern's downsides.
5. **Putting too much responsibility in the Singleton**: It becomes a "God object."

---

## 2. Factory Method

### Intent

Provide an interface for creating objects in a superclass, but allow subclasses to alter the type of objects that will be created.

### Problem It Solves

When code depends directly on concrete product classes, adding new product types requires scattering changes throughout the codebase. Example: a logistics app built only for trucks -- adding ships means rewriting conditional logic everywhere.

### Solution

Replace direct `new` calls with a **factory method** that subclasses override to return different product types, all conforming to a common interface.

**Participants:**
- **Product** (interface): common interface for all created objects.
- **Concrete Products**: different implementations of the Product interface.
- **Creator** (abstract class): declares the abstract factory method.
- **Concrete Creators**: override the factory method to return specific product types.

### When to Use

- When exact object types and dependencies are not known ahead of time.
- To separate product construction from product usage code.
- To enable library/framework users to extend internal components via subclassing.
- To reuse existing objects from pools rather than constantly creating new instances.

### When NOT to Use

- When there is only one product type and no foreseeable need for variation -- adding factory infrastructure is over-engineering.
- When the creation logic is trivial (a simple `new` is fine).
- When you do not control or expect subclassing of the creator hierarchy.

### Real-World Analogy

A software company has a training department, but its primary function is writing code, not producing programmers. Similarly, a Creator class primarily handles business logic; the factory method simply decouples this logic from concrete product creation.

### Code Example (TypeScript)

```typescript
abstract class Creator {
  public abstract factoryMethod(): Product;

  public someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: worked with ${product.operation()}`;
  }
}

class ConcreteCreator1 extends Creator {
  public factoryMethod(): Product {
    return new ConcreteProduct1();
  }
}

class ConcreteCreator2 extends Creator {
  public factoryMethod(): Product {
    return new ConcreteProduct2();
  }
}

interface Product {
  operation(): string;
}

class ConcreteProduct1 implements Product {
  public operation(): string {
    return '{Result of ConcreteProduct1}';
  }
}

class ConcreteProduct2 implements Product {
  public operation(): string {
    return '{Result of ConcreteProduct2}';
  }
}

// Client code -- works with any creator
function clientCode(creator: Creator) {
  console.log(creator.someOperation());
}

clientCode(new ConcreteCreator1());
clientCode(new ConcreteCreator2());
```

### Trade-offs

| Pros | Cons |
|------|------|
| Eliminates tight coupling between creator and concrete products | Increases complexity via many new subclasses |
| Single Responsibility: centralizes product creation code | Works best only when extending existing creator hierarchies |
| Open/Closed: add new products without breaking existing code | |

### Related Patterns

- Frequently **evolves toward** Abstract Factory, Prototype, or Builder.
- **Template Method**: Factory Method is a specialization of Template Method.
- **Prototype**: can avoid subclassing but requires an initialization step.
- **Abstract Factory**: often uses Factory Methods internally.

### Common Mistakes

1. **Creating a factory when a simple constructor suffices**: Ask first whether new types will actually be required.
2. **Putting too much logic in the factory method**: It should only handle creation, not business logic.
3. **Using static factory methods and calling it "Factory Method pattern"**: A static factory method is useful but is not the GoF Factory Method pattern (which relies on inheritance/polymorphism).
4. **Confusing Factory Method with Abstract Factory**: Factory Method creates a single product; Abstract Factory creates families.

---

## 3. Abstract Factory

### Intent

Produce families of related objects without specifying their concrete classes.

### Problem It Solves

When a system requires multiple product families (e.g., furniture in Modern, Victorian, or ArtDeco styles), directly instantiating concrete classes creates tight coupling and risks mismatching products from different families (a Modern chair with a Victorian table).

### Solution

Define abstract interfaces for each product type. Create an **Abstract Factory** interface with creation methods for each product. Implement **Concrete Factories** corresponding to each product variant/family. Client code works exclusively through abstract types.

**Participants:**
- **Abstract Products**: interfaces for each distinct product type.
- **Concrete Products**: variant implementations grouped by family.
- **Abstract Factory**: interface declaring creation methods for all products.
- **Concrete Factories**: each produces products of a single family.
- **Client**: works through abstract interfaces only.

### When to Use

- Code must create multiple related objects that should work together, but you must avoid binding client code to concrete classes.
- Future extensibility for new product variants is anticipated.
- A class's factory methods are blurring its primary responsibility.

### When NOT to Use

- When you only have a single product type (use Factory Method instead).
- When product families do not exist or products do not need to be coordinated.
- When the interface proliferation outweighs the flexibility benefit in a small/stable system.

### Real-World Analogy

Cross-platform UI: operating system detection determines which factory (WinFactory, MacFactory) to instantiate. All UI elements (buttons, checkboxes, menus) then match the current OS, while client code remains platform-agnostic.

### Code Example (TypeScript)

```typescript
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}

class ConcreteFactory1 implements AbstractFactory {
  public createProductA(): AbstractProductA {
    return new ConcreteProductA1();
  }
  public createProductB(): AbstractProductB {
    return new ConcreteProductB1();
  }
}

class ConcreteFactory2 implements AbstractFactory {
  public createProductA(): AbstractProductA {
    return new ConcreteProductA2();
  }
  public createProductB(): AbstractProductB {
    return new ConcreteProductB2();
  }
}

interface AbstractProductA {
  usefulFunctionA(): string;
}

class ConcreteProductA1 implements AbstractProductA {
  public usefulFunctionA(): string {
    return 'Product A1';
  }
}

class ConcreteProductA2 implements AbstractProductA {
  public usefulFunctionA(): string {
    return 'Product A2';
  }
}

interface AbstractProductB {
  usefulFunctionB(): string;
  anotherUsefulFunctionB(collaborator: AbstractProductA): string;
}

class ConcreteProductB1 implements AbstractProductB {
  public usefulFunctionB(): string {
    return 'Product B1';
  }
  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
    return `B1 collaborating with (${collaborator.usefulFunctionA()})`;
  }
}

class ConcreteProductB2 implements AbstractProductB {
  public usefulFunctionB(): string {
    return 'Product B2';
  }
  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
    return `B2 collaborating with (${collaborator.usefulFunctionA()})`;
  }
}

// Client code -- works only with abstract types
function clientCode(factory: AbstractFactory) {
  const productA = factory.createProductA();
  const productB = factory.createProductB();
  console.log(productB.usefulFunctionB());
  console.log(productB.anotherUsefulFunctionB(productA));
}

clientCode(new ConcreteFactory1());
clientCode(new ConcreteFactory2());
```

### Trade-offs

| Pros | Cons |
|------|------|
| Guarantees product compatibility within families | Increases complexity with many interfaces and classes |
| Reduces coupling between concrete products and client code | Adding a new product type to families requires changing the abstract factory interface and all concrete factories |
| Single Responsibility: centralizes product creation | |
| Open/Closed: add new variants without breaking existing code | |

### Related Patterns

- Evolves from **Factory Method** toward greater flexibility.
- Differs from **Builder**: Abstract Factory returns products immediately; Builder supports step-by-step construction.
- Often uses **Factory Methods** internally; can also use **Prototype**.
- Can serve as an alternative to **Facade** for hiding subsystem creation.
- Works alongside **Bridge** to encapsulate platform-specific relations.
- Can be implemented as **Singletons**.

### Common Mistakes

1. **Using Abstract Factory when you only have one product type**: This is overkill; use Factory Method instead.
2. **Forgetting that adding a new product type changes the entire hierarchy**: Every concrete factory must be updated.
3. **Making the factory interface too broad**: Keep it focused on genuinely related products.
4. **Conflating "family" with "variant"**: The factory produces a family of related products, not just different versions of one product.

---

## 4. Builder

### Intent

Construct complex objects step by step, allowing the same construction process to create different representations.

### Problem It Solves

Complex objects often require extensive initialization with many parameters, leading to two problems:
1. **Telescoping constructors**: constructors with many optional parameters that are hard to read and call.
2. **Proliferating subclasses**: creating a subclass for every configuration combination is unmaintainable.

### Solution

Extract construction logic into separate **Builder** objects with discrete step methods. An optional **Director** class encapsulates common construction sequences for reuse.

**Participants:**
- **Builder** (interface): declares construction steps (`buildWalls`, `buildDoor`, etc.).
- **Concrete Builders**: implement steps differently, may produce different product types.
- **Products**: the resulting objects (may differ in type across builders).
- **Director**: defines the order and selection of construction steps.
- **Client**: associates a builder with a director (or drives the builder directly).

### When to Use

- To eliminate telescoping constructors with numerous optional parameters.
- To create different product representations using similar construction steps (e.g., stone house vs. wooden house vs. glass house).
- To build complex composite trees or data structures step by step.

### When NOT to Use

- When object construction is simple (a constructor with 2-3 required parameters).
- When there is only one representation of the product.
- When the overhead of builder classes outweighs the complexity of direct construction.

### Real-World Analogy

Ordering a meal at a restaurant: you build your order step by step (choose appetizer, choose main, choose dessert, choose drink). The waiter (Director) knows popular combos (lunch special, dinner special), but you can also customize each step yourself.

### Code Example (TypeScript)

```typescript
interface Builder {
  producePartA(): void;
  producePartB(): void;
  producePartC(): void;
}

class ConcreteBuilder1 implements Builder {
  private product: Product1;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.product = new Product1();
  }

  public producePartA(): void {
    this.product.parts.push('PartA1');
  }

  public producePartB(): void {
    this.product.parts.push('PartB1');
  }

  public producePartC(): void {
    this.product.parts.push('PartC1');
  }

  public getProduct(): Product1 {
    const result = this.product;
    this.reset();
    return result;
  }
}

class Product1 {
  public parts: string[] = [];

  public listParts(): void {
    console.log(`Product parts: ${this.parts.join(', ')}`);
  }
}

class Director {
  private builder: Builder;

  public setBuilder(builder: Builder): void {
    this.builder = builder;
  }

  public buildMinimalViableProduct(): void {
    this.builder.producePartA();
  }

  public buildFullFeaturedProduct(): void {
    this.builder.producePartA();
    this.builder.producePartB();
    this.builder.producePartC();
  }
}

// Client code
const director = new Director();
const builder = new ConcreteBuilder1();
director.setBuilder(builder);

director.buildMinimalViableProduct();
builder.getProduct().listParts(); // "Product parts: PartA1"

director.buildFullFeaturedProduct();
builder.getProduct().listParts(); // "Product parts: PartA1, PartB1, PartC1"

// Custom build without director
builder.producePartA();
builder.producePartC();
builder.getProduct().listParts(); // "Product parts: PartA1, PartC1"
```

### Trade-offs

| Pros | Cons |
|------|------|
| Construct objects incrementally with deferred/recursive steps | Significant code complexity increase (many new classes) |
| Reuse construction code across product variations | Can be overkill for simple objects |
| Single Responsibility: isolates complex construction from business logic | |
| Supports fluent API style for readability | |

### Related Patterns

- Often evolves from **Factory Method** as complexity grows.
- Differs from **Abstract Factory**: Builder permits step-by-step construction; Abstract Factory returns products immediately.
- Combines well with **Bridge** (director as abstraction, builders as implementations).
- Works with **Composite** for building complex tree structures.

### Common Mistakes

1. **Using Builder for objects with 2-3 fields**: Overkill; a simple constructor is sufficient.
2. **Forgetting `reset()`**: After `getProduct()`, the builder should be ready to build again.
3. **Making the Director mandatory**: The client should be able to drive the builder directly for custom builds.
4. **Returning the builder from non-step methods**: In fluent APIs, every step method should return `this` for chaining (not shown in the basic example above but commonly expected).
5. **Not making the product immutable after construction**: The whole point of Builder is controlled construction; allowing mutation afterward defeats the purpose.

---

## 5. Prototype

### Intent

Copy existing objects without making your code dependent on their classes.

### Problem It Solves

Creating exact copies of objects is problematic because: (1) private fields cannot be accessed from outside the object, (2) code becomes dependent on concrete classes when copying, and (3) when only an interface is known (not the concrete type), copying is impossible through normal means.

### Solution

Delegate cloning to the objects themselves through a common `clone()` method. Objects act as prototypes, creating copies by transferring field values (including private ones, since the clone happens within the same class). Pre-built prototypes serve as an alternative to subclassing.

**Participants:**
- **Prototype** (interface): declares the `clone()` method.
- **Concrete Prototype**: implements cloning, handling deep copy edge cases.
- **Client**: produces copies by calling `clone()` on a prototype.
- **Prototype Registry** (optional): stores frequently-used prototypes for easy retrieval by name/key.

### When to Use

- When code should not depend on concrete classes of objects being copied.
- When working with third-party objects accessible only via interfaces.
- To reduce subclass proliferation when objects differ only in initialization/configuration -- create pre-configured prototypes and clone them.
- When creating objects from scratch is expensive and a copy provides a better starting point.

### When NOT to Use

- When objects have circular references that are difficult to resolve during cloning.
- When objects hold external resources (file handles, database connections) that cannot be meaningfully cloned.
- When the overhead of implementing deep cloning for complex object graphs exceeds the cost of creating objects from scratch.

### Real-World Analogy

Cell mitotic division: an original cell acts as a prototype, actively creating an identical copy through division rather than being constructed from raw materials.

### Code Example (TypeScript)

```typescript
class Prototype {
  public primitive: any;
  public component: object;
  public circularReference: ComponentWithBackReference;

  public clone(): this {
    const clone = Object.create(this);
    clone.component = Object.create(this.component);

    // Handle circular reference: the nested object should
    // point to the cloned object, not the original
    clone.circularReference = new ComponentWithBackReference(clone);

    return clone;
  }
}

class ComponentWithBackReference {
  public prototype;

  constructor(prototype: Prototype) {
    this.prototype = prototype;
  }
}

// Client code
const p1 = new Prototype();
p1.primitive = 245;
p1.component = new Date();
p1.circularReference = new ComponentWithBackReference(p1);

const p2 = p1.clone();

console.log(p1.primitive === p2.primitive);           // true (same value)
console.log(p1.component === p2.component);           // false (deep copied)
console.log(p1.circularReference === p2.circularReference); // false (new instance)
console.log(p2.circularReference.prototype === p2);   // true (points to clone)
```

### Trade-offs

| Pros | Cons |
|------|------|
| Clone objects without coupling to concrete classes | Cloning objects with circular references is complex |
| Eliminate repeated initialization code | Deep cloning complex object graphs can be error-prone |
| Produce complex objects more conveniently | |
| Alternative to inheritance for configuration presets | |

### Related Patterns

- **Factory Method** and **Abstract Factory** can use Prototype internally.
- **Composite** and **Decorator**: Prototype simplifies cloning complex structures.
- **Memento**: can use Prototype for state snapshots.
- Designs often start with **Factory Method** and evolve toward Prototype or Builder.

### Common Mistakes

1. **Shallow copy when deep copy is needed**: The default `Object.create()` or `Object.assign()` only creates shallow copies. Nested objects remain shared between original and clone.
2. **Ignoring circular references**: They cause infinite loops or incorrect references if not handled explicitly.
3. **Not resetting mutable state**: Cloned objects may carry over state (e.g., event listeners, timers) that should not be shared.
4. **Using Prototype when a Factory would be simpler**: If objects are cheap to create from scratch, cloning adds unnecessary complexity.

---

## 6. Object Pool

### Intent

Avoid expensive acquisition and release of resources by recycling objects that are no longer in use.

### Problem It Solves

When object creation/destruction is expensive (database connections, thread allocation, heavy graphical objects), constant instantiation and garbage collection degrades performance. Object Pool maintains a cache of reusable objects that can be checked out and returned.

### Solution

A pool manager (often a Singleton) maintains a collection of reusable objects. Clients call `acquire()` to get an object (recycled if available, or newly created up to a maximum limit) and `release()` to return it to the pool.

**Participants:**
- **Reusable**: objects that collaborate temporarily with clients and then become available for reuse.
- **Client**: uses Reusable objects obtained from the pool.
- **ReusablePool** (Singleton): manages the collection, controlling acquire/release lifecycle.

### When to Use

- The cost of initializing a class instance is high (database connections, network sockets, GPU buffers).
- The rate of instantiation is high but simultaneous usage is low.
- Object creation involves expensive resource allocation (memory, I/O).
- Game development: particle systems, bullet objects, enemy instances.

### When NOT to Use

- When object creation is cheap -- the pool management overhead exceeds the creation cost.
- When objects hold significant state that is expensive to reset between uses.
- When the pool size is hard to predict, leading to either wasted memory or exhausted pools.
- In garbage-collected languages where modern GCs already handle short-lived objects efficiently.

### Real-World Analogy

An office warehouse: new employees receive either spare equipment from inventory or newly ordered items. When employees leave, their equipment returns to the warehouse for future use rather than being discarded.

### Code Example (TypeScript)

```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private maxSize: number;
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = 10) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T | null {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else if (this.inUse.size < this.maxSize) {
      obj = this.factory();
    } else {
      return null; // Pool exhausted
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);        // Clean state before returning to pool
      this.available.push(obj);
    }
  }

  get availableCount(): number {
    return this.available.length;
  }

  get activeCount(): number {
    return this.inUse.size;
  }
}

// Usage: pooling database-like connections
interface Connection {
  id: number;
  query: string | null;
}

let nextId = 0;
const pool = new ObjectPool<Connection>(
  () => ({ id: nextId++, query: null }),  // factory
  (conn) => { conn.query = null; },       // reset
  5                                        // max size
);

const conn1 = pool.acquire()!;
conn1.query = 'SELECT * FROM users';
console.log(conn1); // { id: 0, query: 'SELECT * FROM users' }

pool.release(conn1);
const conn2 = pool.acquire()!;
console.log(conn2); // { id: 0, query: null } -- reused and reset!
```

### Trade-offs

| Pros | Cons |
|------|------|
| Significant performance boost for expensive objects | Added complexity in managing pool lifecycle |
| Reduced GC pressure | Pool sizing: too small = blocking, too large = wasted memory |
| Predictable resource usage | Objects must be properly reset between uses |
| | Risk of resource leaks if clients forget to release |
| | Thread-safety concerns in concurrent environments |

### Related Patterns

- Often implemented as a **Singleton**.
- **Factory Method** encapsulates creation but does not manage the lifecycle; Object Pool does both.
- **Flyweight** shares immutable objects; Object Pool recycles mutable ones.

### Common Mistakes

1. **Not resetting object state on release**: The next client receives dirty state from the previous user.
2. **Forgetting to release objects**: Leads to pool exhaustion and potential deadlocks.
3. **Making the pool too large**: Wastes memory; defeats the purpose if objects are cheap to create.
4. **Not handling thread safety**: Concurrent acquire/release without synchronization causes race conditions.
5. **Pooling cheap objects**: If construction cost is low, the pool management overhead makes things slower, not faster.

---

## 7. Lazy Initialization

### Intent

Delay the creation of an object, the calculation of a value, or some other expensive process until the first time it is needed.

### Problem It Solves

Eagerly creating expensive objects at startup wastes resources when those objects may never be used, or when their creation delays application readiness. This is particularly problematic for resource-intensive objects (database connections, large file reads, network resources) and for objects that are accessed rarely during runtime.

### Solution

Augment an accessor method (or property getter) to check whether a private member has already been initialized. If so, return it immediately. If not, create it, cache it, and return it.

**Participants:**
- **LazyHolder**: the class containing the lazily initialized field.
- **Expensive Resource**: the object whose creation is deferred.
- **Accessor/Getter**: the method that checks and initializes on first access.

### When to Use

- Resource-intensive objects: database connections, large file reads, network resources.
- Rarely-used objects: high probability the object may never be accessed during runtime.
- Startup performance: deferring non-essential initialization improves application start time.
- Complex initialization logic: when creation involves multiple expensive steps.

### When NOT to Use

- When the object is always needed and will definitely be accessed early -- eager initialization is simpler and avoids the check overhead.
- When thread safety concerns make lazy initialization more complex than it is worth.
- When the initialization check on every access becomes a performance concern for frequently-accessed objects.
- In real-time systems where unpredictable initialization latency is unacceptable.

### Real-World Analogy

A reference book on a shelf: you do not read and memorize every book when you move into a house. You only pick up and read a book when you actually need the information. The book "initializes" (provides its content to you) only on first access.

### Code Example (TypeScript)

```typescript
// Generic Lazy<T> wrapper
class Lazy<T> {
  private instance: T | null = null;
  private initializer: () => T;

  constructor(initializer: () => T) {
    this.initializer = initializer;
  }

  public get value(): T {
    if (this.instance === null) {
      this.instance = this.initializer();
    }
    return this.instance;
  }

  public get isInitialized(): boolean {
    return this.instance !== null;
  }
}

// Usage with expensive resource
class DatabaseConnection {
  constructor() {
    console.log('Expensive: Opening database connection...');
    // Simulate expensive setup
  }

  query(sql: string): string {
    return `Result of: ${sql}`;
  }
}

class AppConfig {
  // Eagerly initialized (always needed)
  public readonly appName = 'MyApp';

  // Lazily initialized (may not be needed)
  private _dbConnection = new Lazy(() => new DatabaseConnection());

  get dbConnection(): DatabaseConnection {
    return this._dbConnection.value;
  }
}

const config = new AppConfig();
console.log(config.appName);          // 'MyApp' -- no DB connection yet
console.log(config.dbConnection);     // NOW the connection is created
console.log(config.dbConnection);     // Reuses cached instance
```

### Trade-offs

| Pros | Cons |
|------|------|
| Improved startup performance | Added code complexity |
| Reduced memory consumption (unused objects never created) | Small overhead on every access (null check) |
| Resource optimization: allocate only when needed | Harder to debug if initialization fails at runtime |
| | Thread-safety requires additional synchronization |
| | Unpredictable latency on first access |

### Related Patterns

- Often used **within Singleton** for lazy instance creation.
- **Proxy** (virtual proxy): a common structural implementation of lazy initialization.
- **Object Pool**: may lazily create pooled objects.

### Common Mistakes

1. **Not handling thread safety**: Two threads can trigger initialization simultaneously, creating duplicate instances or race conditions.
2. **Lazy-initializing everything**: Not every object benefits from lazy init; eagerly initializing cheap objects is simpler and more predictable.
3. **Hiding errors**: Initialization failures at runtime are harder to diagnose than failures at startup.
4. **Memory leaks**: Once initialized, the lazy object is cached forever unless explicitly released.
5. **Using lazy init to paper over architectural problems**: If startup is slow, the real fix may be reducing dependencies, not deferring them.

---

## 8. Dependency Injection

### Intent

Decouple the creation of an object's dependencies from its behavior, providing dependencies from the outside rather than having the object create them internally.

### Problem It Solves

When a class creates its own dependencies internally (e.g., `this.engine = new V8Engine()`), it becomes tightly coupled to that concrete class. This makes testing difficult (cannot substitute mocks), violates the Open/Closed Principle (changing dependencies requires modifying the class), and prevents reuse with different configurations.

### Solution

Pass (inject) dependencies into the class from an external source. Three injection types exist:

1. **Constructor Injection**: Dependencies passed via the constructor (most common, makes dependencies explicit and required).
2. **Setter Injection**: Dependencies set via setter methods after construction (useful for optional dependencies).
3. **Interface Injection**: The dependency provides an injector method that clients must implement (less common).

**Participants:**
- **Client/Dependent**: the class that needs dependencies.
- **Service/Dependency**: the object being injected.
- **Injector/Container** (optional): the framework or code that constructs and wires dependencies (e.g., Spring, Angular, InversifyJS).
- **Interface**: the contract between client and service.

### When to Use

- When you need to reduce coupling between classes and improve modularity.
- When you want to facilitate unit testing through dependency mocking/stubbing.
- When working within frameworks (Spring, Angular, NestJS) that manage object lifecycles.
- When multiple implementations of a dependency must be swappable at runtime.
- When applying SOLID principles, especially Dependency Inversion.

### When NOT to Use

- In extremely small applications where DI overhead exceeds its benefit.
- When adding a DI container introduces more complexity than direct construction.
- When all dependencies are stable and will never change (e.g., primitive utilities).
- For "ambient" dependencies that legitimately span the entire application (loggers, clocks) -- these may be better as Singletons.

### Real-World Analogy

A restaurant chef who receives ingredients from a supplier (injector) rather than growing/sourcing each ingredient individually. The chef depends on the ingredient interface (fresh tomatoes), not the specific farm. Swapping suppliers does not require retraining the chef.

### Code Example (TypeScript)

```typescript
// Dependency interface
interface Logger {
  log(message: string): void;
}

// Concrete implementations
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[Console] ${message}`);
  }
}

class FileLogger implements Logger {
  log(message: string): void {
    console.log(`[File] Writing: ${message}`);
    // In reality: fs.appendFileSync(...)
  }
}

// Client class -- receives dependency via constructor injection
class UserService {
  constructor(private logger: Logger) {}

  createUser(name: string): void {
    // Business logic...
    this.logger.log(`User created: ${name}`);
  }
}

// Composition root / manual injection
const devService = new UserService(new ConsoleLogger());
devService.createUser('Alice');   // [Console] User created: Alice

const prodService = new UserService(new FileLogger());
prodService.createUser('Bob');    // [File] Writing: User created: Bob

// Testing: inject a mock
class MockLogger implements Logger {
  public messages: string[] = [];
  log(message: string): void {
    this.messages.push(message);
  }
}

const mockLogger = new MockLogger();
const testService = new UserService(mockLogger);
testService.createUser('Test');
console.log(mockLogger.messages); // ['User created: Test']
```

### Trade-offs

| Pros | Cons |
|------|------|
| Loose coupling and high modularity | Configuration complexity in large projects |
| Excellent testability (mock/stub injection) | Steeper learning curve for DI frameworks |
| Swappable implementations at runtime | More verbose code for passing dependencies |
| Promotes SOLID principles | Cannot enforce single-instance at compile time |
| Concurrent development: teams work against interfaces | Runtime errors if wiring is incorrect |

### Related Patterns

- **Factory Method / Abstract Factory**: handle instance creation; DI handles instance wiring.
- **Service Locator**: an alternative to DI (but creates hidden dependencies; DI is generally preferred).
- **Singleton**: DI frameworks often manage singleton-scoped instances.
- **Strategy**: DI is essentially applying Strategy at the architectural level.

### Common Mistakes

1. **Injecting everything**: Not every dependency needs to be injected. Value objects, DTOs, and utility classes can be created directly.
2. **Service Locator disguised as DI**: If a class asks a container for its dependencies (pulling), it is Service Locator, not DI (pushing).
3. **Constructor with too many parameters**: A sign that the class has too many responsibilities -- refactor before adding more injections.
4. **Not using interfaces**: Injecting concrete classes defeats the purpose; always depend on abstractions.
5. **Circular dependencies**: A and B both depend on each other; usually indicates a design flaw that should be resolved by extracting a third class.

---

## 9. Multiton

### Intent

Ensure a class has only one instance per unique key, maintaining a registry (map) of named instances and providing global access to them.

### Problem It Solves

Singleton restricts to exactly one instance, but some situations require exactly one instance per context/category/key. For example: one database connection per database name, one configuration per environment, one printer per department.

### Solution

Extend the Singleton concept with a **map** of key-to-instance pairs. A static `getInstance(key)` method checks if an instance for that key exists; if so, it returns it; if not, it creates one, stores it, and returns it.

**Participants:**
- **Multiton**: the class managing the static map of instances.
- **Key**: the identifier (string, enum, etc.) for each unique instance.
- **Client**: requests instances by key.

Also known as: **Registry of Singletons**.

### When to Use

- Managing instances in a context-dependent manner where each context has exactly one instance (database connections per schema, loggers per module, config per environment).
- Limiting resources: thread pools, connection pools, or caches categorized by key.
- Classes with multiple configurations or states, each identified by a specific key.

### When NOT to Use

- When only one global instance is needed (use Singleton).
- In small projects where the registry overhead is unjustified.
- When uniqueness per key is not required -- just use a regular factory.
- When the number of keys grows unboundedly, causing memory issues.

### Real-World Analogy

A company with regional offices: there is exactly one office per region (key). When you need "the Tokyo office," you always get the same one. You cannot have two Tokyo offices, but Tokyo and London are distinct instances.

### Code Example (TypeScript)

```typescript
enum NazgulName {
  KHAMUL = 'Khamul',
  MURAZOR = 'Murazor',
  DWAR = 'Dwar',
  JI_INDUR = 'Ji Indur',
  AKHORAHIL = 'Akhorahil',
  HOARMURATH = 'Hoarmurath',
  ADUNAPHEL = 'Adunaphel',
  REN = 'Ren',
  UVATHA = 'Uvatha',
}

class Nazgul {
  private static instances = new Map<NazgulName, Nazgul>();

  private constructor(private name: NazgulName) {}

  public static getInstance(name: NazgulName): Nazgul {
    if (!Nazgul.instances.has(name)) {
      Nazgul.instances.set(name, new Nazgul(name));
    }
    return Nazgul.instances.get(name)!;
  }

  public getName(): NazgulName {
    return this.name;
  }
}

// Client code
const khamul1 = Nazgul.getInstance(NazgulName.KHAMUL);
const khamul2 = Nazgul.getInstance(NazgulName.KHAMUL);
const murazor = Nazgul.getInstance(NazgulName.MURAZOR);

console.log(khamul1 === khamul2); // true  -- same key, same instance
console.log(khamul1 === murazor); // false -- different keys, different instances
```

### Trade-offs

| Pros | Cons |
|------|------|
| Controlled, key-based instance access | Memory usage grows with number of keys |
| Encapsulates instance management | Thread-safety requires synchronization (ConcurrentHashMap, locks) |
| Reduces global state vs. multiple Singletons | Shares Singleton's testability concerns |
| Natural fit for context-based resources | Instances live forever unless explicitly managed |

### Related Patterns

- **Singleton**: Multiton extends Singleton by allowing one instance per key rather than one globally.
- **Factory Method**: both control object creation, but Multiton also manages instance lifecycle.
- **Flyweight**: similar concept of sharing instances, but Flyweight focuses on shared intrinsic state with varying extrinsic state.
- **Object Pool**: pools recycle instances; Multiton caches unique instances by key.

### Common Mistakes

1. **Unbounded key space**: If keys are user-generated strings, the map can grow indefinitely -- add eviction or limit keys to enums.
2. **Not handling thread safety**: Concurrent `getInstance()` calls for the same new key can create duplicate instances.
3. **Treating Multiton as a cache**: It guarantees one-per-key identity, not TTL-based caching. Use a proper cache for expirable objects.
4. **Making instances mutable without synchronization**: If instances hold mutable state accessed from multiple threads, the Multiton itself does not protect against data races within instances.

---

## Pattern Comparisons

### Factory Method vs. Abstract Factory vs. Builder

| Dimension | Factory Method | Abstract Factory | Builder |
|-----------|---------------|-----------------|---------|
| **Purpose** | Create a single product via subclass override | Create families of related products | Construct a complex object step-by-step |
| **Creation mechanism** | Inheritance (subclass overrides method) | Composition (factory object creates family) | Step-by-step method calls on a builder |
| **Number of products** | One product per factory method | Multiple related products per factory | One complex product per build sequence |
| **When product is returned** | Immediately (one method call) | Immediately (one method call per product) | After all steps complete (`getProduct()`) |
| **Variation axis** | Which single product type to create | Which product family to create | How to construct a single product |
| **Complexity** | Low -- one method, subclass hierarchy | Medium -- interface per product + factory | Medium -- step methods + optional Director |
| **Typical evolution** | Starting point | Evolves from Factory Method | Evolves from Factory Method |

**When to use which:**
- **Factory Method**: You have one product type with multiple variants and want subclasses to decide which variant to create.
- **Abstract Factory**: You have multiple product types that must work together in families (e.g., Windows vs. Mac UI kits with buttons, checkboxes, and menus).
- **Builder**: You have one complex product with many optional parts/configurations and want to construct it incrementally.

**They can combine**: A Builder can use a Factory Method internally to create parts. An Abstract Factory can return Builders. A Director can use Abstract Factory to select which builder to use.

---

### Singleton vs. Dependency Injection

| Dimension | Singleton | Dependency Injection |
|-----------|-----------|---------------------|
| **Instance control** | Class controls its own single instance | External container/code controls instance lifecycle |
| **Access** | Global static access (`getInstance()`) | Passed explicitly via constructor/setter |
| **Coupling** | Tight -- client knows the exact Singleton class | Loose -- client knows only the interface |
| **Testability** | Hard -- cannot easily substitute test doubles | Easy -- inject mocks/stubs via constructor |
| **Flexibility** | Fixed implementation at compile time | Swap implementations at runtime/config time |
| **Global state** | Introduces global mutable state | Explicit dependency graph, no hidden globals |
| **Thread safety** | Must be handled within the Singleton class | Container typically handles lifecycle |
| **Simplicity** | Very simple to implement | Requires more setup / DI framework |

**Recommendation**: Prefer Dependency Injection in the vast majority of cases. If you have a non-stable dependency (one that might change, needs mocking, or has multiple implementations), always inject it. Singleton remains appropriate only for truly ambient, stable dependencies (e.g., a system clock abstraction) -- and even then, DI frameworks can manage singleton-scoped beans.

---

### Prototype vs. Factory Method

| Dimension | Prototype | Factory Method |
|-----------|-----------|---------------|
| **Creation mechanism** | Cloning an existing instance | Calling a creation method (inheritance) |
| **Requires subclassing** | No -- clones existing objects | Yes -- subclasses override factory method |
| **Requires initialization step** | Yes -- clone may need customization | No -- returns ready-to-use product |
| **Best when** | Objects are expensive to create from scratch, or come pre-configured | You need a clean creation interface with polymorphic selection |
| **Object reuse** | Reuses existing object as a template | Can return same instance or new instance |
| **State handling** | Carries over state from prototype (deep copy needed) | Creates fresh objects with default state |
| **Flexibility** | Dynamically add/remove prototypes at runtime | Static hierarchy of creators |
| **Typical evolution** | Designs often start with Factory Method and evolve toward Prototype when more flexibility is needed |

**When to choose**:
- **Prototype**: When you have pre-configured object variants and cloning is cheaper than constructing from scratch. Also when types are determined at runtime (dynamic loading).
- **Factory Method**: When you have a clear hierarchy of creators, the product types are known at compile time, and you want clean polymorphic creation.

---

## Summary Table: All Creational Patterns at a Glance

| Pattern | GoF? | Core Idea | Key Participants | Complexity |
|---------|------|-----------|-----------------|------------|
| **Singleton** | Yes | One instance, global access | Singleton class | Low |
| **Factory Method** | Yes | Subclass decides which object to create | Creator, Product | Low-Medium |
| **Abstract Factory** | Yes | Create families of related objects | AbstractFactory, Products | Medium |
| **Builder** | Yes | Step-by-step complex construction | Builder, Director, Product | Medium |
| **Prototype** | Yes | Clone existing objects | Prototype, Registry | Low-Medium |
| **Object Pool** | No | Recycle expensive objects | Pool, Reusable, Client | Medium |
| **Lazy Initialization** | No | Defer creation until first use | LazyHolder, Accessor | Low |
| **Dependency Injection** | No | External provision of dependencies | Client, Service, Injector | Low-Medium |
| **Multiton** | No | One instance per key (registry of singletons) | Multiton, Key, Registry | Low-Medium |

---

## Sources and References

- [Refactoring.Guru -- Singleton](https://refactoring.guru/design-patterns/singleton)
- [Refactoring.Guru -- Factory Method](https://refactoring.guru/design-patterns/factory-method)
- [Refactoring.Guru -- Abstract Factory](https://refactoring.guru/design-patterns/abstract-factory)
- [Refactoring.Guru -- Builder](https://refactoring.guru/design-patterns/builder)
- [Refactoring.Guru -- Prototype](https://refactoring.guru/design-patterns/prototype)
- [Refactoring.Guru -- Factory Comparison](https://refactoring.guru/design-patterns/factory-comparison)
- [SourceMaking -- Object Pool](https://sourcemaking.com/design_patterns/object_pool)
- [Wikipedia -- Lazy Initialization](https://en.wikipedia.org/wiki/Lazy_initialization)
- [Wikipedia -- Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [Wikipedia -- Multiton Pattern](https://en.wikipedia.org/wiki/Multiton_pattern)
- [Java Design Patterns -- Dependency Injection](https://java-design-patterns.com/patterns/dependency-injection/)
- [Java Design Patterns -- Multiton](https://java-design-patterns.com/patterns/multiton/)
- [Enterprise Craftsmanship -- Singleton vs DI](https://enterprisecraftsmanship.com/posts/singleton-vs-dependency-injection/)
- [Baeldung -- Factory Method vs Factory vs Abstract Factory](https://www.baeldung.com/cs/factory-method-vs-factory-vs-abstract-factory)
- [GoF Patterns Comparison](https://www.gofpattern.com/design-patterns/module4/common-creational-patterns.php)
- [Medium -- Lazy Initialization Design Pattern](https://justgokus.medium.com/what-is-the-lazy-initialization-design-pattern-99fa0024ce5b)
- [Medium -- Multiton Pattern](https://medium.com/@codechuckle/demystifying-design-patterns-multiton-pattern-859b50638a9f)
- [DevMaking -- Object Pool TypeScript](https://www.devmaking.com/learn/design-patterns/object-pool-pattern/typescript/)
- [Software Patterns Lexicon -- Lazy Initialization TypeScript](https://softwarepatternslexicon.com/patterns-ts/4/8/2/)
