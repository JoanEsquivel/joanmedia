---
title: "Behavioral Design Patterns: Managing Algorithms and Object Communication"
description: "Explore fourteen behavioral design patterns — from Strategy and Observer to Visitor and Specification — with detailed implementations and comparisons."
pubDate: 2026-03-13
category: "backend"
tags:
  - Behavioral Patterns
  - Design Patterns
  - Observer
  - Strategy
series: "Software Design Patterns"
seriesOrder: 5
heroImage: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=750&h=422&fit=crop"
---

> "The real complexity in software is not in data structures or interfaces -- it is in behavior. How objects communicate, how algorithms are selected, and how responsibilities are distributed across a system determine whether that system thrives or collapses under its own weight."

---

## Table of Contents

1. [Introduction](#introduction)
2. [Chain of Responsibility](#1-chain-of-responsibility)
3. [Command](#2-command)
4. [Interpreter](#3-interpreter)
5. [Iterator](#4-iterator)
6. [Mediator](#5-mediator)
7. [Memento](#6-memento)
8. [Observer](#7-observer)
9. [State](#8-state)
10. [Strategy](#9-strategy)
11. [Template Method](#10-template-method)
12. [Visitor](#11-visitor)
13. [Null Object](#12-null-object)
14. [Specification](#13-specification)
15. [Servant](#14-servant)
16. [Pattern Comparisons](#pattern-comparisons)
    - [Strategy vs. State vs. Command](#strategy-vs-state-vs-command)
    - [Observer vs. Mediator vs. Event Bus](#observer-vs-mediator-vs-event-bus)
    - [Template Method vs. Strategy](#template-method-vs-strategy)
    - [Iterator vs. Visitor](#iterator-vs-visitor)
    - [Chain of Responsibility vs. Command](#chain-of-responsibility-vs-command)
17. [Summary Table](#summary-table)
18. [Sources](#sources)

---

## Introduction

Behavioral patterns are the largest and most diverse category in the Gang of Four catalog. While creational patterns deal with object birth and structural patterns deal with object composition (covered in [Post 3](./post-03-creational-patterns.md) and [Post 4](./post-04-structural-patterns.md) respectively), behavioral patterns are concerned with something fundamentally harder: algorithms and the assignment of responsibilities between objects.

Behavioral patterns describe not just patterns of objects or classes but the patterns of *communication* between them. They shift your focus from the flow of control to the way objects are interconnected -- how they collaborate, delegate, and notify one another. These patterns help you define clean protocols for object interaction, making it possible to change behavior at runtime, decouple senders from receivers, and manage complex state machines without drowning in conditional logic.

This post covers all fourteen behavioral patterns: the eleven from the original GoF catalog (Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor) plus three additional patterns recognized in modern practice (Null Object, Specification, Servant). For each pattern, we provide its intent, problem statement, solution, usage guidance, a real-world analogy, a complete TypeScript code example, trade-offs, related patterns, and common mistakes. We conclude with five head-to-head comparisons of the most frequently confused pattern pairs.

---

## 1. Chain of Responsibility

### Intent

Lets you pass requests along a chain of handlers where each handler decides either to process the request or to pass it to the next handler in the chain.

### Problem It Solves

When multiple sequential checks or operations must be performed on requests, adding checks directly in code becomes messy, bloated, and difficult to maintain. Code duplication occurs when attempting to reuse checks across different system components. You need to decouple the sender of a request from its receiver by giving more than one object a chance to handle it.

### Solution

Transform individual behaviors into standalone handler objects linked sequentially, each maintaining a reference to the next handler. Requests travel through the chain until processed or reaching the end. Handlers can choose to process requests or pass them forward.

**Participants:**
- **Handler**: Declares the common interface for handling requests and optionally holds a reference to the next handler
- **BaseHandler**: Optional abstract class providing shared boilerplate and default forwarding behavior
- **ConcreteHandler**: Contains actual processing logic; decides whether to handle or forward the request
- **Client**: Assembles chains dynamically or triggers handlers

**Collaborations:** The client sends a request to the first handler in the chain. Each handler examines the request, either handles it or delegates to the next handler via the successor link.

### When to Use

- When you need to process different kinds of requests in various ways, but the exact types and sequences are not known in advance
- When handlers must execute in a specific order
- When the set of handlers and their order should change at runtime
- When you want to decouple senders from receivers

### When NOT to Use

- When each request requires handling by only a single known handler -- just call it directly
- When the client already knows which service should process the request
- When handler relationships are fixed and predictable -- the overhead is not justified
- When a guarantee of handling is required and you cannot tolerate unhandled requests
- For trivially simple routing logic where an `if/else` or `switch` suffices

### Real-World Analogies

- **Tech support escalation**: You call customer support; level 1 tries to help, if they cannot, they escalate to level 2, then level 3 specialists
- **Chain of command in military**: A request goes up the hierarchy until someone with sufficient authority handles it
- **Event bubbling in the DOM**: A click event propagates from the clicked element up through parent elements until one handles it or it reaches the document root

### Code Example (TypeScript)

```typescript
interface Handler<Request = string, Result = string> {
    setNext(handler: Handler<Request, Result>): Handler<Request, Result>;
    handle(request: Request): Result;
}

abstract class AbstractHandler implements Handler {
    private nextHandler: Handler;

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler; // enables chaining: a.setNext(b).setNext(c)
    }

    public handle(request: string): string {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return null;
    }
}

class AuthenticationHandler extends AbstractHandler {
    public handle(request: string): string {
        if (request === 'invalid-token') {
            return 'AuthHandler: Access denied -- invalid token.';
        }
        console.log('AuthHandler: Token is valid, passing along.');
        return super.handle(request);
    }
}

class RateLimitHandler extends AbstractHandler {
    public handle(request: string): string {
        if (request === 'rate-exceeded') {
            return 'RateLimitHandler: Too many requests.';
        }
        console.log('RateLimitHandler: Rate OK, passing along.');
        return super.handle(request);
    }
}

class LoggingHandler extends AbstractHandler {
    public handle(request: string): string {
        console.log(`LoggingHandler: Logging request [${request}]`);
        return super.handle(request);
    }
}

// Client assembles the chain
const auth = new AuthenticationHandler();
const rateLimit = new RateLimitHandler();
const logging = new LoggingHandler();

auth.setNext(rateLimit).setNext(logging);

// Requests flow through the chain
console.log(auth.handle('valid-request'));
console.log(auth.handle('invalid-token'));
```

### Trade-offs

| Pros | Cons |
|------|------|
| Control over request handling order | Some requests may go unhandled |
| Single Responsibility Principle -- each handler does one thing | Can be hard to debug the flow |
| Open/Closed Principle -- add handlers without modifying existing code | Runtime configuration errors are possible |
| Reduces coupling between sender and receivers | Performance overhead from traversing the chain |

### Related Patterns

- **Command**: Can represent requests as objects to pass through the chain
- **Composite**: A component's parent can serve as its successor in the chain
- **Decorator**: Similar linked structure, but decorators cannot break the flow; handlers can stop propagation
- **Mediator**: Centralizes communication instead of chaining it
- **Observer**: Dynamic subscriptions vs. sequential delegation

### Common Mistakes

- **No safety net**: Failing to handle the case where no handler processes the request (the request falls off the chain silently)
- **Circular chains**: Accidentally linking handlers in a loop, causing infinite recursion
- **God handler**: Making one handler too broad, defeating the purpose of separation
- **Ordering assumptions**: Hard-coding handler order when it should be configurable
- **Forgetting to call next**: A handler processes and forgets to pass along requests it should not fully consume

---

## 2. Command

### Intent

Encapsulates a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

### Problem It Solves

When GUI elements need to trigger business logic operations, creating numerous button subclasses for different click behaviors causes code duplication and tight coupling. When operations need invocation from multiple locations (buttons, menus, keyboard shortcuts), embedding logic in subclasses becomes unmaintainable.

### Solution

Extract request details into separate command classes implementing a common interface. Commands act as intermediaries between GUI elements and business logic, enabling decoupled, queueable, and reversible operations.

**Participants:**
- **Command Interface**: Declares `execute()` (and optionally `undo()`) methods
- **ConcreteCommand**: Implements specific requests, often delegating to a receiver
- **Receiver**: Contains actual business logic the command invokes
- **Invoker (Sender)**: Initiates requests via command objects rather than directly calling logic
- **Client**: Creates and configures command objects, associates them with invokers

**Collaborations:** The client creates a ConcreteCommand and sets its receiver. The invoker stores the command and calls `execute()` when triggered. The command delegates to the receiver's methods.

### When to Use

- To parameterize objects with operations (callbacks as objects)
- To queue, schedule, or execute operations remotely
- To implement undo/redo functionality using command history stacks
- To structure a system around high-level operations built from primitives (transactions)
- To decouple the object that invokes an operation from the object that performs it

### When NOT to Use

- For trivially simple operations that do not need queuing, undo, or logging -- a direct method call suffices
- When there is only one way to invoke an operation and no need for parameterization
- When the overhead of creating command objects outweighs the benefits
- If you are just wrapping a single function call with no additional behavior -- use a callback or lambda instead

### Real-World Analogies

- **Restaurant order**: A waiter (invoker) takes your order (command) to the kitchen (receiver). The order slip is a self-contained request object that can be queued, tracked, and cancelled
- **TV remote control**: Each button press creates a "command" sent to the TV (receiver). The remote (invoker) does not know how the TV processes the signal internally

### Code Example (TypeScript)

```typescript
interface Command {
    execute(): void;
    undo(): void;
}

class Receiver {
    private text: string = '';

    public write(content: string): void {
        this.text += content;
        console.log(`Document: "${this.text}"`);
    }

    public eraseLastChars(count: number): void {
        this.text = this.text.slice(0, -count);
        console.log(`Document after undo: "${this.text}"`);
    }

    public getText(): string {
        return this.text;
    }
}

class WriteCommand implements Command {
    private receiver: Receiver;
    private content: string;

    constructor(receiver: Receiver, content: string) {
        this.receiver = receiver;
        this.content = content;
    }

    public execute(): void {
        this.receiver.write(this.content);
    }

    public undo(): void {
        this.receiver.eraseLastChars(this.content.length);
    }
}

class Invoker {
    private history: Command[] = [];

    public executeCommand(command: Command): void {
        command.execute();
        this.history.push(command);
    }

    public undoLast(): void {
        const command = this.history.pop();
        if (command) {
            command.undo();
        }
    }
}

// Client code
const doc = new Receiver();
const invoker = new Invoker();

invoker.executeCommand(new WriteCommand(doc, 'Hello '));
invoker.executeCommand(new WriteCommand(doc, 'World!'));
invoker.undoLast(); // Undoes "World!"
```

### Trade-offs

| Pros | Cons |
|------|------|
| Single Responsibility Principle -- decouples invocation from execution | Increases code complexity with extra classes |
| Open/Closed Principle -- add new commands without changing existing code | Can lead to a proliferation of small command classes |
| Enables undo/redo, logging, queuing, and deferred execution | Memory overhead from storing command history |
| Commands can be composed into macros | Over-engineering risk for simple operations |

### Related Patterns

- **Chain of Responsibility**: Both decouple senders/receivers; CoR passes along a chain, Command encapsulates as objects
- **Memento**: Pairs with Command for undo -- Memento saves pre-command state
- **Strategy**: Both parameterize objects; Strategy swaps algorithms, Command defers operations
- **Visitor**: Can be seen as a powerful Command variant operating on multi-object structures
- **Prototype**: Commands can be cloned for macro operations

### Common Mistakes

- **Putting business logic in commands**: Commands should delegate to receivers, not contain complex logic themselves
- **Forgetting undo state**: Not capturing enough state to reverse the command
- **Unbounded history**: Not limiting the command history stack, leading to memory leaks
- **Ignoring idempotency**: Not considering what happens if a command is accidentally executed twice

---

## 3. Interpreter

### Intent

Given a language, defines a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.

### Problem It Solves

When a particular kind of problem occurs often enough, it may be worthwhile to express instances of the problem as sentences in a simple language. Then you can build an interpreter that solves the problem by interpreting these sentences. Recurring problems within well-defined and understood domains can be characterized as a "language" and solved with an interpretation engine.

### Solution

Define a domain language as a simple grammar, represent domain rules as language sentences, and interpret those sentences. Use a class hierarchy to represent each grammar rule, where inheritance mirrors grammatical structures. An abstract base class specifies an `interpret()` method, and each concrete subclass contributes to problem-solving by interpreting a portion of the language.

**Participants:**
- **AbstractExpression**: Declares an abstract `interpret(context)` method
- **TerminalExpression**: Implements interpret for terminal symbols in the grammar (leaf nodes)
- **NonterminalExpression**: Implements interpret for grammar rules that reference other rules (composite nodes)
- **Context**: Contains global information the interpreter needs (input being parsed, accumulated output)
- **Client**: Builds the abstract syntax tree and invokes interpret

**Collaborations:** The client builds a tree of TerminalExpression and NonterminalExpression nodes. The client initializes the context and invokes `interpret()` on the root. Each node's `interpret()` contributes to the overall interpretation.

### When to Use

- The grammar is simple and efficiency is not a primary concern
- When you have a recurring problem that can be expressed as sentences in a simple language
- When you need to evaluate expressions, parse configurations, or implement DSLs (domain-specific languages)
- For Boolean expressions, regular expressions, math parsers, SQL query builders

### When NOT to Use

- For complex grammars -- the number of classes grows large and a parser generator (ANTLR, Yacc) is a better tool
- When performance is critical -- tree-based interpretation is inherently slower than compiled approaches
- When the grammar changes frequently -- each change requires modifying the class hierarchy
- For general-purpose language parsing

### Real-World Analogies

- **Musical notation**: A musician reads a musical score (the language) and interprets it into sound. Each note symbol is a terminal expression; groups of notes form phrases (nonterminal expressions)
- **Roman numerals**: Each letter (I, V, X, L, C, D, M) is a terminal symbol, and the rules for combining them form the grammar

### Code Example (TypeScript)

```typescript
interface Expression {
    interpret(context: Map<string, boolean>): boolean;
}

class VariableExpression implements Expression {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    interpret(context: Map<string, boolean>): boolean {
        return context.get(this.name) ?? false;
    }
}

class AndExpression implements Expression {
    private left: Expression;
    private right: Expression;

    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }

    interpret(context: Map<string, boolean>): boolean {
        return this.left.interpret(context) && this.right.interpret(context);
    }
}

class OrExpression implements Expression {
    private left: Expression;
    private right: Expression;

    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }

    interpret(context: Map<string, boolean>): boolean {
        return this.left.interpret(context) || this.right.interpret(context);
    }
}

class NotExpression implements Expression {
    private expr: Expression;

    constructor(expr: Expression) {
        this.expr = expr;
    }

    interpret(context: Map<string, boolean>): boolean {
        return !this.expr.interpret(context);
    }
}

// Client: Build expression tree for "(A AND B) OR (NOT C)"
const a = new VariableExpression('A');
const b = new VariableExpression('B');
const c = new VariableExpression('C');

const expression = new OrExpression(
    new AndExpression(a, b),
    new NotExpression(c)
);

const context = new Map<string, boolean>([
    ['A', true],
    ['B', false],
    ['C', false],
]);

console.log(expression.interpret(context));
// true (A AND B = false, NOT C = true, false OR true = true)
```

### Trade-offs

| Pros | Cons |
|------|------|
| Easy to change and extend the grammar (add new Expression subclasses) | Complex grammars lead to class explosion |
| Simple grammars are easy to implement | Slow for large or complex sentences |
| Naturally fits recursive structures | Hard to maintain for non-trivial grammars |
| | No built-in parsing -- you must build the AST yourself or with a separate parser |

### Related Patterns

- **Composite**: The abstract syntax tree is a Composite; Interpreter is essentially Composite + `interpret()` operations
- **Flyweight**: Terminal symbols can be shared using Flyweight
- **Iterator**: Used to traverse the abstract syntax tree
- **Visitor**: Can be used instead of Interpreter to add operations to the AST without modifying node classes
- **State**: Can be used for parsing context management

### Common Mistakes

- **Building full parsers with it**: Interpreter is for interpreting, not parsing. Use dedicated parsers for complex grammars
- **Over-applying to complex domains**: If the grammar has more than a handful of rules, use a parser generator instead
- **Ignoring performance**: Each interpret call recurses through the tree; this can be extremely slow for large expressions
- **Conflating parsing and interpreting**: The pattern does not address how to build the AST from raw input

---

## 4. Iterator

### Intent

Provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

### Problem It Solves

Collections can have complex internal structures (lists, stacks, trees, graphs). Clients need to traverse elements without knowing the internal data structure. Adding multiple traversal algorithms directly to collection classes blurs their primary responsibility. Multiple clients may need independent, concurrent traversals of the same collection.

### Solution

Extract traversal behavior into separate iterator objects. Each iterator encapsulates traversal details (current position, remaining elements) and implements a common interface. Multiple iterators can traverse the same collection independently and concurrently.

**Participants:**
- **Iterator Interface**: Declares operations for traversal (`next()`, `hasNext()`, `current()`, etc.)
- **ConcreteIterator**: Implements a specific traversal algorithm and tracks progress independently
- **Aggregate (Collection) Interface**: Declares methods for obtaining compatible iterators
- **ConcreteAggregate**: Returns instances of the appropriate ConcreteIterator
- **Client**: Works with collections and iterators through their interfaces

**Collaborations:** The client asks the collection for an iterator. The iterator encapsulates the traversal state and provides elements one by one. The collection's internal structure remains hidden.

### When to Use

- When you need to access an aggregate object's contents without exposing its internal representation
- When you need to support multiple traversal strategies over the same collection
- When you want a uniform interface for traversing different collection types
- When you need parallel, independent iterations (e.g., multiple cursors)

### When NOT to Use

- For simple arrays or lists where built-in language iteration (`for...of`, `forEach`) is sufficient
- When you only ever need one traversal direction and the language provides it natively
- When performance is critical and the iterator overhead matters (direct index access is faster)
- When the collection is trivial and wrapping it adds no value

### Real-World Analogies

- **Walking through Rome**: You can explore the city by walking randomly, using a guidebook itinerary, or hiring a tour guide. Each is a different "iterator" over the same collection of landmarks
- **TV channel surfing**: The remote control iterates through channels without you knowing the internal tuner mechanism
- **Playlist on a music player**: Shuffle, repeat, and sequential modes are different iterators over the same song collection

### Code Example (TypeScript)

```typescript
interface Iterator<T> {
    current(): T;
    next(): T;
    key(): number;
    valid(): boolean;
    rewind(): void;
}

interface Aggregator {
    getIterator(): Iterator<string>;
}

class AlphabeticalOrderIterator implements Iterator<string> {
    private collection: WordsCollection;
    private position: number = 0;
    private reverse: boolean = false;

    constructor(collection: WordsCollection, reverse: boolean = false) {
        this.collection = collection;
        this.reverse = reverse;
        if (reverse) {
            this.position = collection.getCount() - 1;
        }
    }

    public rewind(): void {
        this.position = this.reverse
            ? this.collection.getCount() - 1
            : 0;
    }

    public current(): string {
        return this.collection.getItems()[this.position];
    }

    public key(): number {
        return this.position;
    }

    public next(): string {
        const item = this.collection.getItems()[this.position];
        this.position += this.reverse ? -1 : 1;
        return item;
    }

    public valid(): boolean {
        return this.reverse
            ? this.position >= 0
            : this.position < this.collection.getCount();
    }
}

class WordsCollection implements Aggregator {
    private items: string[] = [];

    public getItems(): string[] { return this.items; }
    public getCount(): number { return this.items.length; }
    public addItem(item: string): void { this.items.push(item); }

    public getIterator(): Iterator<string> {
        return new AlphabeticalOrderIterator(this);
    }

    public getReverseIterator(): Iterator<string> {
        return new AlphabeticalOrderIterator(this, true);
    }
}

// Client code
const collection = new WordsCollection();
collection.addItem('First');
collection.addItem('Second');
collection.addItem('Third');

const iterator = collection.getIterator();
while (iterator.valid()) {
    console.log(iterator.next());
}
// Output: First, Second, Third

const reverseIterator = collection.getReverseIterator();
while (reverseIterator.valid()) {
    console.log(reverseIterator.next());
}
// Output: Third, Second, First
```

### Trade-offs

| Pros | Cons |
|------|------|
| Single Responsibility -- traversal logic extracted from collection | Overkill for simple collections |
| Open/Closed -- new iterators/collections without breaking existing code | May be less efficient than direct access for specialized collections |
| Parallel iteration with independent state per iterator | Adds extra classes |
| Supports lazy/deferred iteration | |

### Related Patterns

- **Composite**: Use Iterator to traverse composite tree structures
- **Factory Method**: Collections can use Factory Method to return the right type of iterator
- **Memento**: Can capture and restore iteration state
- **Visitor**: Use with Iterator to execute operations on elements during traversal

### Common Mistakes

- **Modifying collection during iteration**: Adding/removing elements while iterating leads to skipped elements or exceptions. Use a copy or a fail-fast mechanism
- **Exposing internals through the iterator**: The iterator should not leak references to the collection's internal data structure
- **Reinventing the wheel**: Most modern languages have built-in iterator protocols (`Symbol.iterator` in JS/TS, `Iterable` in Java). Use the language's native mechanism rather than writing custom iterator infrastructure

---

## 5. Mediator

### Intent

Defines an object that encapsulates how a set of objects interact, promoting loose coupling by keeping objects from referring to each other explicitly.

### Problem It Solves

Complex object interactions create tight coupling and interdependencies. When UI elements (or any components) communicate directly, changing one element cascades changes throughout the system. Components become impossible to reuse because they depend on too many other concrete classes.

### Solution

Route all interactions through a mediator object. Components only notify the mediator about events; the mediator orchestrates responses by calling methods on appropriate components. This creates a hub-and-spoke communication model that decouples components from each other.

**Participants:**
- **Mediator Interface**: Declares a notification method (e.g., `notify(sender, event)`)
- **ConcreteMediator**: Encapsulates the coordination logic, holds references to all components
- **BaseComponent**: Optionally holds a reference to the mediator interface
- **ConcreteComponents**: Business logic classes that communicate only through the mediator

**Collaborations:** When something significant happens in a component, it notifies the mediator. The mediator identifies the sender and the event, then decides which other components need to react and calls their methods.

### When to Use

- When tight coupling between many classes makes changes and reuse difficult
- When you cannot reuse a component because it depends on too many other components
- When you find yourself creating many subclasses just to handle different interaction scenarios
- For dialog boxes, form validation, chat rooms, air traffic control systems

### When NOT to Use

- When only two objects need to communicate -- direct reference is simpler
- When the mediator would become a God Object more complex than the original coupling
- When the interaction logic is simple and stable
- When performance is critical -- the mediator adds an indirection layer

### Real-World Analogies

- **Air traffic control tower**: Aircraft (components) do not communicate with each other directly. They communicate only with the control tower (mediator), which coordinates takeoffs, landings, and routing
- **Chat room**: Users send messages to the chat room (mediator), which distributes them to other participants. Users do not need direct references to each other

### Code Example (TypeScript)

```typescript
interface Mediator {
    notify(sender: object, event: string): void;
}

class ChatRoom implements Mediator {
    private users: Map<string, User> = new Map();

    public register(user: User): void {
        this.users.set(user.getName(), user);
        user.setMediator(this);
    }

    public notify(sender: object, event: string): void {
        if (event.startsWith('message:')) {
            const message = event.substring(8);
            const senderName = (sender as User).getName();
            // Broadcast to all other users
            this.users.forEach((user) => {
                if (user !== sender) {
                    user.receive(senderName, message);
                }
            });
        }
    }
}

class User {
    private name: string;
    private mediator: Mediator;

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string { return this.name; }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }

    public send(message: string): void {
        console.log(`${this.name} sends: ${message}`);
        this.mediator.notify(this, `message:${message}`);
    }

    public receive(from: string, message: string): void {
        console.log(`${this.name} receives from ${from}: ${message}`);
    }
}

// Client code
const chatRoom = new ChatRoom();
const alice = new User('Alice');
const bob = new User('Bob');
const charlie = new User('Charlie');

chatRoom.register(alice);
chatRoom.register(bob);
chatRoom.register(charlie);

alice.send('Hello everyone!');
// Bob receives from Alice: Hello everyone!
// Charlie receives from Alice: Hello everyone!
```

### Trade-offs

| Pros | Cons |
|------|------|
| Single Responsibility -- communication extracted into one place | Mediator can evolve into a God Object |
| Open/Closed -- new mediators without changing components | Adds indirection layer |
| Reduces coupling between components | Can be hard to understand the flow by reading code |
| Components become more reusable | Single point of failure |

### Related Patterns

- **Facade**: Simplifies a subsystem interface but objects are unaware of it; Mediator enables mutual indirect communication
- **Observer**: Mediator can be implemented using Observer internally
- **Chain of Responsibility**: Sequential delegation vs. centralized coordination
- **Command**: Commands can be sent to the mediator for dispatch

### Common Mistakes

- **God Mediator**: Cramming too much logic into the mediator, making it the most complex class in the system
- **Overuse**: Using a mediator when direct references between two objects would be simpler and clearer
- **Circular notifications**: Component A notifies mediator, which triggers component B, which notifies mediator, which triggers A -- infinite loop
- **Exposing mediator implementation**: Components should depend on the mediator interface, not the concrete class

---

## 6. Memento

### Intent

Captures and externalizes an object's internal state so that the object can be restored to this state later, without violating encapsulation.

### Problem It Solves

You need to implement undo, rollback, or snapshot functionality, but accessing an object's internal state directly violates encapsulation. Even if fields are accessible, storing snapshots requires managing large amounts of state data without exposing implementation details to other objects.

### Solution

Delegate snapshot creation to the object that owns the state (the originator). The originator creates a memento -- an immutable snapshot object -- and the caretaker manages memento storage and retrieval without accessing the originator's internal state.

**Participants:**
- **Originator**: Creates mementos of its own state and restores state from them
- **Memento**: Immutable value object storing the originator's state snapshot; only the originator can access its contents
- **Caretaker**: Manages a collection of mementos (e.g., an undo stack); initiates save/restore but never reads memento contents

**Collaborations:** The caretaker requests a memento from the originator before a state change. To undo, the caretaker passes the memento back to the originator, which restores itself.

### When to Use

- To implement undo/redo functionality (e.g., text editors, drawing tools)
- To implement transaction rollback capabilities (e.g., database operations)
- When direct access to internal fields would violate encapsulation
- To create checkpoints in long-running processes

### When NOT to Use

- When the object's state is trivially small and simply cloning it is easier
- When the object's state includes large resources (file handles, connections) that cannot be serialized
- When state changes are infrequent and undo is not a requirement
- When the memento would consume excessive memory (use incremental snapshots instead)

### Real-World Analogies

- **Video game save files**: The game (originator) saves its state to a file (memento). The player (caretaker) manages saves and decides when to load one, without understanding the internal game state format
- **Ctrl+Z in any application**: Each action creates a snapshot; undoing restores the previous snapshot

### Code Example (TypeScript)

```typescript
class EditorMemento {
    private readonly state: string;
    private readonly date: string;

    constructor(state: string) {
        this.state = state;
        this.date = new Date().toISOString();
    }

    public getState(): string {
        return this.state;
    }

    public getDate(): string {
        return this.date;
    }

    public getName(): string {
        return `${this.date} / (${this.state.substring(0, 9)}...)`;
    }
}

class Editor {
    private content: string = '';

    public type(words: string): void {
        this.content += words;
        console.log(`Editor content: "${this.content}"`);
    }

    public save(): EditorMemento {
        return new EditorMemento(this.content);
    }

    public restore(memento: EditorMemento): void {
        this.content = memento.getState();
        console.log(`Editor restored to: "${this.content}"`);
    }

    public getContent(): string {
        return this.content;
    }
}

class History {
    private mementos: EditorMemento[] = [];

    public push(memento: EditorMemento): void {
        this.mementos.push(memento);
    }

    public pop(): EditorMemento | undefined {
        return this.mementos.pop();
    }
}

// Client code
const editor = new Editor();
const history = new History();

history.push(editor.save());
editor.type('Hello ');

history.push(editor.save());
editor.type('World!');

history.push(editor.save());
editor.type(' Extra text.');

// Undo last action
const memento = history.pop();
if (memento) editor.restore(memento); // "Hello World!"
```

### Trade-offs

| Pros | Cons |
|------|------|
| Snapshots without violating encapsulation | High RAM consumption with frequent mementos |
| Simplifies originator by delegating history management to caretaker | Caretakers must track originator lifecycle to dispose outdated mementos |
| Clean separation of concerns | Dynamic languages cannot guarantee memento immutability |
| | Storing large or complex state can be expensive |

### Related Patterns

- **Command**: Commands execute operations; mementos preserve pre-operation state for undo
- **Iterator**: Memento can capture and restore iteration state
- **Prototype**: Sometimes a simpler alternative -- clone the whole object

### Common Mistakes

- **Storing too much state**: Saving the entire object when only a delta is needed
- **Unbounded history**: Not capping the memento stack, leading to memory exhaustion
- **Mutable mementos**: Allowing external code to modify the memento's state, breaking the pattern
- **Exposing originator internals**: The memento should be opaque to everyone except the originator

---

## 7. Observer

### Intent

Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### Problem It Solves

Objects need to track changes in other objects without constant polling. Sending notifications to all possible interested parties wastes resources, while requiring interested parties to check continuously is equally wasteful. The set of dependent objects may be unknown at compile time or change at runtime.

### Solution

Implement a subscription mechanism where a "publisher" (subject) maintains a list of "subscribers" (observers). Subscribers implement a common interface with an `update()` method. When the publisher's state changes, it iterates through subscribers and calls their update methods. This decouples the publisher from specific subscriber classes.

**Participants:**
- **Subject (Publisher)**: Maintains a list of observers; provides methods to attach, detach, and notify
- **Observer (Subscriber) Interface**: Declares the `update()` notification method
- **ConcreteSubject**: Stores state of interest and notifies observers when state changes
- **ConcreteObserver**: Implements the update method to react to the subject's state changes
- **Client**: Creates subjects and observers, registers subscriptions

**Collaborations:** ConcreteSubject notifies its observers when a state change occurs. ConcreteObservers query the subject for information and update their own state in response.

### When to Use

- When changes in one object require updating others, and you do not know how many objects need updating
- When an object should be able to notify other objects without making assumptions about who those objects are
- When the subscription list changes at runtime
- For event handling systems, model-view architectures, reactive programming

### When NOT to Use

- When there is a single known dependent -- a direct reference is simpler
- When the order of notification matters and must be guaranteed (Observer does not guarantee order)
- When updates are extremely frequent and performance-critical (consider batching or event debouncing)
- When circular dependencies between observers would cause infinite notification loops

### Real-World Analogies

- **Newspaper subscription**: You subscribe to a newspaper (subject). When a new edition is published, it is delivered to all subscribers. You can cancel your subscription at any time
- **Auction house**: Bidders (observers) watch the auctioneer (subject). When a new bid is placed, all bidders are notified of the new price

### Code Example (TypeScript)

```typescript
interface Observer {
    update(subject: Subject): void;
}

interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

class EventEmitter implements Subject {
    private observers: Observer[] = [];
    private state: number;

    public attach(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index === -1) {
            this.observers.push(observer);
        }
    }

    public detach(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    public notify(): void {
        for (const observer of this.observers) {
            observer.update(this);
        }
    }

    public getState(): number {
        return this.state;
    }

    public setState(state: number): void {
        this.state = state;
        console.log(`Subject: State changed to ${state}`);
        this.notify();
    }
}

class LoggingObserver implements Observer {
    public update(subject: Subject): void {
        const state = (subject as EventEmitter).getState();
        console.log(`LoggingObserver: Reacted to state ${state}`);
    }
}

class AlertObserver implements Observer {
    public update(subject: Subject): void {
        const state = (subject as EventEmitter).getState();
        if (state > 5) {
            console.log(`AlertObserver: ALERT! State ${state} exceeds threshold!`);
        }
    }
}

// Client code
const subject = new EventEmitter();
const logger = new LoggingObserver();
const alerter = new AlertObserver();

subject.attach(logger);
subject.attach(alerter);

subject.setState(3);   // Logger reacts; alerter ignores
subject.setState(8);   // Both react
subject.detach(logger);
subject.setState(10);  // Only alerter reacts
```

### Trade-offs

| Pros | Cons |
|------|------|
| Open/Closed Principle -- add subscribers without changing publishers | Subscribers notified in unpredictable order |
| Establishes runtime object relationships | Can cause memory leaks if observers are not detached |
| Loose coupling between subject and observers | Cascade of updates can be hard to debug |
| | Lapsed listener problem -- forgotten subscriptions waste resources |

### Related Patterns

- **Mediator**: Centralizes communication; Observer distributes it. Mediator can use Observer internally
- **Chain of Responsibility**: Sequential delegation vs. broadcast notification
- **Command**: Commands can be delivered to observers as notification payloads
- **Event Bus / Pub-Sub**: An evolution of Observer that adds a central event channel, further decoupling publishers and subscribers

### Common Mistakes

- **Memory leaks (lapsed listener)**: Forgetting to unsubscribe observers when they are no longer needed, preventing garbage collection
- **Notification storms**: One state change triggers observer updates, which trigger further state changes, causing cascading notifications
- **Push vs. pull confusion**: Passing too much data in the notification (push) or too little, forcing observers to query back (pull). Choose a balanced approach
- **Thread safety**: In concurrent systems, failing to synchronize the observer list leads to race conditions

---

## 8. State

### Intent

Allows an object to alter its behavior when its internal state changes, making it appear as if the object changed its class.

### Problem It Solves

Objects often behave differently based on their internal state, leading to extensive conditional logic (`if`/`switch` statements based on a state field). As states multiply, these conditionals become unwieldy, difficult to maintain, and error-prone. Changes to one state's behavior risk breaking others.

### Solution

Create separate classes for each possible state and extract state-specific behavior into them. The original object (context) holds a reference to a state object and delegates all state-specific work to it. Transitioning between states means replacing the active state object with another. States can be aware of each other and initiate transitions.

**Participants:**
- **Context**: Maintains a reference to a ConcreteState object; delegates state-dependent behavior to it; provides a method for transitioning between states
- **State Interface**: Declares methods that all ConcreteStates must implement
- **ConcreteState**: Implements behavior associated with a particular state; may trigger transitions to other states via the context

**Collaborations:** Context delegates requests to the current state object. State objects can call `context.transitionTo(newState)` to switch the active state.

### When to Use

- When an object's behavior depends on its state and must change at runtime
- When massive conditional statements control behavior based on a state field
- When there is a lot of duplicate code across similar states and transitions
- For document workflows (Draft -> Review -> Published), order processing, UI components, game entities

### When NOT to Use

- When you have only 2-3 simple states -- a simple `if/else` is clearer
- When state transitions are trivial and the overhead of separate classes is not justified
- When the object's behavior does not change significantly across states

### Real-World Analogies

- **Traffic light**: The traffic light (context) behaves differently based on its current state (red, yellow, green). Each state knows what the next state should be and when to transition
- **Vending machine**: Insert coin (Idle -> HasMoney), select item (HasMoney -> Dispensing), dispense (Dispensing -> Idle). Each state handles inputs differently

### Code Example (TypeScript)

```typescript
abstract class State {
    protected context: Context;

    public setContext(context: Context): void {
        this.context = context;
    }

    public abstract handle1(): void;
    public abstract handle2(): void;
}

class Context {
    private state: State;

    constructor(state: State) {
        this.transitionTo(state);
    }

    public transitionTo(state: State): void {
        console.log(`Context: Transition to ${state.constructor.name}.`);
        this.state = state;
        this.state.setContext(this);
    }

    public request1(): void { this.state.handle1(); }
    public request2(): void { this.state.handle2(); }
}

class DraftState extends State {
    public handle1(): void {
        console.log('Draft: Moving document to moderation.');
        this.context.transitionTo(new ModerationState());
    }

    public handle2(): void {
        console.log('Draft: Still editing...');
    }
}

class ModerationState extends State {
    public handle1(): void {
        console.log('Moderation: Approving document.');
        this.context.transitionTo(new PublishedState());
    }

    public handle2(): void {
        console.log('Moderation: Rejecting, back to draft.');
        this.context.transitionTo(new DraftState());
    }
}

class PublishedState extends State {
    public handle1(): void {
        console.log('Published: Already published. No further action.');
    }

    public handle2(): void {
        console.log('Published: Unpublishing, back to draft.');
        this.context.transitionTo(new DraftState());
    }
}

// Client code
const doc = new Context(new DraftState());
doc.request1(); // Draft -> Moderation
doc.request1(); // Moderation -> Published
doc.request2(); // Published -> Draft
```

### Trade-offs

| Pros | Cons |
|------|------|
| Single Responsibility -- each state in its own class | Overkill for state machines with few states or infrequent changes |
| Open/Closed -- add new states without modifying existing ones | Increases number of classes |
| Eliminates bulky conditional statements | States may create new state objects on each transition (allocation overhead) |
| State transitions are explicit and visible | |

### Related Patterns

- **Strategy**: Similar structure but different intent; Strategy swaps algorithms, State changes behavior based on internal state. States can be aware of each other; strategies generally cannot
- **Bridge, Adapter**: Share similar structures (delegation to an implementation object) but solve different problems
- **Flyweight**: State objects can be shared using Flyweight if they do not store per-context data

### Common Mistakes

- **Context logic leak**: Putting state-dependent logic in the context instead of delegating to state objects
- **Tight coupling between states**: While states can know about each other (to initiate transitions), they should not depend on each other's implementation
- **Missing transitions**: Not handling all possible events in all states, leading to silent failures
- **Over-engineering**: Using State for a two-state boolean flag

---

## 9. Strategy

### Intent

Defines a family of algorithms, encapsulates each one, and makes them interchangeable, letting the algorithm vary independently from clients that use it.

### Problem It Solves

A class implements multiple variations of an algorithm through complex conditional logic. As new algorithms are added, the class becomes difficult to maintain. Modifications risk introducing bugs in existing, unrelated algorithms. The class violates the Single Responsibility and Open/Closed Principles.

### Solution

Extract each algorithm into separate classes (strategies) implementing a common interface. The original class (context) delegates work to the chosen strategy. This allows runtime algorithm switching without modifying the context or other strategies.

**Participants:**
- **Context**: Maintains a reference to a Strategy; communicates via the strategy interface; does not know the concrete strategy class
- **Strategy Interface**: Declares the method common to all algorithms
- **ConcreteStrategy**: Implements a specific algorithm variation
- **Client**: Creates a strategy object and passes it to the context

**Collaborations:** The context delegates algorithm execution to the strategy object. The client can swap the strategy at runtime by calling a setter.

### When to Use

- When you need to switch algorithms at runtime within an object
- When multiple similar classes differ only in how they execute a behavior
- When you want to isolate business logic from algorithm implementation details
- When your class contains massive conditional statements selecting algorithm variants
- For sorting strategies, pricing strategies, compression algorithms, authentication methods

### When NOT to Use

- When you have a stable, rarely-changing algorithm -- the extra abstraction is overhead
- When there is only one algorithm and no prospect of alternatives
- When clients do not need to control which algorithm is used
- In modern languages with first-class functions, a simple callback/lambda may suffice instead of a full Strategy class hierarchy

### Real-World Analogies

- **Transportation to the airport**: You can drive, take a bus, ride a bike, or call a taxi. Each is a different "strategy" for getting to the same destination. You pick one based on budget, time, or preference
- **Sorting mail**: A post office can sort mail by zip code, by size, or by priority. Each sorting method is a strategy

### Code Example (TypeScript)

```typescript
interface SortStrategy {
    sort(data: number[]): number[];
}

class BubbleSortStrategy implements SortStrategy {
    sort(data: number[]): number[] {
        console.log('Sorting using bubble sort');
        const arr = [...data];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        return arr;
    }
}

class QuickSortStrategy implements SortStrategy {
    sort(data: number[]): number[] {
        console.log('Sorting using quicksort');
        if (data.length <= 1) return data;
        const pivot = data[0];
        const left = data.slice(1).filter(x => x <= pivot);
        const right = data.slice(1).filter(x => x > pivot);
        return [...this.sort(left), pivot, ...this.sort(right)];
    }
}

class Sorter {
    private strategy: SortStrategy;

    constructor(strategy: SortStrategy) {
        this.strategy = strategy;
    }

    public setStrategy(strategy: SortStrategy): void {
        this.strategy = strategy;
    }

    public sort(data: number[]): number[] {
        return this.strategy.sort(data);
    }
}

// Client code
const data = [5, 2, 8, 1, 9, 3];
const sorter = new Sorter(new BubbleSortStrategy());
console.log(sorter.sort(data)); // [1, 2, 3, 5, 8, 9]

sorter.setStrategy(new QuickSortStrategy());
console.log(sorter.sort(data)); // [1, 2, 3, 5, 8, 9]
```

### Trade-offs

| Pros | Cons |
|------|------|
| Runtime algorithm swapping | Clients must understand strategy differences to choose correctly |
| Implementation details isolated from usage code | Overkill if algorithms rarely change |
| Composition over inheritance | Extra classes and interfaces |
| Open/Closed Principle | In functional languages, lambdas often suffice |

### Related Patterns

- **State**: Extension of Strategy where strategies (states) can be aware of each other and initiate transitions
- **Template Method**: Inheritance-based algorithmic variation vs. Strategy's composition-based approach
- **Command**: Both parameterize objects; Command focuses on deferring/queuing, Strategy on swapping algorithms
- **Decorator**: Changes the "skin" (adds behavior); Strategy changes the "guts" (replaces behavior)
- **Bridge**: Similar structure (delegation to implementation) but used for orthogonal dimension separation

### Common Mistakes

- **Strategy awareness of context**: Strategies should be self-contained and not depend on the context's implementation
- **Over-parameterizing**: Creating strategies that need too much context data passed as parameters
- **Not using functional alternatives**: In TypeScript/JavaScript, a simple `(data: T) => T` function type often replaces a full Strategy interface
- **Creating strategies for single-use**: If there will only ever be one algorithm, Strategy adds pointless complexity

---

## 10. Template Method

### Intent

Defines the skeleton of an algorithm in a superclass, letting subclasses override specific steps without changing the algorithm's overall structure.

### Problem It Solves

Multiple classes implement similar algorithms with minor variations. This leads to code duplication -- the shared structure is repeated across all classes. Changes to the shared algorithm require modifying every class. The algorithm's invariant parts become entangled with the parts that vary.

### Solution

Break the algorithm into discrete steps, implement each step as a method, and place the method calls in a single "template method" in the abstract base class. Some steps are abstract (requiring subclass implementation), some have default implementations, and some are "hooks" (empty methods that subclasses can optionally override).

**Participants:**
- **AbstractClass**: Declares the template method and defines the algorithm skeleton; declares abstract steps and optional hooks
- **ConcreteClass**: Implements all abstract steps; optionally overrides hooks and default steps; never overrides the template method itself

**Collaborations:** The template method in the abstract class calls abstract and hook methods in a fixed sequence. Subclasses provide implementations for the abstract steps and optionally override hooks.

### When to Use

- When you want clients to extend only specific steps of an algorithm, not the overall structure
- When multiple classes share nearly identical algorithms with minor variations
- When you want to consolidate duplicate code into a base class while allowing controlled variation
- For data processing pipelines, report generation, build processes, game loops

### When NOT to Use

- When the algorithm does not have a fixed structure and each subclass would override most steps
- When composition (Strategy) would be more flexible than inheritance
- When you have only one implementation and no prospect of variations
- When the algorithm has too many steps, making the template method hard to follow
- When subclasses need to change the order of steps (the template method's fixed order is a constraint)

### Real-World Analogies

- **House building blueprint**: A general construction plan (foundation, walls, roof, interior) is the template. Different builders (subclasses) customize the materials, style, and details while following the same overall plan
- **Tax filing**: The form structure (income, deductions, calculation, result) is fixed. Each taxpayer fills in their specific numbers

### Code Example (TypeScript)

```typescript
abstract class DataMiner {
    // Template method -- defines the algorithm skeleton
    public mine(path: string): void {
        const file = this.openFile(path);
        const rawData = this.extractData(file);
        const data = this.parseData(rawData);
        const analysis = this.analyzeData(data);
        this.sendReport(analysis);
        this.hook();
    }

    protected abstract openFile(path: string): string;
    protected abstract extractData(file: string): string;
    protected abstract parseData(rawData: string): object[];

    protected analyzeData(data: object[]): string {
        // Default implementation
        return `Analyzed ${data.length} records`;
    }

    protected sendReport(analysis: string): void {
        console.log(`Report: ${analysis}`);
    }

    // Hook -- optional override point
    protected hook(): void {}
}

class CsvDataMiner extends DataMiner {
    protected openFile(path: string): string {
        console.log(`Opening CSV file: ${path}`);
        return 'csv-file-handle';
    }

    protected extractData(file: string): string {
        return 'name,age\nAlice,30\nBob,25';
    }

    protected parseData(rawData: string): object[] {
        return rawData.split('\n').slice(1).map(row => {
            const [name, age] = row.split(',');
            return { name, age: parseInt(age) };
        });
    }
}

class JsonDataMiner extends DataMiner {
    protected openFile(path: string): string {
        console.log(`Opening JSON file: ${path}`);
        return 'json-file-handle';
    }

    protected extractData(file: string): string {
        return '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    }

    protected parseData(rawData: string): object[] {
        return JSON.parse(rawData);
    }

    protected hook(): void {
        console.log('JsonDataMiner: Cleanup after mining.');
    }
}

// Client code
const csvMiner = new CsvDataMiner();
csvMiner.mine('data.csv');

const jsonMiner = new JsonDataMiner();
jsonMiner.mine('data.json');
```

### Trade-offs

| Pros | Cons |
|------|------|
| Eliminates duplicate code by pulling common logic into the base class | Constrained by the fixed algorithm skeleton |
| Clients override only the parts they need | Inheritance-based; can violate Liskov Substitution Principle |
| Controlled extension points (hooks) | Complex template methods with many steps are hard to maintain |
| Algorithm structure is explicitly documented in one place | Subclass explosion if many variations exist |

### Related Patterns

- **Strategy**: Composition-based alternative. Strategy changes the entire algorithm; Template Method changes steps within a fixed structure
- **Factory Method**: Often a step within a template method
- **Hook methods**: Are an application of the Hollywood Principle ("don't call us, we'll call you")

### Common Mistakes

- **Overriding the template method**: Subclasses should never override the template method itself; only the individual steps. Mark the template method as `final` (or equivalent)
- **Too many abstract steps**: If the base class has 10 abstract methods, subclasses become painful to implement; consider using hooks with defaults
- **Rigid algorithm order**: If different subclasses need different step orders, Template Method is the wrong pattern -- use Strategy instead
- **Deep inheritance hierarchies**: Extending the template over multiple levels creates fragile, hard-to-trace code

---

## 11. Visitor

### Intent

Lets you separate algorithms from the objects on which they operate, allowing you to add new operations to existing object structures without modifying the structures.

### Problem It Solves

You need to perform multiple unrelated operations on objects in a complex structure (e.g., a tree or graph), but you do not want to pollute those classes with operation-specific code. Adding every new operation to the element classes violates the Open/Closed Principle and makes the classes bloated.

### Solution

Create separate visitor classes that implement the new operations. Elements "accept" visitors and delegate to the appropriate visitor method through a technique called **Double Dispatch**. The concrete element redirects the call to the matching visitor method based on its own type, so the correct method is called without type-checking or casting.

**Participants:**
- **Visitor Interface**: Declares a `visit` method for each concrete element type
- **ConcreteVisitor**: Implements behavior for each element type in its `visit` methods
- **Element Interface**: Declares an `accept(visitor)` method
- **ConcreteElement**: Implements `accept()` by calling `visitor.visitConcreteElement(this)`
- **ObjectStructure**: A collection or composite that can enumerate its elements and let each accept a visitor

**Collaborations:** The client creates a visitor and passes it to elements (often via an object structure). Each element calls the visitor's method corresponding to its own class. The visitor accesses the element through its public interface.

### When to Use

- When you need to perform many distinct, unrelated operations on a complex object structure
- When the element class hierarchy is stable (rarely changes) but you frequently add new operations
- When you want to clean auxiliary behavior out of business classes
- For compilers (AST processing), document exporters, serialization, report generators

### When NOT to Use

- When the element class hierarchy changes frequently -- every new element class requires updating all visitors
- When elements have very few operations and the structure is simple
- When visitor methods need access to private element data that should not be exposed
- For small, stable systems where adding methods directly to elements is simpler

### Real-World Analogies

- **Insurance agent visiting a neighborhood**: The agent (visitor) visits each house (element). Depending on the house type (residential, commercial, industrial), the agent applies a different insurance calculation -- without modifying the houses themselves
- **Tax auditor**: The auditor (visitor) examines different types of financial records (bank accounts, investments, property) using different audit procedures for each type

### Code Example (TypeScript)

```typescript
interface Visitor {
    visitCircle(element: Circle): void;
    visitRectangle(element: Rectangle): void;
    visitTriangle(element: Triangle): void;
}

interface Shape {
    accept(visitor: Visitor): void;
}

class Circle implements Shape {
    constructor(public radius: number) {}
    accept(visitor: Visitor): void {
        visitor.visitCircle(this);
    }
}

class Rectangle implements Shape {
    constructor(public width: number, public height: number) {}
    accept(visitor: Visitor): void {
        visitor.visitRectangle(this);
    }
}

class Triangle implements Shape {
    constructor(public base: number, public height: number) {}
    accept(visitor: Visitor): void {
        visitor.visitTriangle(this);
    }
}

class AreaCalculator implements Visitor {
    visitCircle(element: Circle): void {
        console.log(`Circle area: ${Math.PI * element.radius ** 2}`);
    }
    visitRectangle(element: Rectangle): void {
        console.log(`Rectangle area: ${element.width * element.height}`);
    }
    visitTriangle(element: Triangle): void {
        console.log(`Triangle area: ${(element.base * element.height) / 2}`);
    }
}

class JsonExporter implements Visitor {
    visitCircle(element: Circle): void {
        console.log(JSON.stringify({ type: 'circle', radius: element.radius }));
    }
    visitRectangle(element: Rectangle): void {
        console.log(JSON.stringify({ type: 'rectangle', width: element.width, height: element.height }));
    }
    visitTriangle(element: Triangle): void {
        console.log(JSON.stringify({ type: 'triangle', base: element.base, height: element.height }));
    }
}

// Client code
const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];

const areaCalc = new AreaCalculator();
const exporter = new JsonExporter();

shapes.forEach(shape => shape.accept(areaCalc));
shapes.forEach(shape => shape.accept(exporter));
```

### Trade-offs

| Pros | Cons |
|------|------|
| Open/Closed for new operations -- add new visitors without modifying elements | Must update ALL visitors when adding a new element class |
| Single Responsibility -- related operations grouped in one visitor class | Visitors may lack access to private element fields |
| Visitors can accumulate state during traversal | Double dispatch can be confusing to understand |
| Cleanly separates operations from data structures | Breaks encapsulation if elements must expose internals |

### Related Patterns

- **Composite**: Visitor works naturally with Composite for tree traversal
- **Iterator**: Often used with Visitor to traverse complex structures
- **Command**: Visitor can be seen as a powerful Command operating on multiple object types
- **Strategy**: Both separate algorithms from objects, but Strategy is per-object while Visitor is per-structure

### Common Mistakes

- **Unstable element hierarchy**: Using Visitor when element types change frequently causes a maintenance nightmare -- every visitor must be updated
- **Return value confusion**: The classic Visitor uses `void` visit methods. Accumulating results requires mutable state in the visitor, which can be error-prone
- **Breaking encapsulation**: Forcing elements to expose internal data for visitors to operate on
- **Ignoring language features**: In languages with pattern matching (Kotlin, Scala, Rust), the Visitor pattern is often unnecessary

---

## 12. Null Object

### Intent

Encapsulates the absence of an object by providing a substitutable alternative that offers suitable default "do nothing" behavior, eliminating the need for null checks.

### Problem It Solves

Client code is littered with null checks (`if (x !== null) x.doSomething()`). These checks are repetitive, error-prone, and violate the "Tell, Don't Ask" principle. Forgetting a single null check causes `NullPointerException` / `TypeError`. Default behavior that should happen in the absence of an object is scattered across multiple places.

### Solution

Instead of using `null`, provide a special "Null Object" that implements the same interface as real objects but with do-nothing or default behavior. Clients treat it like any other object without special-casing.

**Participants:**
- **AbstractObject**: Declares the interface for collaborators
- **RealObject**: Provides concrete, useful behavior
- **NullObject**: Implements the same interface with no-op or default behavior
- **Client**: Uses the interface without knowing whether it has a real or null object

**Collaborations:** The client receives an object (real or null) through a factory, lookup, or injection. It calls methods on the interface without checking for null. The NullObject silently absorbs calls.

### When to Use

- When client code repeatedly checks for null before calling methods
- When "do nothing" is a valid default behavior
- When you want to simplify client code by eliminating conditionals
- For default loggers (NullLogger that discards messages), default event handlers, placeholder objects

### When NOT to Use

- When the absence of an object is an exceptional condition that should fail loudly (throw an error)
- When you need to distinguish between "no object" and "object with default behavior" -- Null Object hides this distinction
- When the interface has methods that must return meaningful values -- Null Object's "default" return might mask bugs
- When it would hide real problems that should be surfaced during development

### Real-World Analogies

- **Mannequin in a clothing store**: It "wears" clothes like a real person would, but it does not move, eat, or talk. It is a stand-in that fulfills the "wearable display" interface without real behavior
- **Off switch**: A device in the "off" state still accepts button presses; it just does nothing in response

### Code Example (TypeScript)

```typescript
interface Logger {
    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
    warn(message: string): void {
        console.warn(`[WARN] ${message}`);
    }
    error(message: string): void {
        console.error(`[ERROR] ${message}`);
    }
}

class NullLogger implements Logger {
    log(_message: string): void { /* do nothing */ }
    warn(_message: string): void { /* do nothing */ }
    error(_message: string): void { /* do nothing */ }
}

class UserService {
    private logger: Logger;

    constructor(logger?: Logger) {
        // Instead of checking for null throughout the class,
        // use NullLogger as the default
        this.logger = logger ?? new NullLogger();
    }

    public getUser(id: string): object {
        this.logger.log(`Fetching user ${id}`);
        // ... business logic ...
        this.logger.log(`User ${id} found`);
        return { id, name: 'Alice' };
    }
}

// With logging
const service1 = new UserService(new ConsoleLogger());
service1.getUser('123'); // Logs output

// Without logging -- no null checks needed
const service2 = new UserService();
service2.getUser('456'); // Silent, no errors
```

### Trade-offs

| Pros | Cons |
|------|------|
| Eliminates null checks and NullPointerExceptions | Can hide bugs by silently absorbing calls that should have failed |
| Simplifies client code | Hard to distinguish "intended no-op" from "missing implementation" |
| Makes code more polymorphic and clean | Not applicable when null signals an error condition |
| Easy to implement; often a singleton | Can proliferate if many interfaces need null variants |

### Related Patterns

- **Strategy**: Null Object is a special case of Strategy with "do nothing" as the algorithm
- **State**: Null Object can be a "null state" in a state machine
- **Singleton**: Null Objects are typically stateless and can be singletons
- **Proxy**: Similar structure but different intent; Proxy controls access, Null Object provides default behavior

### Common Mistakes

- **Masking real errors**: Using Null Object where a failure should be reported. If a database connection is null, silently doing nothing hides a critical issue
- **Returning null from Null Object methods**: Methods that return values (not void) need sensible defaults (empty string, 0, empty list) -- not `null`
- **Making Null Objects mutable**: Null Objects should be stateless and immutable; they should never transform into real objects
- **Overusing it**: Not every nullable reference needs a Null Object. Sometimes `Optional<T>` or explicit null handling is more appropriate

---

## 13. Specification

### Intent

Encapsulates business rules into combinable, reusable objects that can be chained together using Boolean logic (AND, OR, NOT) to create complex selection criteria.

### Problem It Solves

Business rules for selecting, validating, or filtering objects are scattered throughout the codebase, duplicated across layers, and tangled with domain objects. When rules change, you must hunt through multiple classes to update them. Complex compound rules (e.g., "overdue AND not-in-collection AND notices-sent >= 3") become deeply nested conditionals.

### Solution

Extract each business rule into a Specification class with an `isSatisfiedBy(candidate)` method that returns a boolean. Provide composite specifications (And, Or, Not) that combine leaf specifications using Boolean logic. This creates a declarative, composable rule system.

**Participants:**
- **Specification Interface**: Declares `isSatisfiedBy(candidate): boolean` and combination methods (`and()`, `or()`, `not()`)
- **AbstractSpecification**: Base class implementing combination logic
- **ConcreteSpecification (Leaf)**: Implements a single business rule
- **CompositeSpecification**: Combines specifications using AND, OR, NOT
- **Client**: Builds composite specifications from leaf specifications and evaluates candidates

**Collaborations:** The client composes specifications at runtime. When evaluating a candidate, the composite delegates to leaf specifications and combines results with Boolean logic.

### When to Use

- For filtering, validation, or selection with dynamic, combinable criteria
- In Domain-Driven Design to encapsulate business rules
- When filtering criteria change frequently or are user-defined (e.g., search filters)
- For query object construction (converting specifications to database queries)
- When the same rule must be applied in multiple layers (UI validation, service layer, repository)

### When NOT to Use

- For simple, single-criterion checks -- a plain function suffices
- When criteria never compose or change
- When performance is critical and the overhead of object creation for each rule matters
- When the domain has very few rules that are unlikely to grow

### Real-World Analogies

- **Online shopping filters**: "Price < $50 AND Rating > 4 AND In Stock." Each filter is a specification; combining them narrows the results. Users compose criteria dynamically
- **Job application screening**: "Has degree AND 3+ years experience AND no criminal record." Each criterion is an independent, reusable specification

### Code Example (TypeScript)

```typescript
interface Specification<T> {
    isSatisfiedBy(candidate: T): boolean;
    and(other: Specification<T>): Specification<T>;
    or(other: Specification<T>): Specification<T>;
    not(): Specification<T>;
}

abstract class AbstractSpecification<T> implements Specification<T> {
    abstract isSatisfiedBy(candidate: T): boolean;

    and(other: Specification<T>): Specification<T> {
        return new AndSpecification(this, other);
    }

    or(other: Specification<T>): Specification<T> {
        return new OrSpecification(this, other);
    }

    not(): Specification<T> {
        return new NotSpecification(this);
    }
}

class AndSpecification<T> extends AbstractSpecification<T> {
    constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
    isSatisfiedBy(candidate: T): boolean {
        return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
    }
}

class OrSpecification<T> extends AbstractSpecification<T> {
    constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
    isSatisfiedBy(candidate: T): boolean {
        return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
    }
}

class NotSpecification<T> extends AbstractSpecification<T> {
    constructor(private spec: Specification<T>) { super(); }
    isSatisfiedBy(candidate: T): boolean {
        return !this.spec.isSatisfiedBy(candidate);
    }
}

// Domain
interface Product {
    name: string;
    price: number;
    rating: number;
    inStock: boolean;
}

class PriceBelow extends AbstractSpecification<Product> {
    constructor(private maxPrice: number) { super(); }
    isSatisfiedBy(product: Product): boolean {
        return product.price < this.maxPrice;
    }
}

class RatingAbove extends AbstractSpecification<Product> {
    constructor(private minRating: number) { super(); }
    isSatisfiedBy(product: Product): boolean {
        return product.rating > this.minRating;
    }
}

class InStock extends AbstractSpecification<Product> {
    isSatisfiedBy(product: Product): boolean {
        return product.inStock;
    }
}

// Client code -- composing specifications
const affordableAndHighRated = new PriceBelow(50)
    .and(new RatingAbove(4))
    .and(new InStock());

const products: Product[] = [
    { name: 'Widget', price: 30, rating: 4.5, inStock: true },
    { name: 'Gadget', price: 80, rating: 4.8, inStock: true },
    { name: 'Doohickey', price: 20, rating: 3.2, inStock: false },
];

const results = products.filter(p => affordableAndHighRated.isSatisfiedBy(p));
console.log(results); // [{ name: 'Widget', ... }]
```

### Trade-offs

| Pros | Cons |
|------|------|
| Highly reusable, composable business rules | Proliferation of small specification classes |
| Easy to unit test each rule independently | Performance overhead from object creation and Boolean evaluation |
| Declarative rule composition | Can be overkill for simple filtering |
| Supports DDD and clean architecture | Learning curve for team members unfamiliar with the pattern |

### Related Patterns

- **Composite**: Specification uses the Composite pattern structure for AND, OR, NOT combinations
- **Strategy**: Both encapsulate logic; Strategy varies algorithms, Specification varies selection criteria
- **Interpreter**: Specification can be seen as a simple interpreter for Boolean expressions over domain objects
- **Decorator**: Specifications can be decorated with additional behavior (logging, caching)

### Common Mistakes

- **Over-composing**: Building deeply nested specification trees that are harder to read than a simple `if` statement
- **Ignoring query translation**: Evaluating specifications in-memory when they should be translated to database queries for performance
- **Stateful specifications**: Specifications should be stateless and immutable; side effects break composability
- **Not leveraging generics**: Making specifications type-unsafe by accepting `any` instead of typed candidates

---

## 14. Servant

### Intent

Provides common functionality to a group of classes without defining that functionality in each of them, using a separate "servant" class that operates on the served objects.

### Problem It Solves

Multiple classes need the same behavior (e.g., moving, rendering, serializing), but you cannot (or should not) add that behavior to a common superclass -- perhaps because the classes already have different base classes, or because the behavior is not core to their identity. Duplicating the code across each class violates DRY.

### Solution

Define a Servant class whose methods take the serviced objects as parameters. Define an interface that serviced classes must implement so the servant can operate on them. The servant provides the shared behavior externally.

**Participants:**
- **Servant**: Class that provides shared functionality via methods that accept serviced objects as parameters
- **Serviced Interface**: Declares methods that serviced objects must implement for the servant to use
- **Serviced Objects**: Implement the interface and expose the state the servant needs
- **Client**: Creates the servant and passes serviced objects to it

**Two interaction models:**
1. **Client-driven**: The client calls the servant directly, passing serviced objects as parameters
2. **Serviced-driven**: Serviced objects hold a reference to the servant and delegate to it when needed

### When to Use

- When you need to provide common behavior to classes that cannot share a base class
- For operations that are not the primary responsibility of the objects (auxiliary/cross-cutting behavior)
- For shared GUI operations (rendering, hit-testing) across different widget types
- For game entity operations (movement, collision detection) across different entity types
- For logging, auditing, or serialization across diverse business objects

### When NOT to Use

- When the behavior is core to the objects' identity and belongs in a common base class
- When only one class needs the behavior -- just add it directly
- When the servant would need deep access to private state, breaking encapsulation
- When a Strategy, Visitor, or simple utility method would be more appropriate

### Real-World Analogies

- **Restaurant waiter**: The waiter (servant) serves multiple tables (serviced objects) by taking orders, delivering food, and handling payments -- without modifying the tables or customers
- **Janitor**: The janitor (servant) provides cleaning services to multiple rooms (serviced objects) in a building. Each room must be "accessible" (implement the interface) for the janitor to clean it

### Code Example (TypeScript)

```typescript
interface Movable {
    getPosition(): { x: number; y: number };
    setPosition(x: number, y: number): void;
}

class MoveServant {
    public moveBy(obj: Movable, dx: number, dy: number): void {
        const pos = obj.getPosition();
        obj.setPosition(pos.x + dx, pos.y + dy);
    }

    public moveTo(obj: Movable, x: number, y: number): void {
        obj.setPosition(x, y);
    }
}

class Player implements Movable {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getPosition() { return { x: this.x, y: this.y }; }
    setPosition(x: number, y: number) { this.x = x; this.y = y; }
    toString() { return `Player at (${this.x}, ${this.y})`; }
}

class Enemy implements Movable {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getPosition() { return { x: this.x, y: this.y }; }
    setPosition(x: number, y: number) { this.x = x; this.y = y; }
    toString() { return `Enemy at (${this.x}, ${this.y})`; }
}

// Client code
const mover = new MoveServant();
const player = new Player(0, 0);
const enemy = new Enemy(10, 10);

mover.moveBy(player, 5, 3);
console.log(player.toString()); // Player at (5, 3)

mover.moveTo(enemy, 0, 0);
console.log(enemy.toString()); // Enemy at (0, 0)
```

### Trade-offs

| Pros | Cons |
|------|------|
| Eliminates code duplication across unrelated classes | Increases number of classes |
| Keeps classes focused on primary responsibilities | Can create tight coupling if servant needs too much internal state |
| Works across different class hierarchies | Can complicate understanding (behavior is external to the object) |
| Promotes separation of concerns | May be less intuitive than adding methods directly |

### Related Patterns

- **Visitor**: Similar in that behavior is external to the elements; Visitor uses double dispatch, Servant uses a simpler parameter-passing approach
- **Strategy**: Strategy is plugged into an object to change its behavior; Servant operates on an object from outside
- **Facade**: Facade simplifies a subsystem interface; Servant adds capabilities to objects
- **Adapter**: Adapter changes an interface; Servant adds behavior through an existing interface
- **Command**: Commands encapsulate requests; Servants provide reusable operations

### Common Mistakes

- **Fat servants**: Putting too many unrelated operations in a single servant, making it a God class
- **Breaking encapsulation**: Requiring serviced objects to expose too much internal state for the servant to work
- **Confusing with utility classes**: Servants operate on objects through defined interfaces; utility classes are static methods with no polymorphism
- **Ignoring Visitor as an alternative**: When you need double dispatch (behavior varies by both operation type AND element type), Visitor is a better fit

---

## Pattern Comparisons

Behavioral patterns frequently overlap in structure while diverging in intent. The following comparisons address the most commonly confused groupings and will help you choose the right tool for each situation.

### Strategy vs. State vs. Command

| Aspect | Strategy | State | Command |
|--------|----------|-------|---------|
| **Intent** | Swap interchangeable algorithms | Change behavior based on internal state | Encapsulate a request as an object |
| **Who decides** | The client selects the strategy | The context or current state triggers transitions | The client creates and configures commands |
| **Awareness** | Strategies are unaware of each other | States know about other states and trigger transitions | Commands are independent |
| **Multiplicity** | One strategy active at a time | One state active at a time, but transitions are continuous | Multiple commands can be queued, logged, undone |
| **Focus** | "How to do it" (algorithm selection) | "What can I do now" (state-dependent behavior) | "What to do" (request encapsulation) |
| **Undo support** | Not inherent | Not inherent (but states can transition back) | Core feature -- command history enables undo/redo |
| **Lifecycle** | Typically set once or swapped occasionally | Transitions frequently during object lifetime | Created, executed, possibly undone and discarded |

**Key insight**: State is essentially Strategy where the strategies (states) are aware of each other and can trigger transitions. Command is about turning operations into first-class objects for queuing, logging, and undoing.

---

### Observer vs. Mediator vs. Event Bus

| Aspect | Observer | Mediator | Event Bus |
|--------|----------|----------|-----------|
| **Topology** | One-to-many (subject to observers) | Many-to-many through a central hub | Many-to-many through a central channel |
| **Coupling** | Observers know the subject interface | Components know only the mediator interface | Publishers and subscribers know only the bus |
| **Direction** | Subject pushes to observers | Bidirectional through mediator | Fully decoupled -- publishers and subscribers are anonymous |
| **Communication** | Direct notification | Mediator decides who to notify | Topic/event-based routing |
| **Scalability** | Works well for small numbers of observers | Can become a God Object | Scales well but debugging is harder |
| **Use case** | React to state changes in one object | Coordinate complex interactions between many objects | System-wide event distribution, microservices |

**Key insight**: Observer is the simplest (1:N direct notification). Mediator adds centralized control (N:N coordinated). Event Bus further decouples by removing the requirement that publishers know about the mediator at all -- everything is topic-based.

---

### Template Method vs. Strategy

| Aspect | Template Method | Strategy |
|--------|----------------|----------|
| **Mechanism** | Inheritance | Composition |
| **Variation point** | Override specific steps within a fixed skeleton | Replace the entire algorithm |
| **Binding time** | Compile time (class hierarchy) | Runtime (swap strategy objects) |
| **Coupling** | Subclass is tightly coupled to the abstract class | Strategy is loosely coupled to the context |
| **Flexibility** | Less flexible -- fixed algorithm structure, subclasses only customize steps | More flexible -- any conforming strategy can be plugged in |
| **Use when** | The algorithm structure is invariant; only details vary | The entire algorithm should be swappable |
| **GoF wisdom** | "Template Methods use inheritance to vary part of an algorithm" | "Strategies use delegation to vary the entire algorithm" |

**Key insight**: Template Method says "the algorithm shape is fixed; subclasses fill in the blanks." Strategy says "the algorithm itself is a pluggable component."

---

### Iterator vs. Visitor

| Aspect | Iterator | Visitor |
|--------|----------|---------|
| **Purpose** | Traverse elements sequentially | Perform operations on elements |
| **Focus** | Access/navigation | Behavior/computation |
| **Element awareness** | Iterator does not add behavior to elements | Visitor adds new operations without modifying elements |
| **Double dispatch** | Not used | Core technique |
| **Adding new elements** | Easy -- iterator works with the collection interface | Hard -- must update all visitors |
| **Adding new operations** | N/A -- iterator only traverses | Easy -- add a new visitor class |
| **Often combined** | Yes -- Iterator traverses, Visitor operates | Yes -- Visitor uses Iterator to reach elements |

**Key insight**: Iterator answers "how do I get to each element?" Visitor answers "what do I do with each element?" They are complementary and often used together.

---

### Chain of Responsibility vs. Command

| Aspect | Chain of Responsibility | Command |
|--------|------------------------|---------|
| **Request handling** | Passed along a chain until handled | Directly dispatched to a specific receiver |
| **Receiver knowledge** | Sender does not know which handler will process | Sender (invoker) holds the command, which knows the receiver |
| **Number of handlers** | One or zero (may go unhandled) | Exactly one receiver per command |
| **Decoupling** | Sender decoupled from all handlers | Sender decoupled from receiver but bound to the command |
| **Primary use** | Request filtering, middleware pipelines, event propagation | Undo/redo, queuing, logging, macro recording |
| **Flow** | Sequential -- each handler gets a chance | Direct -- command is executed by the invoker |

**Key insight**: Chain of Responsibility says "someone in this chain will handle it (hopefully)." Command says "this specific operation encapsulated in an object will be executed."

---

## Summary Table

| Pattern | Category | Key Mechanism | Primary Benefit |
|---------|----------|---------------|-----------------|
| **Chain of Responsibility** | GoF | Linked handler chain | Decouples sender from receivers |
| **Command** | GoF | Request as object | Enables undo, queue, log |
| **Interpreter** | GoF | Grammar class hierarchy | Evaluates language sentences |
| **Iterator** | GoF | External traversal object | Hides collection internals |
| **Mediator** | GoF | Central coordinator | Reduces N:N coupling |
| **Memento** | GoF | State snapshot | Enables undo without breaking encapsulation |
| **Observer** | GoF | Subscription notification | Loose coupling for state changes |
| **State** | GoF | Delegated state objects | Eliminates state conditionals |
| **Strategy** | GoF | Pluggable algorithm | Runtime algorithm swapping |
| **Template Method** | GoF | Inheritance skeleton | Reuse with controlled variation |
| **Visitor** | GoF | Double dispatch | Add operations without modifying elements |
| **Null Object** | Extended | No-op implementation | Eliminates null checks |
| **Specification** | Extended | Composable Boolean rules | Reusable business rule evaluation |
| **Servant** | Extended | External behavior provider | Shared behavior without inheritance |

---

## Sources

- [Refactoring.Guru -- Behavioral Patterns](https://refactoring.guru/design-patterns/behavioral-patterns)
- [Refactoring.Guru -- Chain of Responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)
- [Refactoring.Guru -- Command](https://refactoring.guru/design-patterns/command)
- [Refactoring.Guru -- Iterator](https://refactoring.guru/design-patterns/iterator)
- [Refactoring.Guru -- Mediator](https://refactoring.guru/design-patterns/mediator)
- [Refactoring.Guru -- Memento](https://refactoring.guru/design-patterns/memento)
- [Refactoring.Guru -- Observer](https://refactoring.guru/design-patterns/observer)
- [Refactoring.Guru -- State](https://refactoring.guru/design-patterns/state)
- [Refactoring.Guru -- Strategy](https://refactoring.guru/design-patterns/strategy)
- [Refactoring.Guru -- Template Method](https://refactoring.guru/design-patterns/template-method)
- [Refactoring.Guru -- Visitor](https://refactoring.guru/design-patterns/visitor)
- [SourceMaking -- Interpreter](https://sourcemaking.com/design_patterns/interpreter)
- [SourceMaking -- Chain of Responsibility](https://sourcemaking.com/design_patterns/chain_of_responsibility)
- [SourceMaking -- Null Object](https://sourcemaking.com/design_patterns/null_object)
- [Specification Pattern -- Wikipedia](https://en.wikipedia.org/wiki/Specification_pattern)
- [Java Design Patterns -- Specification](https://java-design-patterns.com/patterns/specification/)
- [Servant Pattern -- Wikipedia](https://en.wikipedia.org/wiki/Servant_(design_pattern))
- [Java Design Patterns -- Servant](https://java-design-patterns.com/patterns/servant/)
- [Specification Design Pattern -- Design Pattern Evangelist Blog](https://jhumelsine.github.io/2024/03/06/specification-design-pattern.html)
- [Martin Fowler -- Specifications](https://martinfowler.com/apsupp/spec.pdf)
- [Patterns.dev](https://www.patterns.dev/)
- [GeeksforGeeks -- Design Patterns Cheat Sheet](https://www.geeksforgeeks.org/system-design/design-patterns-cheat-sheet-when-to-use-which-design-pattern/)
- Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994.
- Freeman, Robson. *Head First Design Patterns*, 2nd Ed. O'Reilly Media, 2021.
- Kerievsky, Joshua. *Refactoring to Patterns*. Addison-Wesley, 2004.
