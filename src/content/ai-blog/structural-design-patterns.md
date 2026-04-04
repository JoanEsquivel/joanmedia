---
title: "Structural Design Patterns: Composing Objects into Larger Structures"
description: "Master eleven structural design patterns — Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy and more — with comparisons and practical examples."
pubDate: 2026-03-13
category: "software-engineering"
tags:
  - Structural Patterns
  - Design Patterns
  - Adapter
  - Decorator
series: "Software Design Patterns"
seriesOrder: 4
heroImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=750&h=422&fit=crop"
---

> "Software architecture is not about the components themselves -- it is about how those components fit together."

---

## Table of Contents

1. [Introduction](#introduction)
2. [Adapter](#1-adapter)
3. [Bridge](#2-bridge)
4. [Composite](#3-composite)
5. [Decorator](#4-decorator)
6. [Facade](#5-facade)
7. [Flyweight](#6-flyweight)
8. [Proxy](#7-proxy)
9. [Module](#8-module)
10. [Private Class Data](#9-private-class-data)
11. [Twin](#10-twin)
12. [Pattern Comparisons](#pattern-comparisons)
    - [Adapter vs. Bridge vs. Facade](#adapter-vs-bridge-vs-facade)
    - [Decorator vs. Proxy](#decorator-vs-proxy)
    - [Composite vs. Flyweight](#composite-vs-flyweight)
    - [Adapter: Class vs. Object](#adapter-class-vs-object)
13. [Summary Reference Table](#summary-reference-table)
14. [Sources](#sources)

---

## Introduction

If creational patterns are about *birth* -- how objects come into existence -- then structural patterns are about *relationships* -- how objects and classes assemble into larger, more capable structures. They are the connective tissue of object-oriented design.

Structural patterns explain how to compose objects and classes into larger structures while keeping those structures flexible and efficient. They leverage two fundamental mechanisms -- inheritance and composition -- to create relationships between entities that are powerful yet loosely coupled.

Consider the challenges that arise as a system grows. You integrate a third-party library whose interface does not match yours. You need a class hierarchy that can vary along two independent dimensions without a combinatorial explosion of subclasses. You want to add behaviors to objects at runtime without modifying their source code. You need to represent a complex subsystem through a simple entry point. These are structural problems, and structural patterns are the battle-tested solutions.

This post covers all ten structural patterns: the seven from the original Gang of Four catalog (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy) plus three additional patterns recognized in modern practice (Module, Private Class Data, Twin). For each pattern, we explore its intent, the problem it solves, its solution, when to use it, when to avoid it, a real-world analogy, a complete code example in TypeScript, trade-offs, related patterns, and common mistakes. We then compare patterns that are frequently confused with one another.

If you are following this series from the beginning, you will recognize these patterns as the structural counterpart to the creational patterns discussed in [Post 3](./post-03-creational-patterns.md). In [Post 5](./post-05-behavioral-patterns.md), we will move on to behavioral patterns -- the third and final category of the Gang of Four classification.

---

## 1. Adapter

### Intent

Allows objects with incompatible interfaces to collaborate by wrapping one interface to make it compatible with another.

### Problem It Solves

You need to use an existing class whose interface is incompatible with the rest of your code. For example, your application works with JSON data but a third-party analytics library only accepts XML. You cannot modify the library's source code, and rewriting your code to match would break existing functionality.

### Solution

Create a special "adapter" object that converts the interface of one object so that another object can understand it. The adapter wraps the incompatible object, receives calls through a compatible interface, and translates them into calls the wrapped object can process. The wrapped object remains completely unaware of the adapter.

**Structure (Object Adapter -- composition-based):**
- **Client**: Contains existing business logic
- **Client Interface (Target)**: Describes the protocol other classes must follow to collaborate with the client
- **Service (Adaptee)**: A useful class with an incompatible interface (often third-party or legacy)
- **Adapter**: Implements the client interface while wrapping the service object; translates calls from the client interface into calls the service understands

**Structure (Class Adapter -- inheritance-based):**
- Inherits from both the client interface and the service class simultaneously
- Only possible in languages supporting multiple inheritance (e.g., C++)

### When to Use

- You need to use an existing class but its interface is not compatible with the rest of your code
- You want to reuse several existing subclasses that lack some common functionality that cannot be added to the superclass
- You need a middle-layer translator between your code and a legacy class, a third-party class, or any other class with an unusual interface

### When NOT to Use

- When you find yourself writing adapters between your own interfaces frequently -- this signals your abstractions are poorly designed
- When the service class can simply be modified directly (simpler than introducing an adapter)
- When only a trivial difference exists between interfaces -- the overhead of an adapter class is not justified
- When you are designing a system from scratch -- use Bridge instead of retrofitting with Adapter

### Real-World Analogy

An international power plug adapter: when you travel from the US to Europe, your US plug does not fit European sockets. A power adapter sits between your plug and the socket, converting the physical interface without changing either the plug or the socket.

### Code Example (TypeScript)

```typescript
/**
 * The Target defines the domain-specific interface used by the client code.
 */
class Target {
    public request(): string {
        return 'Target: The default target\'s behavior.';
    }
}

/**
 * The Adaptee contains useful behavior, but its interface is incompatible
 * with the existing client code.
 */
class Adaptee {
    public specificRequest(): string {
        return '.eetpadA eht fo roivaheb laicepS';
    }
}

/**
 * The Adapter makes the Adaptee's interface compatible with the Target's
 * interface via composition.
 */
class Adapter extends Target {
    private adaptee: Adaptee;

    constructor(adaptee: Adaptee) {
        super();
        this.adaptee = adaptee;
    }

    public request(): string {
        const result = this.adaptee
            .specificRequest()
            .split('')
            .reverse()
            .join('');
        return `Adapter: (TRANSLATED) ${result}`;
    }
}

// Client code supports all classes that follow the Target interface
function clientCode(target: Target) {
    console.log(target.request());
}

const target = new Target();
clientCode(target);
// Output: Target: The default target's behavior.

const adaptee = new Adaptee();
const adapter = new Adapter(adaptee);
clientCode(adapter);
// Output: Adapter: (TRANSLATED) Special behavior of the Adaptee.
```

### Trade-offs

| Pros | Cons |
|------|------|
| Single Responsibility Principle: separates interface conversion from business logic | Increases overall code complexity with new interfaces and classes |
| Open/Closed Principle: introduce new adapters without breaking existing code | Sometimes simpler to just change the service class directly |
| Works with existing, unmodifiable code | Adds an extra layer of indirection |

### Related Patterns

- **Bridge**: Designed up-front; Adapter retrofits existing incompatibilities
- **Decorator**: Extends/enhances an interface; Adapter replaces/translates it entirely
- **Facade**: Defines a new simplified interface for a subsystem; Adapter makes an existing interface usable
- **Proxy**: Provides the same interface; Adapter provides a different one

### Common Mistakes

- Adapting your own interfaces too frequently (indicates bad abstractions rather than a need for adapters)
- Creating "fat adapters" that contain business logic beyond simple translation
- Not recognizing when a Facade would be more appropriate (adapting an entire subsystem vs. a single class)
- Using class adapters in languages without multiple inheritance, leading to awkward workarounds

---

## 2. Bridge

### Intent

Decouples an abstraction from its implementation so that the two can vary independently.

### Problem It Solves

When extending a class in two independent dimensions (e.g., shapes and colors, or UI controls and platforms), you face a combinatorial explosion of subclasses. Adding a new shape AND a new color means creating classes for every combination (RedCircle, BlueCircle, RedSquare, BlueSquare, etc.), growing geometrically.

### Solution

Switch from inheritance to composition. Extract one of the dimensions into a separate class hierarchy. The original classes reference an object from this new hierarchy instead of containing all the behavior. This "bridge" connects the abstraction (high-level control logic) with the implementation (low-level platform-specific work).

**Structure:**
- **Abstraction**: High-level control layer; delegates real work to the implementation object
- **Refined Abstraction**: Variants of the control logic
- **Implementation Interface**: Declares the interface common to all concrete implementations
- **Concrete Implementations**: Platform-specific code
- **Client**: Links an abstraction object with an implementation object

### When to Use

- You have a monolithic class with several variants of functionality (e.g., supporting multiple database servers)
- You need to extend a class in several orthogonal (independent) dimensions
- You need to switch implementations at runtime
- You want platform-independent classes and applications

### When NOT to Use

- When the abstraction and implementation are tightly coupled and unlikely to change independently
- When there is only one abstraction and one implementation -- the pattern adds needless complexity
- When the system is simple enough that inheritance covers all variants without combinatorial explosion
- Over-engineering: applying Bridge to a problem that has no independent dimensions of variation

### Real-World Analogy

A remote control (abstraction) and a TV (implementation). You can have different types of remotes (basic, advanced) and different TV brands (Samsung, LG). The remote delegates work to the TV through a common device interface, and both hierarchies evolve independently.

### Code Example (TypeScript)

```typescript
class Abstraction {
    protected implementation: Implementation;

    constructor(implementation: Implementation) {
        this.implementation = implementation;
    }

    public operation(): string {
        const result = this.implementation.operationImplementation();
        return `Abstraction: Base operation with:\n${result}`;
    }
}

class ExtendedAbstraction extends Abstraction {
    public operation(): string {
        const result = this.implementation.operationImplementation();
        return `ExtendedAbstraction: Extended operation with:\n${result}`;
    }
}

interface Implementation {
    operationImplementation(): string;
}

class ConcreteImplementationA implements Implementation {
    public operationImplementation(): string {
        return 'ConcreteImplementationA: Result on platform A.';
    }
}

class ConcreteImplementationB implements Implementation {
    public operationImplementation(): string {
        return 'ConcreteImplementationB: Result on platform B.';
    }
}

// Client code depends only on the Abstraction
function clientCode(abstraction: Abstraction) {
    console.log(abstraction.operation());
}

let impl = new ConcreteImplementationA();
let abstraction = new Abstraction(impl);
clientCode(abstraction);

impl = new ConcreteImplementationB();
abstraction = new ExtendedAbstraction(impl);
clientCode(abstraction);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Platform-independent classes and apps | Can overcomplicate code when applied to a highly cohesive class |
| Client code works with high-level abstractions, not platform details | Adds indirection that may confuse developers new to the codebase |
| Open/Closed Principle: extend abstraction and implementation independently | Requires up-front design investment |
| Single Responsibility Principle: abstraction handles logic, implementation handles details | |

### Related Patterns

- **Adapter**: Retrofits existing classes; Bridge is designed up-front before classes exist
- **Abstract Factory + Bridge**: Factory can create the correct implementation for an abstraction
- **Builder + Bridge**: Director acts as abstraction, builders as implementations
- **Strategy**: Similar structure but Strategy changes an algorithm; Bridge separates abstraction from platform

### Common Mistakes

- Confusing Bridge with Adapter (Bridge is proactive; Adapter is reactive)
- Applying Bridge when there is only one dimension of variation
- Making the abstraction too thin or too thick -- the abstraction should contain only high-level logic
- Forgetting that Bridge requires up-front design; it cannot be easily retrofitted

---

## 3. Composite

### Intent

Composes objects into tree structures and lets clients treat individual objects and compositions of objects uniformly.

### Problem It Solves

When your core model can be represented as a tree (e.g., an order containing products and boxes, where boxes can contain other boxes), you need a way to calculate totals or execute operations without knowing whether you are dealing with a simple element or a nested container. Checking concrete types and navigating nested structures manually makes code brittle and tightly coupled.

### Solution

Define a common Component interface for both simple elements (leaves) and containers (composites). Containers delegate work to their children through this common interface and aggregate results. The client works through the component interface, never needing to know whether it is talking to a leaf or a composite.

**Structure:**
- **Component**: Declares the common interface for all elements
- **Leaf**: Basic element with no sub-elements; does the actual work
- **Composite (Container)**: Element with children; delegates work to children via the Component interface and aggregates results
- **Client**: Works with all elements through the Component interface

### When to Use

- You need to implement a tree-like object structure (files/folders, UI components, organizational hierarchies)
- Client code should treat simple and complex elements uniformly
- You want recursive composition for open-ended, deeply nested collections

### When NOT to Use

- When the functionality of components differs significantly -- forcing a common interface leads to over-generalization
- When the structure is flat (no nesting) -- a simple list or collection suffices
- When leaf and composite behavior has little overlap -- the common interface becomes polluted with no-op methods
- When type safety is critical -- Composite trades compile-time type checking for runtime flexibility

### Real-World Analogy

A military hierarchy: an army contains divisions, which contain brigades, which contain platoons, which contain squads of soldiers. Orders are issued at the top and cascade down through every level. Each level passes the order to its subordinates. The soldiers at the leaf level execute the actual work.

### Code Example (TypeScript)

```typescript
abstract class Component {
    protected parent!: Component | null;

    public setParent(parent: Component | null) {
        this.parent = parent;
    }

    public getParent(): Component | null {
        return this.parent;
    }

    public add(component: Component): void { }
    public remove(component: Component): void { }

    public isComposite(): boolean {
        return false;
    }

    public abstract operation(): string;
}

class Leaf extends Component {
    public operation(): string {
        return 'Leaf';
    }
}

class Composite extends Component {
    protected children: Component[] = [];

    public add(component: Component): void {
        this.children.push(component);
        component.setParent(this);
    }

    public remove(component: Component): void {
        const idx = this.children.indexOf(component);
        this.children.splice(idx, 1);
        component.setParent(null);
    }

    public isComposite(): boolean {
        return true;
    }

    public operation(): string {
        const results: string[] = [];
        for (const child of this.children) {
            results.push(child.operation());
        }
        return `Branch(${results.join('+')})`;
    }
}

// Client code
function clientCode(component: Component) {
    console.log(`RESULT: ${component.operation()}`);
}

const leaf = new Leaf();
clientCode(leaf);
// Output: RESULT: Leaf

const tree = new Composite();
const branch1 = new Composite();
branch1.add(new Leaf());
branch1.add(new Leaf());
const branch2 = new Composite();
branch2.add(new Leaf());
tree.add(branch1);
tree.add(branch2);
clientCode(tree);
// Output: RESULT: Branch(Branch(Leaf+Leaf)+Branch(Leaf))
```

### Trade-offs

| Pros | Cons |
|------|------|
| Work with complex tree structures using polymorphism and recursion | Difficult to provide a common interface when component functionality differs greatly |
| Open/Closed Principle: introduce new element types without breaking existing code | Over-generalizing the interface can reduce code comprehensibility |
| Simplifies client code that works with the tree | Leaf nodes inherit container methods (add/remove) they do not use |

### Related Patterns

- **Builder**: Can construct complex Composite trees step-by-step
- **Iterator**: Traverses Composite trees
- **Visitor**: Executes operations across an entire Composite tree
- **Flyweight**: Shared leaf nodes in a Composite save memory
- **Decorator**: Similar recursive structure, but Decorator adds responsibilities; Composite sums children's results
- **Chain of Responsibility**: Leaf components can pass requests up through parent composites

### Common Mistakes

- Putting too many operations in the Component interface that only apply to composites
- Forgetting to manage parent references, leading to orphaned nodes
- Not considering thread safety when the tree is modified concurrently
- Using Composite when a simple list would suffice (over-engineering)

---

## 4. Decorator

### Intent

Attaches new behaviors to objects dynamically by placing them inside wrapper objects that contain the behaviors.

### Problem It Solves

When you need to combine multiple optional behaviors (e.g., SMS + Facebook + Slack notifications), inheritance creates a combinatorial explosion of subclasses. Inheritance is also static -- you cannot change an object's behavior at runtime. Some classes are marked `final` and cannot be extended at all.

### Solution

Use composition instead of inheritance. Create wrapper (decorator) objects that implement the same interface as the wrapped object. The wrapper delegates all work to the wrapped object but can execute additional behavior before or after delegation. Multiple decorators can be stacked -- each wrapping the previous one -- to combine behaviors.

**Structure:**
- **Component**: Declares the common interface for wrappers and wrapped objects
- **Concrete Component**: The base object being wrapped; defines default behavior
- **Base Decorator**: Has a field referencing the wrapped object; delegates all operations to it
- **Concrete Decorators**: Override methods to add behavior before/after calling `super`
- **Client**: Wraps components in layers of decorators; works through the Component interface

### When to Use

- You need to assign extra behaviors to objects at runtime without breaking code that uses those objects
- It is awkward or impossible to extend behavior through inheritance (e.g., `final` classes)
- You want to combine several behaviors by wrapping an object in multiple decorators
- You need to divide a monolithic class into layers of reusable behavior

### When NOT to Use

- When the order of decorators matters significantly and is hard to control
- When the initial configuration of decorator stacks becomes overly complex
- When you only need one fixed combination of behaviors -- simple subclassing is cleaner
- When removing a specific decorator from the middle of a stack is a requirement (decorators are not designed for this)

### Real-World Analogy

Wearing layers of clothing: when you are cold, you put on a sweater. Still cold? Add a jacket on top. Raining? Add a raincoat over the jacket. Each layer "decorates" your body with additional protection without being intrinsic to you. You can add or remove layers independently.

### Code Example (TypeScript)

```typescript
interface Component {
    operation(): string;
}

class ConcreteComponent implements Component {
    public operation(): string {
        return 'ConcreteComponent';
    }
}

class Decorator implements Component {
    protected component: Component;

    constructor(component: Component) {
        this.component = component;
    }

    public operation(): string {
        return this.component.operation();
    }
}

class ConcreteDecoratorA extends Decorator {
    public operation(): string {
        return `ConcreteDecoratorA(${super.operation()})`;
    }
}

class ConcreteDecoratorB extends Decorator {
    public operation(): string {
        return `ConcreteDecoratorB(${super.operation()})`;
    }
}

// Client code
function clientCode(component: Component) {
    console.log(`RESULT: ${component.operation()}`);
}

const simple = new ConcreteComponent();
clientCode(simple);
// Output: RESULT: ConcreteComponent

const decorator1 = new ConcreteDecoratorA(simple);
const decorator2 = new ConcreteDecoratorB(decorator1);
clientCode(decorator2);
// Output: RESULT: ConcreteDecoratorB(ConcreteDecoratorA(ConcreteComponent))
```

### Trade-offs

| Pros | Cons |
|------|------|
| Extend behavior without new subclasses | Hard to remove a specific wrapper from the middle of a stack |
| Add/remove responsibilities at runtime | Behavior can depend on decorator ordering |
| Combine multiple behaviors through stacking | Initial configuration code looks complex and ugly |
| Single Responsibility Principle: divide monolithic classes into focused layers | Many small decorator classes can be confusing |

### Related Patterns

- **Adapter**: Changes the interface; Decorator keeps or extends it
- **Proxy**: Same interface but manages lifecycle; Decorator is controlled by the client
- **Composite**: Similar recursive structure; Composite sums children, Decorator adds to a single child
- **Chain of Responsibility**: Similar chaining; CoR can stop propagation, Decorator always passes through
- **Strategy**: Decorator changes the "skin" (external behavior); Strategy changes the "guts" (internal algorithm)

### Common Mistakes

- Using decorators when simple inheritance would suffice (over-engineering)
- Creating decorators that depend on a specific ordering (fragile design)
- Adding too many decorators, making debugging nearly impossible (stack trace becomes deep)
- Confusing Decorator with Proxy -- decorators add behavior; proxies control access

---

## 5. Facade

### Intent

Provides a simplified interface to a library, a framework, or any other complex set of classes.

### Problem It Solves

When integrating with a sophisticated library or framework, you must initialize dozens of objects, manage dependencies, and execute methods in the correct order. Business logic becomes tightly coupled to third-party implementation details, making the code hard to understand and maintain.

### Solution

Create a facade class that provides a simple interface to the most common operations of a complex subsystem. The facade delegates client requests to the appropriate subsystem objects. It may provide limited functionality compared to using the subsystem directly, but it includes only the features clients actually need.

**Structure:**
- **Facade**: Provides convenient access to a particular part of the subsystem; knows which subsystem classes to delegate to
- **Additional Facade**: Prevents the primary facade from becoming a god object; both clients and other facades can use it
- **Complex Subsystem**: Dozens of classes doing the real work; unaware of the facade's existence
- **Client**: Uses the facade instead of calling subsystem objects directly

### When to Use

- You need a limited but straightforward interface to a complex subsystem
- You want to structure a subsystem into layers with defined entry points
- Subsystems grow increasingly complex and clients need protection from that complexity
- You want to reduce coupling between multiple subsystems by forcing communication through facades

### When NOT to Use

- When the system is not actually complex -- adding a Facade is unnecessary abstraction ("abstraction bloat")
- When clients need fine-grained control over subsystem internals -- the Facade hides too much
- When you have only one or two subsystem classes -- direct usage is simpler
- When the Facade itself starts becoming a god object coupled to everything

### Real-World Analogy

Placing a phone order at a shop: you call one number (the facade), and the operator handles everything -- checking inventory, processing payment, arranging delivery. You do not interact with the warehouse, bank, or delivery company directly.

### Code Example (TypeScript)

```typescript
class Facade {
    protected subsystem1: Subsystem1;
    protected subsystem2: Subsystem2;

    constructor(subsystem1?: Subsystem1, subsystem2?: Subsystem2) {
        this.subsystem1 = subsystem1 || new Subsystem1();
        this.subsystem2 = subsystem2 || new Subsystem2();
    }

    public operation(): string {
        let result = 'Facade initializes subsystems:\n';
        result += this.subsystem1.operation1();
        result += this.subsystem2.operation1();
        result += 'Facade orders subsystems to perform the action:\n';
        result += this.subsystem1.operationN();
        result += this.subsystem2.operationZ();
        return result;
    }
}

class Subsystem1 {
    public operation1(): string {
        return 'Subsystem1: Ready!\n';
    }
    public operationN(): string {
        return 'Subsystem1: Go!\n';
    }
}

class Subsystem2 {
    public operation1(): string {
        return 'Subsystem2: Get ready!\n';
    }
    public operationZ(): string {
        return 'Subsystem2: Fire!';
    }
}

function clientCode(facade: Facade) {
    console.log(facade.operation());
}

const facade = new Facade(new Subsystem1(), new Subsystem2());
clientCode(facade);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Isolates client code from subsystem complexity | Risk of becoming a "god object" coupled to all application classes |
| Reduces dependencies between clients and subsystems | May hide too much, limiting power users |
| Provides a clean entry point for each subsystem layer | Can become a maintenance bottleneck if the subsystem changes frequently |

### Related Patterns

- **Adapter**: Wraps a single object to change its interface; Facade works with an entire subsystem
- **Abstract Factory**: Can serve as an alternative when you only need to hide subsystem object creation
- **Mediator**: Both organize collaboration, but Mediator centralizes communication; Facade simplifies access
- **Singleton**: A Facade is often implemented as a Singleton since only one is usually needed
- **Proxy**: Both buffer complex entities, but Proxy provides an identical interface

### Common Mistakes

- Letting the Facade grow into a god object that does everything
- Exposing too many subsystem details through the facade (defeating its purpose)
- Creating a facade for a system that is not actually complex
- Preventing direct subsystem access when power users legitimately need it

---

## 6. Flyweight

### Intent

Lets you fit more objects into available RAM by sharing common parts of state between multiple objects instead of storing all data in each object.

### Problem It Solves

You need to create a massive number of similar objects (e.g., millions of particles in a game, forest trees in a renderer), and each object stores redundant data (color, sprite, texture). The application crashes or runs out of memory on constrained hardware.

### Solution

Separate object state into two categories:
- **Intrinsic state**: Constant, shared data that does not change (e.g., color, sprite, texture). Stored inside the flyweight object.
- **Extrinsic state**: Context-specific data that changes per instance (e.g., coordinates, velocity). Stored externally by the client or context object.

A Flyweight Factory manages a pool of flyweight objects, returning existing ones when a matching intrinsic state is requested.

**Structure:**
- **Flyweight**: Stores intrinsic (shared) state; accepts extrinsic state via method parameters
- **Context**: Stores extrinsic state and pairs it with a flyweight reference
- **Flyweight Factory**: Manages the pool; creates or returns existing flyweights
- **Client**: Calculates/stores extrinsic state; requests flyweights from the factory

### When to Use

- Your application creates massive quantities of similar objects that drain available memory
- Objects contain duplicatable state that can be extracted and shared
- Many groups of objects can be replaced by fewer shared objects once extrinsic state is removed
- The application does not depend on object identity (shared objects are logically identical)

### When NOT to Use

- When you have a small number of objects -- the overhead of the pattern exceeds any memory savings
- When objects have little shared state -- most state is unique/extrinsic
- When RAM is abundant and performance is not constrained
- When the code complexity of separating intrinsic/extrinsic state is not justified by savings

### Real-World Analogy

A forest rendering system: instead of storing name, color, and texture data for each of a billion trees, store each unique TreeType once. Individual Tree objects hold only their coordinates and a reference to their shared TreeType flyweight.

### Code Example (TypeScript)

```typescript
class Flyweight {
    private sharedState: any;

    constructor(sharedState: any) {
        this.sharedState = sharedState;
    }

    public operation(uniqueState: any): void {
        const s = JSON.stringify(this.sharedState);
        const u = JSON.stringify(uniqueState);
        console.log(`Flyweight: shared (${s}) and unique (${u}) state.`);
    }
}

class FlyweightFactory {
    private flyweights: { [key: string]: Flyweight } = {};

    constructor(initialFlyweights: string[][]) {
        for (const state of initialFlyweights) {
            this.flyweights[this.getKey(state)] = new Flyweight(state);
        }
    }

    private getKey(state: string[]): string {
        return state.join('_');
    }

    public getFlyweight(sharedState: string[]): Flyweight {
        const key = this.getKey(sharedState);
        if (!(key in this.flyweights)) {
            console.log('FlyweightFactory: Creating new flyweight.');
            this.flyweights[key] = new Flyweight(sharedState);
        } else {
            console.log('FlyweightFactory: Reusing existing flyweight.');
        }
        return this.flyweights[key];
    }

    public listFlyweights(): void {
        const count = Object.keys(this.flyweights).length;
        console.log(`FlyweightFactory: ${count} flyweights cached.`);
        for (const key in this.flyweights) {
            console.log(key);
        }
    }
}

// Usage
const factory = new FlyweightFactory([
    ['Chevrolet', 'Camaro2018', 'pink'],
    ['Mercedes', 'C300', 'black'],
    ['BMW', 'M5', 'red'],
]);

factory.listFlyweights();

function addCarToDatabase(
    ff: FlyweightFactory,
    plates: string, owner: string,
    brand: string, model: string, color: string,
) {
    const flyweight = ff.getFlyweight([brand, model, color]);
    flyweight.operation([plates, owner]);
}

addCarToDatabase(factory, 'CL234IR', 'James Doe', 'BMW', 'M5', 'red');
// Output: Reusing existing flyweight.

addCarToDatabase(factory, 'AB567CD', 'Jane Doe', 'BMW', 'X1', 'red');
// Output: Creating new flyweight.
```

### Trade-offs

| Pros | Cons |
|------|------|
| Saves enormous amounts of RAM when dealing with millions of similar objects | Trades RAM for CPU cycles when extrinsic state must be recalculated |
| Centralizes shared state management | Significantly increases code complexity |
| | Confusing for new team members unfamiliar with the pattern |
| | Breaking the intrinsic/extrinsic separation causes subtle bugs |

### Related Patterns

- **Composite**: Flyweight often optimizes shared leaf nodes in Composite trees
- **Facade**: Flyweight creates many small shared objects; Facade creates a single object representing a subsystem
- **Singleton**: Flyweight can have many instances with shared state; Singleton has exactly one instance

### Common Mistakes

- Applying Flyweight when there are not enough objects to justify the complexity
- Making intrinsic state mutable (it MUST be immutable for sharing to be safe)
- Storing extrinsic state inside the flyweight (defeats the purpose)
- Forgetting thread safety when multiple threads access the factory concurrently

---

## 7. Proxy

### Intent

Provides a substitute or placeholder for another object, controlling access to it and allowing additional behavior before or after requests reach the original.

### Problem It Solves

A heavyweight object (e.g., a database connection, a large file, a remote service) consumes significant resources but may only be needed occasionally. Lazy initialization, access control, logging, and caching logic gets duplicated across every client. You cannot modify the original service class (e.g., third-party library).

### Solution

Create a proxy class implementing the same interface as the original service. The proxy holds a reference to the real service and delegates requests to it, but can execute additional logic (initialization, logging, access control, caching) before or after forwarding the request.

**Six primary proxy types:**
1. **Virtual Proxy (Lazy Initialization)**: Delays creation of expensive objects until needed
2. **Protection Proxy (Access Control)**: Restricts access to authorized clients only
3. **Remote Proxy**: Handles network communication to a remote service transparently
4. **Logging Proxy**: Maintains an audit trail of all service requests
5. **Caching Proxy**: Stores and reuses previous results for repeated requests
6. **Smart Reference**: Manages object lifecycle and tracks active clients

**Structure:**
- **Service Interface**: The contract both the real service and proxy implement
- **Service**: The class providing actual business logic
- **Proxy**: References the service; delegates requests after preprocessing
- **Client**: Works through the Service Interface, unaware of whether it has a proxy or real service

### When to Use

- You need lazy initialization of a heavyweight object (virtual proxy)
- You need access control to a service (protection proxy)
- You need to execute a service located on a remote server (remote proxy)
- You need request logging or caching (logging/caching proxy)
- You need to manage the lifecycle of a service object (smart reference)

### When NOT to Use

- When the service is lightweight and there is no benefit to lazy loading or access control
- When adding a proxy introduces latency that is unacceptable for the use case
- When the service interface is unstable and changes frequently (every change requires updating the proxy too)
- When a simpler approach (direct caching, middleware) accomplishes the same goal

### Real-World Analogy

A credit card is a proxy for a bank account, which is a proxy for cash. All three implement the same "payment" interface. The credit card adds convenience and security without you carrying cash. The bank account adds access control.

### Code Example (TypeScript)

```typescript
interface Subject {
    request(): void;
}

class RealSubject implements Subject {
    public request(): void {
        console.log('RealSubject: Handling request.');
    }
}

class ProxySubject implements Subject {
    private realSubject: RealSubject;

    constructor(realSubject: RealSubject) {
        this.realSubject = realSubject;
    }

    public request(): void {
        if (this.checkAccess()) {
            this.realSubject.request();
            this.logAccess();
        }
    }

    private checkAccess(): boolean {
        console.log('Proxy: Checking access prior to firing a real request.');
        return true;
    }

    private logAccess(): void {
        console.log('Proxy: Logging the time of request.');
    }
}

// Client code
function clientCode(subject: Subject) {
    subject.request();
}

console.log('Client: Using real subject:');
const realSubject = new RealSubject();
clientCode(realSubject);

console.log('\nClient: Using proxy:');
const proxy = new ProxySubject(realSubject);
clientCode(proxy);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Controls access without clients knowing | Increases code complexity with additional classes |
| Manages service lifecycle independently of clients | May introduce response latency |
| Works even when the service is unavailable (caching proxy) | Proxy must be updated when the service interface changes |
| Open/Closed Principle: introduce new proxies without modifying the service | |

### Related Patterns

- **Adapter**: Changes the interface; Proxy preserves it
- **Decorator**: Adds behavior controlled by the client; Proxy manages behavior independently
- **Facade**: Both buffer complex entities, but Facade defines a new interface; Proxy keeps the same one

### Common Mistakes

- Confusing Proxy with Decorator (Proxy controls access; Decorator adds behavior)
- Creating proxies that manage the service lifecycle in unexpected ways (e.g., disposing of the service while clients still need it)
- Not considering thread safety in caching proxies
- Using Proxy when simple dependency injection or middleware would suffice

---

## 8. Module

### Intent

Encapsulates code into independent, reusable units with explicit public/private boundaries, preventing global scope pollution.

### Problem It Solves

As applications grow, unorganized code in the global scope leads to naming collisions, accidental overwrites, and tightly coupled components. Without encapsulation, any part of the code can access and mutate any variable.

### Solution

Organize code into modules where every declaration is private by default. Only explicitly exported members become available to other modules. Modern JavaScript/TypeScript achieves this natively with ES modules.

**Key mechanisms:**
- **Named Exports**: `export function add(x, y) { ... }`
- **Default Exports**: `export default function add(x, y) { ... }`
- **Namespace Imports**: `import * as math from './math'`
- **Dynamic Imports**: `const module = await import('./math')` (enables lazy loading)
- **Re-exports**: `export { add } from './math'`

### When to Use

- Splitting large codebases into maintainable, testable pieces
- Creating reusable component or utility libraries
- Implementing code-splitting and lazy loading to improve page load times
- Preventing global scope pollution when multiple dependencies exist
- Encapsulating implementation details while exposing clean APIs

### When NOT to Use

- Simple scripts with no external dependencies and no risk of naming collisions
- Projects targeting older runtimes without module support or transpilation
- When module bundling overhead adds unnecessary build complexity
- Tiny utilities where a single file with no exports is sufficient

### Real-World Analogy

Departments in a company: each department (module) has internal operations (private) that outside departments do not see. Departments interact through well-defined interfaces (exports) -- HR provides an `onboardEmployee()` API, but its internal processes remain hidden.

### Code Example (TypeScript)

```typescript
// mathUtils.ts -- the module
const PI = 3.14159; // private to this module

export function circleArea(radius: number): number {
    return PI * radius * radius;
}

export function circleCircumference(radius: number): number {
    return 2 * PI * radius;
}

// Internal helper -- NOT exported, truly private
function validateRadius(radius: number): boolean {
    return radius > 0;
}

export default class Calculator {
    add(a: number, b: number): number { return a + b; }
    subtract(a: number, b: number): number { return a - b; }
}


// app.ts -- consuming the module
import Calculator, { circleArea, circleCircumference } from './mathUtils';

console.log(circleArea(5));           // 78.53975
console.log(circleCircumference(5));  // 31.4159

const calc = new Calculator();
console.log(calc.add(2, 3));          // 5

// PI and validateRadius are inaccessible here
```

### Trade-offs

| Pros | Cons |
|------|------|
| Encapsulation prevents naming collisions | Requires build tooling (bundler/transpiler) for older environments |
| Better code organization and maintainability | Module resolution adds slight performance overhead |
| Enables code splitting and lazy loading | Circular dependencies can cause subtle issues |
| Each module is independently testable | Over-modularization fragments code into too many tiny files |

### Related Patterns

- **Facade**: A module's public API acts as a facade over its internal complexity
- **Singleton**: A module instance is effectively a singleton in most module systems
- **Namespace**: The precursor pattern; Module is the modern, standardized replacement

### Common Mistakes

- Exporting everything (defeats the purpose of encapsulation)
- Creating circular dependencies between modules
- Over-modularizing into dozens of tiny files that are hard to navigate
- Mixing module systems (CommonJS `require` and ES `import`) in the same project
- Not using barrel files (index.ts re-exports) when a logical grouping exists

---

## 9. Private Class Data

### Intent

Restricts access to class attributes by encapsulating them in a separate data object, providing immutability after construction.

### Problem It Solves

A class exposes its attributes (even `private` ones) to manipulation by its own methods after construction. When attributes should be set only during initialization and never changed afterward, there is no built-in "final after constructor" mechanism in many languages. Methods within the class can still accidentally modify state that should be immutable.

### Solution

Extract all attributes that need protection into a separate Data class. The main class holds an instance of this Data class, initialized through the Data class's constructor. Expose attributes through getters only. Provide setters only for attributes that genuinely need to change after construction.

**Structure:**
1. **Main Class**: The class whose data needs protection
2. **Data Class**: Holds all sensitive attributes; initialized once via constructor
3. **Getters**: Provide read-only access to attributes
4. **Setters** (optional): Only for attributes that must remain mutable

### When to Use

- Class attributes should be immutable after construction but cannot be declared `final`/`readonly`
- You want to prevent accidental state mutation by the class's own methods
- You need to separate data from the methods that operate on it
- You want a clean separation between initialization and usage phases

### When NOT to Use

- When the language already provides strong immutability guarantees (e.g., Kotlin `val`, TypeScript `readonly`)
- When all attributes legitimately need to be mutable throughout the object's lifetime
- When the class is simple enough that the overhead of a separate data class is unjustified
- In languages with robust property access modifiers where the problem does not exist

### Real-World Analogy

A sealed envelope: once a letter (data) is sealed inside the envelope (data class), you can read the address on the outside (getter) but you cannot alter the contents without destroying the envelope. The envelope protects the integrity of the data after it has been "constructed" (sealed).

### Code Example (TypeScript)

```typescript
// The Data class encapsulates immutable state
class CircleData {
    private readonly radius: number;
    private readonly color: string;
    private readonly origin: { x: number; y: number };

    constructor(radius: number, color: string, origin: { x: number; y: number }) {
        this.radius = radius;
        this.color = color;
        this.origin = { ...origin }; // defensive copy
    }

    getRadius(): number { return this.radius; }
    getColor(): string { return this.color; }
    getOrigin(): { x: number; y: number } { return { ...this.origin }; }
}

// The main class delegates data storage to CircleData
class Circle {
    private data: CircleData;

    constructor(radius: number, color: string, origin: { x: number; y: number }) {
        this.data = new CircleData(radius, color, origin);
    }

    circumference(): number {
        return 2 * Math.PI * this.data.getRadius();
    }

    area(): number {
        return Math.PI * this.data.getRadius() ** 2;
    }

    describe(): string {
        return `Circle(radius=${this.data.getRadius()}, color=${this.data.getColor()})`;
    }
}

const circle = new Circle(5, 'red', { x: 0, y: 0 });
console.log(circle.describe());     // Circle(radius=5, color=red)
console.log(circle.area());          // 78.539...
console.log(circle.circumference()); // 31.415...
// No way to change radius, color, or origin after construction
```

### Trade-offs

| Pros | Cons |
|------|------|
| Controls write access to class attributes after construction | Adds an extra class for every protected class |
| Cleanly separates data from methods | Verbose in languages that already support `readonly`/`final` |
| Provides "final after constructor" semantics | Increases overall class count in the codebase |
| Encapsulates initialization logic | Over-engineering for simple value objects |

### Related Patterns

- **Flyweight**: Both separate state; Flyweight separates shared vs. unique state, Private Class Data separates mutable vs. immutable state
- **Builder**: Can be used to construct the Data class with complex initialization
- **Memento**: Both protect state; Memento captures snapshots, Private Class Data prevents mutation

### Common Mistakes

- Adding setters to the data class (defeats the purpose of immutability)
- Not making defensive copies of mutable reference types (e.g., arrays, objects)
- Using the pattern in languages where `readonly`/`final` keywords already solve the problem
- Applying it to classes where mutability is actually required

---

## 10. Twin

### Intent

Simulates multiple inheritance in languages that do not support it by using two closely linked objects that together represent a single conceptual entity.

### Problem It Solves

In languages like Java or C#, a class cannot inherit from two parent classes simultaneously. When you need an object that behaves as both a `GameItem` and a `Thread` (or any two unrelated parent classes), you have no way to inherit from both.

### Solution

Instead of one class inheriting from two parents, create two separate subclasses, each inheriting from one parent. These two objects hold references to each other (the "twin" link) and collaborate as a pair. Each handles the protocol of its parent class and forwards other requests to its twin partner. Clients reference one twin object directly and reach the other through the twin field.

**Structure:**
1. **Parent Class A**: First superclass (e.g., GameItem)
2. **Parent Class B**: Second superclass (e.g., Thread)
3. **Twin A (SubA)**: Extends Parent A; holds a reference to Twin B
4. **Twin B (SubB)**: Extends Parent B; holds a reference to Twin A
5. **Client**: Creates both twins and links them together

### When to Use

- You need to simulate multiple inheritance in a single-inheritance language
- An object must participate in two independent class hierarchies simultaneously
- You need to combine behaviors from two frameworks that require extending their respective base classes
- Legacy code integration where new and old systems have incompatible hierarchies

### When NOT to Use

- When the language supports multiple inheritance natively (C++, Python)
- When interfaces/mixins/traits can achieve the same result more cleanly
- When only one of the two hierarchies is needed
- When the coupling between the two twins is unnecessary overhead for the problem

### Real-World Analogy

A driver and a driving simulator: both interact with the same vehicle controls (steering, acceleration, braking) and receive the same feedback (speed, engine status). Despite performing similar functions, they operate in fundamentally different environments -- one physical, one virtual. They are "twinned" to ensure consistent interaction with the controls.

### Code Example (TypeScript)

```typescript
// Parent A: GameItem hierarchy
abstract class GameItem {
    abstract draw(): void;
    abstract click(): void;
}

// Parent B: independent functionality
abstract class Runnable {
    abstract run(): void;
    abstract stop(): void;
}

// Twin A: extends GameItem, references its twin
class BallItem extends GameItem {
    twin!: BallThread; // reference to twin
    private x: number = 0;
    private y: number = 0;
    private dx: number = 1;
    private dy: number = 1;

    draw(): void {
        console.log(`Drawing ball at (${this.x}, ${this.y})`);
    }

    click(): void {
        // Delegate to twin for thread control
        this.twin.toggleSuspend();
    }

    move(): void {
        this.x += this.dx;
        this.y += this.dy;
    }
}

// Twin B: extends Runnable, references its twin
class BallThread extends Runnable {
    twin!: BallItem; // reference to twin
    private suspended: boolean = false;
    private running: boolean = false;

    run(): void {
        this.running = true;
        console.log('BallThread: running');
        // In a real implementation, this would be a loop:
        // while (running) { if (!suspended) twin.move(); twin.draw(); }
    }

    stop(): void {
        this.running = false;
        console.log('BallThread: stopped');
    }

    toggleSuspend(): void {
        this.suspended = !this.suspended;
        console.log(`BallThread: ${this.suspended ? 'suspended' : 'resumed'}`);
    }
}

// Client: creates and links twins
const ballItem = new BallItem();
const ballThread = new BallThread();
ballItem.twin = ballThread;
ballThread.twin = ballItem;

// Use each twin through its own parent hierarchy
ballThread.run();       // BallThread: running
ballItem.draw();        // Drawing ball at (0, 0)
ballItem.move();
ballItem.draw();        // Drawing ball at (1, 1)
ballItem.click();       // BallThread: suspended (delegates to twin)
ballThread.stop();      // BallThread: stopped
```

### Trade-offs

| Pros | Cons |
|------|------|
| Simulates multiple inheritance in single-inheritance languages | Increased complexity managing bidirectional references |
| Enables participation in two independent class hierarchies | Potential code duplication between twins |
| Avoids complications of true multiple inheritance (diamond problem) | Message forwarding between twins adds runtime overhead |
| Allows independent replacement of either twin | Requires explicit linking and lifecycle management |

### Related Patterns

- **Adapter**: Both solve interface incompatibility; Adapter wraps one interface, Twin links two hierarchies
- **Bridge**: Both decouple hierarchies; Bridge separates abstraction/implementation, Twin links two unrelated hierarchies
- **Proxy**: Both use composition; Proxy controls access, Twin enables dual inheritance

### Common Mistakes

- Forgetting to initialize the twin references (null pointer errors)
- Creating circular dependencies that lead to memory leaks (especially without garbage collection)
- Overusing the pattern when interfaces or mixins would be simpler
- Not clearly documenting which twin owns which responsibilities

---

## Pattern Comparisons

One of the most valuable skills in working with structural patterns is understanding when to reach for one over another. The following comparisons address the most commonly confused groupings.

### Adapter vs. Bridge vs. Facade

| Aspect | Adapter | Bridge | Facade |
|--------|---------|--------|--------|
| **When designed** | After the system is built (retrofitting) | Before the system is built (up-front) | Any time, typically when complexity grows |
| **Purpose** | Makes two existing incompatible interfaces work together | Separates abstraction from implementation for independent variation | Simplifies access to a complex subsystem |
| **Scope** | Single class or interface | Two class hierarchies (abstraction + implementation) | Entire subsystem |
| **Interface** | Converts one existing interface to another existing interface | Creates two new interfaces that bridge two hierarchies | Creates a new simplified interface over existing ones |
| **Number of wrapped objects** | Typically one | One implementation object per abstraction | Many subsystem objects |
| **Direction** | Client --> Adapter --> Adaptee | Abstraction --> Implementation | Client --> Facade --> Subsystem classes |
| **Client awareness** | Client uses the target interface | Client uses the abstraction interface | Client uses the facade interface |

**Key insight**: Adapter makes things work *after* they are designed. Bridge makes them work *before* they are designed. Facade makes complex things look simple regardless of when they were designed.

---

### Decorator vs. Proxy

| Aspect | Decorator | Proxy |
|--------|-----------|-------|
| **Primary purpose** | Add new behavior/responsibilities | Control access to the object |
| **Object creation** | Always requires the wrapped object to be passed in | Can create the real object itself (lazy initialization) |
| **Behavior modification** | Additive: wraps and enhances, always forwards the call | Restrictive: can modify, intercept, or block calls entirely |
| **Stacking** | Designed to be stacked in any order; multiple decorators compose naturally | Rarely stacked; usually a single proxy suffices |
| **Lifecycle control** | Client controls composition; decorator does not manage the component's lifecycle | Proxy manages the service's lifecycle independently |
| **Specificity** | General-purpose; works with any Component implementation | Specific to a particular service; adds logic for that service |
| **Typical use cases** | Logging, encryption, compression layers | Lazy loading, access control, caching, remote calls |

**Key insight**: If you are adding functionality, use Decorator. If you are controlling access, use Proxy. Both implement the same interface as their target, but their intentions are opposite: decoration enriches, proxy restricts.

---

### Composite vs. Flyweight

| Aspect | Composite | Flyweight |
|--------|-----------|-----------|
| **Primary purpose** | Build hierarchical tree structures | Optimize memory for large numbers of similar objects |
| **Focus** | Organization and representation of part-whole hierarchies | Memory optimization through shared state |
| **Object uniqueness** | Each node is a distinct object with its own identity | Multiple objects share the same flyweight instance |
| **State management** | Each node holds its own state | Separates intrinsic (shared) and extrinsic (unique) state |
| **Relationship** | Parent-child tree | Factory-managed pool of shared instances |
| **Typical use cases** | File systems, UI component trees, organizational charts | Game particles, text rendering (character glyphs), forest rendering |

**Complementary usage**: Flyweight is often used to optimize the leaf nodes within a Composite structure. A Composite tree with millions of leaves can share leaf instances through the Flyweight pattern, dramatically reducing memory consumption.

---

### Adapter: Class vs. Object

| Aspect | Class Adapter | Object Adapter |
|--------|---------------|----------------|
| **Mechanism** | Multiple inheritance (extends both Target and Adaptee) | Composition (implements Target, holds reference to Adaptee) |
| **Language support** | Only languages with multiple inheritance (C++, Python) | All languages (Java, C#, TypeScript, etc.) |
| **Flexibility** | Less flexible; committed to one specific Adaptee class | More flexible; can adapt any subclass of Adaptee |
| **Override capability** | Can override Adaptee behavior directly | Cannot override Adaptee behavior; must delegate |
| **Number of objects** | Single object (the adapter IS both Target and Adaptee) | Two objects (adapter and adaptee) |
| **Adaptee access** | Direct access to Adaptee's protected members | Only access to Adaptee's public interface |
| **Runtime adaptee swap** | Not possible (inheritance is static) | Possible (swap the composed adaptee reference) |
| **Industry preference** | Rare; used mainly in C++ | Dominant; used in Java, C#, TypeScript, Go, etc. |

**Key insight**: Object Adapter is the de facto standard because it works in all languages, supports adapting entire class hierarchies through polymorphism, and allows runtime flexibility. Class Adapter is a niche optimization for C++ or Python where direct access to protected members is needed.

---

## Summary Reference Table

| Pattern | Intent (one line) | Key Mechanism |
|---------|-------------------|---------------|
| **Adapter** | Makes incompatible interfaces work together | Wraps one interface to match another |
| **Bridge** | Separates abstraction from implementation for independent variation | Composition of two hierarchies |
| **Composite** | Treats individual objects and compositions uniformly in tree structures | Recursive composition via shared interface |
| **Decorator** | Adds behavior to objects dynamically through wrapping | Stacked wrappers with same interface |
| **Facade** | Provides a simplified interface to a complex subsystem | Single entry point delegating to many classes |
| **Flyweight** | Shares state across many objects to save memory | Intrinsic/extrinsic state separation + factory pool |
| **Proxy** | Controls access to an object through a same-interface substitute | Delegation with access control logic |
| **Module** | Encapsulates code into private-by-default reusable units | ES module exports/imports |
| **Private Class Data** | Protects attributes from mutation after construction | Separate immutable data class |
| **Twin** | Simulates multiple inheritance via paired objects | Bidirectional references between two subclasses |

---

## Sources

- [Refactoring.Guru -- Structural Design Patterns](https://refactoring.guru/design-patterns/structural-patterns)
- [Refactoring.Guru -- Adapter](https://refactoring.guru/design-patterns/adapter)
- [Refactoring.Guru -- Bridge](https://refactoring.guru/design-patterns/bridge)
- [Refactoring.Guru -- Composite](https://refactoring.guru/design-patterns/composite)
- [Refactoring.Guru -- Decorator](https://refactoring.guru/design-patterns/decorator)
- [Refactoring.Guru -- Facade](https://refactoring.guru/design-patterns/facade)
- [Refactoring.Guru -- Flyweight](https://refactoring.guru/design-patterns/flyweight)
- [Refactoring.Guru -- Proxy](https://refactoring.guru/design-patterns/proxy)
- [SourceMaking -- Structural Patterns](https://sourcemaking.com/design_patterns/structural_patterns)
- [SourceMaking -- Private Class Data](https://sourcemaking.com/design_patterns/private_class_data)
- [Wikipedia -- Twin Pattern](https://en.wikipedia.org/wiki/Twin_pattern)
- [Java Design Patterns -- Twin](https://java-design-patterns.com/patterns/twin/)
- [Java Design Patterns -- Private Class Data](https://java-design-patterns.com/patterns/private-class-data/)
- [Patterns.dev -- Module Pattern](https://www.patterns.dev/vanilla/module-pattern/)
- [GeeksforGeeks -- Structural Design Patterns](https://www.geeksforgeeks.org/system-design/structural-design-patterns/)
- [GeeksforGeeks -- Facade vs Proxy vs Adapter vs Decorator](https://www.geeksforgeeks.org/system-design/difference-between-the-facade-proxy-adapter-and-decorator-design-patterns/)
- [Baeldung -- Proxy, Decorator, Adapter and Bridge Patterns](https://www.baeldung.com/java-structural-design-patterns)
- [Decorator vs Proxy Pattern -- doeken.org](https://doeken.org/blog/decorator-vs-proxy-pattern)
- [GitHub Gist -- Adapter vs Facade vs Bridge](https://gist.github.com/Integralist/d67f0f913d795f703b89)
- [Medium -- Structural Design Patterns Comprehensive Guide](https://olegdavimuka.medium.com/structural-design-patterns-a-comprehensive-guide-for-developers-c0ccde4a86319)
