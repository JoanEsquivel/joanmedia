---
title: "The Pattern Decision Framework: Choosing the Right Pattern"
description: "A practical framework for selecting the right design pattern — with problem-to-pattern mappings, decision flowcharts, architecture layer guidance, and a learning path."
pubDate: 2026-03-13
category: "software-engineering"
tags:
  - Design Patterns
  - Software Architecture
  - Decision Framework
  - Software Engineering
series: "Software Design Patterns"
seriesOrder: 10
heroImage: "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=750&h=422&fit=crop"
---

*The hardest part of design patterns is not learning them. It is knowing which one to use --- and when to use none at all.*

---

## Table of Contents

- [The Real Challenge](#the-real-challenge)
- [Problem-to-Pattern Mapping](#problem-to-pattern-mapping)
  - [Creational Problems](#creational-problems)
  - [Structural Problems](#structural-problems)
  - [Behavioral Problems](#behavioral-problems)
  - [Cross-Cutting and Architectural Problems](#cross-cutting-and-architectural-problems)
- [Pattern Relationship Map](#pattern-relationship-map)
  - [Creational Pattern Combinations](#creational-pattern-combinations)
  - [Structural Pattern Combinations](#structural-pattern-combinations)
  - [Behavioral Pattern Combinations](#behavioral-pattern-combinations)
  - [Cross-Category Combinations](#cross-category-combinations)
- [Pattern Selection by Architecture Layer](#pattern-selection-by-architecture-layer)
  - [Presentation Layer](#presentation-layer)
  - [Business Logic Layer](#business-logic-layer)
  - [Data Access Layer](#data-access-layer)
  - [Infrastructure Layer](#infrastructure-layer)
  - [Cross-Cutting Concerns](#cross-cutting-concerns)
- [Pattern Complexity and Learning Path](#pattern-complexity-and-learning-path)
  - [Difficulty Rankings](#difficulty-rankings)
  - [Recommended Learning Order](#recommended-learning-order)
- [Decision Flowcharts](#decision-flowcharts)
  - [Master Decision Tree](#master-decision-tree)
  - [Creational Branch](#creational-branch)
  - [Structural Branch](#structural-branch)
  - [Behavioral Branch](#behavioral-branch)
  - [Architectural Branch](#architectural-branch)
  - [Quick-Reference: Commonly Confused Patterns](#quick-reference-commonly-confused-patterns)
  - [When NOT to Use a Pattern](#when-not-to-use-a-pattern)
- [Anti-Patterns: The Patterns of Failure](#anti-patterns-the-patterns-of-failure)
  - [God Object](#god-object)
  - [Spaghetti Code](#spaghetti-code)
  - [Golden Hammer](#golden-hammer)
  - [Premature Optimization](#premature-optimization)
  - [Copy-Paste Programming](#copy-paste-programming)
  - [Lava Flow](#lava-flow)
  - [Boat Anchor](#boat-anchor)
  - [Dead Code](#dead-code)
  - [How Anti-Patterns Relate to Pattern Misuse](#how-anti-patterns-relate-to-pattern-misuse)
- [Recommended Resources](#recommended-resources)
  - [Essential Books](#essential-books)
  - [Top Online Learning Resources](#top-online-learning-resources)
  - [Video Courses](#video-courses)
  - [Quick-Reference Cheat Sheets](#quick-reference-cheat-sheets)
  - [Community Debates Worth Reading](#community-debates-worth-reading)
- [Series Conclusion: The Pattern Mindset](#series-conclusion-the-pattern-mindset)
- [Sources](#sources)

---

## The Real Challenge

Over the past nine posts, we have built a comprehensive understanding of software design patterns --- from the foundational GoF patterns to SOLID principles, from creational and structural patterns to behavioral ones, from language-specific adaptations to real-world case studies at Netflix, Google, Amazon, and Uber.

But there is a gap between knowing patterns and applying them well. Every experienced developer has encountered codebases where patterns were applied enthusiastically but poorly --- a Singleton where a simple function would do, a Factory producing exactly one type, an Observer creating memory leaks because nobody considered deregistration.

This post bridges that gap. It is a decision framework: a structured approach to answering the question "which pattern should I use?" --- and the equally important question "should I use a pattern at all?"

---

## Problem-to-Pattern Mapping

The most practical way to choose a pattern is to start with the problem, not the pattern. The following mapping covers 38 common problem scenarios and the patterns that address them.

### Creational Problems

*"How do I create objects?"*

| # | Problem Statement | Recommended Pattern(s) | Key Consideration |
|---|-------------------|----------------------|-------------------|
| 1 | "I need to ensure only one instance exists" | **Singleton** | Consider Dependency Injection as a modern alternative; Singleton introduces global state and complicates testing |
| 2 | "I need to create objects without specifying the exact class" | **Factory Method** | Use when object creation depends on runtime input or when adding new types without modifying existing code |
| 3 | "I need to create families of related objects that must be consistent" | **Abstract Factory** | Ideal for theme systems (dark/light mode), cross-platform UI kits, multi-vendor cloud resources |
| 4 | "I need to construct complex objects step by step" | **Builder** | Use for objects with many optional fields or complex multi-step configuration (HTTP requests, SQL queries) |
| 5 | "I need copies of existing objects without coupling to their classes" | **Prototype** | Apply when cloning is more efficient than constructing from scratch (document templates, game characters) |
| 6 | "I need to recycle expensive-to-create objects" | **Object Pool** | Use for database connections, thread pools, socket connections where acquisition/release cost is high |
| 7 | "I need a simple way to create one of several possible classes" | **Simple Factory** (not GoF) | Use as a stepping stone; upgrade to Factory Method when extensibility is needed |
| 8 | "I need to register and dynamically create objects by identifier" | **Registry / Service Locator** | Use when types are discovered at runtime; consider DI containers as a more testable alternative |

### Structural Problems

*"How do I compose objects?"*

| # | Problem Statement | Recommended Pattern(s) | Key Consideration |
|---|-------------------|----------------------|-------------------|
| 9 | "I need to make incompatible interfaces work together" | **Adapter** | Wraps an existing class with a new interface; does not add behavior, only translates |
| 10 | "I need to decouple abstraction from implementation so both can vary" | **Bridge** | Prevents class explosion in multi-dimensional hierarchies (e.g., shapes x rendering APIs) |
| 11 | "I need to represent a tree/hierarchy where parts and wholes are treated uniformly" | **Composite** | File systems, org charts, UI component trees, menu structures |
| 12 | "I need to add behavior without modifying existing code" | **Decorator** | Adds responsibilities dynamically; stackable (e.g., encryption + compression on a stream) |
| 13 | "I need to simplify a complex subsystem with a unified interface" | **Facade** | Provides a simplified API; does not prevent direct subsystem access if needed |
| 14 | "I need to cache/share expensive objects to reduce memory" | **Flyweight** | Use when thousands of objects share intrinsic state (text editors, game sprites, map tiles) |
| 15 | "I need to control access to an object" | **Proxy** | Variants: virtual (lazy-load), protection (access control), remote (network), caching |
| 16 | "I need to restrict accessor/mutator access to object data" | **Private Class Data** | Reduces exposure of internal state; limits write access after construction |

### Behavioral Problems

*"How do objects communicate and divide responsibility?"*

| # | Problem Statement | Recommended Pattern(s) | Key Consideration |
|---|-------------------|----------------------|-------------------|
| 17 | "I need to notify multiple objects of state changes" | **Observer** | Event-driven systems, UI updates, reactive streams; beware performance with many observers |
| 18 | "I need to switch algorithms at runtime" | **Strategy** | Encapsulates interchangeable algorithms behind a common interface (sorting, compression, payment methods) |
| 19 | "I need to encapsulate a request as an object" | **Command** | Enables queuing, logging, undo/redo, macro recording, and transactional operations |
| 20 | "I need to change an object's behavior when its internal state changes" | **State** | Replaces complex conditional logic with state objects (order lifecycles, media player states) |
| 21 | "I need to add operations to a class hierarchy without modifying it" | **Visitor** | Double-dispatch mechanism; ideal for compilers, AST walkers, data export tools |
| 22 | "I need to save and restore object state" | **Memento** | Captures snapshots without breaking encapsulation; game saves, editor undo, checkpoint systems |
| 23 | "I need to traverse a collection without exposing internals" | **Iterator** | Standard in most language collection libraries; supports multiple concurrent traversals |
| 24 | "I need to reduce complex communication between many objects" | **Mediator** | Centralizes interaction logic; chatrooms, air traffic control, UI dialog coordination |
| 25 | "I need to process a request through multiple handlers" | **Chain of Responsibility** | Servlet filters, middleware pipelines, approval workflows, logging chains |
| 26 | "I need to define a skeleton algorithm with customizable steps" | **Template Method** | Fixed algorithm structure, variable steps via subclass overrides; document parsers, test frameworks |
| 27 | "I need to support undo/redo operations" | **Command + Memento** | Command captures the operation; Memento captures the state snapshot before execution |
| 28 | "I need to interpret or evaluate a language/grammar" | **Interpreter** | Use for DSLs, search filters, chatbot rule engines, mathematical expression parsers |
| 29 | "I need to handle null gracefully without null checks everywhere" | **Null Object** | Provides a do-nothing default implementation; eliminates defensive null checking |
| 30 | "I need to define complex boolean business rules composably" | **Specification** | Combine rules with AND/OR/NOT; ideal for filtering, validation, and query criteria |

### Cross-Cutting and Architectural Problems

| # | Problem Statement | Recommended Pattern(s) | Key Consideration |
|---|-------------------|----------------------|-------------------|
| 31 | "I need to add logging/security/caching without polluting business logic" | **Interceptor / AOP** | Aspect-oriented approach; pre/post processing via proxies or framework interceptors |
| 32 | "I need to decouple event producers from consumers" | **Publish-Subscribe** (Observer variant) | Message brokers, event buses; stronger decoupling than basic Observer |
| 33 | "I need to coordinate multiple data operations as a single transaction" | **Unit of Work** | Tracks changes and applies them atomically (e.g., Entity Framework's SaveChanges) |
| 34 | "I need to abstract data access behind a collection-like interface" | **Repository** | Encapsulates query logic; promotes domain-driven design; testable via in-memory implementations |
| 35 | "I need to map between domain objects and database rows" | **Data Mapper** | Separates domain model from persistence schema; use when domain and DB diverge significantly |
| 36 | "I need to provide a fluent, readable API for configuration" | **Builder + Fluent Interface** | Method chaining for readability (e.g., `query.select("name").from("users").where("active")`) |
| 37 | "I need to separate read and write models for scalability" | **CQRS** | Command-Query Responsibility Segregation; often paired with Event Sourcing |
| 38 | "I need to reconstruct state from a sequence of events" | **Event Sourcing** | Store events rather than state; enables audit trails, temporal queries, and replay |

---

## Pattern Relationship Map

Design patterns rarely exist in isolation. Their real power emerges when combined. The relationships below are based on the classifications from Zimmer (1995) and the GoF book: "X uses Y" (Y is part of X's solution), "X is similar to Y" (solve related problems), and "X can be combined with Y" (synergistic pairing).

### Creational Pattern Combinations

| Combination | How They Work Together | Real-World Example |
|-------------|----------------------|-------------------|
| **Factory + Singleton** | Factory method returns a singleton instance; factory itself may be a singleton | Logging framework: `LoggerFactory.getLogger()` returns the shared logger instance |
| **Abstract Factory + Prototype** | Factory clones prototypical instances instead of calling constructors | UI toolkit where theme factories clone pre-configured widget prototypes |
| **Builder + Fluent Interface** | Builder exposes chainable methods for step-by-step construction | `HttpRequest.newBuilder().uri(uri).header("Accept","json").GET().build()` |
| **Factory + Strategy** | Factory creates the appropriate strategy based on context | Payment processor factory that returns Stripe/PayPal/Braintree strategy based on region |
| **Factory + Builder** | Factory selects which builder to use; builder constructs the object | Report generator factory selects PDF/HTML/CSV builder based on export format |
| **Abstract Factory + Factory Method** | Abstract Factory uses Factory Methods internally to create each product | Cross-platform GUI factory with `createButton()`, `createCheckbox()` factory methods |

### Structural Pattern Combinations

| Combination | How They Work Together | Real-World Example |
|-------------|----------------------|-------------------|
| **Decorator + Chain of Responsibility** | Decorators form a processing pipeline where each can pass to the next | HTTP middleware stack: auth decorator -> logging decorator -> compression decorator |
| **Adapter + Facade** | Facade simplifies the interface; Adapter converts between incompatible interfaces behind it | API gateway that provides a unified facade while adapting multiple microservice protocols |
| **Composite + Iterator** | Iterator traverses Composite's tree structure uniformly | File system walker iterating over directories (composites) and files (leaves) |
| **Proxy + Decorator** | Both wrap an object; Proxy controls access, Decorator adds behavior | Caching proxy that also decorates responses with timing metadata |
| **Bridge + Adapter** | Bridge separates abstraction/implementation; Adapter bridges the gap to legacy interfaces | Messaging system where Bridge separates message type from delivery channel, with Adapters for legacy protocols |
| **Composite + Visitor** | Visitor traverses the Composite tree, performing operations at each node | AST (Abstract Syntax Tree) in a compiler: Composite tree structure walked by type-checker Visitor |

### Behavioral Pattern Combinations

| Combination | How They Work Together | Real-World Example |
|-------------|----------------------|-------------------|
| **Command + Memento** | Command executes the action; Memento stores state for undo | Text editor: each edit is a Command, with Memento snapshots enabling Ctrl+Z |
| **Observer + Mediator** | Mediator coordinates communication; Observer notifies of changes | Chat application: Mediator manages room logic, Observer pattern notifies connected clients |
| **Strategy + Template Method** | Template Method defines skeleton; Strategy handles variable algorithm steps | Data processing pipeline: template defines extract-transform-load flow; strategy varies the transform step |
| **State + Strategy** | State switches strategies based on internal state transitions | Game character: State determines current mode (idle/combat/stealth); Strategy determines behavior within that mode |
| **Iterator + Visitor** | Iterator traverses the collection; Visitor performs operations on each element | Database result set: Iterator moves through rows, Visitor serializes each to JSON/XML |
| **Command + Observer** | Command executes actions; Observer is notified of command execution | GUI framework: button click fires Command; Observer updates toolbar state and status bar |
| **Chain of Responsibility + Command** | Commands are passed down a chain of handlers for processing | Event system: input events as Commands processed by a chain of UI handlers (bubbling) |

### Cross-Category Combinations

| Combination | How They Work Together | Real-World Example |
|-------------|----------------------|-------------------|
| **Factory + Observer** | Factory creates observers and registers them with subjects | Plugin system: factory creates plugin instances and subscribes them to relevant events |
| **Singleton + Mediator** | Mediator is typically a singleton coordinating system-wide communication | Event bus: single mediator instance routing messages between all application components |
| **Proxy + Observer** | Proxy intercepts access and notifies observers of changes | Data-binding frameworks: proxy on model objects triggers UI updates via Observer |
| **Builder + Composite** | Builder constructs a Composite tree structure step by step | HTML DOM builder that constructs nested element hierarchies fluently |
| **Factory + Decorator** | Factory assembles the decorator chain based on configuration | I/O stream factory that wraps base stream with buffering, encryption, and compression decorators |

---

## Pattern Selection by Architecture Layer

Where you are in the architecture stack changes which patterns are most relevant. This section maps patterns to the layer where they provide the most value.

### Presentation Layer

*Handles UI rendering, user interaction, and display logic.*

| Pattern | Role in This Layer | When to Choose |
|---------|-------------------|---------------|
| **MVC** (Model-View-Controller) | Separates display, input handling, and data | Web applications with server-rendered views |
| **MVP** (Model-View-Presenter) | View is passive; presenter drives all logic | When you need highly testable presentation logic |
| **MVVM** (Model-View-ViewModel) | Two-way data binding between View and ViewModel | Rich client apps (WPF, SwiftUI, Vue.js, Angular) |
| **Observer** | Updates UI when model state changes | Reactive UIs, real-time dashboards |
| **Command** | Encapsulates user actions (button clicks, menu items) | When actions need undo/redo, queueing, or logging |
| **Mediator** | Coordinates complex form/dialog interactions | Multi-panel UIs where components interact heavily |
| **Strategy** | Switches rendering/formatting logic | When display format varies (list/grid/card views) |
| **State** | Manages UI state transitions | Multi-step wizards, form validation states |

### Business Logic Layer

*Contains domain rules, workflows, and application-specific logic.*

| Pattern | Role in This Layer | When to Choose |
|---------|-------------------|---------------|
| **Strategy** | Encapsulates interchangeable business algorithms | Pricing rules, discount calculations, tax computation |
| **State** | Models domain object lifecycles | Order processing (draft -> submitted -> approved -> shipped) |
| **Chain of Responsibility** | Routes business decisions through handler pipeline | Approval workflows, validation chains, rule engines |
| **Specification** | Defines composable business rules | Complex filtering criteria, eligibility checks |
| **Template Method** | Fixed workflow with customizable steps | Report generation, ETL processes, onboarding flows |
| **Command** | Encapsulates domain operations | Task scheduling, audit logging, transactional operations |
| **Visitor** | Applies operations across a domain hierarchy | Tax calculation across product categories, export formats |
| **Observer** | Domain event notification | Saga/process manager patterns, cross-aggregate communication |
| **Interpreter** | Evaluates domain-specific languages | Rule engines, formula evaluators, query builders |

### Data Access Layer

*Manages persistence, queries, and data transformation.*

| Pattern | Role in This Layer | When to Choose |
|---------|-------------------|---------------|
| **Repository** | Abstracts data access as a collection-like interface | When domain model should be persistence-ignorant |
| **Data Mapper** | Translates between domain objects and database schema | When domain model differs significantly from DB schema |
| **Active Record** | Objects know how to persist themselves | Simple CRUD apps with 1:1 model-table mapping (Rails, Laravel) |
| **Unit of Work** | Tracks changes and commits them atomically | When multiple entities change in a single business operation |
| **DAO** (Data Access Object) | Encapsulates all access to a data source | Simpler alternative to Repository when DDD is not used |
| **Identity Map** | Ensures each DB row maps to exactly one in-memory object | Prevents duplicate objects and inconsistent state |
| **Query Object** | Encapsulates a database query as an object | Dynamic search/filter scenarios |
| **Lazy Load** | Defers loading of related data until accessed | Performance optimization for large object graphs |

### Infrastructure Layer

*Handles external systems, frameworks, and technical services.*

| Pattern | Role in This Layer | When to Choose |
|---------|-------------------|---------------|
| **Adapter** | Wraps external service APIs to match internal interfaces | Integrating third-party APIs, legacy system migration |
| **Facade** | Simplifies complex infrastructure subsystems | Wrapping email/SMS/push notification services behind one API |
| **Proxy** | Controls access to infrastructure resources | Caching proxies, circuit breakers, rate limiters |
| **Factory** | Creates infrastructure components based on configuration | Database driver selection, cloud provider abstraction |
| **Builder** | Constructs complex configuration objects | Connection strings, HTTP clients, message producers |
| **Singleton** | Manages shared infrastructure resources | Connection pools, configuration managers |
| **Gateway** | Encapsulates access to an external system | REST/SOAP/gRPC service wrappers |

### Cross-Cutting Concerns

*Aspects that span multiple layers: logging, security, caching, monitoring.*

| Pattern | Role | When to Choose |
|---------|------|---------------|
| **Interceptor / AOP** | Injects behavior before/after method calls | Logging, authentication, performance monitoring |
| **Decorator** | Wraps objects to add cross-cutting behavior | Adding caching, retry logic, circuit breaking to service calls |
| **Observer / Pub-Sub** | Decouples event producers from consumers | Audit logging, analytics events, domain events |
| **Proxy** | Intercepts calls for security/caching/logging | Transaction management, access control |
| **Chain of Responsibility** | Pipelines for cross-cutting processing | Middleware stacks (ASP.NET, Express.js) |
| **Strategy** | Swappable implementations for cross-cutting concerns | Pluggable logging backends, cache providers |

---

## Pattern Complexity and Learning Path

Not all patterns are equal in difficulty or frequency of use. This section provides difficulty rankings and a recommended learning order to build understanding incrementally.

### Difficulty Rankings

#### Beginner Level (Learn First)

*Patterns with intuitive concepts, straightforward implementation, and high practical frequency.*

| Pattern | Difficulty | Frequency of Use | Why Learn First |
|---------|-----------|------------------|-----------------|
| **Factory Method** | 2/5 | Very High | Foundation for understanding all creational patterns |
| **Strategy** | 2/5 | Very High | Teaches composition over inheritance; used everywhere |
| **Observer** | 2/5 | Very High | Core of event-driven programming and UI frameworks |
| **Singleton** | 1/5 | High | Easy to understand; teaches global state trade-offs |
| **Iterator** | 1/5 | Very High | Built into every modern language; reinforces abstraction |
| **Facade** | 1/5 | High | Simple concept; immediate practical benefit |
| **Adapter** | 2/5 | High | Directly maps to real integration problems |
| **Template Method** | 2/5 | High | Natural use of inheritance; common in frameworks |

#### Intermediate Level (Learn Second)

*Patterns that require understanding of composition, delegation, and lifecycle management.*

| Pattern | Difficulty | Frequency of Use | Why Learn Second |
|---------|-----------|------------------|------------------|
| **Decorator** | 3/5 | High | Introduces dynamic composition; builds on Strategy concepts |
| **Command** | 3/5 | High | Essential for undo systems and task queues |
| **Composite** | 3/5 | Medium-High | Recursive structures; builds on Iterator |
| **Builder** | 2/5 | High | Practical and common; pairs naturally with Factory |
| **State** | 3/5 | Medium-High | Replaces complex conditionals; similar to Strategy |
| **Proxy** | 3/5 | Medium-High | Similar structure to Decorator but different intent |
| **Chain of Responsibility** | 3/5 | Medium | Builds on Decorator concepts for pipelines |
| **Mediator** | 3/5 | Medium | Centralizes Observer-like communication |
| **Abstract Factory** | 3/5 | Medium | Extension of Factory Method to families |
| **Memento** | 3/5 | Medium | Pairs with Command for undo systems |

#### Advanced Level (Learn Third)

*Patterns with complex mechanics, niche use cases, or requiring deep OOP understanding.*

| Pattern | Difficulty | Frequency of Use | Why Learn Last |
|---------|-----------|------------------|----------------|
| **Visitor** | 4/5 | Low-Medium | Double dispatch is non-intuitive; niche use cases |
| **Bridge** | 4/5 | Low-Medium | Abstract concept; often confused with Adapter |
| **Flyweight** | 4/5 | Low | Memory optimization; only needed at scale |
| **Prototype** | 3/5 | Low-Medium | Cloning semantics (deep vs shallow) are tricky |
| **Interpreter** | 5/5 | Low | Requires understanding of grammars and parsing |
| **Null Object** | 2/5 | Medium | Easy concept but requires design maturity to apply well |

### Recommended Learning Order

Based on Joshua Kerievsky's "A Learning Guide to Design Patterns" (Industrial Logic), this 23-session curriculum builds each pattern on the foundations of the ones before it:

| Phase | Session | Pattern | Rationale |
|-------|---------|---------|-----------|
| **Foundation** | 1 | Factory Method | Gateway to creational patterns |
| | 2 | Strategy | Most frequently needed behavioral pattern |
| | 3 | Decorator | Introduces dynamic composition elegantly |
| | 4 | Composite | Appears in many real systems |
| | 5 | Iterator | Reinforces Composite; universally used |
| | 6 | Template Method | Natural inheritance pattern; builds on prior |
| **Core Creational** | 7 | Abstract Factory | Extends Factory Method concepts |
| | 8 | Builder | Step-by-step construction |
| | 9 | Singleton | Simple but important to understand trade-offs |
| **Structural** | 10 | Proxy | Access control and lazy loading |
| | 11 | Adapter | Interface translation |
| | 12 | Bridge | Abstraction/implementation separation |
| **Core Behavioral** | 13 | Mediator | Centralized communication |
| | 14 | Observer | Event notification (builds on Mediator) |
| | 15 | Chain of Responsibility | Handler pipelines |
| | 16 | Memento | State snapshots |
| | 17 | Command | Action encapsulation (pairs with Memento) |
| **Advanced** | 18 | Prototype | Cloning mechanics |
| | 19 | State | State machines |
| | 20 | Visitor | Double dispatch |
| | 21 | Flyweight | Memory optimization |
| | 22 | Interpreter | Language processing |
| | 23 | Facade | System simplification (capstone) |

---

## Decision Flowcharts

When you face a design problem, start here. These textual decision trees guide you from problem description to pattern selection.

### Master Decision Tree

```
START: What type of problem are you solving?
|
+---> CREATING OBJECTS? -----------------------------> [Creational Branch]
|
+---> COMPOSING/STRUCTURING objects or classes? ------> [Structural Branch]
|
+---> MANAGING BEHAVIOR, communication, or algorithms? -> [Behavioral Branch]
|
+---> CROSS-CUTTING or ARCHITECTURAL concern? --------> [Architectural Branch]
```

### Creational Branch

```
Is your problem about CREATING OBJECTS?
|
+---> Do you need exactly ONE instance globally?
|     +---> Yes, and it must be thread-safe -----------> Singleton
|     +---> Consider: Would Dependency Injection work? -> DI Container (preferred)
|
+---> Do you need to hide/vary the creation logic?
|     +---> Creating ONE product type?
|     |     +---> Decision based on simple input? -----> Simple Factory
|     |     +---> Subclasses decide what to create? ---> Factory Method
|     +---> Creating FAMILIES of related products? ----> Abstract Factory
|
+---> Do you need step-by-step construction?
|     +---> Object has many optional parameters? ------> Builder
|     +---> Same construction, different output? ------> Builder
|     +---> Need fluent/readable API? -----------------> Builder + Fluent Interface
|
+---> Do you need copies of existing objects?
|     +---> Construction is expensive? -----------------> Prototype
|     +---> Need to avoid subclass proliferation? -----> Prototype
|
+---> Do you need to recycle expensive objects?
      +---> DB connections, threads, sockets? ----------> Object Pool
```

### Structural Branch

```
Is your problem about STRUCTURING objects?
|
+---> Do you need to make two things work together?
|     +---> Converting one interface to another? ------> Adapter
|     |     +---> Wrapping a class? -------------------> Class Adapter (inheritance)
|     |     +---> Wrapping an object? -----------------> Object Adapter (composition)
|     +---> Need abstraction AND implementation to vary independently?
|           +---> Preventing class explosion? ----------> Bridge
|
+---> Do you need to build something from parts?
|     +---> Tree/hierarchy where parts = wholes? ------> Composite
|     +---> Need uniform treatment of leaves & nodes? -> Composite
|
+---> Do you need to add behavior?
|     +---> At runtime, dynamically? ------------------> Decorator
|     +---> Stack multiple behaviors? -----------------> Decorator
|     +---> Inheritance would cause class explosion? --> Decorator
|
+---> Do you need to simplify something complex?
|     +---> Provide a simple interface to subsystem? --> Facade
|
+---> Do you need to optimize memory?
|     +---> Many objects sharing common state? ---------> Flyweight
|     +---> Intrinsic vs extrinsic state separation? --> Flyweight
|
+---> Do you need to control access?
      +---> Lazy initialization? -----------------------> Virtual Proxy
      +---> Access control / security? -----------------> Protection Proxy
      +---> Remote object access? ----------------------> Remote Proxy
      +---> Caching? ----------------------------------> Caching Proxy
```

### Behavioral Branch

```
Is your problem about OBJECT BEHAVIOR?
|
+---> ALGORITHM PROBLEMS
|     +---> Need to swap algorithms at runtime? -------> Strategy
|     +---> Fixed skeleton, variable steps? -----------> Template Method
|     |     (Difference: Strategy uses composition, Template Method uses inheritance)
|     +---> Need to interpret a language/grammar? -----> Interpreter
|
+---> COMMUNICATION PROBLEMS
|     +---> One-to-many notification? -----------------> Observer
|     |     +---> Need stronger decoupling? -----------> Publish-Subscribe / Event Bus
|     +---> Many-to-many communication too complex? ---> Mediator
|     +---> Sender shouldn't know the receiver? -------> Chain of Responsibility
|
+---> STATE MANAGEMENT PROBLEMS
|     +---> Behavior changes with internal state? -----> State
|     |     (Difference from Strategy: State transitions happen internally)
|     +---> Need to save/restore state? ---------------> Memento
|     +---> Need undo/redo? ---------------------------> Command + Memento
|
+---> ACTION ENCAPSULATION
|     +---> Need to parameterize objects with actions? -> Command
|     +---> Need to queue/schedule actions? -----------> Command
|     +---> Need to log/audit actions? ----------------> Command
|     +---> Need macro/composite actions? -------------> Command + Composite
|
+---> TRAVERSAL PROBLEMS
|     +---> Need to traverse a collection uniformly? --> Iterator
|     +---> Need to traverse a tree structure? --------> Iterator + Composite
|     +---> Need to perform operations during traversal? -> Visitor
|
+---> EXTENSION PROBLEMS
|     +---> Add operations without modifying classes? --> Visitor
|     +---> Handle null without null checks? -----------> Null Object
|
+---> RESPONSIBILITY DISTRIBUTION
      +---> Request processed by one of many handlers? -> Chain of Responsibility
      +---> Request processed by ALL handlers in sequence? -> Chain of Responsibility
                                                              (pipeline variant)
```

### Architectural Branch

```
Is your problem ARCHITECTURAL or CROSS-CUTTING?
|
+---> PRESENTATION ARCHITECTURE
|     +---> Server-rendered web app? ------------------> MVC
|     +---> Need highly testable presentation? --------> MVP
|     +---> Rich client with data binding? ------------> MVVM
|
+---> DATA ACCESS ARCHITECTURE
|     +---> Domain-driven design? ---------------------> Repository + Data Mapper
|     +---> Simple CRUD app? --------------------------> Active Record
|     +---> Multiple entity changes per operation? ----> Unit of Work
|     +---> Need to abstract all data access? ---------> DAO
|
+---> SCALABILITY / SEPARATION
|     +---> Read and write models differ? -------------> CQRS
|     +---> Need full audit trail / event replay? -----> Event Sourcing
|     +---> Need to decouple services? ----------------> Publish-Subscribe / Message Queue
|
+---> CROSS-CUTTING CONCERNS
      +---> Logging, auth, monitoring? ----------------> Interceptor / AOP
      +---> Need to add behavior to service calls? ----> Decorator or Proxy
      +---> Middleware pipeline? -----------------------> Chain of Responsibility
```

### Quick-Reference: Commonly Confused Patterns

**Strategy vs. State vs. Command:**

```
STRATEGY: "I have multiple ways to DO something"
  -> Client chooses the algorithm externally
  -> Example: sorting (quicksort vs mergesort)

STATE: "I behave differently DEPENDING ON my condition"
  -> Object transitions between states internally
  -> Example: TCP connection (listening/established/closed)

COMMAND: "I need to REPRESENT an action as an object"
  -> Decouples invoker from executor
  -> Example: menu item that triggers any action
```

**Adapter vs. Bridge vs. Facade vs. Proxy vs. Decorator:**

```
ADAPTER:   Changes the interface    (make X look like Y)
BRIDGE:    Separates abstraction    (X and Y evolve apart)
FACADE:    Simplifies the interface (hide complexity of X, Y, Z)
PROXY:     Controls access          (guard/cache/lazy-load X)
DECORATOR: Adds behavior            (enhance X without change)
```

### When NOT to Use a Pattern

This is as important as knowing when to use one.

| Pattern | Do NOT Use When... |
|---------|-------------------|
| **Singleton** | You are using it as a global variable; when you need testability; when multiple instances might be needed later |
| **Observer** | There are too many observers causing performance issues; update order matters (use Mediator instead) |
| **Factory** | There is only one concrete type and no foreseeable variation |
| **Decorator** | The order of decoration matters and is hard to control; a few subclasses would be simpler |
| **Strategy** | There are only two variants and no expected growth (simple if/else suffices) |
| **Visitor** | The class hierarchy changes frequently (adding classes requires modifying all visitors) |
| **Chain of Responsibility** | You always know exactly which handler should process the request |
| **Mediator** | It becomes a "God object" that knows too much about every colleague |
| **Command** | The action is trivial and will never need undo, queuing, or logging |

---

## Anti-Patterns: The Patterns of Failure

If design patterns are proven solutions to recurring problems, anti-patterns are proven ways to create recurring problems. Understanding them is essential because they often result from the misapplication of design patterns.

### God Object

**Definition:** A single class or object that handles far too many responsibilities, creating a broad, unfocused interface.

**Symptoms:** One class that knows about user data, transactions, UI logic, database access, and business rules simultaneously. Everywhere in the codebase depends on it.

**Consequences:** Violates Single Responsibility Principle; forces implementing classes to include unnecessary properties; becomes a bottleneck for all changes; nearly impossible to test in isolation.

**Pattern Misuse Connection:** Often results from failing to apply proper decomposition patterns (Strategy, Observer, Facade) or misunderstanding the Singleton pattern as a dumping ground.

### Spaghetti Code

**Definition:** Code with tangled control flow, lacking structure, organization, and modularity.

**Symptoms:** Random file placement, arbitrary jumps, long functions, absence of modularity, cross-dependencies, difficult-to-follow execution paths.

**Consequences:** Makes maintenance nearly impossible; prevents accurate project estimation; "you will constantly break things, not understand the scope of your changes."

**Pattern Misuse Connection:** Represents the complete absence of intentional architectural patterns; the antithesis of structured pattern-based design.

### Golden Hammer

**Definition:** Over-reliance on a single familiar tool, technology, or pattern for all problems regardless of appropriateness.

**Symptoms:** Applying the same solution pattern everywhere despite poor fit; resisting new tools or methodologies; "when all you have is a hammer, everything looks like a nail."

**Consequences:** Performance degradation, increased development time, language-specific problems when approaches do not transfer across contexts.

**Pattern Misuse Connection:** Directly relates to dogmatic pattern application --- using Singleton everywhere, forcing Observer into every communication channel, or applying Factory when simple constructors suffice.

### Premature Optimization

**Definition:** Optimizing code for performance before knowing whether the optimization is actually needed.

**Symptoms:** Complex caching layers without profiling data; hand-rolled data structures replacing standard library ones; micro-optimizations that obscure business logic.

**Consequences:** Increased complexity, reduced readability, decreased maintainability, wasted development time.

**Pattern Misuse Connection:** Applying Flyweight, Object Pool, or Proxy patterns for performance reasons without evidence of a performance problem. As Donald Knuth stated: "premature optimization is the root of all evil."

### Copy-Paste Programming

**Definition:** Copying and pasting source code instead of creating reusable abstractions.

**Symptoms:** Nearly identical code blocks scattered across the codebase; bug fixes applied in one location but not duplicated locations; increasing divergence between copies over time.

**Consequences:** Multiplied bug surface, inconsistent behavior, exponential maintenance cost.

**Pattern Misuse Connection:** Indicates failure to recognize opportunities for Template Method, Strategy, or simple extraction into shared components; the opposite of the DRY principle that patterns formalize.

### Lava Flow

**Definition:** Old, fragile code remaining in the system because no one fully understands or dares to remove it --- like hardened lava that was once fluid but has cooled into a rigid, immovable structure.

**Symptoms:** Code written under sub-optimal conditions deployed to production and expanded upon while still developmental; mysterious modules that "might break something" if removed.

**Consequences:** Accumulating dead weight, increasing build times, false dependencies, fear-driven development.

**Pattern Misuse Connection:** Often contains abandoned pattern implementations from previous architectural visions; patterns half-implemented during prototyping that solidified into production without completion.

### Boat Anchor

**Definition:** Retaining unnecessary code "in case it is needed later" despite not meeting current specifications.

**Symptoms:** Obsolete code mixed with functional code; commented-out blocks; unused interfaces and abstract classes kept "just in case."

**Consequences:** Extended build times, maintenance confusion, potential accidental activation in production, accumulated technical debt.

**Pattern Misuse Connection:** Creates false implementation patterns that obfuscate actual architectural intent; over-engineered pattern infrastructure built for requirements that never materialized.

### Dead Code

**Definition:** Code whose functionality is no longer required but remains in the codebase, often with unclear context about its purpose.

**Symptoms:** Functions called everywhere but serving no purpose; uncertainty about necessity; common in proof-of-concept code that reaches production.

**Consequences:** Increased debugging difficulty, knowledge gaps about actual system requirements, management resistance to cleanup.

**Pattern Misuse Connection:** Represents patterns implemented for obsolete requirements, creating misleading architectural assumptions; developers read the dead code and assume the patterns it implements are still relevant.

### How Anti-Patterns Relate to Pattern Misuse

| Relationship | Description |
|--------------|-------------|
| **Over-application** | Golden Hammer: forcing patterns where they add no value; every problem becomes a Factory or Strategy |
| **Under-application** | Spaghetti Code: failing to recognize where patterns would bring structure and clarity |
| **Premature application** | Boat Anchor / Premature Optimization: implementing complex pattern infrastructure before requirements justify it |
| **Abandoned application** | Lava Flow / Dead Code: half-implemented patterns from prior visions that calcify in the codebase |
| **Misunderstood application** | God Object: using Singleton as an excuse for a global dumping ground instead of a controlled single instance |
| **Duplicated logic** | Copy-Paste Programming: failing to see that repeated code is a signal to extract a Template Method or Strategy |

---

## Recommended Resources

### Essential Books

**"Design Patterns: Elements of Reusable Object-Oriented Software" (GoF, 1994)**
- Authors: Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides
- The canonical reference. Cataloged 23 foundational patterns. Established the formal template for documenting patterns. Popularized "Program to an interface, not an implementation" and "Favor object composition over class inheritance." Examples in C++ and Smalltalk.

**"Head First Design Patterns" (Freeman & Robson)**
- Publisher: O'Reilly Media (1st ed. 2004, 2nd ed. 2021)
- The most accessible entry point for learning design patterns. Visually rich, brain-friendly format with puzzles, humor, and conversational tone. Builds understanding incrementally through real-world scenarios.

**"Patterns of Enterprise Application Architecture" (Martin Fowler, 2002)**
- Defined the vocabulary for enterprise application architecture. Active Record, Data Mapper, Unit of Work, and Repository remain foundational in modern frameworks (Rails, Django, Entity Framework, Hibernate). Covers domain logic, data source, web presentation, distribution, offline concurrency, and session state patterns.

**"Domain-Driven Design" (Eric Evans, 2003)**
- Strategic patterns (Bounded Context, Context Mapping, Ubiquitous Language, Anti-Corruption Layer) and tactical patterns (Entity, Value Object, Aggregate, Repository, Factory, Domain Service, Domain Event, Specification). DDD patterns operate at a higher abstraction level than GoF --- they address the domain model and system boundaries. GoF patterns are used within DDD implementations.

**"Clean Architecture" (Robert C. Martin, 2017)**
- The Dependency Rule, concentric architecture layers, architectural boundaries, and the Humble Object pattern. Builds on Hexagonal Architecture (Ports and Adapters) and Onion Architecture. Integrates SOLID principles as the foundation for component-level and architectural-level decisions.

**"Refactoring to Patterns" (Joshua Kerievsky, 2004)**
- Bridges refactoring and patterns with 27 pattern-directed refactorings. Demonstrates that patterns need not be designed up-front but can be evolved into as a system grows. 12 design smells that indicate the need for pattern-based refactoring.

**"Implementation Patterns" (Kent Beck, 2007)**
- 77 patterns for everyday programming tasks. Focuses on the micro-level: how to write individual classes, methods, and variables that clearly communicate intent. Complements GoF patterns by addressing the code-level decisions that GoF patterns are built upon.

**"Pattern-Oriented Software Architecture" (POSA) Vol 1-5**

| Volume | Focus | Year |
|--------|-------|------|
| Vol 1 | Architectural patterns (Layers, Pipes and Filters, Blackboard), design patterns, idioms | 1996 |
| Vol 2 | 17 patterns for concurrent and networked systems | 2000 |
| Vol 3 | Complete resource lifecycle patterns | 2004 |
| Vol 4 | Pattern language for distributed computing | 2007 |
| Vol 5 | Meta-level: what patterns are and are not, developing pattern languages | 2007 |

### Top Online Learning Resources

| # | Resource | URL | Why Valuable |
|---|----------|-----|--------------|
| 1 | **Refactoring.Guru** | https://refactoring.guru/design-patterns | Visual-heavy, multi-language (9 languages), integrates patterns with refactoring and code smells |
| 2 | **SourceMaking** | https://sourcemaking.com/design_patterns | Problem-solution format, includes criticism section, covers 26 patterns including non-GoF |
| 3 | **Patterns.dev** | https://www.patterns.dev/ | Free, modern web-focused patterns (React, vanilla JS), rendering and performance patterns |
| 4 | **GeeksforGeeks Design Patterns Cheat Sheet** | https://www.geeksforgeeks.org/system-design/design-patterns-cheat-sheet-when-to-use-which-design-pattern/ | Complete decision guide: when to use which pattern, organized by problem type |
| 5 | **Hackr.io Design Patterns** | https://hackr.io/tutorials/learn-software-design-patterns | Community-voted rankings of courses and tutorials across all languages |
| 6 | **DZone Refcardz: Design Patterns** | https://dzone.com/refcardz/design-patterns | Concise reference card covering all 23 GoF patterns with diagrams and examples |
| 7 | **ByteByteGo Design Patterns Cheat Sheet** | https://blog.bytebytego.com/p/ep17-design-patterns-cheat-sheet | System design perspective, visual cheat sheets |
| 8 | **Game Programming Patterns** | http://gameprogrammingpatterns.com/design-patterns-revisited.html | Free online book, revisits GoF patterns through game development lens |
| 9 | **F# for Fun and Profit: FP Patterns** | https://fsharpforfunandprofit.com/fppatterns/ | Functional programming design patterns, bridges OOP and FP paradigms |
| 10 | **Java Code Geeks Cheatsheet** | https://www.javacodegeeks.com/design-patterns-cheatsheet.html | Downloadable PDF, Java-focused, concise quick-reference |

### Video Courses

| # | Title | Platform | Why Valuable |
|---|-------|----------|--------------|
| 1 | Design Patterns Library | Pluralsight | Comprehensive library covering all major patterns with descriptions, examples, and techniques |
| 2 | Design Patterns in Java | Udemy | Implements classic patterns using modern Java 8+ features (lambdas, streams) |
| 3 | Design Patterns (University of Alberta) | Coursera | Academic rigor with hands-on projects; covers OO principles, common patterns, and architecture |
| 4 | Design Patterns Overview | Pluralsight | How patterns are discovered, defined, and applied; ideal starting point |
| 5 | Practical Design Patterns in JavaScript | Pluralsight | Patterns specifically for JavaScript; web development context |

### Quick-Reference Cheat Sheets

| Resource | Format | URL |
|----------|--------|-----|
| DZone Refcardz | PDF | https://dzone.com/refcardz/design-patterns |
| RIT SE Reference Card | PDF | https://www.se.rit.edu/~swen-383/resources/RefCardz/designpatterns.pdf |
| McdonaldLand Card | PDF | https://www.mcdonaldland.info/files/designpatterns/designpatternscard.pdf |
| GitHub GoF Cheat Sheet | Gist | https://gist.github.com/kevinCefalu/c160afd09b2802c01e3dfc02d09ed677 |

### Community Debates Worth Reading

**"Are Design Patterns Still Relevant?"**

The consensus across multiple sources: design patterns remain relevant as conceptual tools and shared vocabulary, but their implementation has evolved. Modern developers should understand patterns but apply them judiciously, using language-native features when they provide the same benefit with less ceremony.

Key perspectives:
- **Yes, more than ever:** System complexity explosion and cross-domain integration requirements make patterns a competitive necessity.
- **Yes, but evolved:** The 23 GoF patterns remain relevant as vocabulary; patterns must be adapted to modern language features.
- **Partially obsolete:** Many classic patterns are workarounds for language limitations that modern languages have solved.
- **Context-dependent:** Relevance varies by language. Each pattern must be evaluated against each language's capabilities.
- **Valuable as vocabulary:** Even critics acknowledge patterns provide a shared language for communicating design decisions.

**"SOLID Principles vs. Design Patterns"**

SOLID provides the "why" (guidelines and constraints). Design patterns provide the "how" (concrete solutions and templates). They are complementary:

| SOLID Principle | Patterns That Embody It |
|----------------|------------------------|
| **S** - Single Responsibility | Strategy, Observer |
| **O** - Open/Closed | Decorator, Strategy |
| **L** - Liskov Substitution | Factory Method, Template Method |
| **I** - Interface Segregation | Adapter, Facade |
| **D** - Dependency Inversion | Abstract Factory, Observer |

---

## Series Conclusion: The Pattern Mindset

Over ten posts, we have traveled from the foundations of software design patterns to the frameworks for choosing them. Here is the arc of what we have covered:

**Posts 1-2** established what design patterns are and why they matter --- a shared vocabulary born from the Gang of Four's 1994 catalog, rooted in Christopher Alexander's architectural pattern language. We grounded patterns in the SOLID principles that give them their theoretical backbone.

**Posts 3-5** dove into the three categories of GoF patterns: creational patterns (how objects are born), structural patterns (how objects are composed), and behavioral patterns (how objects communicate). Each pattern was examined not just for its mechanics but for its trade-offs and real applicability.

**Posts 6-7** expanded beyond the GoF canon into architectural patterns (MVC, microservices, event-driven architecture) and the principles that guide pattern application --- composition over inheritance, dependency inversion, separation of concerns, and the principle of least knowledge.

**Post 8** revealed that patterns are not universal constants --- they are shaped by language features and programming paradigms. What requires three classes in Java is a one-liner in Python. Rust's type system enables patterns (Typestate, Newtype) that cannot exist elsewhere. Functional programming replaces entire pattern categories with function composition and algebraic data types.

**Post 9** showed patterns in the wild --- running the Linux kernel, powering Netflix's resilience infrastructure, organizing Uber's 2,200 microservices, and evolving through jQuery's rise and fall, React's HOC-to-Hooks transition, and the microservices revival of 1990s distributed systems patterns.

**This post (Post 10)** provides the decision framework --- the practical tools for choosing the right pattern for the right problem at the right time.

### The Five Principles of Pattern Application

If this entire series distills into five principles, they are these:

1. **Start with the problem, not the pattern.** The decision flowcharts in this post exist because good pattern selection begins with a clear problem statement. "I need to notify multiple objects of state changes" leads to Observer. "This code looks like it could use Observer" leads to over-engineering.

2. **Patterns are a vocabulary, not a checklist.** Their primary value is enabling developers to communicate design intent efficiently. "This is a Strategy" tells a teammate everything they need to know about the structure, intent, and trade-offs of your code.

3. **Language and paradigm matter.** A pattern that is essential in Java may be invisible in Python and irrelevant in Haskell. Always evaluate whether a language feature provides the same benefit with less ceremony.

4. **Patterns evolve.** jQuery's Facade, React's HOCs, and JavaScript callbacks were all valuable patterns that were superseded. The Circuit Breaker pattern did not exist in the GoF book but is essential in modern distributed systems. Stay current.

5. **The best pattern is sometimes no pattern.** The anti-patterns section of this post exists because pattern misuse --- over-application, premature application, and misunderstood application --- creates worse code than no patterns at all. Every pattern must earn its place in your codebase by solving a real problem that justifies its complexity.

Design patterns are tools for thinking. They encode decades of collective experience into reusable solutions. But like any tool, they require judgment in application. The developer who knows 23 patterns and applies them mechanically will produce worse software than the developer who knows 5 patterns and applies them with wisdom.

The goal was never to memorize a catalog. It was to develop the pattern mindset --- the ability to recognize recurring problems, recall proven solutions, evaluate trade-offs, and make deliberate design choices. If this series has helped you develop that mindset, it has done its job.

---

## Sources

### Decision Framework
- [Refactoring Guru --- Design Patterns Catalog](https://refactoring.guru/design-patterns)
- [SourceMaking --- Design Patterns](https://sourcemaking.com/design_patterns)
- [GeeksforGeeks --- Design Patterns Cheat Sheet](https://www.geeksforgeeks.org/design-patterns-cheat-sheet-when-to-use-which-design-pattern/)
- [JavaTechOnline --- When to Use Which Design Pattern: 23 GoF Patterns](https://javatechonline.com/when-to-use-which-design-pattern-23-gof-pattern/)
- [Industrial Logic --- A Learning Guide to Design Patterns (Joshua Kerievsky)](https://www.industriallogic.com/papers/learning.html)
- [Design Gurus --- Classification of Design Patterns](https://www.designgurus.io/course-play/grokking-design-patterns-for-engineers-and-managers/doc/classification-of-design-patterns)
- [AlgoCademy --- Understanding Design Patterns](https://algocademy.com/blog/understanding-design-patterns-singleton-factory-and-observer/)
- [Zimmer (1995) --- Relationships Between Design Patterns](https://www.semanticscholar.org/paper/Relationships-between-design-patterns-Zimmer/b7fd68d166ca62fc05fe267b69ac78c279c6ea4f)
- [Microservices.io --- Better Decision Making with Pattern-Style Thinking](https://microservices.io/post/architecture/2023/03/13/better-decision-making-with-patterns.html)
- [Microsoft Learn --- Common Web Application Architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [O'Reilly --- Software Architecture Patterns: Layered Architecture](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [LinkedIn --- How Design Patterns Solve Cross-Cutting Concerns](https://www.linkedin.com/advice/0/how-can-design-patterns-solve-cross-cutting-concerns)
- [Beezwax --- The Repository and Unit of Work Design Patterns](https://blog.beezwax.net/the-repository-and-unit-of-work-design-patterns/)
- [Gamma, Helm, Johnson, Vlissides --- Design Patterns: Elements of Reusable Object-Oriented Software (GoF Book)](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)

### Anti-Patterns
- [freeCodeCamp --- Antipatterns to Avoid in Code](https://www.freecodecamp.org/news/antipatterns-to-avoid-in-code/)
- [Wikipedia --- List of Software Anti-Patterns](https://en.wikipedia.org/wiki/List_of_software_anti-patterns)
- [Baeldung --- Anti-Patterns](https://www.baeldung.com/cs/anti-patterns)
- [Lucidchart --- What Are Software Anti-Patterns](https://www.lucidchart.com/blog/what-are-software-anti-patterns)
- [Minware --- Premature Optimization](https://www.minware.com/guide/anti-patterns/premature-optimization)
- [Minware --- Lava Flow](https://www.minware.com/guide/anti-patterns/lava-flow)
- [Wikipedia --- Lava Flow (programming)](https://en.wikipedia.org/wiki/Lava_flow_(programming))

### Community Resources and Debates
- [Refactoring.Guru](https://refactoring.guru/design-patterns)
- [SourceMaking](https://sourcemaking.com/design_patterns)
- [Patterns.dev](https://www.patterns.dev/)
- [Game Programming Patterns --- Robert Nystrom](http://gameprogrammingpatterns.com/design-patterns-revisited.html)
- [F# for Fun and Profit: FP Patterns --- Scott Wlaschin](https://fsharpforfunandprofit.com/fppatterns/)
- [Are Design Patterns Still Relevant in 2025? --- Freddy Dordoni](https://medium.com/@freddy.dordoni/the-gang-of-four-gave-us-23-design-patterns-are-they-still-relevant-in-2025-f2e999c384c0)
- [Are Design Patterns Still Relevant --- Mario Cervera](https://mariocervera.com/are-design-patterns-still-relevant)
- [Design Patterns in Functional Programming --- DEV Community](https://dev.to/patferraggi/do-you-need-design-patterns-in-functional-programming-370c)
- [FP Alternative to the Strategy Pattern --- Expedia Group](https://medium.com/expedia-group-tech/a-functional-programming-alternative-to-the-strategy-pattern-73268b68868a)
- [SOLID vs Design Patterns --- Tolga Yildiz](https://medium.com/@tolgayildiz91/design-patterns-vs-solid-principles-where-they-intersect-3cb2b78a60df)
- [Design Principles vs Design Patterns --- TutorialsTeacher](https://www.tutorialsteacher.com/articles/difference-between-design-principle-and-design-pattern)

### Books
- [Martin Fowler --- Refactoring to Patterns](https://martinfowler.com/books/r2p.html)
- [POSA Series](http://www.dre.vanderbilt.edu/POSA/)
- [Pluralsight Design Patterns Library](https://www.pluralsight.com/courses/patterns-library)
- [Coursera Design Patterns (University of Alberta)](https://www.coursera.org/learn/design-patterns)
- [C# Decision Tree for Design Patterns --- Vivek Baliyan](https://medium.com/@vivek-baliyan/factory-builder-strategy-adapter-facade-the-senior-developers-30-second-decision-guide-bf07d6ac3151)
- [ByteByteGo Design Patterns Cheat Sheet](https://blog.bytebytego.com/p/ep17-design-patterns-cheat-sheet)
