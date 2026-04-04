---
title: "Foundations: GRASP, SOLID, and the Principles Behind Patterns"
description: "Explore the foundational principles behind design patterns — GRASP, SOLID, DRY, KISS, and YAGNI — and learn why understanding these transforms pattern application."
pubDate: 2026-03-13
category: "software-engineering"
tags:
  - SOLID Principles
  - GRASP
  - Design Principles
  - Object-Oriented Design
series: "Software Design Patterns"
seriesOrder: 2
heroImage: "https://images.unsplash.com/photo-1509966756634-9c23dd6e6815?w=750&h=422&fit=crop"
---

## Table of Contents

1. [Patterns Without Principles Are Recipes Without Understanding](#patterns-without-principles-are-recipes-without-understanding)
2. [GRASP Patterns: The Nine Responsibility-Assignment Principles](#grasp-patterns-the-nine-responsibility-assignment-principles)
   - [Information Expert](#1-information-expert)
   - [Creator](#2-creator)
   - [Controller](#3-controller)
   - [Low Coupling](#4-low-coupling)
   - [High Cohesion](#5-high-cohesion)
   - [Polymorphism](#6-polymorphism)
   - [Pure Fabrication](#7-pure-fabrication)
   - [Indirection](#8-indirection)
   - [Protected Variations](#9-protected-variations)
3. [SOLID Principles: The Five Structural Rules](#solid-principles-the-five-structural-rules)
   - [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
   - [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
   - [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
   - [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
   - [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
4. [Other Foundational Principles](#other-foundational-principles)
   - [DRY (Don't Repeat Yourself)](#dry-dont-repeat-yourself)
   - [KISS (Keep It Simple, Stupid)](#kiss-keep-it-simple-stupid)
   - [YAGNI (You Ain't Gonna Need It)](#yagni-you-aint-gonna-need-it)
   - [Composition over Inheritance](#composition-over-inheritance)
   - [Program to an Interface, Not an Implementation](#program-to-an-interface-not-an-implementation)
   - [Favor Object Composition over Class Inheritance](#favor-object-composition-over-class-inheritance)
   - [Law of Demeter](#law-of-demeter)
5. [How GRASP + SOLID + GoF Connect](#how-grasp--solid--gof-connect)
   - [The Hierarchy](#the-hierarchy)
   - [GRASP to SOLID Mapping](#grasp-to-solid-mapping)
   - [GRASP to GoF Pattern Mapping](#grasp-to-gof-pattern-mapping)
   - [SOLID to GoF Pattern Matrix](#solid-to-gof-pattern-matrix)
   - [The Unifying Insight](#the-unifying-insight)
6. [Sources and References](#sources-and-references)

---

## Patterns Without Principles Are Recipes Without Understanding

A cookbook can teach you to follow a recipe. But only an understanding of *why* heat denatures proteins, *why* salt enhances flavor at specific concentrations, and *why* emulsification requires both fat and water will let you improvise, adapt, and create something new when the recipe does not fit your ingredients.

Design patterns work the same way. In [Part 1 of this series](./post-01-history-of-design-patterns.md), we traced the history of patterns from Christopher Alexander's architectural vision through the Gang of Four's catalog. Those 23 patterns are powerful -- but they are the *recipes*. This post is about the *culinary science*: the foundational principles that explain why each pattern works, when it applies, and when it will lead you astray.

Three complementary frameworks form this foundation:

- **GRASP** (General Responsibility Assignment Software Patterns) -- Craig Larman's nine patterns for answering the fundamental OO design question: *which class should be responsible for what?*
- **SOLID** -- Robert C. Martin's five principles for structuring classes and modules
- **Other principles** -- DRY, KISS, YAGNI, Composition over Inheritance, Program to an Interface, and the Law of Demeter

These are not competing systems. They are three lenses on the same underlying object-oriented design wisdom. As Craig Larman wrote: *"The critical design tool for software development is a mind well educated in design principles."*

---

## GRASP Patterns: The Nine Responsibility-Assignment Principles

> GRASP (General Responsibility Assignment Software Patterns) comes from Craig Larman's *Applying UML and Patterns* (first published 1997, 3rd edition 2004). These nine patterns/principles guide the fundamental question of object-oriented design: **which class should be responsible for what?** GRASP patterns sit at a more foundational level than GoF patterns -- they explain the *reasoning* behind why GoF patterns work.

### Hierarchy of GRASP Patterns

The nine GRASP patterns are not all equal. Some are overarching evaluative principles (Low Coupling, High Cohesion), some are concrete assignment techniques (Information Expert, Creator, Controller), and some are advanced design strategies (Polymorphism, Pure Fabrication, Indirection, Protected Variations).

---

### 1. Information Expert

**Intent:** Assign responsibility to the class that has the information needed to fulfill it.

**Problem:** Given a responsibility, which object should carry it out?

**Solution:** Look at what data is needed to fulfill the responsibility. Assign the responsibility to the class that naturally possesses (or can readily acquire) the most relevant information.

**Example:**

In an e-commerce system, who should calculate the order total? The `Order` class owns references to its `LineItem` objects, and each `LineItem` knows its product and quantity. Therefore `Order` is the information expert for calculating the total.

```python
class LineItem:
    product: Product
    quantity: int

    def subtotal(self) -> Money:
        return self.product.price * self.quantity  # LineItem is expert for its subtotal

class Order:
    items: list[LineItem]

    def total(self) -> Money:
        return sum(item.subtotal() for item in self.items)  # Order is expert for the total
```

**When to Use:**
- As the default starting point for *every* responsibility assignment decision
- When you need to determine where to place a method or calculation
- When data and behavior should be co-located

**Relationship to GoF Patterns:**
- Foundation for nearly all GoF patterns -- each pattern places behavior where the relevant state resides
- Visitor pattern is a deliberate *violation* of Information Expert, trading co-location for extensibility
- Iterator embodies it: the collection knows how to traverse itself

**Trade-offs:**
- Sometimes following Information Expert leads to low cohesion (a domain object accumulating persistence, UI, or logging concerns). In those cases, favor Pure Fabrication or Indirection instead.

---

### 2. Creator

**Intent:** Determine which class should be responsible for creating instances of another class.

**Problem:** Who should create new instances of class A?

**Solution:** Assign class B the responsibility to create instances of A if one or more of these conditions hold (the more the better):
- B **contains** or compositely **aggregates** A
- B **records** instances of A
- B **closely uses** A
- B has the **initializing data** for A

**Example:**

In Larman's Point-of-Sale system, `Sale` creates `SalesLineItem` instances because `Sale` contains/aggregates them and has the initialization data (product ID, quantity).

```python
class Sale:
    line_items: list[SalesLineItem]

    def add_line_item(self, product: Product, quantity: int):
        item = SalesLineItem(product, quantity)  # Sale is the Creator
        self.line_items.append(item)
```

**When to Use:**
- For simple object creation where no complex construction logic exists
- When the creating class naturally aggregates or records the created objects
- When creation doesn't require selecting among multiple concrete types

**Relationship to GoF Patterns:**
- When Creator logic becomes complex (choosing between subtypes, requiring configuration), it evolves into **Factory Method** or **Abstract Factory**
- **Builder** pattern emerges when creation requires multi-step construction that exceeds simple Creator responsibility
- **Prototype** is used when creation should clone existing instances rather than constructing new ones

**Trade-offs:**
- If creation requires knowledge from many unrelated sources, Creator may lead to high coupling. Use a Factory pattern instead.

---

### 3. Controller

**Intent:** Assign responsibility for handling system events to a non-UI class that represents either the overall system or a use-case scenario.

**Problem:** What first object beyond the UI layer receives and coordinates a system operation?

**Solution:** Assign the responsibility to a class that represents one of these:
- The **overall system**, a **root object**, or a major subsystem (a *facade controller*)
- A **use case** or **session** scenario (a *use case controller*)

**Example:**

```python
# Facade controller -- represents the overall system
class POSSystem:
    def enter_item(self, item_id, quantity): ...
    def make_payment(self, amount): ...

# Use case controller -- represents a specific scenario
class ProcessSaleHandler:
    def enter_item(self, item_id, quantity): ...
    def make_payment(self, amount): ...
```

A UI button click delegates to the controller, which coordinates domain objects. The controller should *delegate* work, not do it. A "bloated controller" that contains business logic violates High Cohesion.

**When to Use:**
- As the entry point for every system operation (non-UI layer)
- When you need to decouple the UI from domain logic
- When coordinating multiple domain objects for a single use case

**Relationship to GoF Patterns:**
- Directly relates to **Facade** pattern (facade controller)
- Relates to **Command** pattern when controllers are further decomposed into individual command objects
- The **Mediator** pattern is used when controllers mediate between multiple collaborating objects
- In modern architectures, controllers often delegate to a **Mediator** (e.g., MediatR pattern: `IMediator.Send(command)`)

**Trade-offs:**
- Facade controllers can become "god classes" if they handle too many use cases. Split into use-case controllers when this happens.

---

### 4. Low Coupling

**Intent:** Assign responsibilities so that unnecessary coupling remains low.

**Problem:** How do we reduce the impact of change, support reuse, and maintain independence between classes?

**Solution:** When evaluating design alternatives, prefer the one that reduces the number and strength of dependencies between classes. Coupling forms include:
- A has an **attribute** of type B
- A **calls methods** on B
- A has a method that references B (parameter, return type, local variable)
- A is a **subclass** of B (strongest coupling)
- A **implements** interface B

**Example:**

```python
# HIGH coupling -- Payment knows about Sale internals
class Payment:
    def authorize(self, sale: Sale):
        total = sale.calculate_total()  # Payment coupled to Sale
        tax = sale.tax_calculator.compute(total)  # coupled to Sale's internals
        ...

# LOW coupling -- Payment depends only on an amount
class Payment:
    def authorize(self, amount: Money):
        ...  # Payment knows nothing about Sale
```

**When to Use:**
- As an *evaluative principle* applied to every design decision
- When choosing between alternative designs, pick the one with fewer dependencies
- Most critical at architectural boundaries (between layers, modules, services)

**Relationship to GoF Patterns:**
- **Observer** reduces coupling between subject and observers (observers depend on an abstract interface, not each other)
- **Mediator** centralizes coupling in one place instead of spreading it across many objects
- **Bridge** decouples abstraction from implementation
- **Strategy** decouples algorithm selection from the context that uses it
- Nearly every GoF pattern has reducing coupling as a primary or secondary goal

---

### 5. High Cohesion

**Intent:** Assign responsibilities so that cohesion remains high -- each class has a focused, manageable set of strongly related responsibilities.

**Problem:** How do we keep classes focused, understandable, and manageable while supporting Low Coupling?

**Solution:** When evaluating alternatives, prefer the design that keeps responsibilities tightly related within each class. A class with high cohesion does one logical thing well.

**Signs of Low Cohesion:**
- A class that does many unrelated things
- A class with methods that operate on different subsets of its attributes
- A class that is difficult to name (vague names like "Manager" or "Handler" often signal low cohesion)

**Example:**

```python
# LOW cohesion -- Customer does too many unrelated things
class Customer:
    def calculate_order_total(self): ...
    def send_email_notification(self): ...
    def generate_pdf_invoice(self): ...
    def validate_credit_card(self): ...

# HIGH cohesion -- each class has a focused purpose
class Customer:
    def place_order(self, order: Order): ...

class EmailService:
    def send_notification(self, recipient, message): ...

class InvoiceGenerator:
    def generate_pdf(self, order: Order): ...

class PaymentValidator:
    def validate_credit_card(self, card_info): ...
```

**When to Use:**
- As an evaluative principle alongside Low Coupling for every design decision
- When a class starts accumulating methods that don't relate to its core purpose
- When you struggle to give a class a clear, specific name

**Relationship to GoF Patterns:**
- **Strategy** extracts variant algorithms into cohesive strategy classes
- **State** extracts state-specific behavior into cohesive state classes
- **Command** encapsulates each operation as a cohesive object
- **Facade** provides a cohesive interface to a subsystem
- Pure Fabrication pattern exists specifically to achieve High Cohesion when Information Expert fails

---

### 6. Polymorphism

**Intent:** When behavior varies by type, assign responsibility for the variant behavior using polymorphic operations on the types.

**Problem:** How to handle alternatives based on type? How to create pluggable software components?

**Solution:** Instead of using conditionals (`if/else`, `switch`) to test object type and branch to different behaviors, assign each variant behavior to the type that varies using polymorphic method calls.

**Example:**

```python
# WITHOUT Polymorphism -- scattered conditionals
class TaxCalculator:
    def calculate(self, country, amount):
        if country == "US":
            return amount * 0.07
        elif country == "UK":
            return amount * 0.20
        elif country == "DE":
            return amount * 0.19
        # Every new country requires modifying this class

# WITH Polymorphism -- type-based dispatch
class TaxPolicy(ABC):
    @abstractmethod
    def calculate(self, amount: Money) -> Money: ...

class USTaxPolicy(TaxPolicy):
    def calculate(self, amount): return amount * 0.07

class UKTaxPolicy(TaxPolicy):
    def calculate(self, amount): return amount * 0.20

# Adding Germany requires only a new class, no modification to existing code
```

**When to Use:**
- When you see `if/elif/else` or `switch` statements branching on object type
- When behavior must vary across types but the interface is uniform
- When you anticipate new types being added over time

**Relationship to GoF Patterns:**
- **Strategy** pattern is the direct GoF embodiment: interchangeable algorithms behind a common interface
- **State** pattern: behavior varies based on current state (polymorphic state objects)
- **Template Method**: subclasses override specific steps (inheritance-based polymorphism)
- **Visitor**: double dispatch enables polymorphic operations on element types
- **Factory Method**: subclasses decide which product to create
- Polymorphism is arguably the *single most important mechanism* underlying the majority of GoF patterns

---

### 7. Pure Fabrication

**Intent:** Assign a highly cohesive set of responsibilities to an artificial class that does not represent a domain concept, to achieve Low Coupling and High Cohesion.

**Problem:** Sometimes assigning responsibility based on Information Expert leads to a domain class with too many unrelated responsibilities (low cohesion) or too many dependencies (high coupling). What object should have the responsibility?

**Solution:** Create a "made-up" convenience class -- one that doesn't exist in the domain model -- to absorb responsibilities that don't naturally fit domain objects.

**Example:**

```python
# Information Expert says Customer should save itself (it has the data)
# But that couples Customer to the database, violating High Cohesion

# Pure Fabrication: a repository that doesn't exist in the business domain
class CustomerRepository:            # <-- not a domain concept
    def save(self, customer): ...
    def find_by_id(self, id): ...

class EmailNotificationService:      # <-- not a domain concept
    def send_order_confirmation(self, order, customer): ...

class CurrencyExchangeService:       # <-- not a domain concept
    def convert(self, amount, from_currency, to_currency): ...
```

**When to Use:**
- When Information Expert assignment would compromise cohesion or coupling
- For cross-cutting concerns: persistence, logging, notifications, external integrations
- When you need reusable service-like behavior that doesn't belong to any domain entity

**Relationship to GoF Patterns:**
- **Facade** is a Pure Fabrication providing a simplified interface to a subsystem
- **Adapter** is a Pure Fabrication bridging incompatible interfaces
- **Strategy** objects are often Pure Fabrications (algorithm objects that don't represent domain concepts)
- **Data Access Objects (DAOs)** and **Repositories** are classic Pure Fabrications
- In Domain-Driven Design, "Domain Services" are Pure Fabrications for behavior that doesn't belong to any entity or value object

---

### 8. Indirection

**Intent:** Assign responsibility to an intermediate object to mediate between components, avoiding direct coupling.

**Problem:** How do we decouple objects so that low coupling is supported and reuse potential remains higher?

**Solution:** Introduce an intermediary object that mediates between two components. Instead of A knowing about B directly, A talks to an intermediate I, which talks to B. This allows A and B to vary independently.

**Example:**

```python
# WITHOUT Indirection -- controller directly coupled to services
class OrderController:
    def __init__(self):
        self.inventory_service = InventoryService()
        self.payment_service = PaymentService()
        self.shipping_service = ShippingService()

# WITH Indirection -- mediator decouples controller from handlers
class OrderController:
    def __init__(self, mediator: IMediator):
        self.mediator = mediator

    def place_order(self, command: PlaceOrderCommand):
        self.mediator.send(command)  # Controller knows nothing about handlers
```

**When to Use:**
- When you need to decouple two components that would otherwise be tightly bound
- When you want to enable independent variation of two sides
- When adding a level of indirection improves testability or replaceability

**Relationship to GoF Patterns:**
- **Adapter** is indirection between incompatible interfaces
- **Bridge** is indirection between abstraction and implementation
- **Facade** is indirection between client and subsystem
- **Mediator** is indirection between colleague objects
- **Proxy** is indirection that controls access to an object
- **Observer** uses indirection (the event/callback mechanism) between subject and observers
- As the GoF authors noted: "Most problems in computer science can be solved by another level of indirection" (attributed to David Wheeler)

**Trade-offs:**
- Every level of indirection adds complexity and reduces direct readability/traceability. Apply judiciously.

---

### 9. Protected Variations

**Intent:** Identify points of predicted variation or instability and create a stable interface around them to shield the rest of the system from change impact.

**Problem:** How do we design systems so that variations in one element don't cascade undesirable impacts to other elements?

**Solution:** Identify points of predicted variation (things likely to change) and wrap them behind stable interfaces. When the variation occurs, only the implementation behind the interface changes -- clients remain unaffected.

**Example:**

```python
# The database technology might change. Protect against it:
class OrderRepository(ABC):               # Stable interface
    @abstractmethod
    def save(self, order: Order): ...
    @abstractmethod
    def find_by_id(self, id: str) -> Order: ...

class PostgresOrderRepository(OrderRepository):   # Current implementation
    def save(self, order): ...  # PostgreSQL-specific
    def find_by_id(self, id): ...

class MongoOrderRepository(OrderRepository):       # Future alternative
    def save(self, order): ...  # MongoDB-specific
    def find_by_id(self, id): ...
```

**When to Use:**
- At every point where you foresee likely change (database, external APIs, business rules, algorithms)
- At architectural boundaries (between layers, between services)
- Continuously throughout design -- it's the *overarching meta-principle* of GRASP

**Relationship to GoF Patterns:**
- Protected Variations is the **unifying principle** behind most GoF patterns
- **Strategy**: protects against algorithm variation
- **Bridge**: protects against implementation variation
- **Abstract Factory**: protects against product family variation
- **Decorator**: protects against feature combination variation
- **Observer**: protects against notification subscriber variation
- **Adapter**: protects against interface incompatibility variation
- Larman calls Protected Variations "perhaps the most important principle in design" -- it's essentially the OCP (Open/Closed Principle) restated in GRASP terms

**Supporting Mechanisms:**
- Encapsulation, interfaces, polymorphism, indirection
- Data-driven designs, configuration files
- Service lookups, dependency injection
- Standards and protocols

---

## SOLID Principles: The Five Structural Rules

> SOLID principles were introduced by Robert C. Martin (Uncle Bob) in the early 2000s, with the acronym coined by Michael Feathers. They describe five fundamental principles of object-oriented class design. Where GRASP focuses on responsibility *assignment*, SOLID focuses on class *structure*. GoF patterns are concrete implementations of these principles.

---

### Single Responsibility Principle (SRP)

**Statement:** *"A class should have only one reason to change."* (Robert C. Martin)

More precisely: A class should have only one *actor* (stakeholder or source of change requirements) that can cause it to change.

**GoF Patterns That Enforce SRP:**

| Pattern | How It Enforces SRP |
|---------|-------------------|
| **Strategy** | Extracts each algorithm into its own class, each with a single responsibility |
| **Command** | Encapsulates each operation/request as a separate object |
| **State** | Extracts state-specific behavior into dedicated state classes |
| **Observer** | Separates the subject (event source) from notification logic and observer behavior |
| **Factory Method** | Isolates object creation from object usage |
| **Chain of Responsibility** | Each handler has the single responsibility of processing one type of request |
| **Facade** | Gives a subsystem a single entry point, separating client-facing API from internal complexity |

**Relationship to GRASP:** Directly corresponds to **High Cohesion**. A class with high cohesion naturally has a single reason to change.

---

### Open/Closed Principle (OCP)

**Statement:** *"Software entities (classes, modules, functions) should be open for extension but closed for modification."* (Bertrand Meyer, 1988)

You should be able to add new behavior without changing existing code.

**GoF Patterns That Embody OCP:**

| Pattern | How It Embodies OCP |
|---------|-------------------|
| **Strategy** | New algorithms are added by creating new strategy classes; the context class is never modified |
| **Decorator** | New behavior is added by wrapping objects in new decorators; existing decorators and the component are unchanged |
| **Observer** | New observers are added without modifying the subject or existing observers |
| **Template Method** | New variants override specific steps; the template skeleton is never modified |
| **Factory Method** | New product types are added by creating new factory subclasses |
| **Abstract Factory** | New product families are added by implementing new factory classes |
| **Visitor** | New operations are added by creating new visitor classes (though adding new element types requires modification -- the "expression problem") |
| **Chain of Responsibility** | New handlers are added to the chain without modifying existing handlers |
| **Bridge** | Abstraction and implementation vary independently |
| **State** | New states are added as new classes without modifying the context |

**Relationship to GRASP:** Directly corresponds to **Protected Variations**. Both say: anticipate change, put an interface around it, extend via new implementations.

---

### Liskov Substitution Principle (LSP)

**Statement:** *"Objects of a supertype should be replaceable with objects of a subtype without altering the correctness of the program."* (Barbara Liskov, 1987)

Subtypes must honor the behavioral contract of their supertypes. If client code works with a base type, it must continue to work correctly with any derived type.

**GoF Patterns That Depend on LSP:**

| Pattern | How It Depends on LSP |
|---------|---------------------|
| **Strategy** | Strategies must be interchangeable; each must fulfill the strategy interface contract correctly |
| **State** | State objects replace each other; each must behave correctly as a State from the context's perspective |
| **Template Method** | Subclasses override hooks but must maintain the behavioral contract of the template |
| **Decorator** | Decorators must be substitutable for the component they wrap; the client sees no difference |
| **Proxy** | The proxy must be substitutable for the real subject |
| **Composite** | Leaves and composites must both work correctly as Components |
| **Factory Method / Abstract Factory** | Returned products must be correctly substitutable for their abstract types |
| **Iterator** | All iterators over a collection must behave consistently per the iterator contract |

**Relationship to GRASP:** Underpins **Polymorphism**. Polymorphic dispatch only works correctly if substituted types honor their contracts.

**Classic Violation:** The Rectangle/Square problem. If `Square` extends `Rectangle` but setting width also changes height, code that relies on `Rectangle` behavior (independently settable width/height) breaks.

---

### Interface Segregation Principle (ISP)

**Statement:** *"Clients should not be forced to depend on methods they do not use."* (Robert C. Martin)

Prefer many small, specific interfaces over one large, general-purpose interface.

**GoF Patterns That Demonstrate ISP:**

| Pattern | How It Demonstrates ISP |
|---------|----------------------|
| **Adapter** | Creates a focused interface bridging what the client needs to what the adaptee provides |
| **Facade** | Exposes only the relevant subset of a complex subsystem's functionality |
| **Proxy** | Implements only the interface the client expects, hiding the full real-subject interface |
| **Observer** | Observers implement only the update interface they need (`Observer`, `EventListener`) |
| **Strategy** | Strategy interfaces are typically narrow (one method: `execute`, `calculate`, `compare`) |
| **Iterator** | Exposes only `next()` and `has_next()`, not the full collection interface |
| **Visitor** | Each visitor method is specific to an element type; clients implement only what they need |

**Relationship to GRASP:** Supports **Low Coupling** and **High Cohesion**. Segregated interfaces mean clients depend only on what they use, reducing coupling.

---

### Dependency Inversion Principle (DIP)

**Statement:** *"High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions."* (Robert C. Martin)

**GoF Patterns That Implement DIP:**

| Pattern | How It Implements DIP |
|---------|---------------------|
| **Abstract Factory** | Client depends on abstract factory and abstract product interfaces, not concrete implementations |
| **Factory Method** | Creator depends on abstract Product; concrete factories provide the specific implementation |
| **Strategy** | Context depends on abstract strategy interface; concrete strategies are injected |
| **Observer** | Subject depends on abstract Observer interface; concrete observers are registered at runtime |
| **Bridge** | Abstraction depends on abstract Implementor; concrete implementations are pluggable |
| **Decorator** | Client depends on the abstract Component interface; decorators and concrete components implement it |
| **Template Method** | Abstract class defines the skeleton; subclasses provide concrete step implementations |
| **Proxy** | Client depends on abstract Subject; proxy and real subject both implement it |
| **Adapter** | Client depends on a target interface; adapters provide concrete translation to adaptee |

**Relationship to GRASP:** Directly corresponds to **Indirection** and **Low Coupling**. DIP is the structural mechanism; Indirection is the responsibility-assignment strategy.

**Practical Implementation:** Dependency Injection (DI) is the most common technique for applying DIP. Frameworks (Spring, .NET DI, Dagger) automate the wiring of abstractions to concrete implementations.

---

## Other Foundational Principles

### DRY (Don't Repeat Yourself)

**Statement:** *"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."* (Andy Hunt & Dave Thomas, *The Pragmatic Programmer*, 1999)

**How Patterns Reduce Duplication:**

| Pattern | How It Eliminates Duplication |
|---------|------------------------------|
| **Template Method** | Factors common algorithm skeleton into a base class; subclasses override only the varying steps |
| **Strategy** | Eliminates duplicated conditional branching across multiple clients by centralizing algorithm selection |
| **Decorator** | Eliminates the need to create combinatorial subclass explosions for feature combinations |
| **Observer** | Eliminates repeated polling/checking logic by centralizing notification |
| **Flyweight** | Eliminates duplication of shared intrinsic state across many objects |
| **Singleton** | Eliminates duplicated initialization of a single shared resource |
| **Prototype** | Eliminates duplicated complex construction logic by cloning |
| **Facade** | Eliminates repeated subsystem interaction sequences by centralizing them |

**Key Insight:** DRY is not just about code duplication -- it's about *knowledge* duplication. Two code blocks that look identical but represent different domain concepts are NOT violations of DRY. Two code blocks that look different but encode the same business rule ARE violations.

---

### KISS (Keep It Simple, Stupid)

**Statement:** Most systems work best if they are kept simple rather than made complex. Simplicity should be a key design goal, and unnecessary complexity should be avoided.

**When Patterns Violate KISS:**

- **Abstract Factory** for a system that will only ever have one product family
- **Visitor** when the element hierarchy is small and stable (a simple `switch` would suffice)
- **Strategy** when there's only one algorithm and no anticipated variation
- **Bridge** when there's no independent variation of abstraction and implementation
- **Chain of Responsibility** when there's only one handler
- **Decorator** for a single, known combination of behaviors (just write the combined class)
- **Observer** when there's only one listener and it's always present

**The Pattern Trap:** Developers who learn patterns often see them everywhere. The result is over-engineered code with unnecessary abstractions. A pattern should simplify the *problem* even if it adds structural complexity. If the pattern's structural complexity exceeds the problem's inherent complexity, you've violated KISS.

**Rule of Thumb:** Don't introduce a pattern until you feel the *pain* of its absence at least twice.

---

### YAGNI (You Ain't Gonna Need It)

**Statement:** *"Always implement things when you actually need them, never when you just foresee that you need them."* (Ron Jeffries, XP co-founder)

**Premature Pattern Application -- Common Mistakes:**

| Premature Pattern | What You Probably Need Instead |
|------------------|-------------------------------|
| Abstract Factory | Direct construction (`new ConcreteProduct()`) |
| Strategy with one strategy | A simple method |
| Observer with one observer | A direct method call |
| Full Decorator chain | A single class with the combined behavior |
| Mediator for two objects | Direct communication |
| Chain of Responsibility with one handler | A single function |
| Builder for a class with 2 parameters | A constructor |

**Tension with Protected Variations:** YAGNI says "don't build for variation you haven't seen." Protected Variations says "anticipate likely variation." The resolution: protect against variations that are **concretely foreseeable** (database changes, payment provider switches), not **hypothetically possible** (everything might change someday).

**Three Strikes Rule:** The first time you need something, write it simply. The second time, note the duplication. The third time, refactor into a pattern.

---

### Composition over Inheritance

**Statement:** *"Favor object composition over class inheritance."* (GoF, *Design Patterns*, 1994, Chapter 1)

**Why the GoF Said This:**

Inheritance is the strongest form of coupling. Problems with inheritance:
- **White-box reuse**: subclasses see parent internals, creating fragile dependencies
- **Compile-time binding**: the parent-child relationship is fixed at compile time
- **Fragile base class problem**: changes to the base class can break subclasses in subtle ways
- **Combinatorial explosion**: multiple independent dimensions of variation create exponential subclass counts

Composition advantages:
- **Black-box reuse**: objects interact only through interfaces
- **Runtime flexibility**: composed objects can be swapped at runtime
- **Selective reuse**: compose only the behavior you need

**GoF Patterns That Prefer Composition:**

| Pattern | How It Uses Composition |
|---------|----------------------|
| **Strategy** | Composes behavior via a strategy object instead of inheriting variant behavior |
| **Decorator** | Composes additional behavior by wrapping objects instead of subclassing |
| **Bridge** | Composes abstraction with implementation instead of inheriting implementations |
| **State** | Composes behavior via a state object instead of conditional inheritance |
| **Observer** | Composes notification relationships dynamically instead of hard-wiring them |
| **Composite** | Composes tree structures of objects uniformly |
| **Proxy** | Composes access control/caching around a real subject |
| **Chain of Responsibility** | Composes handler chains dynamically |

**GoF Patterns That Use Inheritance (appropriately):**

| Pattern | Why Inheritance Is Appropriate |
|---------|-------------------------------|
| **Template Method** | Defines an algorithm skeleton; subclasses fill in steps. Inheritance is the mechanism. |
| **Factory Method** | Subclasses decide which product to create. |
| **Adapter (class variant)** | Adapts via multiple inheritance. |
| **Interpreter** | Grammar rules form a natural class hierarchy. |

**Key Insight:** The GoF didn't say "never use inheritance." They said *favor* composition. Use inheritance when there's a genuine "is-a" relationship and the subclass truly substitutes for the parent (LSP). Use composition for "has-a" or "uses-a" relationships.

---

### Program to an Interface, Not an Implementation

**Statement:** *"Program to an interface, not an implementation."* (GoF, *Design Patterns*, 1994, Chapter 1)

This means: declare variables and parameters using abstract types (interfaces or abstract classes), not concrete classes. Clients should know only about the abstract interface, not the specific class of the object they use.

**How This Works in Practice:**

```python
# Programming to implementation (bad)
postgres_repo = PostgresOrderRepository()
service = OrderService(postgres_repo)

# Programming to interface (good)
repo: OrderRepository = PostgresOrderRepository()  # declared as abstract type
service = OrderService(repo)  # OrderService knows only about OrderRepository interface
```

**Patterns That Depend on This Principle:**
- Every behavioral pattern (Strategy, State, Observer, Command, etc.)
- Every creational pattern (Factory Method, Abstract Factory, Builder, Prototype)
- Structural patterns (Bridge, Decorator, Proxy, Adapter, Composite)

This is not an exaggeration -- **programming to an interface is the foundational technique of the entire GoF catalog**. Without it, polymorphism-based patterns cannot function.

**Relationship to GRASP:** Corresponds to **Protected Variations** (interfaces are the stable boundary) and **Low Coupling** (depending on abstractions reduces coupling).

---

### Favor Object Composition over Class Inheritance

**Statement:** This is the same principle as Composition over Inheritance, stated as the GoF's second core design principle (Chapter 1). The GoF observed that the patterns in their catalog overwhelmingly use composition/delegation rather than inheritance as their primary mechanism.

**GoF's Own Analysis:**

The GoF documented that of their 23 patterns:
- **Most** use object composition as their primary structural mechanism
- **Only Template Method and Factory Method** rely primarily on inheritance
- Even patterns that appear inheritance-based (like Strategy) actually work via composition -- the context *holds* a strategy object

**Why This Matters for Pattern Selection:**

When you face a design problem with multiple variant behaviors:
- **First instinct** (often wrong): create a class hierarchy with inheritance
- **Better approach**: compose objects that collaborate through interfaces

**Example -- The Classic Motivation:**

```python
# Inheritance approach -- combinatorial explosion
TextWindow
BorderedTextWindow
ScrollableTextWindow
BorderedScrollableTextWindow  # How many combinations?

# Composition approach (Decorator pattern)
window = ScrollDecorator(BorderDecorator(TextView()))
# Any combination, any order, assembled at runtime
```

---

### Law of Demeter

**Statement:** *"Only talk to your immediate friends. Don't talk to strangers."* (Karl Lieberherr, 1987, Northeastern University)

Formally, a method M of object O should only call methods on:
1. O itself
2. M's parameters
3. Objects created within M
4. O's direct component objects (attributes)
5. Global objects accessible to O in the scope of M

**Violation Example:**

```python
# Violates Law of Demeter -- "train wreck" chaining
customer.get_wallet().get_credit_card().charge(amount)

# Follows Law of Demeter
customer.charge(amount)  # Customer delegates internally
```

**Patterns That Enforce the Law of Demeter:**

| Pattern | How It Enforces LoD |
|---------|-------------------|
| **Facade** | Provides a single point of contact to a subsystem, hiding internal object relationships |
| **Mediator** | Objects communicate through the mediator, not directly with each other's internals |
| **Proxy** | Client talks only to the proxy, which manages access to the real subject |
| **Decorator** | Client talks to the outermost decorator, unaware of the decoration chain |
| **Iterator** | Client talks to the iterator, not to the collection's internal structure |
| **Command** | Invoker talks to the command, not to the receiver's internals |

**Relationship to GRASP:** Supports **Low Coupling** and **Protected Variations**. The Law of Demeter is a specific, enforceable rule for reducing structural coupling.

**Trade-offs:**
- Strict adherence can lead to many small "wrapper" methods that just delegate. This is the cost of decoupling.
- Some violations are pragmatic and acceptable (e.g., fluent/builder APIs that intentionally chain).

---

## How GRASP + SOLID + GoF Connect

> The three frameworks form a hierarchy: **GRASP** provides responsibility-assignment reasoning, **SOLID** provides structural design rules, and **GoF patterns** provide proven, reusable solutions. They are not competing systems -- they are three lenses on the same underlying object-oriented design wisdom.

### The Hierarchy

```
FOUNDATIONAL PRINCIPLES (the "why")
    |
    +-- GRASP Patterns (responsibility assignment)
    |       "Who should be responsible for this?"
    |
    +-- SOLID Principles (class structure)
    |       "How should classes be structured?"
    |
    +-- Other Principles (DRY, KISS, YAGNI, LoD, Composition > Inheritance)
            "What general rules should guide us?"
    |
    v
GOF DESIGN PATTERNS (the "how")
    |
    +-- Creational (Factory Method, Abstract Factory, Builder, Prototype, Singleton)
    +-- Structural (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy)
    +-- Behavioral (Chain of Responsibility, Command, Iterator, Mediator, Memento,
                     Observer, State, Strategy, Template Method, Visitor)
```

### GRASP to SOLID Mapping

| GRASP Pattern | SOLID Principle | Connection |
|--------------|----------------|------------|
| **Information Expert** | SRP | Expert naturally leads to focused classes with one reason to change |
| **Creator** | SRP, DIP | Creation responsibility is isolated; can evolve to factory patterns for DIP |
| **Controller** | SRP | Each controller focuses on one use case or system scope |
| **Low Coupling** | DIP, ISP | DIP achieves low coupling via abstractions; ISP reduces interface coupling |
| **High Cohesion** | SRP | High cohesion and single responsibility are two perspectives on the same idea |
| **Polymorphism** | OCP, LSP | OCP: extend via new types; LSP: subtypes must be substitutable |
| **Pure Fabrication** | SRP | Fabricated classes exist specifically to maintain single responsibility |
| **Indirection** | DIP | Both introduce abstractions between dependent modules |
| **Protected Variations** | OCP | Both say: interface the variation point, extend via new implementations |

### GRASP to GoF Pattern Mapping

| GRASP Pattern | GoF Patterns It Explains |
|--------------|------------------------|
| **Information Expert** | Foundation for all patterns (behavior goes where data lives) |
| **Creator** | Factory Method, Abstract Factory, Builder, Prototype |
| **Controller** | Facade (facade controller), Command (use-case controller decomposition) |
| **Low Coupling** | Observer, Mediator, Bridge, Strategy, all patterns using interfaces |
| **High Cohesion** | Strategy, State, Command (extract focused behavior) |
| **Polymorphism** | Strategy, State, Template Method, Visitor, Factory Method |
| **Pure Fabrication** | Facade, Adapter, Repository, Service classes |
| **Indirection** | Adapter, Bridge, Facade, Mediator, Proxy, Observer |
| **Protected Variations** | ALL patterns (this is the meta-principle) |

### SOLID to GoF Pattern Matrix

| | SRP | OCP | LSP | ISP | DIP |
|---|:---:|:---:|:---:|:---:|:---:|
| **Abstract Factory** | | X | X | | X |
| **Builder** | X | | | | |
| **Factory Method** | X | X | X | | X |
| **Prototype** | | | X | | |
| **Singleton** | | | | | |
| **Adapter** | | | | X | X |
| **Bridge** | | X | | | X |
| **Composite** | | | X | | |
| **Decorator** | | X | X | | X |
| **Facade** | X | | | X | |
| **Flyweight** | | | | | |
| **Proxy** | | | X | | X |
| **Chain of Responsibility** | X | X | | | |
| **Command** | X | X | | | |
| **Iterator** | | | X | X | |
| **Mediator** | | | | | X |
| **Memento** | X | | | | |
| **Observer** | X | X | | | X |
| **State** | X | X | X | | |
| **Strategy** | X | X | X | X | X |
| **Template Method** | | X | X | | X |
| **Visitor** | X | X | | | |

*X = pattern significantly implements or depends on the principle*

### The Unifying Insight

All three frameworks converge on one fundamental idea:

**Isolate what varies behind stable abstractions.**

- **GRASP** calls this *Protected Variations*
- **SOLID** calls this the *Open/Closed Principle*
- **GoF** calls this *"encapsulate what varies"* (Chapter 1)
- In practice, it is *Polymorphism* + *Indirection* + *Programming to Interfaces*

Every GoF pattern is a specific, proven way to identify a variation point and wrap it in a stable interface. GRASP and SOLID explain *why* that works. Understanding the principles means you can:

1. **Recognize** when a pattern applies (the variation point)
2. **Choose** the right pattern (matching the kind of variation)
3. **Adapt** patterns to your context (because you understand the principle, not just the template)
4. **Invent** new solutions when no existing pattern fits (guided by the underlying principles)

With this principled foundation in place, we are ready to examine the patterns themselves. In [Part 3 of this series](./post-03-creational-patterns.md), we will dive into the Creational Design Patterns -- the patterns that address the deceptively complex problem of building objects the right way.

---

## Sources and References

### Primary Sources (Books)
- Gamma, E., Helm, R., Johnson, R., Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
- Larman, C. (2004). *Applying UML and Patterns: An Introduction to Object-Oriented Analysis and Design and Iterative Development*, 3rd Edition. Prentice Hall.
- Martin, R.C. (2003). *Agile Software Development: Principles, Patterns, and Practices*. Prentice Hall.
- Hunt, A., Thomas, D. (1999). *The Pragmatic Programmer*. Addison-Wesley.
- Meyer, B. (1988). *Object-Oriented Software Construction*. Prentice Hall.

### Web Sources
- [GRASP - General Responsibility Assignment Software Patterns Explained -- Kamil Grzybek](https://www.kamilgrzybek.com/blog/posts/grasp-explained)
- [GRASP Principles Part 3: Polymorphism, Pure Fabrication, Indirection, Protected Variations -- HackerNoon](https://hackernoon.com/grasp-principles-part-3-polymorphism-pure-fabrication-indirection-protected-variations)
- [GRASP: 9 Must-Know Design Principles for Code -- Fluent C++](https://www.fluentcpp.com/2021/06/23/grasp-9-must-know-design-principles-for-code/)
- [GRASP (object-oriented design) -- Wikipedia](https://en.wikipedia.org/wiki/GRASP_(object-oriented_design))
- [SOLID Design Principles and Design Patterns with Examples -- DEV Community](https://dev.to/burakboduroglu/solid-design-principles-and-design-patterns-crash-course-2d1c)
- [SOLID Design Principles -- oodesign.com](https://www.oodesign.com/design-principles/)
- [SOLID, CUPID, GRASP Principles -- Boldare](https://www.boldare.com/blog/solid-cupid-grasp-principles-object-oriented-design/)
- [Design Patterns, GRASP and SOLID -- Alana Brandao (Medium)](https://medium.com/@alana.almeida.brandao/design-patterns-grasp-and-solid-6ef3ba09dfdf)
- [Design Patterns VS Design Principles -- Fluent C++](https://www.fluentcpp.com/2021/09/12/design-patterns-vs-design-principles-iterator-mediator-and-memento/)
- [SOLID Principles -- DigitalOcean](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [Law of Demeter -- Wikipedia](https://en.wikipedia.org/wiki/Law_of_Demeter)
- [Managing Coupling with Mediator and Facade -- Embedded Artistry](https://embeddedartistry.com/blog/2020/07/06/managing-complexity-with-the-mediator-and-facade-patterns/)
- [Principles of Software Development: SOLID, DRY, KISS -- scalastic.io](https://scalastic.io/en/solid-dry-kiss/)
- [GRASP and GOF Patterns in Solving Design Problems -- ResearchGate](https://www.researchgate.net/publication/266596865_Grasp_and_GOF_Patterns_in_Solving_Design_Problems)
- [GRASP Patterns -- University of Colorado](https://home.cs.colorado.edu/~kena/classes/5448/f12/presentation-materials/duncan.pdf)
- [GRASP Patterns -- CMU](https://www.cs.cmu.edu/~charlie/courses/15-214/2013-fall/slides/design-grasp.pdf)
- [General Responsibility Assignment Software Patterns -- Principles Wiki](http://principles-wiki.net/collections:grasp)
