---
layout: "../../layouts/PostLayout.astro"
title: "QA Basics"
description: "Article with a full guide to learn software testing, and crack any interview"
pubDate: "Nov 17 2022"
heroImage: "https://images.unsplash.com/photo-1600267165477-6d4cc741b379?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
---

## Introduction

This article will have a list of different topics that you may need to know, and understand if you are working as a QA Engineer. Some of them are also common interview questions you may have.

## Table of contents

1. [Testing Objectives](#1)
2. [Is QA the same as testing?](#2)
3. [Error, Defects, and Failures](#3)
4. [How to create a root cause analysis ( RCA )?](#4)
5. [RCA Process](#5)
6. [Testing Principles](#6)
7. [Test process (The big picture)](#7)
8. [Test Work Products](#8)
9. [What is the difference between stub and drivers?](#9)

---

### 1. Testing Objectives <a name="1"></a>

- Prevent defects
- Requirements are fulfilled
- Test Object is complete.
- Build quality confidence
- Provide information to stakeholders
- Comply with legal standards.

---

### 2. Is QA the same as testing? <a name="2"></a>

QA is part of the Quality Management Process.

---

### 3. Error, Defects, and Failures <a name="3"></a>

- **Error** is a mistake done by the developer.
- **Defect, Fault or Bug** is basically a deviation from requirements, led by the errors.
- A **failure** happens when a defect/bug is executed.

---

### 4. How to create a root cause analysis ( RCA )? <a name="4"></a>

An RCA is a mechanism of analyzing defects to identify its cause:

1. Testing miss
2. Development miss
3. Requirement or design miss

---

### 5. RCA Process <a name="5"></a>

1. Form an RCA Team
2. Define the problem
   1. What is the problem?
   2. What is the sequence of events that led to the problem?
   3. What systems were involved?
   4. How long has the problem existed?
   5. What is the impact of the system?
   6. Who was involved and determine who should be interviewed?
3. Identity Root Cause
   1. Conduct a brainstorm with the RCA Team.
   2. Use the Fishbone diagram or 5 why analysis
4. Implement a root cause corrective action (RCCA)
5. Implement a root cause preventive action (RCPA)

---

### 6. Testing Principles <a name="6"></a>

1. Testing shows the presence of defects, not their absence
   - It is not a proof of correctness
   - Tests reduce the probability of undiscovered defects.
2. Exhaustive testing is impossible
   - Use risk analysis
   - Test techniques
   - Set priorities
3. Early testing saves time and money
4. Defects cluster together
   - Small number of modules usually contains most of the defects discovered.
5. Beware of the pesticide paradox
   - If tests are repeated and repeated again, tests no longer find new defects.
6. Testing is context dependent
7. Absence-of-errors is a fallacy
   - It is a mistaken belief thinking that finding and fixing a large number of defects will ensure the success of a system.

---

### 7. Test process (The big picture) <a name="7"></a>

#### 7.1 SDLC

- Requirement analysis
- Design
- Implementation
- Testing
- Deployment
- Maintenance

#### 7.2 Project Methodologies

- Waterfall
- Iterative
- Prototype
- Agile

#### 7.3 Test Levels

- Component testing(unit or module testing)
- Integration Testing
- System Testing
- Acceptance Testing

#### 7.4 Testing Types

- Functional Testing
  - evaluate functions that the system should perform
- Non Functional Testing
  - evaluates characteristics of systems and software such as usability, performance efficiency or security
- White Box Testing
  - derives tests based on the system’s internal structure or implementation
- Change Related Testing
  - Confirmation testing (specific re-testing)
  - Regression testing (validate change did not affect the whole system)
- Maintenance Testing

#### 7.5 Product and project risks

#### 7.6 Business domain

#### 7.7 Operational constraints

- Budget and resources
- Timescales
- Complexity
- Contractual and regulatory requirements

#### 7.8 Organization policies & regulatory requirements

#### 7.9 Required internal and external standards

---

### 8. Test Work Products <a name="8"></a>

#### 8.1 Test planning

- Test plan(s)
- Test Basis

#### 8.2 Test monitoring and control

- Test progress reports
- Test summary reports at completed milestones
- task completion
- resource allocation

#### 8.3 Test analysis

- Defined test conditions
- Defect report from defects found on test basis.

#### 8.4 Test design

- test environment design documents
- Infrastructure, and tools research.

#### 8.5 Test implementation

- Test procedures
- Test Suites
- Test Execution schedule

#### 8.6 Test execution

- Status reports
- Defect reports
- Documentation

#### 8.7 Test completion

- Test summary reports
- Action items
- change requests
- product backlog
- finalized testware

---

### 9. What is the difference between stub and drivers? <a name="9"></a>

**Stubs** and **drivers** are modules developed to **emulate missing parts of a software**.

Integration testing has different approaches, but there are a couple of them that implies stubs and drivers:
#### Top-down Integration Testing
Testing takes place from top to bottom, following the control flow or architectural structure (e.g. starting from the GUI or main menu). Components or systems are substituted by **stubs**.

[![Top-Down integration testing image from TryQA](http://tryqa.com/wp-content/uploads/2012/01/What-is-top-down-integration-testing.jpg)](https://tryqa.com/what-is-integration-testing/)

#### Bottom up Integration Testing
Testing takes place from the bottom of the control flow upwards. Components or systems are substituted by **drivers**. Below is the image of ‘Bottom up approach’:

[![Bottom integration testing image from TryQA](http://tryqa.com/wp-content/uploads/2012/01/what-is-bottom-up-integration-testing.jpg)](https://tryqa.com/what-is-integration-testing/)

---
