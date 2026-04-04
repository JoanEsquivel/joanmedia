---
title: "Concurrency and Architectural Patterns: Designing Systems at Scale"
description: "A comprehensive guide to concurrency patterns (Thread Pool, Reactor, Proactor) and architectural patterns (MVC, CQRS, Microservices, Event-Driven) for scalable systems."
pubDate: 2026-03-13
category: "software-engineering"
tags:
  - Concurrency
  - System Architecture
  - Microservices
  - System Design
series: "Software Design Patterns"
seriesOrder: 6
heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=750&h=422&fit=crop"
---

Modern software lives and dies by two decisions made early and changed painfully: how it handles concurrency, and how it structures its architecture. A brilliant algorithm running on a single thread will buckle under ten thousand simultaneous users. A beautifully refactored codebase without clear architectural boundaries will collapse into a distributed monolith the moment you add a second service. Concurrency patterns and architectural patterns are the load-bearing walls of every system that operates at scale -- get them wrong and the whole structure creaks; get them right and the system bends without breaking.

This post covers the patterns that govern these two critical dimensions. Part 1 dives into concurrency patterns -- the battle-tested approaches for managing threads, I/O, and shared state that emerged from decades of operating system and network server design. Part 2 explores architectural patterns -- the structural blueprints that determine how your system's components communicate, scale, and evolve over time. Together, they form the foundation on which everything else is built.

---

## Table of Contents

