---
title: "Design Patterns Across Languages: How Paradigms Shape Patterns"
description: "Understand how design patterns manifest differently in JavaScript, Go, Rust, and functional languages — and when language features make patterns invisible or unnecessary."
pubDate: 2026-03-13
category: "backend"
tags:
  - Design Patterns
  - Go
  - Rust
  - Functional Programming
series: "Software Design Patterns"
seriesOrder: 8
heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=750&h=422&fit=crop"
---

*A pattern in Java might be invisible in Python. Here is why that matters more than you think.*

---

## Table of Contents

- [The Vanishing Pattern](#the-vanishing-pattern)
- [Norvig's "16 of 23" Finding](#norvigs-16-of-23-finding)
- [Patterns in JavaScript and TypeScript](#patterns-in-javascript-and-typescript)
- [Patterns in Go](#patterns-in-go)
- [Patterns in Rust](#patterns-in-rust)
- [Patterns in Functional Programming](#patterns-in-functional-programming)
- [Game Development Patterns](#game-development-patterns)
- [Cross-Cutting Summary: When Patterns Become Unnecessary](#cross-cutting-summary-when-patterns-become-unnecessary)
- [Sources](#sources)

---

## The Vanishing Pattern

Consider the Strategy pattern in Java. You define an interface. You create multiple implementations. You write a class that accepts the interface and delegates to it. Three files, an interface, and a constructor later, you have interchangeable algorithms.

Now consider the same problem in Python:

```python
sorted(data, key=lambda x: x.name)
```

One line. No interface. No class hierarchy. The Strategy pattern is still there --- you are still swapping algorithms at runtime --- but it has become invisible. The language absorbed it.

This is not a quirk of Python. It is a fundamental truth about software design patterns: they are shaped by the language they inhabit. A pattern that requires careful architectural planning in one language may be a single function call in another, a built-in keyword in a third, or entirely irrelevant in a fourth.

Understanding this relationship between language features and pattern necessity is what separates developers who apply patterns mechanically from those who apply them with judgment. This post maps that relationship across the major programming paradigms.

---

## Norvig's "16 of 23" Finding

In 1996, Peter Norvig --- then at NASA's Ames Research Center, later Director of Research at Google --- delivered a landmark presentation titled "Design Patterns in Dynamic Languages." His central finding was striking: **16 of the 23 Gang of Four patterns become "invisible or simpler" in dynamic languages** like Lisp and Dylan.

His argument was not that patterns are useless. It was that patterns are often workarounds for missing language features. When a language provides those features natively, the pattern dissolves into the language itself.

### The 16 Patterns, Categorized by Language Feature

| Language Feature | Patterns Simplified | Mechanism |
|---|---|---|
| **First-class types** (6) | Abstract Factory, Flyweight, Factory Method, State, Proxy, Chain of Responsibility | Classes and types are runtime objects that serve as their own factories; no dual class hierarchies needed |
| **First-class functions** (4) | Command, Strategy, Template Method, Visitor | A function variable replaces an entire command or strategy object; composition replaces inheritance |
| **Macros** (2) | Interpreter, Iterator | Syntactic abstraction handles parsing and iteration at the language level |
| **Method combination** (2) | Mediator, Observer | Before/after/around method hooks eliminate observer boilerplate; "Observer is just notify after every change" |
| **Multimethods** (1) | Builder | Dispatch on multiple argument types eliminates builder/director class hierarchies |
| **Modules** (1) | Facade | Module exports provide simple subsystem interfaces natively |

The remaining 7 patterns --- Composite, Decorator, Memento, Prototype, Singleton, Bridge, and Adapter --- are "essentially unchanged" in dynamic languages, but often simpler in implementation.

### Which GoF Patterns Are Trivial in Python, Ruby, and JavaScript

**Invisible or trivial:**

- **Strategy** --- Pass a function. `sorted(data, key=lambda x: x.name)` is the Strategy pattern in one line.
- **Command** --- Any callable (function, lambda, closure) is a command object.
- **Template Method** --- Pass functions into a higher-order function instead of subclassing.
- **Iterator** --- Python generators (`yield`), JavaScript generators (`function*`), and Ruby's `Enumerable` mixin make this a language primitive.
- **Observer** --- Python descriptors, Ruby's `Observable` module, and JavaScript's `EventEmitter` are built-in.
- **Decorator** --- Python's `@decorator` syntax is a language feature (distinct from the GoF Decorator pattern, which wraps objects; Python decorators wrap functions and classes).
- **Adapter** --- Duck typing means if an object has the right methods, it already fits. No adapter class needed.
- **Factory Method** --- Classes are first-class objects: `cls = MyClass; obj = cls()`.
- **Singleton** --- Module-level instances in Python; `module.exports` in Node.js.

**Still useful but simpler:**

- **Observer** --- Simpler with built-in event systems but still architecturally relevant for decoupling large systems.
- **State** --- Can use dictionaries of functions instead of state classes.
- **Builder** --- Keyword arguments and dictionary unpacking (`**kwargs`) often suffice.

### Key Language Features That Eliminate Patterns

| Feature | Replaces | Example |
|---|---|---|
| First-class functions | Strategy, Command, Template Method | `process(data, strategy_fn)` |
| `@decorator` syntax (Python) | Decorator (behavioral wrapping) | `@retry(max=3)` wraps any function |
| Generators / iterators | Iterator pattern | `yield` in Python, `function*` in JS |
| Duck typing | Adapter, many interface-based patterns | No interface declaration needed |
| Mixins / modules | Some structural patterns | Ruby mixins, Python multiple inheritance |
| Closures | Command, Memento (state capture) | Closure captures free variables |

Norvig's finding does not diminish the GoF patterns. It reframes them. Patterns are not universal laws --- they are solutions shaped by constraints. Change the constraints, and the solutions change.

---

## Patterns in JavaScript and TypeScript

JavaScript occupies a unique position in the pattern landscape. It is multi-paradigm (object-oriented, functional, event-driven), runs on both client and server, and has evolved so rapidly that some patterns became language features within a few years of being popularized.

### Module Pattern (IIFE and ES Modules)

The Module Pattern uses closures to create private scope. Historically, it was implemented via the IIFE (Immediately Invoked Function Expression):

```javascript
const Counter = (function() {
  let count = 0;                    // private
  return {
    increment() { return ++count; }, // public
    getCount() { return count; }
  };
})();
```

With ES Modules (`import`/`export`), the IIFE is no longer needed --- the module file itself provides encapsulation. **The pattern became a language feature.**

### Revealing Module Pattern

A refinement where all logic is private and only selected members are returned:

```javascript
const Calculator = (function() {
  function add(a, b) { return a + b; }
  function multiply(a, b) { return a * b; }
  return { add, multiply }; // reveal only these
})();
```

**When unnecessary:** With ES Modules, simply do not export private functions. The pattern is obsolete in modern JavaScript and TypeScript.

### Observer via EventEmitter

Node.js's `EventEmitter` is a first-class Observer implementation:

```javascript
const emitter = new EventEmitter();
emitter.on('data', (payload) => handle(payload));  // subscribe
emitter.emit('data', { id: 1 });                   // publish
```

On the browser side, `addEventListener` and `dispatchEvent` serve the same role. The Observer pattern is baked into the platform.

### Middleware Pattern (Express.js, Redux)

The Middleware pattern is a Chain of Responsibility variant where each handler can process, transform, or short-circuit a request:

```javascript
// Express.js
app.use(logger);          // logs request
app.use(authenticate);    // checks auth, may short-circuit
app.use(parseBody);       // transforms request
app.get('/api', handler); // final handler

// Each middleware: (req, res, next) => { ...; next(); }
```

Redux middleware follows the same structure: `store => next => action => { ... }`.

Middleware is so pervasive in JavaScript ecosystems --- Express, Koa, Redux, Apollo --- that it has become its own idiomatic pattern, more natural than the formal Chain of Responsibility it descends from.

### Higher-Order Components (HOC) in React

HOCs wrap a component to inject behavior --- a Decorator pattern for components:

```jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    if (!isLoggedIn()) return <Redirect to="/login" />;
    return <WrappedComponent {...props} />;
  };
}
```

**Problem:** Multiple HOCs create "wrapper hell" --- deeply nested component trees that are hard to debug.

### Hooks as Pattern Replacement in React

React Hooks (2019 onward) replaced HOCs and render props for most use cases:

```jsx
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => { /* fetch user */ }, []);
  return user;
}

function Dashboard() {
  const user = useAuth(); // no wrapper needed
  if (!user) return <Redirect to="/login" />;
  return <DashboardContent user={user} />;
}
```

**What Hooks replace:**

- HOCs for cross-cutting concerns become custom Hooks (`useAuth`, `useTheme`)
- Render Props for shared state become `useState` and `useReducer`
- Class component lifecycle becomes `useEffect`
- Context wrapper nesting becomes `useContext`

The React documentation has phased out detailed HOC coverage in favor of Hooks. This is a pattern evolution where the newer approach did not just improve ergonomics --- it changed how developers think about component composition.

### Promise Patterns (Async/Await)

Promises and `async/await` replaced callback-based patterns and eliminated "callback hell":

| Callback Pattern | Promise/Async Equivalent |
|---|---|
| Nested callbacks (pyramid of doom) | `async/await` sequential flow |
| Error-first callbacks `(err, data)` | `try/catch` with `await` |
| Callback-based event chains | `Promise.all`, `Promise.race` |
| Manual continuation passing | Implicit with `await` |

### Prototype Pattern (Prototypal Inheritance)

JavaScript's prototype chain is the Prototype pattern as a language primitive. Every object has a `__proto__` link; property lookup traverses the chain. `Object.create(proto)` creates new objects from prototypes directly --- no class needed.

With ES6 `class` syntax, this is syntactic sugar over prototypes. The pattern is the language's inheritance model itself.

---

## Patterns in Go

Go's design philosophy --- no classes, no inheritance, implicit interfaces, goroutines, and channels --- fundamentally changes how patterns manifest. Go does not just simplify patterns; it enforces different ones.

### How Go Idioms Replace Traditional Patterns

| Traditional Pattern | Go Idiom | Mechanism |
|---|---|---|
| **Inheritance hierarchies** | Struct embedding + interfaces | Composition over inheritance is enforced, not optional |
| **Abstract Factory** | Factory functions returning interfaces | `func NewReader(src string) io.Reader` |
| **Singleton** | `sync.Once` + package variable | `once.Do(func() { instance = &Config{} })` |
| **Strategy** | Interface with multiple implementations | Small interfaces (often 1 method) |
| **Decorator** | Function wrapping | `func WithLogging(h http.Handler) http.Handler` |
| **Observer** | Channels | Goroutine reads from channel; no observer registry |
| **Iterator** | Range over channels, slices | `for item := range channel { ... }` |
| **Chain of Responsibility** | HTTP middleware chains | `func(next http.Handler) http.Handler` |
| **Adapter** | Wrapper struct + interface impl | Struct embeds the adaptee, implements target interface |
| **Builder** | Functional Options pattern | Variadic option functions |
| **Template Method** | Accept function parameters | Pass behavior as `func` argument |

### Functional Options Pattern

Go's signature pattern for configuring objects with many optional parameters, popularized by Dave Cheney:

```go
type Option func(*Server)

func WithPort(p int) Option {
  return func(s *Server) { s.port = p }
}

func WithTimeout(t time.Duration) Option {
  return func(s *Server) { s.timeout = t }
}

func NewServer(opts ...Option) *Server {
  s := &Server{port: 8080, timeout: 30 * time.Second} // defaults
  for _, opt := range opts {
    opt(s)
  }
  return s
}

// Usage: srv := NewServer(WithPort(9090), WithTimeout(60*time.Second))
```

**Why this exists:** Go lacks default parameters, method overloading, and keyword arguments. Functional options provide a clean, extensible API without the Builder pattern's class hierarchy. It is one of the best examples of a language's constraints giving rise to a pattern that is arguably more elegant than the one it replaces.

### Interface-Based Patterns

Go interfaces are satisfied implicitly --- no `implements` keyword. This means:

- **Any type with the right methods satisfies the interface** (structural typing)
- **Interfaces are small**, often single-method: `io.Reader`, `io.Writer`, `fmt.Stringer`
- The **Accept Interfaces, Return Structs** principle keeps APIs flexible

```go
type Notifier interface {
  Notify(message string) error
}
// EmailNotifier, SlackNotifier, etc. all satisfy Notifier without declaring it
```

This implicit satisfaction is philosophically different from Java's explicit `implements`. In Go, the consumer defines the interface it needs, and any type that happens to match it works. This inverts the dependency relationship and makes Adapter patterns largely unnecessary.

### Concurrency Patterns

Go's goroutines and channels create patterns that do not exist in traditional OOP:

**Pipeline:** Stages connected by channels, each stage a group of goroutines running the same function.

```go
func gen(nums ...int) <-chan int { /* stage 1: emit */ }
func sq(in <-chan int) <-chan int { /* stage 2: transform */ }
// pipeline: for v := range sq(sq(gen(2,3))) { ... }
```

**Fan-Out / Fan-In:** Distribute work to multiple goroutines (fan-out), merge results into one channel (fan-in).

**Worker Pool:** Fixed N goroutines reading from a shared task channel --- controls concurrency and provides backpressure.

**Context Cancellation:** `context.Context` propagates cancellation, deadlines, and request-scoped values across goroutine boundaries. It replaces manual done-channel patterns.

**Select Statement:** Multiplexes across multiple channels --- a pattern primitive unique to Go.

These concurrency patterns do not have direct GoF equivalents. They emerged from Go's specific concurrency primitives and have become standard idioms in the Go ecosystem.

---

## Patterns in Rust

Rust's ownership system, trait-based polymorphism, and zero-cost abstractions create unique pattern manifestations. Where Go simplified patterns through minimalism, Rust reshapes them through its type system's power.

### Ownership and Borrowing Affecting Patterns

Ownership fundamentally changes pattern implementation:

- **State pattern** requires `Option::take()` to temporarily move state ownership during transitions
- **Observer pattern** is complex because multiple observers holding references conflicts with single-ownership rules
- **Singleton** requires `unsafe` or crates like `once_cell`/`lazy_static` for global mutable state
- **Prototype** (clone) must explicitly implement `Clone` --- deep versus shallow copying is a conscious decision, not an accident

### Trait-Based Patterns

Traits replace interfaces but with additional power --- associated types, default implementations, and trait bounds:

```rust
trait Renderer {
    fn render(&self, scene: &Scene) -> Image;
}
struct OpenGLRenderer;
struct VulkanRenderer;
impl Renderer for OpenGLRenderer { /* ... */ }
impl Renderer for VulkanRenderer { /* ... */ }
// Static dispatch: fn draw<R: Renderer>(r: &R, s: &Scene) -> Image
// Dynamic dispatch: fn draw(r: &dyn Renderer, s: &Scene) -> Image
```

**Key difference from Go:** Traits must be explicitly implemented (`impl Trait for Type`). This is deliberate --- no accidental interface satisfaction. The developer must declare the intent to implement an abstraction.

### Builder Pattern in Rust

Extremely common because Rust has no default parameters or method overloading:

```rust
let server = ServerBuilder::new()
    .port(8080)
    .max_connections(100)
    .tls_config(TlsConfig::default())
    .build()?;  // Returns Result<Server, Error>
```

The Builder consumes `self` (ownership) at each step, preventing reuse of partially-built objects. The `build()` method can return `Result` for validation. This is a pattern that Rust makes both necessary (no default parameters) and safer (ownership prevents misuse).

### Newtype Pattern

Wraps an existing type to create a distinct type with its own semantics:

```rust
struct Meters(f64);
struct Kilometers(f64);
// These are different types — can't accidentally mix them
```

**Use cases:** Type-safe APIs, preventing unit confusion (the Mars Climate Orbiter disaster was caused by exactly this kind of unit mismatch), implementing external traits on external types (orphan rule workaround), and restricting the interface of a wrapped type.

### Typestate Pattern

Encodes valid states as distinct types so invalid state transitions fail at compile time:

```rust
struct Draft;
struct Published;

struct Post<State> {
    content: String,
    _state: std::marker::PhantomData<State>,
}

impl Post<Draft> {
    fn publish(self) -> Post<Published> { /* ... */ }
}

impl Post<Published> {
    fn content(&self) -> &str { &self.content }
    // Draft posts can't call content() — it doesn't exist on that type
}
```

**Key advantage:** Invalid states are unrepresentable. The compiler prevents calling `content()` on a draft post. No runtime checks needed. This is a pattern that simply cannot exist in languages without Rust's type system.

### RAII (Resource Acquisition Is Initialization)

Resources are tied to object lifetimes. When a value goes out of scope, its `Drop` implementation runs automatically:

```rust
{
    let file = File::open("data.txt")?;  // resource acquired
    // use file...
}  // file.drop() called automatically — resource released
```

**RAII in Rust replaces:**
- Try/finally blocks
- Manual resource cleanup
- Dispose patterns
- Scope guards

`MutexGuard`, `File`, `TcpStream` --- all use RAII. The pattern is fundamental to Rust's safety guarantees and eliminates entire categories of resource leak bugs.

### Trade-offs: Trait Objects vs. Enums vs. Typestate

| Approach | Compile-time safety | Runtime flexibility | Extensibility | Performance |
|---|---|---|---|---|
| **Trait objects** (`dyn Trait`) | Moderate | High (dynamic dispatch) | Open (new types easy) | Heap allocation + vtable |
| **Enums** | High (exhaustive matching) | Low (closed set) | Closed (must modify enum) | Stack, no indirection |
| **Typestate** | Highest (invalid states impossible) | Low (all static) | Moderate | Zero-cost abstractions |

Choosing between these three approaches is one of the most consequential design decisions in Rust. Each represents a different point on the safety-flexibility spectrum.

---

## Patterns in Functional Programming

Functional programming does not just simplify OOP patterns --- it often eliminates them entirely, replacing class hierarchies with function composition and type-level guarantees. If Norvig showed that dynamic languages simplify 16 of 23 patterns, functional programming goes further: it replaces the conceptual framework that made those patterns necessary.

### How FP Eliminates OOP Patterns

| OOP Pattern | FP Replacement | Mechanism |
|---|---|---|
| **Strategy** | Higher-order functions | Pass the algorithm as a function parameter |
| **Command** | First-class functions / closures | A closure is already a deferred computation |
| **Template Method** | Higher-order functions | Pass the varying steps as function arguments |
| **Factory** | Functions returning functions | A factory is just a function |
| **Singleton** | Module-level value | Modules are singletons; no mutable global state in pure FP |
| **Decorator** | Function composition | `f = compose(logging, caching, validate)` |
| **Observer** | Reactive streams / FRP | `Observable.map().filter().subscribe()` |
| **Visitor** | Pattern matching | `match` on algebraic data types; compiler ensures exhaustiveness |
| **State** | State monad / pure state threading | `(State, Action) -> (State, Output)` |
| **Chain of Responsibility** | Railway-oriented programming | Compose Result-returning functions |
| **Iterator** | Lazy sequences / list comprehensions | `map`, `filter`, `fold` over lazy streams |
| **Null Object** | Option/Maybe monad | `Option<T>` forces handling of absence |

### Monads Replacing Null Checks (Maybe/Option)

The `Maybe`/`Option` type eliminates null pointer exceptions by encoding absence in the type system:

```haskell
-- Haskell
safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide x y = Just (x `div` y)

-- Chain operations without null checks
result = safeDivide 10 2 >>= safeDivide 100  -- Just 50
result = safeDivide 10 0 >>= safeDivide 100  -- Nothing (short-circuits)
```

The Null Object pattern (creating a do-nothing implementation) becomes unnecessary --- `Nothing`/`None` is the universal null object. The type system forces you to handle the absence case, eliminating entire categories of null pointer bugs that plague OOP codebases.

### Pattern Matching Replacing Visitor

The Visitor pattern exists because OOP languages cannot easily add new operations to a closed class hierarchy. Pattern matching on algebraic data types solves this directly:

```rust
enum Expr {
    Literal(f64),
    Add(Box<Expr>, Box<Expr>),
    Mul(Box<Expr>, Box<Expr>),
}

fn eval(expr: &Expr) -> f64 {
    match expr {
        Expr::Literal(n) => *n,
        Expr::Add(a, b) => eval(a) + eval(b),
        Expr::Mul(a, b) => eval(a) * eval(b),
    }
}
// Adding a new operation (e.g., pretty_print) is just a new function with match
// No accept() method, no visitor interface, no double dispatch
```

The compiler ensures exhaustive matching --- if you add a new variant, all match expressions must handle it. No silent bugs from forgotten cases.

### Higher-Order Functions Replacing Strategy

```python
# OOP Strategy
class JsonSerializer:
    def serialize(self, data): return json.dumps(data)
class XmlSerializer:
    def serialize(self, data): return to_xml(data)
class Exporter:
    def __init__(self, strategy): self.strategy = strategy
    def export(self, data): return self.strategy.serialize(data)

# FP: just pass a function
def export(data, serialize_fn):
    return serialize_fn(data)
export(data, json.dumps)
export(data, to_xml)
```

The entire class hierarchy collapses to a function parameter. The Strategy pattern's intent is preserved; its ceremony is eliminated.

### Immutability Affecting Memento and Prototype

- **Memento** (capture and restore state): With immutable data, every previous version is already preserved. Undo is simply pointing to the previous value. Persistent data structures (used in Clojure and Haskell) make this essentially free.
- **Prototype** (clone objects): With immutable values, "copying" is just sharing a reference. Copy-on-write semantics handle the rare mutation case.

Immutability does not just simplify these patterns --- it makes them nearly invisible. The problem they solve (how to capture and restore state) is handled by the data model itself.

### Algebraic Data Types Replacing Class Hierarchies

Instead of a class hierarchy with abstract base classes and subclasses:

```haskell
-- ADT replaces Shape -> Circle, Rectangle, Triangle class hierarchy
data Shape = Circle Double
           | Rectangle Double Double
           | Triangle Double Double Double

area :: Shape -> Double
area (Circle r)        = pi * r * r
area (Rectangle w h)   = w * h
area (Triangle a b c)  = -- Heron's formula
```

**Expression Problem trade-off:** ADTs make adding new operations easy (write a new function with match) but adding new variants hard (must update all functions). Class hierarchies are the opposite --- adding new subclasses is easy, but adding new operations requires modifying all classes. This is a fundamental tension in software design, not a flaw of either approach.

### Railway-Oriented Programming Replacing Chain of Responsibility

Railway-Oriented Programming, coined by Scott Wlaschin, models error handling as two parallel tracks:

```
Success track:  --> validate --> normalize --> save --> notify --> done
                      |            |           |         |
Failure track:  ---------------------------------------------------> error
```

Each function returns `Result<Success, Failure>`. The `bind` function (`>>=`) routes successes forward and failures to the bottom track. Once on the failure track, all subsequent steps are bypassed.

```fsharp
let processRequest =
    validate
    >> bind normalize
    >> bind save
    >> bind notify
```

This replaces:
- Chain of Responsibility (handlers decide whether to pass along)
- Nested try/catch blocks
- Error code checking at every step
- Defensive null checks

The elegance of railway-oriented programming is that error handling becomes compositional. Each step in the pipeline only needs to handle the success case. The failure track is handled by the composition mechanism itself.

---

## Game Development Patterns

Game development has its own pattern ecosystem. Robert Nystrom's *Game Programming Patterns* catalogs 13 patterns driven by game-specific constraints: real-time performance, frame budgets, cache efficiency, and the need to update hundreds of thousands of entities every 16 milliseconds.

These patterns are not academic. They run inside every game engine you have ever used.

### Sequencing Patterns

#### Game Loop

**Problem:** Decouple game progression from hardware speed and user input timing.

**How it works:** The core loop processes input, updates game state, and renders each frame. A fixed timestep updates at consistent intervals while rendering can vary.

```
while (gameIsRunning) {
    processInput();
    update(FIXED_TIMESTEP);
    render();
}
```

**Key insight:** Variable timesteps cause non-deterministic physics and floating-point errors. Fixed timestep with variable rendering provides deterministic behavior across hardware. This is why the same game plays identically on a low-end laptop and a high-end desktop --- the game logic runs at the same rate.

#### Update Method

**Problem:** Each game entity needs independent per-frame behavior without coupling to the main loop.

**How it works:** Each entity has an `update()` method. The game loop iterates a collection of updatable entities.

**When unnecessary:** Static entities and event-driven systems.

#### Double Buffer

**Problem:** Prevent visual tearing and ensure simultaneous state transitions appear atomic.

**How it works:** Two buffers alternate --- one is read while the other is written. A pointer swap makes the transition atomic.

**Beyond graphics:** Also used for AI systems where all actors must appear to update simultaneously. Without double buffering, actors that update early in the loop see the new state, while actors that update late see the old state.

### Behavioral Patterns

#### Bytecode

**Problem:** Ship behavior as data for modding, patching, and designer iteration without recompilation.

**How it works:** A stack-based virtual machine executes bytecode compiled from higher-level scripts.

**Key insight:** Denser and faster than the Interpreter pattern (AST walking). The trade-off: debugging is manual and language scope creep is a real risk. Many game studios have built internal scripting languages that grew more complex than intended.

#### Subclass Sandbox

**Problem:** Decouple derived classes from the broader engine.

**How it works:** The base class provides protected primitives (`playSound()`, `spawnParticles()`). Subclasses compose behavior only from these primitives, never reaching into engine systems directly.

**When unnecessary:** When composition (the Component pattern) is preferred over inheritance, which is increasingly the case in modern game development.

#### Type Object

**Problem:** Allow designers to create entity variations without programmer intervention.

**How it works:** Entities hold a reference to a "type object" (often loaded from JSON or data files) that defines attributes. Multiple entities share the same type object.

**Key insight:** This lifts type definition into data. It supports inheritance via prototype-chain-like fallback. Designers can add new monster types, weapon types, and ability types via data files without touching code.

### Decoupling Patterns

#### Component (Entity-Component-System)

**Problem:** Monolithic entity classes that couple rendering, physics, AI, and audio.

**How it works:** Entities are composed of independent components (PhysicsComponent, RenderComponent, AIComponent). Each component handles its domain separately.

**ECS variant:** Entities are just IDs. Components are pure data stored in contiguous arrays by type. Systems are functions that iterate over specific component combinations.

**Why this pattern changes everything:** It enables code parallelization, makes components reusable across entity types, and aligns with data-oriented design. ECS is now the dominant architecture in game engines, including Unity's DOTS system.

#### Event Queue

**Problem:** Decouple event senders from receivers in both space and time.

**How it works:** Events are enqueued rather than handled synchronously. A subsystem processes its queue during its update, potentially on a separate thread.

**Key difference from Observer:** Observer is synchronous (the handler runs immediately). Event Queue is asynchronous (the handler runs when the queue is processed). Senders lose immediate feedback about whether events were handled. This trade-off is the reason both patterns coexist in game engines.

#### Service Locator

**Problem:** Provide global access to services (audio, physics, logging) without hardcoded singletons.

**How it works:** A registry maps service interfaces to concrete implementations. Implementations can be swapped at runtime, decorated, or replaced.

**Key difference from Singleton:** More flexible --- supports decoration (e.g., logged audio wrapping real audio), null services (silent audio for testing), and runtime swapping. Service Locator is often the pattern that replaces Singleton abuse in game engines.

### Optimization Patterns

#### Data Locality

**Problem:** Cache misses from pointer-chasing through scattered heap objects.

**How it works:** Store homogeneous data in contiguous arrays. Iterate sequentially to maximize cache line utilization.

**Key insight:** Can yield 50x performance improvements over pointer-heavy OOP layouts. The trade-off: sacrifices polymorphism and OOP abstraction for raw throughput. This tension between clean object-oriented design and cache-friendly data layout is one of game programming's defining challenges.

#### Dirty Flag

**Problem:** Redundant recalculation of derived data (e.g., world transforms in a scene graph).

**How it works:** When primary data changes, set a flag. Recalculate derived data only when needed and the flag is set.

**When unnecessary:** When primary data changes less frequently than derived data is read, or when the cost of checking the flag exceeds the cost of recalculation.

#### Object Pool

**Problem:** Heap fragmentation and allocation overhead from rapid create/destroy cycles (particles, bullets, audio events).

**How it works:** Pre-allocate a fixed block. "Destroy" marks objects inactive; "create" reuses inactive slots.

**When unnecessary:** When allocation and deallocation are infrequent, or when the language's garbage collector is sufficient --- though GC pauses are their own problem in games where a single frame must complete in 16 milliseconds.

#### Spatial Partition

**Problem:** O(n^2) complexity when finding nearby objects (collision detection, proximity queries).

**How it works:** Organize objects in spatial data structures --- fixed grids, quadtrees, octrees, k-d trees, BSP trees.

**Selection guide:**
- **Fixed grid:** Best for dynamic objects with uniform distribution
- **Quadtree/Octree:** Best for non-uniform distribution
- **k-d tree:** Best for static geometry and high-dimensional queries
- **BSP tree:** Best for rendering order and indoor environments

---

## Cross-Cutting Summary: When Patterns Become Unnecessary

| Pattern | Unnecessary When... |
|---|---|
| Strategy | Language has first-class functions |
| Command | Language has closures |
| Iterator | Language has generators or built-in iteration protocols |
| Observer | Framework provides event emitters or reactive primitives |
| Singleton | Language has modules with initialization guarantees |
| Factory | Classes/types are first-class objects |
| Adapter | Language uses duck typing or structural typing |
| Visitor | Language has pattern matching on ADTs |
| State | Language supports typestate encoding (Rust) or state monads (Haskell) |
| Builder | Language has keyword arguments or functional options |
| Template Method | Language has higher-order functions |
| Null Object | Language has Option/Maybe types |
| Decorator | Language supports function composition or decorator syntax |
| Chain of Responsibility | Language supports railway-oriented programming or Result chaining |

**The meta-insight:** Patterns do not disappear --- they move into the language or runtime. What was explicit architecture in C++ becomes implicit in Python, built-in in Rust, or a language primitive in Haskell. Understanding the pattern helps you recognize it even when it is invisible. And recognizing it when it is invisible is what lets you choose the right abstraction level for the language you are working in.

---

## Sources

- [Peter Norvig --- Design Patterns in Dynamic Languages (1996)](https://norvig.com/design-patterns/)
- [Norvig Presentation Slides](https://slidetodoc.com/design-patterns-in-dynamic-programming-peter-norvig-chief/)
- [GOF Design Patterns in a Dynamic OO Language --- MIT CSAIL](https://people.csail.mit.edu/gregs/ref-dyn-patterns.html)
- [Design Patterns Unnecessary in Dynamic Languages --- Stack Exchange](https://softwareengineering-stackexchange-com.translate.goog/questions/157943/are-there-any-design-patterns-that-are-unnecessary-in-dynamic-languages-like-pyt)
- [Module Pattern in JavaScript --- DigitalOcean](https://www.digitalocean.com/community/conceptual-articles/module-design-pattern-in-javascript)
- [Revealing Module Pattern --- GitHub Gist](https://gist.github.com/zcaceres/bb0eec99c02dda6aac0e041d0d4d7bf2)
- [Node.js Design Patterns --- LogRocket](https://blog.logrocket.com/guide-node-js-design-patterns/)
- [Do React Hooks Replace HOCs --- Eric Elliott](https://medium.com/javascript-scene/do-react-hooks-replace-higher-order-components-hocs-7ae4a08b7b58)
- [HOC Pattern --- patterns.dev](https://www.patterns.dev/react/hoc-pattern/)
- [Go Design Patterns --- Curated List (tmrts/go-patterns)](https://github.com/tmrts/go-patterns)
- [Common Design Patterns in Golang --- DEV Community](https://dev.to/truongpx396/common-design-patterns-in-golang-5789)
- [Go Functional Options Pattern](https://github.com/tmrts/go-patterns/blob/master/idiom/functional-options.md)
- [Go Concurrency Patterns: Pipelines and Cancellation --- Go Blog](https://go.dev/blog/pipelines)
- [Go Concurrency Patterns: Worker Pool, Fan-In/Fan-Out --- DEV](https://dev.to/serifcolakel/go-concurrency-patterns-worker-pool-fan-in-fan-out-pipeline-49pd)
- [Rust Typestate Pattern --- Cliffle](https://cliffle.com/blog/rust-typestate/)
- [Rust Newtype Pattern --- Unofficial Patterns](https://rust-unofficial.github.io/patterns/patterns/behavioural/newtype.html)
- [Implementing OOP Design Patterns in Rust --- The Rust Book](https://doc.rust-lang.org/book/ch18-03-oo-design-patterns.html)
- [RAII Guards and Newtypes in Rust --- Ben Congdon](https://benjamincongdon.me/blog/2025/12/23/RAII-Guards-and-Newtypes-in-Rust/)
- [Rust Design Patterns --- Software Patterns Lexicon](https://softwarepatternslexicon.com/rust/)
- [FP Design Patterns --- Do You Need Them? --- DEV Community](https://dev.to/patferraggi/do-you-need-design-patterns-in-functional-programming-370c)
- [Scott Wlaschin --- Functional Programming Design Patterns](https://fsharpforfunandprofit.com/fppatterns/)
- [Railway Oriented Programming --- F# for Fun and Profit](https://fsharpforfunandprofit.com/posts/recipe-part2/)
- [Algebraic Data Types --- James Sinclair](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/)
- [Game Programming Patterns --- Robert Nystrom](https://gameprogrammingpatterns.com/contents.html)
- [Notes on Game Programming Patterns --- Tyler A. Young](https://tylerayoung.com/2017/01/23/notes-on-game-programming-patterns-by-robert-nystrom/)
- [Fluent Python: Design Patterns with First-Class Functions --- O'Reilly](https://www.oreilly.com/library/view/fluent-python/9781491946237/ch06.html)
- [The Decorator Pattern --- Python Patterns Guide](https://python-patterns.guide/gang-of-four/decorator-pattern/)
