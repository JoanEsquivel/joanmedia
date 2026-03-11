---
title: "Enterprise, Functional, and Reactive Patterns"
description: "Deep dive into enterprise patterns from Fowler's PoEAA, functional programming patterns like monads and ADTs, and reactive resilience patterns including Circuit Breaker."
pubDate: 2026-03-13
category: "backend"
tags:
  - Enterprise Patterns
  - Functional Programming
  - Reactive Programming
  - Design Patterns
series: "Software Design Patterns"
seriesOrder: 7
heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=750&h=422&fit=crop"
---

The Gang of Four gave us a vocabulary for object-oriented design. The concurrency and architectural patterns in the previous post gave us blueprints for systems at scale. But there is a vast territory beyond both -- patterns born from the realities of enterprise data management, from the mathematical rigor of functional programming, and from the hard-won lessons of building systems that must stay alive when everything around them is failing.

This post covers three families of patterns that address these concerns. Part 1 examines the Enterprise Patterns from Martin Fowler's *Patterns of Enterprise Application Architecture* -- the patterns that underpin every ORM, every web framework, and every service layer you have ever used. Part 2 explores Functional Design Patterns -- the abstractions from category theory and languages like Haskell and Scala that are increasingly shaping mainstream development through concepts like monads, functors, and algebraic data types. Part 3 tackles Reactive Patterns -- the resilience toolkit for distributed systems, where Circuit Breakers, Bulkheads, and Backpressure mechanisms determine whether your system degrades gracefully or collapses catastrophically.

Together, these patterns represent the cutting edge of what it means to write software that handles real data, composes cleanly, and survives the chaos of production.

---

## Table of Contents