- [Part 1: Concurrency Patterns](#part-1-concurrency-patterns)
  - [1.1 Active Object](#11-active-object)
  - [1.2 Monitor Object](#12-monitor-object)
  - [1.3 Half-Sync/Half-Async](#13-half-synchalf-async)
  - [1.4 Leader/Followers](#14-leaderfollowers)
  - [1.5 Thread Pool](#15-thread-pool)
  - [1.6 Reactor](#16-reactor)
  - [1.7 Proactor](#17-proactor)
  - [1.8 Read-Write Lock](#18-read-write-lock)
  - [1.9 Double-Checked Locking](#19-double-checked-locking)
  - [1.10 Producer-Consumer](#110-producer-consumer)
  - [1.11 Concurrency Pattern Comparisons](#111-concurrency-pattern-comparisons)
- [Part 2: Architectural Patterns](#part-2-architectural-patterns)
  - [2.1 MVC (Model-View-Controller)](#21-mvc-model-view-controller)
  - [2.2 MVP (Model-View-Presenter)](#22-mvp-model-view-presenter)
  - [2.3 MVVM (Model-View-ViewModel)](#23-mvvm-model-view-viewmodel)
  - [2.4 Clean Architecture](#24-clean-architecture)
  - [2.5 Hexagonal Architecture (Ports and Adapters)](#25-hexagonal-architecture-ports-and-adapters)
  - [2.6 Event-Driven Architecture](#26-event-driven-architecture)
  - [2.7 Microservices Patterns](#27-microservices-patterns)
  - [2.8 Pipe and Filter](#28-pipe-and-filter)
  - [2.9 Blackboard](#29-blackboard)
  - [2.10 Broker](#210-broker)
  - [2.11 Architectural Pattern Comparisons](#211-architectural-pattern-comparisons)
- [Sources](#sources)

---

# Part 1: Concurrency Patterns

Concurrency patterns address the architecture and design of components, subsystems, and applications that handle concurrent execution. They originate primarily from POSA2 (Pattern-Oriented Software Architecture, Volume 2) by Schmidt, Stal, Rohnert, and Buschmann -- a text that formalized solutions to problems that kernel developers and network server engineers had been solving ad hoc for years. These patterns are not academic curiosities. They are the underpinnings of Node.js, Nginx, Java's `java.util.concurrent`, and every modern async framework you have ever used.

---

## 1.1 Active Object

### Intent

Decouple method invocation from method execution to enhance concurrency. Clients call methods on a proxy that enqueues requests; a separate scheduler thread executes them asynchronously, returning results via futures.

### When to Use

- Objects must run in their own thread of control, independent of calling threads.
- You need sophisticated scheduling of method execution order (e.g., priority-based).
- Refactoring legacy synchronous code to add concurrency without restructuring callers.
- Systems requiring request queuing, buffering, or prioritization.

### When NOT to Use

- Simple mutual exclusion suffices (use Monitor Object instead).
- The overhead of a dedicated thread, queue, and scheduler is unjustified for lightweight operations.
- When latency of method invocation must be minimal and the indirection through a queue is too costly.

### Code Example (Java)

```java
import java.util.concurrent.*;

public class ActiveObject {
    private final PriorityBlockingQueue<Runnable> queue = new PriorityBlockingQueue<>();
    private final Thread schedulerThread;
    private volatile boolean running = true;

    public ActiveObject() {
        schedulerThread = new Thread(() -> {
            while (running) {
                try {
                    Runnable task = queue.take();
                    task.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        schedulerThread.start();
    }

    public Future<String> enqueue(Callable<String> task) {
        FutureTask<String> future = new FutureTask<>(task);
        queue.put(future);
        return future;
    }

    public void shutdown() {
        running = false;
        schedulerThread.interrupt();
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| True async execution decoupled from callers | Thread + queue overhead per active object |
| Enables priority-based and custom scheduling | Increased complexity vs. simple locking |
| No blocking on the client side (futures) | Debugging async execution is harder |
| Clean separation of invocation and execution | Potential for unbounded queue growth |

---

## 1.2 Monitor Object

### Intent

Synchronize concurrent method execution to ensure that only one method at a time runs within an object, while allowing methods to cooperatively schedule their execution sequences using condition variables.

### When to Use

- Protecting shared mutable state from concurrent modification.
- Multiple threads need serialized access to an object's methods.
- Simpler synchronization needs where a dedicated thread is overkill.
- The object does not need its own thread of control.

### When NOT to Use

- When true asynchronous behavior is required (use Active Object).
- When you need sophisticated execution ordering beyond mutual exclusion.
- High-contention scenarios where the serialized access becomes a bottleneck.

### Code Example (Java)

```java
public class MonitorBuffer<T> {
    private final Queue<T> buffer = new LinkedList<>();
    private final int capacity;
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public MonitorBuffer(int capacity) {
        this.capacity = capacity;
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (buffer.size() == capacity) {
                notFull.await();  // cooperatively wait
            }
            buffer.add(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (buffer.isEmpty()) {
                notEmpty.await();  // cooperatively wait
            }
            T item = buffer.poll();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Simpler than Active Object | Methods execute on the caller's thread (blocking) |
| No separate thread overhead | Limited to sequential execution in critical sections |
| Built-in language support (synchronized, locks) | Potential for deadlocks with nested monitors |
| Condition variables allow cooperative scheduling | Not suitable for long-running operations |

---

## 1.3 Half-Sync/Half-Async

### Intent

Decouple asynchronous and synchronous processing in concurrent systems, allowing them to communicate without complicating their programming model or degrading performance. Uses a queuing layer that mediates between an asynchronous I/O layer and a synchronous processing layer.

### When to Use

- High-performance systems requiring efficient concurrency management (e.g., network servers).
- Applications that must handle asynchronous I/O events while processing them with synchronous business logic.
- Systems needing to utilize multicore architectures effectively.
- When you want to simplify programming for developers by isolating async complexity.

### When NOT to Use

- Simple applications without concurrent processing requirements.
- When the added complexity of dual processing modes and the queue layer is not justified.
- If the boundary crossing overhead between layers is unacceptable for latency-sensitive operations.

### Code Example (Java)

```java
public class HalfSyncHalfAsync {
    private final BlockingQueue<Runnable> taskQueue = new LinkedBlockingQueue<>();
    private final ExecutorService syncLayer = Executors.newFixedThreadPool(4);

    // Async layer: receives events and enqueues work
    public void asyncReceive(Runnable task) {
        taskQueue.offer(task);  // non-blocking enqueue
    }

    // Sync layer: processes tasks from the queue
    public void startSyncProcessing() {
        for (int i = 0; i < 4; i++) {
            syncLayer.submit(() -> {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        Runnable task = taskQueue.take();  // blocking dequeue
                        task.run();  // synchronous processing
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
        }
    }

    public void shutdown() {
        syncLayer.shutdownNow();
    }
}
```

### Real-World Examples

- BSD Unix networking subsystem (interrupt-driven async layer + user-space sync layer).
- Android's AsyncTask framework.
- Java's `java.util.concurrent` thread pools and execution queues.

### Trade-offs

| Pros | Cons |
|------|------|
| Simplifies programming by separating sync and async | Complexity in managing dual processing modes |
| Improves system responsiveness | Potential bottleneck at the queuing layer |
| Each layer can be optimized independently | Boundary crossing overhead between layers |
| Natural fit for I/O-bound + CPU-bound workloads | Careful design needed to prevent queue saturation |

---

## 1.4 Leader/Followers

### Intent

Provide an efficient concurrency model where multiple threads take turns sharing a set of event sources. One thread (the leader) waits for events; upon detecting one, it promotes another thread to leader and then processes the event as a follower.

### When to Use

- High-performance event-driven servers where minimizing latency is critical.
- When no synchronization or ordering constraints exist between requests.
- Situations where the overhead of dynamic thread creation or inter-thread communication is unacceptable.
- Recommended over Half-Sync/Half-Async when request ordering is not required.

### When NOT to Use

- When requests need to be processed in order.
- When complex scheduling or prioritization of tasks is required.
- If the programming model complexity is not justified by the performance gains.

### Code Example (Pseudocode)

```
ThreadPool:
  leaderThread = null
  followers = ConcurrentQueue<Thread>

  promoteNewLeader():
    leaderThread = followers.dequeue()
    leaderThread.notify()

  run(thread):
    while true:
      if thread == leaderThread:
        event = waitForEvent()        // block on I/O demux
        promoteNewLeader()            // hand off leadership
        processEvent(event)           // process as follower
        followers.enqueue(thread)     // rejoin pool
      else:
        followers.enqueue(thread)
        thread.wait()                 // sleep until promoted
```

### Trade-offs

| Pros | Cons |
|------|------|
| No inter-thread message passing or queue overhead | Complex implementation |
| Minimizes context switches | Inflexible scheduling |
| Efficient for short, uniform request handling | Not suitable for requests needing ordering |
| Better cache locality than thread-per-request | Harder to debug and reason about |

---

## 1.5 Thread Pool

### Intent

Manage a collection of reusable threads that execute submitted tasks, avoiding the overhead of creating and destroying threads for each task. The pool accepts work items and assigns them to available threads.

### When to Use

- Handling a high volume of short-lived tasks (e.g., HTTP request handling).
- Limiting the number of concurrent threads to prevent resource exhaustion.
- Amortizing thread creation cost across many tasks.
- Server applications that process many independent client requests.

### When NOT to Use

- When tasks are long-running or blocking, potentially starving other tasks.
- When precise control over individual thread lifecycle is needed.
- If the application creates very few threads and the pooling overhead is not justified.

### Code Example (Java)

```java
import java.util.concurrent.*;

public class ThreadPoolExample {
    public static void main(String[] args) {
        // Fixed pool of 4 worker threads
        ExecutorService pool = Executors.newFixedThreadPool(4);

        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            pool.submit(() -> {
                System.out.println("Task " + taskId
                    + " on thread " + Thread.currentThread().getName());
                try { Thread.sleep(100); } catch (InterruptedException e) {}
            });
        }

        pool.shutdown();
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Reduced thread creation/destruction overhead | Thread starvation if tasks block |
| Bounded resource consumption | Queue management complexity |
| Improved response time for short tasks | Choosing optimal pool size is non-trivial |
| Built-in to most languages/frameworks | Dead tasks can leak threads if not handled |

---

## 1.6 Reactor

### Intent

Handle concurrent service requests efficiently using a single or limited number of threads. An event loop (the reactor) demultiplexes incoming I/O readiness events and dispatches them to registered event handlers synchronously.

### When to Use

- Server-side applications requiring low-latency and high-throughput with many simultaneous connections.
- Non-blocking I/O architectures (e.g., chat servers, web servers, proxies).
- When most work is I/O-bound and can be interleaved efficiently on a single thread.
- Default pattern for UNIX/Linux systems lacking robust async OS APIs.

### When NOT to Use

- CPU-intensive workloads that would block the event loop.
- When the application logic requires long-running per-request processing.
- If the complexity of non-blocking state machines is not justified.

### Code Example (Java NIO)

```java
Selector selector = Selector.open();
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false);
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();  // block until events are ready
    Set<SelectionKey> keys = selector.selectedKeys();
    for (SelectionKey key : keys) {
        if (key.isAcceptable()) {
            SocketChannel client = serverChannel.accept();
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            client.read(buffer);
            // process data...
        }
    }
    keys.clear();
}
```

### Real-World Examples

- **Node.js**: Single-threaded event loop using libuv.
- **Netty**: Asynchronous event-driven network framework for Java.
- **Nginx**: Event-driven architecture for high-concurrency web serving.
- **Redis**: Single-threaded event loop for in-memory operations.

### Trade-offs

| Pros | Cons |
|------|------|
| Handles many connections with minimal threads | Long handlers block the entire loop |
| Low memory footprint per connection | Complex state management (state machines) |
| Excellent for I/O-bound workloads | Difficult to debug asynchronous code |
| Widely supported on all platforms | Cannot exploit multiple CPU cores (single-threaded) |

---

## 1.7 Proactor

### Intent

Handle concurrent service requests by initiating asynchronous I/O operations and dispatching completion handlers when the OS signals that operations have finished. Unlike Reactor (readiness-based), Proactor is completion-based -- the OS performs the actual I/O.

### When to Use

- High-concurrency servers on platforms with robust async OS APIs (e.g., Windows IOCP).
- When superior scalability beyond Reactor is needed for massive connection counts.
- Applications that benefit from the OS handling I/O directly into user-provided buffers.

### When NOT to Use

- On platforms without native async I/O support (most UNIX systems lack robust APIs).
- When the complexity of buffer management and async completion tracking is unjustified.
- Simpler applications where Reactor is sufficient.

### Code Example (Conceptual C++ with Boost.Asio)

```cpp
#include <boost/asio.hpp>
using boost::asio::ip::tcp;

class Session : public std::enable_shared_from_this<Session> {
    tcp::socket socket_;
    char data_[1024];

public:
    Session(tcp::socket socket) : socket_(std::move(socket)) {}

    void start() { doRead(); }

private:
    void doRead() {
        auto self = shared_from_this();
        // Initiate async read -- OS performs the I/O
        socket_.async_read_some(
            boost::asio::buffer(data_, 1024),
            [this, self](boost::system::error_code ec, std::size_t length) {
                if (!ec) {
                    doWrite(length);  // Completion handler
                }
            });
    }

    void doWrite(std::size_t length) {
        auto self = shared_from_this();
        boost::asio::async_write(
            socket_, boost::asio::buffer(data_, length),
            [this, self](boost::system::error_code ec, std::size_t) {
                if (!ec) {
                    doRead();
                }
            });
    }
};
```

### Reactor vs. Proactor Comparison

| Aspect | Reactor | Proactor |
|--------|---------|----------|
| **Event type** | Readiness ("socket is ready to read") | Completion ("read operation finished") |
| **Who performs I/O** | Event handler (application) | Operating system |
| **I/O model** | Synchronous non-blocking | Asynchronous |
| **Buffer management** | Handler manages its own buffers on demand | Buffers provided upfront; OS writes into them |
| **Platform support** | All UNIX/Linux/Windows | Best on Windows (IOCP); limited on UNIX |
| **Scalability** | Good; degrades at very high connection counts | Excellent; up to 10-35% better than Reactor |
| **Complexity** | Moderate (state machines) | High (buffer lifecycle, completion tracking) |
| **Portability** | Highly portable | Platform-dependent |

---

## 1.8 Read-Write Lock

### Intent

Allow concurrent read access to a shared resource while ensuring exclusive access for writes. Multiple readers can hold the lock simultaneously, but a writer requires exclusive ownership.

### When to Use

- Read-heavy workloads where data is read far more often than written.
- When allowing concurrent reads significantly improves throughput.
- Shared caches, configuration stores, or in-memory data structures.

### When NOT to Use

- Write-heavy workloads where the read/write ratio does not justify the overhead.
- When the critical section is very short (a simple mutex may be faster due to lower overhead).
- If writer starvation is a concern (readers can continuously preempt writers).

### Code Example (Java)

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.HashMap;
import java.util.Map;

public class ThreadSafeCache<K, V> {
    private final Map<K, V> cache = new HashMap<>();
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

    public V get(K key) {
        rwLock.readLock().lock();
        try {
            return cache.get(key);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void put(K key, V value) {
        rwLock.writeLock().lock();
        try {
            cache.put(key, value);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public int size() {
        rwLock.readLock().lock();
        try {
            return cache.size();
        } finally {
            rwLock.readLock().unlock();
        }
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Concurrent reads boost throughput | Higher overhead than a simple mutex |
| Fair policies can prevent starvation | Writer starvation in default mode |
| Built-in to most languages | More complex than a basic lock |
| Ideal for read-heavy workloads | No benefit for write-heavy workloads |

---

## 1.9 Double-Checked Locking

### Intent

Reduce locking overhead when implementing lazy initialization in multi-threaded environments. Avoid acquiring a lock on every access by first checking the condition without a lock, then re-checking inside the lock.

### When to Use

- Lazy initialization of expensive objects (commonly Singletons).
- When the initialization happens once but the object is accessed frequently.
- Performance-critical paths where lock contention is a concern.

### When NOT to Use

- In languages or runtimes where the pattern is inherently broken without `volatile` or memory barriers.
- When simpler alternatives exist (e.g., static initializer, `Lazy<T>`, `enum` singleton).
- If the object initialization is cheap -- the locking overhead may not matter.

### Critical Warning

Double-checked locking is notoriously easy to implement incorrectly. Without proper memory ordering guarantees (`volatile` in Java, memory barriers in C++), a thread can observe a partially constructed object. Many experts consider the naive form an anti-pattern.

### Code Example (Java -- Correct Form)

```java
public class Singleton {
    // volatile is REQUIRED to prevent instruction reordering
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {                // 1st check (no lock)
            synchronized (Singleton.class) {
                if (instance == null) {        // 2nd check (with lock)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### Safer Alternatives

```java
// Java: Initialization-on-demand holder idiom (preferred)
public class Singleton {
    private Singleton() {}
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Lock acquired only once during initialization | Extremely easy to implement incorrectly |
| Fast subsequent reads (no lock) | Requires `volatile` / memory barriers |
| Useful when simpler idioms are not available | Simpler alternatives usually exist |
| Well-known optimization technique | Considered an anti-pattern by some |

---

## 1.10 Producer-Consumer

### Intent

Decouple the production of work items from their consumption by placing a shared buffer (queue) between producers and consumers. Producers generate data independently; consumers process data independently; the queue synchronizes them.

### When to Use

- Decoupling UI threads from background worker threads.
- Load balancing work across a set of consumer threads.
- Buffering between components that operate at different speeds.
- Pipeline processing where stages produce and consume data at different rates.

### When NOT to Use

- When producers and consumers must operate in strict lockstep (direct call is simpler).
- If the queue introduces unacceptable latency.
- Single-threaded applications where the pattern adds unnecessary complexity.

### Code Example (Java)

```java
import java.util.concurrent.*;

public class ProducerConsumerExample {
    private static final BlockingQueue<Integer> queue =
        new LinkedBlockingQueue<>(10);  // bounded buffer

    public static void main(String[] args) {
        // Producer
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 100; i++) {
                    queue.put(i);  // blocks if full
                    System.out.println("Produced: " + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Consumer
        Thread consumer = new Thread(() -> {
            try {
                while (true) {
                    int item = queue.take();  // blocks if empty
                    System.out.println("Consumed: " + item);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Decouples producers and consumers | Queue management complexity |
| Handles speed mismatches naturally | Bounded buffers can cause blocking |
| Easy to add more producers or consumers | Unbounded buffers risk memory exhaustion |
| Well-supported by standard libraries | Ordering guarantees depend on queue type |

---

## 1.11 Concurrency Pattern Comparisons

### Execution Model Comparison

| Pattern | Has Own Thread? | I/O Model | Primary Use |
|---------|----------------|-----------|-------------|
| Active Object | Yes | Async | Decoupled method invocation |
| Monitor Object | No (caller's thread) | Sync | Mutual exclusion |
| Half-Sync/Half-Async | Layered | Both | Bridging async I/O to sync processing |
| Leader/Followers | Shared pool | Sync | High-perf event handling |
| Thread Pool | Reusable pool | Sync | Task execution |
| Reactor | Single/few threads | Sync non-blocking | I/O event demuxing |
| Proactor | OS-driven | Async | I/O completion handling |

### Synchronization Comparison

| Pattern | Mechanism | Best For |
|---------|-----------|----------|
| Read-Write Lock | Shared/exclusive locks | Read-heavy workloads |
| Double-Checked Locking | Volatile + lock | Lazy singleton init |
| Monitor Object | Intrinsic locks + conditions | General mutual exclusion |
| Producer-Consumer | Blocking queue | Speed-mismatched components |

### Choosing Guide

- **Need async method calls?** --> Active Object
- **Need simple thread-safe access?** --> Monitor Object
- **Async I/O + sync processing?** --> Half-Sync/Half-Async
- **Maximum event-handling performance?** --> Leader/Followers
- **Many short tasks?** --> Thread Pool
- **Many I/O connections, single thread?** --> Reactor
- **Many I/O connections, OS async support?** --> Proactor
- **Read-heavy shared data?** --> Read-Write Lock
- **Lazy singleton?** --> Double-Checked Locking (or better: holder idiom)
- **Decoupled speed components?** --> Producer-Consumer

---

# Part 2: Architectural Patterns

Architectural patterns define the fundamental structural organization of software systems, providing templates for system-wide design decisions. If concurrency patterns are about how threads and I/O cooperate within a process, architectural patterns are about how the whole system is partitioned -- what talks to what, through which channels, with what dependencies. The right architectural choice shapes everything downstream: team structure, deployment strategy, testing approach, and how painful the next feature is to ship.

---

## 2.1 MVC (Model-View-Controller)

### Intent

Separate an application into three interconnected components: the Model (data and business logic), the View (presentation), and the Controller (input handling and coordination). This separates internal representations from how information is presented and accepted.

### When to Use

- Web applications and traditional GUI applications.
- When multiple views of the same data are needed.
- When UI changes should not affect business logic.
- Teams that want to parallelize front-end and back-end development.

### When NOT to Use

- Very simple applications where the overhead of three layers is not justified.
- Real-time data-driven UIs where two-way data binding (MVVM) is more natural.
- When the tight coupling between View and Controller becomes a maintenance burden.

### Code Example (TypeScript/Express-style)

```typescript
// Model
class UserModel {
    private users: Map<string, User> = new Map();

    getUser(id: string): User | undefined {
        return this.users.get(id);
    }

    createUser(user: User): void {
        this.users.set(user.id, user);
    }
}

// View
class UserView {
    renderUser(user: User): string {
        return `<div><h1>${user.name}</h1><p>${user.email}</p></div>`;
    }

    renderError(message: string): string {
        return `<div class="error">${message}</div>`;
    }
}

// Controller
class UserController {
    constructor(
        private model: UserModel,
        private view: UserView
    ) {}

    handleGetUser(id: string): string {
        const user = this.model.getUser(id);
        return user
            ? this.view.renderUser(user)
            : this.view.renderError("User not found");
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Clear separation of concerns | Can lead to bloated controllers |
| Multiple views for one model | Tight coupling between View and Controller |
| Parallel development of components | Overhead for simple applications |
| Well-understood, massive ecosystem | Model updates can be hard to track |

---

## 2.2 MVP (Model-View-Presenter)

### Intent

Evolve MVC by making the View passive. The Presenter sits between the Model and View, fetching data from the Model, applying UI logic, and explicitly commanding the View what to display. The View has no knowledge of the Model.

### When to Use

- Applications requiring high testability of presentation logic.
- When the View should be completely passive (no logic).
- Android development and Windows Forms where data binding is limited.
- When you want the presenter to be unit-testable without a UI framework.

### When NOT to Use

- When data binding is naturally supported (use MVVM instead).
- If the one-to-one Presenter-to-View mapping creates excessive boilerplate.
- Simple CRUD screens that do not benefit from the extra layer.

### Code Example (TypeScript)

```typescript
// View interface (passive)
interface IUserView {
    setUserName(name: string): void;
    setUserEmail(email: string): void;
    showError(message: string): void;
}

// Presenter
class UserPresenter {
    constructor(
        private view: IUserView,
        private model: UserModel
    ) {}

    loadUser(id: string): void {
        const user = this.model.getUser(id);
        if (user) {
            this.view.setUserName(user.name);
            this.view.setUserEmail(user.email);
        } else {
            this.view.showError("User not found");
        }
    }
}

// Concrete View
class UserViewImpl implements IUserView {
    setUserName(name: string): void { /* update DOM */ }
    setUserEmail(email: string): void { /* update DOM */ }
    showError(message: string): void { /* show alert */ }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Presenter is highly testable (mock the view) | One presenter per view = boilerplate |
| View is completely passive | Presenter can become bloated |
| Clear separation of UI logic | More indirection than MVC |
| No framework dependency in Presenter | Manual state synchronization needed |

---

## 2.3 MVVM (Model-View-ViewModel)

### Intent

Separate the View from the Model using a ViewModel that exposes data and commands through data binding. The View declaratively binds to ViewModel properties; changes in the ViewModel automatically update the View and vice versa.

### When to Use

- UI frameworks with strong data binding support (WPF, SwiftUI, Angular, Vue, Jetpack Compose).
- When UI state management is complex and should be decoupled from the View.
- When you need reactive UIs that automatically reflect data changes.

### When NOT to Use

- Frameworks without data binding support (the pattern loses its primary advantage).
- Simple views where data binding is overkill.
- When the ViewModel becomes a dumping ground for unrelated logic.

### Code Example (TypeScript/Angular-style)

```typescript
// ViewModel (Angular Component)
class UserViewModel {
    userName: string = "";
    userEmail: string = "";
    errorMessage: string = "";
    private subscription: Subscription;

    constructor(private userService: UserService) {}

    loadUser(id: string): void {
        this.subscription = this.userService.getUser(id).subscribe({
            next: (user) => {
                this.userName = user.name;    // binding updates view
                this.userEmail = user.email;  // binding updates view
            },
            error: () => {
                this.errorMessage = "User not found";
            }
        });
    }
}
```

```html
<!-- View (declarative binding) -->
<div>
    <h1>{{ userName }}</h1>
    <p>{{ userEmail }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
</div>
```

### Trade-offs

| Pros | Cons |
|------|------|
| Automatic UI updates via data binding | Memory leaks from unmanaged bindings |
| ViewModel testable without UI framework | Debugging data binding issues is hard |
| Declarative, readable view templates | Overkill for simple views |
| Clean separation of UI state from View | ViewModel can become a god object |

---

## 2.4 Clean Architecture

### Intent

Organize code into concentric layers where dependencies point inward. The innermost layer contains enterprise business rules (entities), surrounded by application business rules (use cases), then interface adapters, then frameworks and drivers. No inner layer knows about any outer layer.

### When to Use

- Complex domains with evolving business rules.
- When framework independence is important (the framework is a detail, not the center).
- Long-lived applications where technology stacks will change over time.
- When testability of business rules without infrastructure is a priority.

### When NOT to Use

- Simple CRUD applications where the layers create unnecessary indirection.
- Prototypes or MVPs where speed of delivery outweighs architectural purity.
- Small teams unfamiliar with the pattern (learning curve is steep).

### Structure

```
Frameworks & Drivers  (outermost: web, DB, UI)
    |
    v
Interface Adapters    (controllers, gateways, presenters)
    |
    v
Application Business Rules  (use cases, interactors)
    |
    v
Enterprise Business Rules   (entities, domain objects)  <-- innermost
```

**The Dependency Rule:** Source code dependencies must point inward only. Nothing in an inner circle can know about anything in an outer circle.

### Code Example (TypeScript)

```typescript
// Entity (innermost layer)
class Order {
    constructor(
        public readonly id: string,
        public readonly items: OrderItem[],
        public readonly customerId: string
    ) {}

    get total(): number {
        return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    canBeFulfilled(): boolean {
        return this.items.every(item => item.qty > 0);
    }
}

// Use Case (application layer) -- depends only on entities + interfaces
interface OrderRepository {
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
}

class PlaceOrderUseCase {
    constructor(private orderRepo: OrderRepository) {}

    async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
        const order = new Order(input.id, input.items, input.customerId);
        if (!order.canBeFulfilled()) {
            throw new Error("Order cannot be fulfilled");
        }
        await this.orderRepo.save(order);
        return { orderId: order.id, total: order.total };
    }
}

// Adapter (outer layer) -- implements the interface
class PostgresOrderRepository implements OrderRepository {
    async save(order: Order): Promise<void> { /* SQL INSERT */ }
    async findById(id: string): Promise<Order | null> { /* SQL SELECT */ }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Framework-independent business rules | Significant boilerplate (interfaces, DTOs) |
| Highly testable at every layer | Over-engineered for simple apps |
| Technology can be swapped at any layer | Steep learning curve |
| Clear dependency direction | Many files and folders |

---

## 2.5 Hexagonal Architecture (Ports and Adapters)

### Intent

Create loosely coupled applications where the core business logic (the "hexagon") is isolated from external concerns through technology-agnostic interfaces (ports) and concrete implementations (adapters). The core communicates with the outside world solely through ports.

### When to Use

- Applications that must be testable without external dependencies (databases, APIs, UIs).
- Systems where the technology stack may change over time (database migration, API changes).
- E-commerce, banking, and regulatory domains where business logic must be protected.
- When multiple input channels (REST, CLI, GraphQL) access the same domain logic.

### When NOT to Use

- Simple CRUD applications where the port/adapter indirection is overhead.
- When only one adapter will ever exist for a port (unnecessary abstraction).
- Prototypes prioritizing delivery speed over long-term maintainability.
- Performance-critical hot paths where the additional layer adds unacceptable latency.

### Structure

```
          +----[ REST Adapter ]----+
          |                        |
  [ CLI Adapter ]---> PORT ---> DOMAIN <--- PORT <---[ DB Adapter ]
          |                        |
          +---[ Event Adapter ]----+

  Driving Adapters (left)    Ports (interfaces)    Driven Adapters (right)
  (who calls the app)                              (what the app calls)
```

### Code Example (TypeScript)

```typescript
// PORT (driving) -- how the outside world calls the domain
interface PlaceOrderPort {
    placeOrder(command: PlaceOrderCommand): Promise<OrderId>;
}

// PORT (driven) -- how the domain calls the outside world
interface OrderPersistencePort {
    save(order: Order): Promise<void>;
}

interface NotificationPort {
    notifyOrderPlaced(order: Order): Promise<void>;
}

// DOMAIN -- knows only ports, not adapters
class OrderService implements PlaceOrderPort {
    constructor(
        private persistence: OrderPersistencePort,
        private notifications: NotificationPort
    ) {}

    async placeOrder(cmd: PlaceOrderCommand): Promise<OrderId> {
        const order = Order.create(cmd);
        await this.persistence.save(order);
        await this.notifications.notifyOrderPlaced(order);
        return order.id;
    }
}

// ADAPTER (driven) -- implements a port with a specific technology
class PostgresOrderAdapter implements OrderPersistencePort {
    async save(order: Order): Promise<void> {
        // SQL-specific persistence logic
    }
}

// ADAPTER (driving) -- REST controller calling the port
class OrderRestController {
    constructor(private placeOrder: PlaceOrderPort) {}

    async handlePost(req: Request): Promise<Response> {
        const orderId = await this.placeOrder.placeOrder(req.body);
        return { status: 201, body: { orderId } };
    }
}
```

### Trade-offs

| Pros | Cons |
|------|------|
| Domain testable in complete isolation | More boilerplate (ports, adapters, mappings) |
| Technology can be swapped by changing adapters | Learning curve for new team members |
| Multiple input/output channels supported cleanly | Performance cost of additional indirection |
| Prevents technology lock-in | Unjustified if only one adapter per port |

---

## 2.6 Event-Driven Architecture

### Intent

Build systems where the flow of the program is determined by events -- significant changes in state that are published, detected, and consumed by loosely coupled components. Producers emit events without knowledge of consumers.

### When to Use

- Complex event processing (pattern matching, aggregation over time windows).
- High-volume, high-velocity data (IoT, streaming analytics).
- Systems expecting massive growth or variable load patterns.
- Complex business workflows (order fulfillment, content publishing pipelines).
- Systems integrating with many external services or triggering multiple downstream actions.
- Industries requiring detailed audit trails.

### When NOT to Use

- Simple request-response workflows where synchronous calls meet latency and throughput requirements.
- Business transactions requiring strong consistency across services where eventual consistency windows are unacceptable.
- When the operational overhead of event brokers, async error handling, and eventual consistency is not justified.
- Small teams that cannot handle the debugging complexity of distributed async systems.

### Code Example (TypeScript)

```typescript
// Event Bus
class EventBus {
    private handlers = new Map<string, Function[]>();

    subscribe(eventType: string, handler: Function): void {
        const list = this.handlers.get(eventType) || [];
        list.push(handler);
        this.handlers.set(eventType, list);
    }

    publish(event: { type: string; payload: any }): void {
        const handlers = this.handlers.get(event.type) || [];
        handlers.forEach(handler => handler(event.payload));
    }
}

// Producers and consumers are decoupled
const bus = new EventBus();

// Consumer 1: Send confirmation email
bus.subscribe("OrderPlaced", (order: Order) => {
    emailService.sendConfirmation(order.customerEmail, order.id);
});

// Consumer 2: Update inventory
bus.subscribe("OrderPlaced", (order: Order) => {
    inventoryService.reserve(order.items);
});

// Producer: knows nothing about consumers
bus.publish({ type: "OrderPlaced", payload: newOrder });
```

### Trade-offs

| Pros | Cons |
|------|------|
| Loose coupling between components | Eventual consistency challenges |
| Independent scalability of producers/consumers | Debugging distributed event flows is hard |
| Natural audit trail of all events | Ordering and idempotency complexity |
| Resilient to individual component failures | Requires robust messaging infrastructure |

---

## 2.7 Microservices Patterns

Microservices architectures introduce a constellation of supporting patterns to handle the complexity of distributed systems. The following are among the most critical.

### 2.7.1 Circuit Breaker

**Intent:** Prevent cascading failures by stopping calls to a failing downstream service. The circuit has three states: Closed (normal), Open (fail-fast), and Half-Open (probe to test recovery).

See [Part 3: Reactive Patterns in Post 7](#) for the full implementation, code example, and trade-off analysis.

### 2.7.2 Saga

**Intent:** Manage distributed transactions across multiple microservices as a sequence of local transactions, each with a compensating transaction for rollback. Replaces two-phase commit (2PC) in microservice architectures.

**Two Approaches:**

| Approach | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **Choreography** | Services publish domain events; other services react | Simple; no central coordinator | Hard to track; implicit flow |
| **Orchestration** | Central orchestrator directs each service | Explicit flow; easier to understand | Single point of failure; coupling |

**Code Example (Orchestration - TypeScript):**

```typescript
class CreateOrderSaga {
    async execute(orderData: OrderData): Promise<OrderResult> {
        const order = await orderService.createOrder(orderData);  // Step 1

        try {
            await paymentService.reserveCredit(order.customerId, order.total);  // Step 2
        } catch (e) {
            await orderService.rejectOrder(order.id);  // Compensating txn
            throw new SagaRollbackError("Credit reservation failed");
        }

        try {
            await inventoryService.reserveStock(order.items);  // Step 3
        } catch (e) {
            await paymentService.releaseCredit(order.customerId, order.total);  // Compensate 2
            await orderService.rejectOrder(order.id);  // Compensate 1
            throw new SagaRollbackError("Stock reservation failed");
        }

        await orderService.approveOrder(order.id);
        return { orderId: order.id, status: "APPROVED" };
    }
}
```

**Trade-offs:** Maintains consistency without 2PC, but requires manual compensating transactions, lacks ACID isolation, and adds significant complexity in tracking saga state.

### 2.7.3 CQRS (Command Query Responsibility Segregation)

**Intent:** Separate read and write operations into different models, potentially with different data stores optimized for each purpose.

**When to Use:**
- Read and write workloads have vastly different scaling requirements.
- Complex domains where the write model differs significantly from read projections.
- Event-sourced systems where querying the event store directly is impractical.

**When NOT to Use:**
- Simple CRUD where read and write models are nearly identical.
- When eventual consistency between read and write models is unacceptable.

```
[Client] --commands--> [Write Model] --events--> [Read Model] <--queries-- [Client]
                          |                          |
                     [Write DB]                [Read DB (denormalized)]
```

**Trade-offs:** Enables optimized read/write scaling and denormalized read views, but introduces code duplication, replication lag (eventual consistency), and significant architectural complexity.

### 2.7.4 Event Sourcing

**Intent:** Persist the state of a business entity as a sequence of state-changing events rather than storing current state. Reconstruct state by replaying events.

**When to Use:**
- Complete audit trail of all changes is required.
- Need to reconstruct past states or implement temporal queries.
- Event-driven architectures where reliable event publishing is essential.
- Domains with complex state transitions.

**When NOT to Use:**
- Simple CRUD where event replay overhead is unjustified.
- When the learning curve and "different style of programming" is too costly.
- If querying current state must be fast (requires CQRS as a companion).

**Code Example (Java):**

```java
// Events
record OrderCreated(String customerId, BigDecimal total) {}
record OrderApproved(String orderId) {}
record OrderRejected(String orderId, String reason) {}

// Aggregate rebuilds state from events
class OrderAggregate {
    private String status;
    private BigDecimal total;

    public static OrderAggregate replay(List<Event> events) {
        OrderAggregate order = new OrderAggregate();
        events.forEach(order::apply);
        return order;
    }

    private void apply(Event event) {
        switch (event) {
            case OrderCreated e -> { this.status = "PENDING"; this.total = e.total(); }
            case OrderApproved e -> { this.status = "APPROVED"; }
            case OrderRejected e -> { this.status = "REJECTED"; }
        }
    }
}
```

**Trade-offs:** 100% reliable audit log and enables temporal queries, but requires a fundamentally different programming approach, event store is hard to query directly, and typically requires CQRS for efficient reads.

### 2.7.5 API Gateway

**Intent:** Provide a single entry point for all clients, routing requests to appropriate backend microservices while handling cross-cutting concerns (authentication, rate limiting, response transformation).

**When to Use:** Multiple client types (web, mobile, IoT); centralized security needed; API versioning required.

**When NOT to Use:** Very simple systems with 1-2 services; when the added network hop is unacceptable.

**Trade-offs:** Simplifies client logic and centralizes security, but can become a bottleneck and single point of failure; risk of becoming a monolithic gateway.

### 2.7.6 Service Mesh

**Intent:** Provide a dedicated infrastructure layer for managing service-to-service communication, handling load balancing, service discovery, security (mTLS), observability, and resilience (retries, circuit breaking) at the network level.

**When to Use:** Large microservice deployments; polyglot environments; when resilience logic should not be in application code.

**When NOT to Use:** Small deployments; when operational complexity of the mesh (Istio, Linkerd) outweighs benefits.

**Trade-offs:** Offloads cross-cutting concerns from application code to infrastructure, but adds operational complexity, resource overhead (sidecar proxies), and debugging difficulty.

### 2.7.7 Sidecar

**Intent:** Deploy a helper process alongside the main service to handle cross-cutting concerns (logging, monitoring, proxying, security) without modifying the main service code.

**When to Use:** Adding observability across services; service mesh implementations; protocol translation; polyglot environments where a shared library is impractical.

**When NOT to Use:** Resource-constrained environments; simple applications; when tight coupling with main service logic is needed.

**Trade-offs:** Clean separation of concerns and language-agnostic, but adds resource overhead per service instance and operational complexity.

---

## 2.8 Pipe and Filter

### Intent

Decompose a complex processing task into a sequence of independent processing steps (filters) connected by channels (pipes). Each filter receives input, transforms it, and passes the result to the next filter.

### When to Use

- Processing can be broken into independent, reorderable steps.
- Steps have different scalability requirements.
- You need flexibility to add, remove, or reorder processing steps.
- Steps should be testable in isolation.
- Data transformation pipelines (ETL, image processing, log analysis).

### When NOT to Use

- Request-response patterns requiring immediate results.
- Processing steps are interdependent and must execute as a single transaction.
- The context/state required by each step makes the pattern inefficient.
- Latency-sensitive applications where inter-filter communication overhead matters.

### Code Example (TypeScript)

```typescript
// Filter interface
interface Filter<T> {
    process(input: T): T;
}

// Concrete filters
class ValidationFilter implements Filter<Order> {
    process(order: Order): Order {
        if (!order.items.length) throw new Error("Empty order");
        return order;
    }
}

class DiscountFilter implements Filter<Order> {
    process(order: Order): Order {
        if (order.total > 100) {
            return { ...order, discount: order.total * 0.1 };
        }
        return order;
    }
}

class TaxFilter implements Filter<Order> {
    process(order: Order): Order {
        return { ...order, tax: order.total * 0.08 };
    }
}

// Pipeline (pipe)
class Pipeline<T> {
    private filters: Filter<T>[] = [];

    addFilter(filter: Filter<T>): Pipeline<T> {
        this.filters.push(filter);
        return this;
    }

    execute(input: T): T {
        return this.filters.reduce(
            (data, filter) => filter.process(data),
            input
        );
    }
}

// Usage
const pipeline = new Pipeline<Order>()
    .addFilter(new ValidationFilter())
    .addFilter(new DiscountFilter())
    .addFilter(new TaxFilter());

const processedOrder = pipeline.execute(rawOrder);
```

### Trade-offs

| Pros | Cons |
|------|------|
| Filters developed and tested independently | Communication overhead between filters |
| Easy to add, remove, or reorder steps | End-to-end testing still required |
| Filters can scale independently | Context/state passing between filters is complex |
| Promotes reusability of processing steps | Not suited for request-response patterns |

---

## 2.9 Blackboard

### Intent

Provide a computational framework where multiple specialized knowledge sources collaborate to solve a complex, non-deterministic problem by reading from and writing to a shared data structure (the blackboard). A control component decides which knowledge source to activate next.

### When to Use

- Complex problems where no single algorithm can provide a complete solution (AI, computer vision, speech recognition, natural language processing).
- Problems requiring contributions from diverse, specialized modules.
- Domains involving uncertainty, incomplete information, or iterative refinement.
- Medical diagnostics, optimization problems (logistics, scheduling).

### When NOT to Use

- Well-structured problems with deterministic algorithms.
- Simple pipeline processing (use Pipe and Filter instead).
- When the overhead of the control component and blackboard synchronization is unjustified.
- Real-time systems with strict latency requirements.

### Components

```
+-------------------+     +-------------------+
| Knowledge Source A |     | Knowledge Source B |
+---------+---------+     +---------+---------+
          |                         |
          v                         v
     +----+-------------------------+----+
     |          BLACKBOARD               |
     |  (shared global data structure)   |
     +----------------+------------------+
                      |
                      v
            +---------+---------+
            | Control Component |
            | (scheduler/rules) |
            +-------------------+
```

### Code Example (Python)

```python
class Blackboard:
    def __init__(self):
        self.data = {}
        self.solution_complete = False

    def update(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data.get(key)

class KnowledgeSource:
    def can_contribute(self, blackboard: Blackboard) -> bool:
        raise NotImplementedError

    def contribute(self, blackboard: Blackboard) -> None:
        raise NotImplementedError

class SyntaxAnalyzer(KnowledgeSource):
    def can_contribute(self, bb):
        return "raw_text" in bb.data and "tokens" not in bb.data

    def contribute(self, bb):
        bb.update("tokens", bb.get("raw_text").split())

class SemanticAnalyzer(KnowledgeSource):
    def can_contribute(self, bb):
        return "tokens" in bb.data and "meaning" not in bb.data

    def contribute(self, bb):
        tokens = bb.get("tokens")
        bb.update("meaning", self._analyze(tokens))
        bb.solution_complete = True

# Control component
class Controller:
    def __init__(self, blackboard, sources):
        self.blackboard = blackboard
        self.sources = sources

    def run(self):
        while not self.blackboard.solution_complete:
            for source in self.sources:
                if source.can_contribute(self.blackboard):
                    source.contribute(self.blackboard)
                    break
```

### Trade-offs

| Pros | Cons |
|------|------|
| Handles ill-defined, non-deterministic problems | Complex control logic |
| Knowledge sources are modular and independent | Performance overhead of blackboard access |
| Easy to add new knowledge sources | Difficult to predict execution order |
| Supports iterative refinement | Testing and debugging is challenging |

---

## 2.10 Broker

### Intent

Structure distributed systems with decoupled components that interact via remote service invocations. A broker component mediates all communication, handling registration, location, and invocation of services.

### When to Use

- Distributed systems where components need to communicate without direct knowledge of each other.
- Service-oriented architectures requiring dynamic discovery and routing.
- Systems where components are added or removed dynamically.
- When centralizing communication management simplifies the overall architecture.

### When NOT to Use

- Single-process applications where direct function calls suffice.
- Performance-critical systems where the broker introduces unacceptable overhead.
- When the broker becomes a single point of failure without proper redundancy.

### Code Example (TypeScript)

```typescript
interface ServiceRegistration {
    name: string;
    handler: (request: any) => Promise<any>;
}

class Broker {
    private services = new Map<string, ServiceRegistration>();

    register(service: ServiceRegistration): void {
        this.services.set(service.name, service);
    }

    unregister(name: string): void {
        this.services.delete(name);
    }

    async invoke(serviceName: string, request: any): Promise<any> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`);
        }
        return service.handler(request);
    }
}

// Usage
const broker = new Broker();
broker.register({
    name: "UserService",
    handler: async (req) => ({ id: req.userId, name: "Alice" })
});

const user = await broker.invoke("UserService", { userId: "123" });
```

### Trade-offs

| Pros | Cons |
|------|------|
| Decoupled components; no direct dependencies | Broker is a potential SPOF |
| Dynamic component registration/removal | Message passing overhead |
| Centralized communication management | Added system complexity |
| Scalable with proper broker clustering | Debugging distributed calls is hard |

---

## 2.11 Architectural Pattern Comparisons

### Presentation Patterns

| Pattern | View Intelligence | Binding | Testability | Best For |
|---------|-------------------|---------|-------------|----------|
| MVC | Active (reads model) | None | Moderate | Web apps, traditional GUIs |
| MVP | Passive (no logic) | Manual | High | Android, WinForms |
| MVVM | Declarative | Automatic | High | WPF, Angular, Vue, SwiftUI |

### Architecture Styles

| Pattern | Core Principle | Coupling | Complexity | Best For |
|---------|---------------|----------|------------|----------|
| Clean Architecture | Dependency rule (inward) | Very low | High | Complex, long-lived domains |
| Hexagonal (Ports/Adapters) | Ports isolate domain | Very low | High | Multi-channel, testable apps |
| Event-Driven | Events drive flow | Very low | High | Async, high-volume systems |
| Pipe and Filter | Sequential transforms | Low | Moderate | Data processing pipelines |
| Blackboard | Shared workspace | Moderate | High | AI, NLP, ill-defined problems |
| Broker | Mediated communication | Low | Moderate | Distributed service systems |

### Microservices Data Patterns

| Pattern | Purpose | Consistency | Complexity |
|---------|---------|-------------|------------|
| Saga | Distributed transactions | Eventual | High |
| CQRS | Separate read/write | Eventual | High |
| Event Sourcing | State as event stream | Eventual | Very High |
| API Gateway | Single entry point | N/A | Moderate |

---

## Sources

### Concurrency Patterns
- [POSA2 Concurrency Patterns -- Vanderbilt](https://www.dre.vanderbilt.edu/~schmidt/POSA/POSA2/conc-patterns.html)
- [Concurrency Patterns: Active Object and Monitor Object -- TopCoder](https://www.topcoder.com/thrive/articles/Concurrency%20Patterns%20-%20Active%20Object%20and%20Monitor%20Object)
- [Half-Sync/Half-Async Pattern in Java -- java-design-patterns.com](https://java-design-patterns.com/patterns/half-sync-half-async/)
- [Reactor Pattern in Java -- java-design-patterns.com](https://java-design-patterns.com/patterns/reactor/)
- [Comparing Reactor and Proactor I/O Patterns -- Artima](https://www.artima.com/articles/comparing-two-high-performance-io-design-patterns)
- [Producer-Consumer Pattern -- Jenkov](https://jenkov.com/tutorials/java-concurrency/producer-consumer.html)
- [Read/Write Locks in Java -- Jenkov](https://jenkov.com/tutorials/java-concurrency/read-write-locks.html)
- [Double-Checked Locking -- Wikipedia](https://en.wikipedia.org/wiki/Double-checked_locking)
- [Double-Checked Locking -- Rotational Labs](https://rotational.io/blog/double-checked-locking/)

### Architectural Patterns
- [Architecture Patterns: MVC, MVP, MVVM -- DEV Community](https://dev.to/chiragagg5k/architecture-patterns-for-beginners-mvc-mvp-and-mvvm-2pe7)
- [Hexagonal Architecture -- Wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))
- [Hexagonal Architecture -- AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html)
- [Event-Driven Architecture -- TechTrailCamp](https://www.techtrailcamp.com/blog/event-driven-architecture.html)
- [What do you mean by "Event-Driven"? -- Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html)
- [Pipes and Filters -- Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters)
- [Blackboard Pattern -- Wikipedia](https://en.wikipedia.org/wiki/Blackboard_(design_pattern))
- [Blackboard Pattern -- DEV Community](https://dev.to/lovestaco/the-blackboard-pattern-a-framework-for-complex-problem-solving-4o1p)

### Microservices Patterns
- [Saga Pattern -- Microservices.io](https://microservices.io/patterns/data/saga.html)
- [CQRS Pattern -- Microservices.io](https://microservices.io/patterns/data/cqrs.html)
- [Event Sourcing -- Microservices.io](https://microservices.io/patterns/data/event-sourcing.html)
- [19 Essential Microservices Patterns -- Design Gurus](https://www.designgurus.io/blog/19-essential-microservices-patterns-for-system-design-interviews)
- [Microservices Architecture Patterns -- docuwriter.ai](https://www.docuwriter.ai/posts/microservices-architecture-patterns)