- [Part 1: Enterprise Patterns (PoEAA)](#part-1-enterprise-patterns-poeaa)
  - [1.1 Repository](#11-repository)
  - [1.2 Unit of Work](#12-unit-of-work)
  - [1.3 Data Mapper](#13-data-mapper)
  - [1.4 Active Record](#14-active-record)
  - [1.5 Table Data Gateway](#15-table-data-gateway)
  - [1.6 Domain Model](#16-domain-model)
  - [1.7 Service Layer](#17-service-layer)
  - [1.8 Identity Map](#18-identity-map)
  - [1.9 Enterprise Pattern Comparisons](#19-enterprise-pattern-comparisons)
- [Part 2: Functional Patterns](#part-2-functional-patterns)
  - [2.1 Monad](#21-monad)
  - [2.2 Functor](#22-functor)
  - [2.3 Lens](#23-lens)
  - [2.4 Higher-Order Functions as Patterns](#24-higher-order-functions-as-patterns)
  - [2.5 Pattern Matching](#25-pattern-matching)
  - [2.6 Algebraic Data Types](#26-algebraic-data-types)
  - [2.7 Railway-Oriented Programming](#27-railway-oriented-programming)
  - [2.8 Functional Pattern Comparisons](#28-functional-pattern-comparisons)
- [Part 3: Reactive Patterns](#part-3-reactive-patterns)
  - [3.1 Observable](#31-observable)
  - [3.2 Backpressure](#32-backpressure)
  - [3.3 Circuit Breaker](#33-circuit-breaker)
  - [3.4 Bulkhead](#34-bulkhead)
  - [3.5 Retry with Exponential Backoff](#35-retry-with-exponential-backoff)
  - [3.6 Reactive Pattern Comparisons](#36-reactive-pattern-comparisons)
- [Sources](#sources)

---

# Part 1: Enterprise Patterns (PoEAA)

These patterns are drawn from Martin Fowler's *Patterns of Enterprise Application Architecture* (2002). Despite being over two decades old, they remain foundational to modern ORM frameworks, web frameworks, and service architectures. Every time you use Rails, Laravel, Django, Hibernate, Entity Framework, or Spring Data, you are using implementations of these patterns whether you know it or not. Understanding them gives you the ability to choose the right abstraction for your domain's complexity rather than accepting whatever your framework defaults to.

---

## 1.1 Repository

### Intent

Mediate between the domain and data mapping layers using a collection-like interface for accessing domain objects. Clients query the repository with domain-friendly methods; the repository encapsulates all query and persistence mechanics.

### When to Use

- The same aggregate is accessed across multiple use cases.
- You want consistent, reusable data access behind domain-language methods.
- Supporting multiple query strategies (SQL, NoSQL, in-memory) behind a single interface.
- When unit testing domain logic without a real database.

### When NOT to Use

- Simple CRUD applications where the repository adds unnecessary indirection.
- When the ORM already provides a rich query API that the repository merely wraps.
- Trivial domains where a repository per entity is over-engineered.

### Code Example (TypeScript)

```typescript
interface OrderRepository {
    findById(id: string): Promise<Order | null>;
    findByCustomer(customerId: string): Promise<Order[]>;
    findPending(): Promise<Order[]>;
    save(order: Order): Promise<void>;
    delete(id: string): Promise<void>;
}

class PostgresOrderRepository implements OrderRepository {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Order | null> {
        const row = await this.db.query("SELECT * FROM orders WHERE id = $1", [id]);
        return row ? this.toDomain(row) : null;
    }

    async findByCustomer(customerId: string): Promise<Order[]> {
        const rows = await this.db.query(
            "SELECT * FROM orders WHERE customer_id = $1", [customerId]
        );
        return rows.map(this.toDomain);
    }

    async findPending(): Promise<Order[]> {
        const rows = await this.db.query(
            "SELECT * FROM orders WHERE status = 'PENDING'"
        );
        return rows.map(this.toDomain);
    }

    async save(order: Order): Promise<void> {
        await this.db.query(
            "INSERT INTO orders (id, customer_id, status, total) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET status = $3, total = $4",
            [order.id, order.customerId, order.status, order.total]
        );
    }

    private toDomain(row: any): Order {
        return new Order(row.id, row.customer_id, row.status, row.total);
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Domain-friendly query interface | Adds indirection layer |
| Testable (swap with in-memory impl) | Can become a thin wrapper over ORM |
| Encapsulates persistence details | Risk of "repository per table" anti-pattern |
| Single place for query optimization | May hide important query complexity |

---

## 1.2 Unit of Work

### Intent

Maintain a list of objects affected by a business transaction and coordinate the writing out of changes and the resolution of concurrency problems as a single atomic operation.

### When to Use

- A single business operation touches multiple aggregates or tables.
- You need clear transactional boundaries for data consistency.
- Domain logic should remain free of explicit save/commit calls.
- Batching multiple changes into one database round-trip for performance.

### When NOT to Use

- Simple single-entity operations where explicit saves are sufficient.
- When your ORM already implements Unit of Work (e.g., Entity Framework's `DbContext`, Hibernate's `Session`).
- If the added abstraction does not provide value beyond what the ORM gives.

### Code Example (TypeScript)

```typescript
class UnitOfWork {
    private newEntities: Entity[] = [];
    private dirtyEntities: Entity[] = [];
    private removedEntities: Entity[] = [];

    registerNew(entity: Entity): void {
        this.newEntities.push(entity);
    }

    registerDirty(entity: Entity): void {
        if (!this.dirtyEntities.includes(entity)) {
            this.dirtyEntities.push(entity);
        }
    }

    registerRemoved(entity: Entity): void {
        this.removedEntities.push(entity);
    }

    async commit(db: Database): Promise<void> {
        await db.beginTransaction();
        try {
            for (const entity of this.newEntities) {
                await db.insert(entity);
            }
            for (const entity of this.dirtyEntities) {
                await db.update(entity);
            }
            for (const entity of this.removedEntities) {
                await db.delete(entity);
            }
            await db.commitTransaction();
        } catch (e) {
            await db.rollbackTransaction();
            throw e;
        } finally {
            this.clear();
        }
    }

    private clear(): void {
        this.newEntities = [];
        this.dirtyEntities = [];
        this.removedEntities = [];
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Atomic batch commits for consistency | Added complexity managing change tracking |
| Domain objects free from persistence calls | Memory overhead of tracking all changes |
| Optimized database round-trips | Implicit behavior can surprise developers |
| Natural concurrency conflict resolution point | May duplicate ORM capabilities |

---

## 1.3 Data Mapper

### Intent

Provide a layer of mappers that move data between domain objects and a database while keeping them independent of each other and the mapper itself. Neither the domain object nor the database schema knows about the other.

### When to Use

- Rich Domain Models where the object model should not be polluted with persistence logic.
- Database schemas must evolve independently from domain models.
- Testing domain logic without database dependencies.
- Complex mappings between relational data and object graphs.

### When NOT to Use

- Simple domains where Active Record is sufficient and faster to develop.
- When the mapping layer adds overhead for trivially identical object-to-table mappings.
- Prototypes and MVPs where speed outweighs architectural purity.

### Code Example (TypeScript)

```typescript
// Domain object -- NO persistence knowledge
class Customer {
    constructor(
        public readonly id: string,
        public name: string,
        public email: string,
        public tier: CustomerTier
    ) {}

    upgrade(): void {
        if (this.tier === CustomerTier.SILVER) this.tier = CustomerTier.GOLD;
    }
}

// Data Mapper -- translates between domain and DB
class CustomerMapper {
    constructor(private db: Database) {}

    async find(id: string): Promise<Customer | null> {
        const row = await this.db.query(
            "SELECT id, name, email, tier FROM customers WHERE id = $1", [id]
        );
        if (!row) return null;
        return new Customer(row.id, row.name, row.email, row.tier as CustomerTier);
    }

    async save(customer: Customer): Promise<void> {
        await this.db.query(
            `INSERT INTO customers (id, name, email, tier)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, tier=$4`,
            [customer.id, customer.name, customer.email, customer.tier]
        );
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Domain objects are clean and persistence-free | Extra translation layer = more code |
| Schema and domain evolve independently | Mapping logic can become complex |
| Testable without database | Performance cost of translation |
| Handles complex object-relational mappings | ORM frameworks already do this (e.g., Hibernate) |

---

## 1.4 Active Record

### Intent

Merge domain objects with persistence. Each entity maps directly to a database row and knows how to load, save, and delete itself. The class wraps a row in a database table, encapsulating both domain logic and data access.

### When to Use

- Straightforward domains with simple, one-to-one table-to-object mappings.
- Prototypes and MVPs prioritizing development speed over architectural purity.
- Simple CRUD applications with light behavioral logic.
- When the object model closely mirrors the database schema.

### When NOT to Use

- Complex domains where business rules differ significantly from the storage model.
- When domain objects should be testable without a database.
- Systems requiring schema-domain independence (use Data Mapper instead).
- When the tight coupling between persistence and domain logic becomes a maintenance burden.

### Code Example (TypeScript)

```typescript
class User {
    id?: number;
    name: string;
    email: string;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

    // Domain logic mixed with persistence
    isValid(): boolean {
        return this.name.length > 0 && this.email.includes("@");
    }

    async save(db: Database): Promise<void> {
        if (this.id) {
            await db.query(
                "UPDATE users SET name=$1, email=$2 WHERE id=$3",
                [this.name, this.email, this.id]
            );
        } else {
            const result = await db.query(
                "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
                [this.name, this.email]
            );
            this.id = result.id;
        }
    }

    static async find(db: Database, id: number): Promise<User | null> {
        const row = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        if (!row) return null;
        const user = new User(row.name, row.email);
        user.id = row.id;
        return user;
    }

    async delete(db: Database): Promise<void> {
        await db.query("DELETE FROM users WHERE id = $1", [this.id]);
    }
}
```

### Real-World Frameworks

- Ruby on Rails ActiveRecord
- Laravel Eloquent
- Django ORM (close to Active Record)

### Trade-offs

| Pros | Cons |
|------|------|
| Fast development; minimal boilerplate | Domain logic coupled with persistence |
| Intuitive API (`user.save()`) | Hard to test without database |
| One-to-one mapping is easy to understand | Does not scale to complex domains |
| Convention over configuration | Schema changes affect domain objects |

---

## 1.5 Table Data Gateway

### Intent

Provide an object that acts as a Gateway to a database table. One instance handles all the rows in the table. All SQL is contained in the gateway class, keeping the rest of the application free from SQL.

### When to Use

- Transaction Script-based applications where business logic is procedural.
- When you want to isolate all SQL in dedicated classes.
- Simple data access needs without rich domain objects.
- Reporting or read-heavy applications with straightforward queries.

### When NOT to Use

- Rich domain models (use Data Mapper or Active Record).
- When the abstraction level is too low for complex object-relational mappings.
- If the gateway becomes a dumping ground for business logic.

### Code Example (TypeScript)

```typescript
class OrderGateway {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Record<string, any> | null> {
        return this.db.queryRow("SELECT * FROM orders WHERE id = $1", [id]);
    }

    async findByStatus(status: string): Promise<Record<string, any>[]> {
        return this.db.query("SELECT * FROM orders WHERE status = $1", [status]);
    }

    async insert(data: { customerId: string; total: number }): Promise<string> {
        const result = await this.db.query(
            "INSERT INTO orders (customer_id, total, status) VALUES ($1, $2, 'PENDING') RETURNING id",
            [data.customerId, data.total]
        );
        return result.id;
    }

    async updateStatus(id: string, status: string): Promise<void> {
        await this.db.query(
            "UPDATE orders SET status = $1 WHERE id = $2",
            [status, id]
        );
    }

    async delete(id: string): Promise<void> {
        await this.db.query("DELETE FROM orders WHERE id = $1", [id]);
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| All SQL isolated in one place | Returns raw data (no domain objects) |
| Simple and easy to understand | Low abstraction level |
| Works well with Transaction Script | Not suited for rich domains |
| Easy to optimize queries | Business logic can leak into gateways |

---

## 1.6 Domain Model

### Intent

Create an object model of the domain that incorporates both behavior and data. Entities express business invariants, rules, and operations, becoming the center of gravity for the system's logic.

### When to Use

- Business rules are complex, interdependent, and evolve frequently.
- Invariants matter more than raw throughput.
- The domain warrants DDD (Domain-Driven Design) practices.
- When behavior should live with data (tell, do not ask).

### When NOT to Use

- Simple CRUD applications (use Transaction Script + Table Data Gateway).
- When the upfront design investment is unjustified.
- Systems where most operations are data transformations, not business rules.

### Code Example (TypeScript)

```typescript
class Order {
    private items: OrderItem[] = [];
    private status: OrderStatus = OrderStatus.DRAFT;

    constructor(
        public readonly id: string,
        public readonly customerId: string,
        private creditLimit: number
    ) {}

    addItem(product: Product, quantity: number): void {
        if (this.status !== OrderStatus.DRAFT) {
            throw new Error("Cannot modify a non-draft order");
        }
        const item = new OrderItem(product, quantity);
        this.items.push(item);
    }

    submit(): void {
        if (this.items.length === 0) {
            throw new Error("Cannot submit empty order");
        }
        if (this.total > this.creditLimit) {
            throw new Error("Order exceeds credit limit");
        }
        this.status = OrderStatus.SUBMITTED;
    }

    get total(): number {
        return this.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity, 0
        );
    }

    cancel(): void {
        if (this.status === OrderStatus.SHIPPED) {
            throw new Error("Cannot cancel shipped order");
        }
        this.status = OrderStatus.CANCELLED;
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Business rules expressed clearly in code | Upfront design investment required |
| Invariants enforced by the model itself | Persistence mapping complexity (impedance mismatch) |
| Highly testable without infrastructure | Can be over-engineered for simple domains |
| Natural fit for DDD | Learning curve for teams |

---

## 1.7 Service Layer

### Intent

Define an application's boundary with a layer of services that establishes the set of available operations and coordinates the application's response for each operation. It sits between external interfaces (controllers, CLI) and the domain model.

### When to Use

- Multiple clients (web, mobile, CLI, background jobs) access the same core logic.
- You need a stable application API that does not change when the UI evolves.
- Cross-cutting concerns (logging, authorization, transactions) need consistent application.
- Orchestrating multiple domain objects and repositories in a single operation.

### When NOT to Use

- Single-client applications where the controller can orchestrate directly.
- When the service layer becomes an anemic pass-through adding no value.
- Trivial CRUD where the controller talks directly to the repository.

### Code Example (TypeScript)

```typescript
class OrderService {
    constructor(
        private orderRepo: OrderRepository,
        private customerRepo: CustomerRepository,
        private paymentGateway: PaymentGateway,
        private eventBus: EventBus
    ) {}

    async placeOrder(command: PlaceOrderCommand): Promise<OrderResult> {
        // Orchestrate across multiple domain objects
        const customer = await this.customerRepo.findById(command.customerId);
        if (!customer) throw new NotFoundError("Customer not found");

        const order = new Order(generateId(), customer.id, customer.creditLimit);
        for (const item of command.items) {
            order.addItem(item.product, item.quantity);
        }
        order.submit();

        // Coordinate infrastructure concerns
        await this.paymentGateway.authorize(customer.id, order.total);
        await this.orderRepo.save(order);
        await this.eventBus.publish({ type: "OrderPlaced", payload: order });

        return { orderId: order.id, total: order.total, status: "SUBMITTED" };
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Stable API boundary for multiple clients | Can become an anemic pass-through |
| Centralized cross-cutting concerns | Adds a layer of indirection |
| Coordinates complex operations cleanly | Risk of business logic leaking into service |
| Transaction boundaries are explicit | May duplicate domain object orchestration |

---

## 1.8 Identity Map

### Intent

Ensure that each object is loaded only once by keeping a map of every loaded object indexed by its identity. If the same entity is requested again, return the cached instance rather than loading it from the database again.

### When to Use

- Same entity is loaded through different paths in a single request/session.
- Domain behavior depends on reference equality (same object in memory).
- Avoiding inconsistent in-memory states from duplicate loads.
- Performance optimization for repeated materialization of the same entity.

### When NOT to Use

- Stateless request handling where objects are not reused within a request.
- When the memory overhead of caching all loaded objects is unacceptable.
- If your ORM already implements Identity Map internally (e.g., Entity Framework Core, Hibernate).

### Code Example (TypeScript)

```typescript
class IdentityMap<T extends { id: string }> {
    private cache = new Map<string, T>();

    get(id: string): T | undefined {
        return this.cache.get(id);
    }

    add(entity: T): void {
        this.cache.set(entity.id, entity);
    }

    has(id: string): boolean {
        return this.cache.has(id);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Usage in a repository
class CustomerRepository {
    private identityMap = new IdentityMap<Customer>();

    async findById(id: string): Promise<Customer | null> {
        // Check cache first
        const cached = this.identityMap.get(id);
        if (cached) return cached;

        // Load from database
        const row = await this.db.query("SELECT * FROM customers WHERE id = $1", [id]);
        if (!row) return null;

        const customer = new Customer(row.id, row.name, row.email);
        this.identityMap.add(customer);  // Cache for this session
        return customer;
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Prevents duplicate loads (performance) | Memory overhead from caching objects |
| Ensures reference equality consistency | Must be scoped to a unit of work/request |
| Avoids inconsistent in-memory state | Stale data if long-lived sessions |
| Transparent to domain code | Already built into most ORMs |

---

## 1.9 Enterprise Pattern Comparisons

### Data Access Patterns

| Pattern | Maps To | Knows DB? | Domain Logic | Best For |
|---------|---------|-----------|-------------|----------|
| Active Record | One row | Yes (self) | In the entity | Simple CRUD, Rails-style |
| Data Mapper | One row | No (separate) | In the entity | Rich domains, DDD |
| Table Data Gateway | Entire table | Yes (gateway) | External | Procedural, reporting |
| Repository | Aggregate | No (interface) | In the entity | Complex queries, DDD |

### Domain Logic Patterns

| Pattern | Complexity | Where Logic Lives | Best For |
|---------|-----------|-------------------|----------|
| Transaction Script | Low | Procedural scripts | Simple workflows |
| Domain Model | High | Rich objects | Complex business rules |
| Service Layer | Medium | Coordination layer | Multi-client apps |

### Active Record vs. Data Mapper

This is one of the most consequential decisions in enterprise application design. The choice affects testability, development speed, and how well your system handles growing domain complexity.

| Aspect | Active Record | Data Mapper |
|--------|--------------|-------------|
| Coupling | High (entity knows DB) | Low (entity is POJO) |
| Testability | Low (needs DB) | High (mockable) |
| Development Speed | Fast | Slower |
| Domain Complexity | Simple | Complex |
| Schema Independence | No | Yes |
| Frameworks | Rails, Laravel, Django | Hibernate, EF Core, Doctrine |

The rule of thumb: start with Active Record if your domain is simple and your priority is shipping fast. Move to Data Mapper when the domain complexity makes the coupling painful -- when business rules start fighting the database schema, when testing requires spinning up a database, or when schema migrations break domain logic.

---

# Part 2: Functional Patterns

Functional design patterns leverage mathematical abstractions to create composable, type-safe, and side-effect-controlled code. They originate from category theory and functional programming languages like Haskell, Scala, and F#. While they once lived exclusively in academic circles, these patterns have become mainstream through TypeScript's union types, Rust's `Result` and `Option`, Kotlin's sealed classes, and Java's `Optional` and `Stream` APIs. Understanding them is no longer optional for the modern developer -- they are the patterns behind every `.map()`, every `Promise.then()`, and every `Optional.flatMap()` you write.

---

## 2.1 Monad

### Intent

Provide a generic structure for composing sequential operations within a given context (e.g., optionality, error handling, async, state). A monad wraps a value, provides a way to apply functions to that value, and chains operations that produce new monads (via `flatMap`/`bind`).

### Monad Laws

1. **Left identity:** `unit(a).flatMap(f) === f(a)`
2. **Right identity:** `m.flatMap(unit) === m`
3. **Associativity:** `m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))`

### When to Use

- Chaining dependent computations where each step may fail, produce side effects, or change context.
- Managing effects (I/O, state, error handling) in a composable way.
- Flattening nested contexts (e.g., `Optional<Optional<T>>` to `Optional<T>`).
- Creating pipelines of transformations with consistent error propagation.

### When NOT to Use

- Simple value transformations where a Functor (`.map()`) suffices.
- Languages without generics or higher-kinded types (monad abstractions become awkward).
- When the conceptual overhead alienates the team without providing proportional benefit.

### Code Example (TypeScript -- Result Monad)

```typescript
class Result<T> {
    private constructor(
        private value?: T,
        private error?: string
    ) {}

    static ok<T>(value: T): Result<T> {
        return new Result(value, undefined);
    }

    static fail<T>(error: string): Result<T> {
        return new Result(undefined, error);
    }

    isOk(): boolean { return this.error === undefined; }

    // Functor: map
    map<U>(fn: (val: T) => U): Result<U> {
        return this.isOk()
            ? Result.ok(fn(this.value!))
            : Result.fail(this.error!);
    }

    // Monad: flatMap (bind)
    flatMap<U>(fn: (val: T) => Result<U>): Result<U> {
        return this.isOk()
            ? fn(this.value!)
            : Result.fail(this.error!);
    }

    getOrElse(defaultVal: T): T {
        return this.isOk() ? this.value! : defaultVal;
    }
}

// Usage: chaining operations that may fail
const result = Result.ok("42")
    .flatMap(str => {
        const n = parseInt(str);
        return isNaN(n) ? Result.fail("Not a number") : Result.ok(n);
    })
    .flatMap(n => n > 0 ? Result.ok(n * 2) : Result.fail("Must be positive"))
    .map(n => `Result: ${n}`);
// Result.ok("Result: 84")
```

### Common Monads

| Monad | Context | Purpose |
|-------|---------|---------|
| Maybe/Optional | Absence | Handle null/undefined safely |
| Result/Either | Errors | Propagate errors without exceptions |
| IO | Side effects | Defer and compose side effects |
| Promise/Future | Async | Chain asynchronous operations |
| State | Mutable state | Thread state through pure functions |
| List | Non-determinism | Multiple possible results |

### Trade-offs

| Pros | Cons |
|------|------|
| Composable error/effect handling | Steep learning curve |
| Eliminates nested null checks | Can obscure simple logic with ceremony |
| Type-safe chaining of operations | Performance overhead from wrapping |
| Consistent pattern across many contexts | Not all languages support cleanly |

---

## 2.2 Functor

### Intent

Provide a structure that supports mapping a function over its wrapped value(s) while preserving the container's structure. If you can `.map()` over it, it is a functor.

### Functor Laws

1. **Identity:** `f.map(x => x) === f`
2. **Composition:** `f.map(g).map(h) === f.map(x => h(g(x)))`

### When to Use

- Transforming values inside a container without extracting them.
- Building composable transformation pipelines.
- Abstracting over container types (arrays, optionals, results, trees).

### When NOT to Use

- When transformations need to change the container structure (use Monad).
- Simple value transformations where wrapping adds no benefit.

### Code Example (TypeScript)

```typescript
// Array is a Functor
const doubled = [1, 2, 3].map(x => x * 2);  // [2, 4, 6]

// Optional is a Functor
class Optional<T> {
    private constructor(private value: T | null) {}

    static of<T>(value: T): Optional<T> { return new Optional(value); }
    static empty<T>(): Optional<T> { return new Optional<T>(null); }

    map<U>(fn: (val: T) => U): Optional<U> {
        return this.value !== null
            ? Optional.of(fn(this.value))
            : Optional.empty();
    }
}

// Usage: safe transformation
const name = Optional.of({ user: { name: "Alice" } })
    .map(obj => obj.user)
    .map(user => user.name)
    .map(name => name.toUpperCase());
// Optional("ALICE")

Optional.empty<string>()
    .map(s => s.toUpperCase());
// Optional.empty() -- no error, no null check needed
```

### Trade-offs

| Pros | Cons |
|------|------|
| Safe transformations; no null checks | Adds abstraction layer |
| Composable with other functors | Cannot flatten nested containers (need Monad) |
| Uniform interface across container types | Overkill for trivial transformations |
| Enables declarative data pipelines | Requires disciplined law compliance |

---

## 2.3 Lens

### Intent

Provide composable abstractions for getting, setting, and modifying values in deeply nested immutable data structures, without verbose boilerplate or mutation.

### When to Use

- Working with deeply nested immutable data (common in Redux, Elm, functional state management).
- Composing field accessors for multi-level navigation.
- When you need a reusable, composable "path" into a data structure.

### When NOT to Use

- Mutable data structures where direct assignment is simpler.
- Shallow data structures where destructuring suffices.
- Languages without good support for composable optics.

### Code Example (TypeScript)

```typescript
interface Lens<S, A> {
    get: (source: S) => A;
    set: (value: A, source: S) => S;
}

// Lens constructor
function lens<S, A>(
    getter: (s: S) => A,
    setter: (a: A, s: S) => S
): Lens<S, A> {
    return { get: getter, set: setter };
}

// Compose two lenses
function compose<S, A, B>(
    outer: Lens<S, A>,
    inner: Lens<A, B>
): Lens<S, B> {
    return {
        get: (s: S) => inner.get(outer.get(s)),
        set: (b: B, s: S) => outer.set(inner.set(b, outer.get(s)), s)
    };
}

// Usage
interface Address { street: string; city: string; }
interface User { name: string; address: Address; }

const addressLens = lens<User, Address>(
    u => u.address,
    (a, u) => ({ ...u, address: a })
);

const cityLens = lens<Address, string>(
    a => a.city,
    (c, a) => ({ ...a, city: c })
);

const userCityLens = compose(addressLens, cityLens);

const user: User = { name: "Alice", address: { street: "123 Main", city: "NYC" } };
userCityLens.get(user);                    // "NYC"
userCityLens.set("LA", user);              // { name: "Alice", address: { street: "123 Main", city: "LA" } }
```

### Trade-offs

| Pros | Cons |
|------|------|
| Composable nested immutable updates | Steep learning curve |
| Eliminates spread operator nesting | Verbose syntax in some languages |
| Reusable accessors for common paths | Runtime performance for deep nesting |
| Type-safe get/set operations | Library dependency usually needed |

---

## 2.4 Higher-Order Functions as Patterns

### Intent

Use functions that accept other functions as arguments or return them as results to abstract over behavior patterns, enabling reusable, composable, and declarative code.

### When to Use

- Abstracting common iteration patterns (`map`, `filter`, `reduce`).
- Creating function factories (e.g., configurable validators, middleware).
- Implementing callbacks, event handlers, and hooks.
- Building DSLs and fluent APIs.
- Decorator/strategy-like patterns without class hierarchies.

### When NOT to Use

- When deeply nested HOFs reduce readability for the team.
- Performance-critical inner loops where function call overhead matters.
- When the abstraction does not provide reuse benefit.

### Code Example (TypeScript)

```typescript
// Function factory (replaces Strategy pattern)
function createValidator(rules: ((s: string) => boolean)[]) {
    return (input: string): boolean =>
        rules.every(rule => rule(input));
}

const isNotEmpty = (s: string) => s.length > 0;
const isEmail = (s: string) => s.includes("@");
const maxLength = (n: number) => (s: string) => s.length <= n;

const validateEmail = createValidator([isNotEmpty, isEmail, maxLength(255)]);
validateEmail("alice@example.com");  // true

// Middleware composition (replaces Chain of Responsibility)
type Middleware = (req: Request, next: () => Response) => Response;

function compose(...middlewares: Middleware[]) {
    return (req: Request, finalHandler: () => Response): Response => {
        const chain = middlewares.reduceRight(
            (next, mw) => () => mw(req, next),
            finalHandler
        );
        return chain();
    };
}

const withLogging: Middleware = (req, next) => {
    console.log(`${req.method} ${req.url}`);
    return next();
};

const withAuth: Middleware = (req, next) => {
    if (!req.headers.auth) throw new Error("Unauthorized");
    return next();
};

const pipeline = compose(withLogging, withAuth);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Eliminates class hierarchies for behavioral patterns | Can reduce readability with deep nesting |
| Highly composable and reusable | Debugging closures and stack traces is harder |
| Concise, declarative code | Performance overhead from function indirection |
| Natural fit for event-driven and middleware patterns | Team must be comfortable with FP style |

---

## 2.5 Pattern Matching

### Intent

Provide declarative destructuring of data types, enabling exhaustive case handling with compiler-verified completeness. Replaces chains of `if/else` or `switch` with structural matching.

### When to Use

- Decomposing sum types (discriminated unions, sealed classes).
- Handling multiple cases exhaustively with compiler checks.
- Extracting values from nested structures.
- State machines and event handling.

### When NOT to Use

- Languages without native pattern matching (emulation is verbose).
- Simple conditions where `if/else` is clearer.
- When the number of cases is very small and a switch suffices.

### Code Example (TypeScript with Discriminated Unions)

```typescript
// Algebraic Data Type
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle"; base: number; height: number };

// Exhaustive pattern matching
function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return 0.5 * shape.base * shape.height;
    }
    // TypeScript: adding a new variant to Shape without handling it here
    // causes a compile error (exhaustive check)
}

// Rust-style (for comparison)
// match shape {
//     Circle { radius } => PI * radius * radius,
//     Rectangle { width, height } => width * height,
//     Triangle { base, height } => 0.5 * base * height,
// }
```

### Code Example (Scala)

```scala
sealed trait PaymentResult
case class Success(transactionId: String) extends PaymentResult
case class Declined(reason: String) extends PaymentResult
case class Error(exception: Throwable) extends PaymentResult

def handlePayment(result: PaymentResult): String = result match {
  case Success(txId)    => s"Payment successful: $txId"
  case Declined(reason) => s"Payment declined: $reason"
  case Error(ex)        => s"Payment error: ${ex.getMessage}"
}
// Compiler warns if a case is missing
```

### Trade-offs

| Pros | Cons |
|------|------|
| Compiler-verified exhaustiveness | Limited in languages without native support |
| Declarative and readable | Can become verbose with many cases |
| Natural fit for sum types and state machines | Emulated pattern matching is clunky |
| Extracts values during matching | May hide control flow vs. explicit conditionals |

---

## 2.6 Algebraic Data Types

### Intent

Model domain values precisely using composite types built from sum types (disjoint unions -- "one of") and product types (tuples/records -- "all of"). Eliminate invalid states at the type level.

### When to Use

- Modeling domain states where certain combinations are invalid.
- When exhaustive handling of all cases is critical.
- Encoding state machines, protocol states, or workflow stages.
- Replacing boolean flags and nullable fields with precise types.

### When NOT to Use

- Languages without sum type support (Java pre-17, JavaScript without TypeScript).
- Trivially simple domains where the type machinery is overkill.
- When the team is unfamiliar with the concepts.

### Code Example (TypeScript)

```typescript
// BAD: boolean flags allow invalid states
interface User_Bad {
    isLoggedIn: boolean;
    isAdmin: boolean;
    token?: string;        // undefined when? who knows?
    adminLevel?: number;   // only meaningful when isAdmin is true
}

// GOOD: algebraic data type eliminates invalid states
type User =
    | { status: "anonymous" }
    | { status: "loggedIn"; token: string; name: string }
    | { status: "admin"; token: string; name: string; level: number };

function greet(user: User): string {
    switch (user.status) {
        case "anonymous":  return "Hello, guest!";
        case "loggedIn":   return `Hello, ${user.name}!`;
        case "admin":      return `Hello, Admin ${user.name} (Level ${user.level})!`;
    }
}

// The type system PREVENTS creating an admin without a token or level.
// const invalid: User = { status: "admin", name: "Bob" }; // Compile error!
```

### Code Example (Rust)

```rust
enum RemoteData<T, E> {
    NotAsked,
    Loading,
    Success(T),
    Failure(E),
}

// Perfectly models all 4 possible states of an API call
// No booleans, no nullable fields, no invalid combinations
fn render(data: RemoteData<Vec<User>, String>) -> String {
    match data {
        RemoteData::NotAsked  => "Click to load".into(),
        RemoteData::Loading   => "Loading...".into(),
        RemoteData::Success(users) => format!("{} users", users.len()),
        RemoteData::Failure(err)   => format!("Error: {}", err),
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Impossible states are unrepresentable | Requires language support for sum types |
| Compiler-enforced exhaustive handling | Upfront design investment |
| Self-documenting domain models | Can create verbosity for simple cases |
| Eliminates entire classes of runtime bugs | Refactoring variants ripples through codebase |

---

## 2.7 Railway-Oriented Programming

### Intent

Model a pipeline of operations as a two-track "railway" where each function can succeed (stay on the success track) or fail (switch to the failure track). Once on the failure track, subsequent operations are skipped and the error propagates to the end. Uses `Either`/`Result` monads.

### When to Use

- Validation pipelines with multiple steps that can each fail.
- Replacing deeply nested try/catch blocks or null checks.
- When you want explicit, composable error handling without exceptions.
- Form validation, data transformation pipelines, API request processing.

### When NOT to Use

- When exceptions are the idiomatic error-handling mechanism and the team prefers them.
- Truly exceptional situations (out of memory, hardware failure) where exception unwinding is appropriate.
- Simple operations with a single failure mode.

### Code Example (TypeScript)

```typescript
type Result<T, E = string> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function ok<T>(value: T): Result<T> { return { ok: true, value }; }
function fail<T>(error: string): Result<T> { return { ok: false, error }; }

// Railway functions: each returns Result
function validateName(input: { name: string }): Result<{ name: string }> {
    return input.name.length > 0
        ? ok(input)
        : fail("Name is required");
}

function validateEmail(input: { name: string; email: string }): Result<typeof input> {
    return input.email.includes("@")
        ? ok(input)
        : fail("Invalid email");
}

function validateAge(input: { name: string; email: string; age: number }): Result<typeof input> {
    return input.age >= 18
        ? ok(input)
        : fail("Must be 18 or older");
}

// Railway: chain operations
function pipe<T>(...fns: ((val: T) => Result<T>)[]): (input: T) => Result<T> {
    return (input: T) =>
        fns.reduce(
            (result, fn) => result.ok ? fn(result.value) : result,
            ok(input) as Result<T>
        );
}

const validateUser = pipe(validateName, validateEmail, validateAge);

validateUser({ name: "Alice", email: "alice@test.com", age: 25 });
// { ok: true, value: { name: "Alice", email: "alice@test.com", age: 25 } }

validateUser({ name: "", email: "alice@test.com", age: 25 });
// { ok: false, error: "Name is required" }  -- short-circuits
```

### Visual Model

```
Input --> [Validate Name] --> [Validate Email] --> [Validate Age] --> Output
              |                    |                    |
              v                    v                    v
         Error Track ============================================> Error Output
```

### Trade-offs

| Pros | Cons |
|------|------|
| Explicit, composable error handling | Unfamiliar to teams used to exceptions |
| No hidden control flow (no try/catch) | Verbose in languages without sugar |
| Short-circuits on first failure | Accumulating multiple errors needs Validated |
| Easy to test each step independently | Wrapping/unwrapping overhead |

---

## 2.8 Functional Pattern Comparisons

### Abstraction Hierarchy

```
Functor         -- can map (transform wrapped value)
    |
    v
Applicative     -- can apply wrapped functions to wrapped values
    |
    v
Monad           -- can flatMap (chain context-producing operations)
```

Every Monad is a Functor, but not every Functor is a Monad.

### Error Handling Patterns

| Pattern | Approach | Accumulates Errors? | Short-Circuits? |
|---------|----------|--------------------| --------------|
| Railway (Result/Either) | Two-track pipeline | No | Yes |
| Validated | Applicative | Yes | No |
| Try Monad | Exception-catching monad | No | Yes |
| Option/Maybe | Absence handling | N/A | Yes |

### Functional vs. OOP Equivalents

| Functional Pattern | OOP Equivalent | Key Difference |
|-------------------|---------------|---------------|
| Higher-Order Functions | Strategy Pattern | No class hierarchy needed |
| Monad (Result) | Exception handling | Explicit, in the type system |
| Functor (map) | Iterator/Transform | Preserves container structure |
| Lens | Getter/Setter | Composable, immutable |
| ADTs + Pattern Matching | Visitor Pattern | Compiler-enforced exhaustiveness |
| Railway-Oriented Programming | Chain of Responsibility | Type-safe error propagation |

This table is worth studying closely. Nearly every functional pattern has an OOP counterpart, but the functional version typically gains composability and type safety while shedding the class hierarchy overhead. The trade-off is always the same: more abstraction, steeper learning curve, but fewer runtime surprises.

---

# Part 3: Reactive Patterns

Reactive patterns enable building systems that are responsive, resilient, elastic, and message-driven, as described in the Reactive Manifesto. They address the challenges of distributed, asynchronous, and failure-prone systems -- the reality of every modern application that depends on networks, external APIs, and shared infrastructure. These are not theoretical patterns. They are the difference between a system that degrades gracefully under pressure and one that cascades into total failure because a single downstream service had a bad day.

---

## 3.1 Observable

### Intent

Represent a stream of data that emits values over time. Observers (subscribers) register to receive values, errors, or completion signals. Decouples producers from consumers of asynchronous data streams.

### When to Use

- High-frequency real-time events (UI interactions, sensor data, WebSocket feeds).
- Asynchronous workflows requiring clean composition (chaining, filtering, combining streams).
- Event-driven architectures where multiple consumers react to the same events.
- Replacing callback hell with declarative stream operators.

### When NOT to Use

- Simple request-response patterns (use Promises/async-await).
- CRUD applications with linear data flow.
- When the team lacks reactive programming experience and the learning curve is prohibitive.

### Cold vs. Hot Observables

| Type | Behavior | Example |
|------|----------|---------|
| Cold | Each subscriber gets its own execution | HTTP requests, file reads |
| Hot | All subscribers share one execution | WebSocket, mouse events, stock tickers |

### Code Example (TypeScript/RxJS)

```typescript
import { fromEvent, interval } from 'rxjs';
import { map, filter, debounceTime, switchMap, takeUntil } from 'rxjs/operators';

// Observable from DOM events
const searchInput$ = fromEvent<InputEvent>(searchBox, 'input').pipe(
    map(event => (event.target as HTMLInputElement).value),
    debounceTime(300),              // wait 300ms after last keystroke
    filter(query => query.length >= 3),  // ignore short queries
    switchMap(query =>
        fetch(`/api/search?q=${query}`).then(r => r.json())
    )
);

searchInput$.subscribe({
    next: results => renderResults(results),
    error: err => showError(err),
    complete: () => console.log("Stream completed")
});

// Composing multiple streams
const clicks$ = fromEvent(document, 'click');
const timer$ = interval(1000);

// Stop timer when user clicks
timer$.pipe(takeUntil(clicks$)).subscribe(
    tick => console.log(`Tick: ${tick}`)
);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Composable async stream operations | Steep learning curve |
| Declarative, readable pipelines | Debugging stream chains is difficult |
| Handles backpressure naturally | Memory leaks from unmanaged subscriptions |
| Replaces callback hell | Overkill for simple async operations |

---

## 3.2 Backpressure

### Intent

Control the flow of data from fast producers to slow consumers, preventing resource exhaustion (memory overflow, queue saturation) while maintaining system stability.

### When to Use

- Fast producers paired with slow consumers (high-frequency sensors to database writers).
- Streaming ETL pipelines requiring reliability.
- Systems requiring bounded memory usage.
- Any situation where unbounded buffering would crash the system.

### When NOT to Use

- Low-volume, predictable data flows.
- Scenarios where data loss is acceptable (use drop strategy instead).
- Synchronous processing where natural blocking provides flow control.

### Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Buffer** | Store items temporarily (bounded) | Short bursts of excess data |
| **Drop** | Discard oldest or newest items | Real-time data where freshness matters |
| **Signal (pull-based)** | Consumer requests N items | Reactive Streams spec (request/demand) |
| **Window/Batch** | Group items for batch processing | Analytics, bulk inserts |
| **Throttle** | Limit emission rate | UI events, rate-limited APIs |

### Code Example (TypeScript/RxJS)

```typescript
import { interval, asyncScheduler } from 'rxjs';
import { bufferTime, take, throttleTime } from 'rxjs/operators';

// Fast producer: emits every 10ms
const fastProducer$ = interval(10);

// Strategy 1: Buffer -- collect items over 1 second, process batch
fastProducer$.pipe(
    bufferTime(1000),  // collect 1 second of items
    take(5)            // stop after 5 batches
).subscribe(batch => {
    console.log(`Processing batch of ${batch.length} items`);
    // Slow consumer: batch insert to database
});

// Strategy 2: Throttle -- take one item per second
fastProducer$.pipe(
    throttleTime(1000),
    take(10)
).subscribe(item => {
    console.log(`Processing item: ${item}`);
});
```

### Code Example (Java -- Reactive Streams pull-based)

```java
// Consumer controls flow via request()
Subscriber<Integer> slowConsumer = new Subscriber<>() {
    private Subscription subscription;

    @Override
    public void onSubscribe(Subscription s) {
        this.subscription = s;
        s.request(10);  // request first 10 items
    }

    @Override
    public void onNext(Integer item) {
        processSlowly(item);
        subscription.request(1);  // request next item when ready
    }

    @Override
    public void onError(Throwable t) { /* handle */ }

    @Override
    public void onComplete() { /* done */ }
};
```

### Trade-offs

| Pros | Cons |
|------|------|
| Prevents system crashes from overflow | Implementation complexity |
| Bounded, predictable memory usage | May lose data (drop strategies) |
| Consumer-driven flow control | Requires careful threshold tuning |
| Essential for production streaming | Adds latency with buffering/windowing |

---

## 3.3 Circuit Breaker

### Intent

Prevent cascading failures by wrapping calls to remote services with a stateful proxy that monitors failures and trips to an "open" state when failures exceed a threshold, returning errors immediately without calling the downstream service.

### States

```
         success
    +------<------+
    |              |
    v              |
 [CLOSED] --failures exceed threshold--> [OPEN]
    ^                                       |
    |                                       | timeout expires
    +-------success-------[HALF-OPEN]<-----+
                            |
                        failure --> [OPEN]
```

- **Closed**: Requests flow normally; failures are counted.
- **Open**: Requests fail immediately without contacting the service.
- **Half-Open**: One probe request is allowed to test if the service recovered.

### When to Use

- Distributed systems with unreliable downstream dependencies.
- Preventing cascading failures across microservices.
- Protecting systems from wasting resources on known-failing operations.
- Providing fast failure feedback to clients.

### When NOT to Use

- Single-service applications without external dependencies.
- Local in-process calls that cannot meaningfully "fail" in this way.
- Operations where you want to retry indefinitely (use retry pattern instead).

### Code Example (TypeScript)

```typescript
enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
    private state = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;

    constructor(
        private failureThreshold: number = 5,
        private resetTimeout: number = 30000  // 30 seconds
    ) {}

    async call<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
            } else {
                throw new Error("Circuit is OPEN -- failing fast");
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = CircuitState.CLOSED;
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }
}

// Usage
const breaker = new CircuitBreaker(3, 10000);

try {
    const data = await breaker.call(() => fetch("/api/orders").then(r => r.json()));
} catch (e) {
    // Either the call failed or the circuit is open
    useFallbackData();
}
```

### Real-World Libraries

- **Resilience4j** (Java)
- **Polly** (.NET)
- **Hystrix** (Java, Netflix -- now in maintenance)
- **Istio/Envoy** (service mesh level)

### Trade-offs

| Pros | Cons |
|------|------|
| Prevents cascading failures | Adds state management complexity |
| Fast failure = better user experience | False positives with wrong thresholds |
| Protects overwhelmed services | Requires monitoring and tuning |
| Gives failing services time to recover | Half-open state needs careful handling |

---

## 3.4 Bulkhead

### Intent

Isolate resources (thread pools, connection pools, containers) per service or component so that a failure or resource exhaustion in one does not cascade to others. Named after ship bulkhead compartments that contain flooding.

### Implementation Approaches

| Approach | Isolation Unit | Granularity |
|----------|---------------|-------------|
| Thread pool isolation | Separate thread pool per service call | Fine-grained |
| Connection pool isolation | Dedicated DB connections per service | Medium |
| Process/container isolation | Separate containers with CPU/memory quotas | Coarse-grained |
| Semaphore isolation | Concurrent call limits per service | Fine-grained, lightweight |

### When to Use

- Microservice architectures where one slow dependency can exhaust shared resources.
- When resource spikes in one subsystem should not affect critical paths.
- Multi-tenant systems where one tenant's workload should not degrade others.
- Combined with Circuit Breaker for comprehensive resilience.

### When NOT to Use

- Simple, single-dependency applications.
- When resource overhead of maintaining separate pools is unjustified.
- If the added operational complexity outweighs the resilience benefit.

### Code Example (TypeScript)

```typescript
class Bulkhead {
    private activeCount = 0;
    private waitQueue: (() => void)[] = [];

    constructor(
        private maxConcurrent: number,
        private maxWait: number = 0
    ) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.activeCount >= this.maxConcurrent) {
            if (this.waitQueue.length >= this.maxWait) {
                throw new Error("Bulkhead full -- request rejected");
            }
            await new Promise<void>(resolve => this.waitQueue.push(resolve));
        }

        this.activeCount++;
        try {
            return await operation();
        } finally {
            this.activeCount--;
            const next = this.waitQueue.shift();
            if (next) next();
        }
    }
}

// Usage: separate bulkheads per dependency
const orderServiceBulkhead = new Bulkhead(10, 5);
const paymentServiceBulkhead = new Bulkhead(5, 2);

// A slow payment service won't exhaust order service resources
const order = await orderServiceBulkhead.execute(() => fetchOrders());
const payment = await paymentServiceBulkhead.execute(() => processPayment());
```

### Code Example (Spring Boot/Resilience4j)

```java
@Bulkhead(name = "paymentService", fallbackMethod = "paymentFallback")
public PaymentResult processPayment(PaymentRequest request) {
    return paymentClient.process(request);
}

// application.yml
// resilience4j.bulkhead.instances.paymentService:
//   maxConcurrentCalls: 5
//   maxWaitDuration: 500ms
```

### Trade-offs

| Pros | Cons |
|------|------|
| Isolates failure blast radius | Resource overhead (separate pools) |
| Prevents cascading resource exhaustion | Complexity in configuration and monitoring |
| Predictable behavior under load | Reduced overall resource utilization |
| Composable with circuit breaker and retry | Choosing granularity is non-trivial |

---

## 3.5 Retry with Exponential Backoff

### Intent

Automatically retry failed operations with progressively increasing delays between attempts, preventing retry storms that can overwhelm recovering services. Jitter (randomization) is added to prevent synchronized retries from multiple clients.

### When to Use

- Transient failures (network glitches, temporary service unavailability, rate limiting).
- Distributed systems where brief outages are expected.
- API calls to rate-limited services.
- Database connections that may temporarily fail.

### When NOT to Use

- Permanent failures (invalid credentials, 404 Not Found, business rule violations).
- When immediate failure notification is required.
- Operations that are not idempotent (retrying could cause duplicate processing).
- When combined with Circuit Breaker in open state (the breaker should prevent retries).

### Formula

```
delay = min(baseDelay * 2^attempt + jitter, maxDelay)
```

Where `jitter = random(0, baseDelay * 2^attempt)` to decorrelate retries.

### Code Example (TypeScript)

```typescript
interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitter: boolean;
}

async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: RetryConfig = { maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 30000, jitter: true }
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            if (attempt === config.maxAttempts - 1) break;

            let delay = config.baseDelayMs * Math.pow(2, attempt);
            if (config.jitter) {
                delay += Math.random() * delay;  // full jitter
            }
            delay = Math.min(delay, config.maxDelayMs);

            console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Usage
const data = await retryWithBackoff(
    () => fetch("/api/orders").then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }),
    { maxAttempts: 4, baseDelayMs: 500, maxDelayMs: 15000, jitter: true }
);
```

### Backoff Strategies

| Strategy | Formula | Use Case |
|----------|---------|----------|
| Constant | `delay = constant` | Simple, predictable retries |
| Linear | `delay = baseDelay * attempt` | Gentle increase |
| Exponential | `delay = baseDelay * 2^attempt` | Standard distributed systems |
| Exponential + Jitter | `delay = random(0, baseDelay * 2^attempt)` | Prevents thundering herd |
| Decorrelated Jitter | `delay = random(baseDelay, previousDelay * 3)` | AWS recommended |

### Trade-offs

| Pros | Cons |
|------|------|
| Handles transient failures gracefully | Increases latency during failures |
| Jitter prevents thundering herd | Inappropriate for non-idempotent operations |
| Simple to implement | Needs careful max attempt/delay caps |
| Composable with circuit breaker | Can mask underlying persistent issues |

---

## 3.6 Reactive Pattern Comparisons

### Resilience Patterns Working Together

```
Request --> [Retry with Backoff] --> [Circuit Breaker] --> [Bulkhead] --> Service
                                          |                    |
                                     (fail fast if           (isolate
                                      service down)          resources)
```

- **Retry** handles transient failures by trying again.
- **Circuit Breaker** stops retries when the service is persistently down.
- **Bulkhead** isolates the blast radius so one failing dependency does not consume all resources.
- **Backpressure** controls the flow rate between fast producers and slow consumers.

### Pattern Comparison Table

| Pattern | Purpose | Scope | Stateful? | Typical Use |
|---------|---------|-------|-----------|-------------|
| Observable | Stream composition | Data flow | No | Event handling, real-time UIs |
| Backpressure | Flow control | Producer-consumer | Yes (buffers) | Streaming, ETL |
| Circuit Breaker | Failure isolation | Per-dependency | Yes (3 states) | Remote service calls |
| Bulkhead | Resource isolation | Per-component | Yes (pool limits) | Shared resource protection |
| Retry + Backoff | Transient failure recovery | Per-operation | No | Network calls, APIs |

### Combined Resilience Stack Example

The following example shows how these patterns compose into a complete resilience stack. The order matters: the outermost layer (Bulkhead) limits resource consumption, the middle layer (Circuit Breaker) prevents calls to known-failing services, and the innermost layer (Retry) handles transient glitches.

```typescript
// Complete resilience stack
const resilientCall = async () => {
    return await orderServiceBulkhead.execute(async () => {      // Bulkhead
        return await circuitBreaker.call(async () => {           // Circuit Breaker
            return await retryWithBackoff(async () => {          // Retry
                return await fetch("/api/orders").then(r => r.json());
            }, { maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 5000, jitter: true });
        });
    });
};
```

This layered approach ensures that:
1. The Bulkhead prevents any single dependency from monopolizing shared resources.
2. The Circuit Breaker stops retrying when the service is clearly down, giving it time to recover.
3. The Retry with Backoff handles transient network issues without overwhelming the service.

---

## Sources

### Enterprise Patterns
- [Catalog of PoEAA -- Martin Fowler](https://martinfowler.com/eaaCatalog/)
- [Enterprise Patterns in C# -- Chris Woodruff](https://www.woodruff.dev/enterprise-patterns-real-code-implementing-fowlers-ideas-in-c/)
- [Patterns of Enterprise Application Architecture -- Martin Fowler (book)](https://martinfowler.com/books/eaa.html)

### Functional Patterns
- [Functional Programming Patterns & Design Techniques -- softwarepatternslexicon.com](https://softwarepatternslexicon.com/functional/)
- [Railway Oriented Programming -- Naveen Muguda (Medium)](https://naveenkumarmuguda.medium.com/railway-oriented-programming-a-powerful-functional-programming-pattern-ab454e467f31)
- [Python Functors and Monads -- ArjanCodes](https://arjancodes.com/blog/python-functors-and-monads/)
- [Haskell Lenses -- Wikibooks](https://en.wikibooks.org/wiki/Haskell/Lenses_and_functional_references)

### Reactive Patterns
- [Reactive Programming Patterns Guide -- TechBuzzOnline](https://techbuzzonline.com/reactive-programmingpatterns-beginners-guide/)
- [Resilience Design Patterns -- codecentric](https://www.codecentric.de/en/knowledge-hub/blog/resilience-design-patterns-retry-fallback-timeout-circuit-breaker)
- [Bulkhead Pattern -- Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)
- [Bulkhead Pattern -- System Design Academy](https://www.systemdesignacademy.com/blog/bulkhead-pattern)
- [Resilient Microservices Patterns -- Design Gurus](https://www.designgurus.io/answers/detail/what-are-design-patterns-for-resilient-microservices-circuit-breaker-bulkhead-retries)
