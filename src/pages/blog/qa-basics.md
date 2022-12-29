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
10. [Risk based testing](#10)
11. [Test Levels](#11)

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

### 10. Risk based testing <a name="10"></a>

It is a software testing type which is based on the probability of risk. It involves assessing the risk based on software complexity, criticality of business, frequency of use, possible areas with Defect etc. Risk based testing prioritizes testing of features and functions of the software application which are more impactful and likely to have defects.

#### What is a risk?
Risk is the occurrence of an uncertain event with a positive or negative effect on the measurable success criteria of a project. It could be events that have occurred in the past or current events or something that could happen in the future. These uncertain events can have an impact on the cost, business, technical and quality targets of a project.

##### Risks can be positive or negative.

- **Positive risks** are referred to as opportunities and help in business sustainability. For example investing in a New project, Changing business processes, Developing new products.
- **Negative Risks** are referred to as threats and recommendations to minimize or eliminate them must be implemented for project success.

#### What is the risk management process? 
1. Risk Identification. Check the risk breakdown structure sample!
2. Risk Analysis:
   - Once potential risks are identified
   - Analyze them, and filter the risk based on significance.
   - Use the Risk Matrix
3. Risk response planning
   - If the risk requires a response, we need to assign it to an owner and monitor it to reduce the probability, and impact.
4. Risk mitigation
   - It is a method to lessen the adverse impacts of possible threads. 
   - We can eliminate them, or reduce the to an acceptable leve.
   - Check the https://www.guru99.com/images/3-2016/032316_1114_RiskBasedTe4.png risk response strategy diagram
5. Risk monitoring and control
   - Track identify risks
   - Monitor residual risks
   - Identify new risks
   - Updated the risk register
   - Evaluate the effectiveness

#### Risk based testing process definition

[![Risk based testing](https://www.guru99.com/images/3-2016/032316_1114_RiskBasedTe6.png)](#)

#### Prioritization and Risk Assessment Matrix
**Probability** is the measure of the chance for an uncertain event will occur. Exposure in terms of time, proximity and repetition. It is expressed in terms of percentage.

This can be classified as Frequent(A), Probable(B), Occasional(C), Remote(D), Improbable(E), Eliminated(F)

- Frequent- It is expected to occur several times in most circumstances (91 – 100%)
- Probable: Likely to occur several times in most circumstances (61 – 90%)
- Occasional: Might occur sometime (41 – 60%)
Remote –Unlikely to occur /could occur sometime ( 11 – 40%)
- Improbable-May occur in rare and exceptional circumstances (0 -10%)
- Eliminate-Impossible to occur (0%)

**Severity** is the degree of impact of damage or loss caused due to the uncertain event. Scored 1 to 4 and can be classified as Catastrophic=1, Critical=2, Marginal=3, Negligible=4

- Catastrophic – Harsh Consequences that make the project completely unproductive and could even lead to project shutdown. This must be a top priority during risk management.
- Critical – Large consequences which can lead to a great amount of loss. Project is severely threatened.
- Marginal – Short term damage still reversible through restoration activities.
- Negligible– Little or minimal damage or loss. This can be monitored and managed by routine procedures.

**Risk assessment matrix example:**
[![Risk assessment matrix](https://www.armsreliability.com/content/Document/Blog/Risk-Matrix-1024x550-1024x550.png)](#)

The priority is classified into four categories, which is mapped against the severity and probability of the risk as shown in below image.

- Serious: The risks that fall in this category are marked in Amber color. The activity must be stopped, and immediate action must be taken to isolate the risk. Effective controls must be identified and implemented. Further, the activity must not proceed unless the risk is reduced to a low or medium level.

- High: The risks that fall in this category are marked in Red color ate action or risk management strategies. Immediate action must be taken to isolate, eliminate, substitute the risk and to implement effective risk controls. If these issues cannot be resolved immediately, strict timelines must be defined to resolve these issues.

- Medium: The risks that fall in this category are marked in Yellow color. Reasonable and practical steps must be taken to minimize the risks.

- Low: The risks that fall in this category are marked in green color) marked can be ignored as they usually do not pose any significant problem. Periodical review is a must to ensure the controls remain effective.

More about risk based testing at [Guru 99](https://www.guru99.com/risk-based-testing.html)

---

### 11. Test Levels <a name="11"></a>

There are four testing levels:

#### 1. Component Testing
##### Objectives
- Reducing risk 
- Verifying whether the functional and non-functional 
- Building confidence in the component’s quality 
- Finding defects in the component 
- Preventing defects from escaping to higher test levels

##### Test Basis 
- Data model
- Component specifications

#### 2. Integration testing
##### Objectives
- Reducing risk
- Verifying whether the functional and non-functional behaviors of the interfaces are as designed and specified
- Building confidence in the quality of the interfaces
- Finding defects (which may be in the interfaces themselves or within the components or systems) 
- Preventing defects from escaping to higher test levels

##### Test Basis 
- Software and system design 
- Sequence diagrams
- Interface and communication protocol specifications
- Use cases
- Architecture at component or system level, workflows, external interface definitions.

##### Test Objects 
- Subsystems 
- Databases
- Infrastructure Interfaces 
- APIs 
- Microservices
 
#### 3. System testing
##### Objectives
- Reducing risk
- Verifying whether the functional and non-functional behaviors of the system are as designed and specified
- Validating that the system is complete and will work as expected
- Building confidence in the quality of the system as a whole 
- Finding defects 
- Preventing defects from escaping to higher test levels or production


##### Test Basis 
- System and software requirement specifications (functional and non-functional)
- Risk analysis reports
- Use cases
- Epics and user stories
- Models of system behavior
- State diagrams 
- System and user manuals


##### Test Objects 
- Applications
- Hardware/software systems
- Operating systems
- System under test (SUT)
- System configuration and configuration data

#### 4. Acceptance testing
##### Objectives
- Establishing confidence in the quality of the system as a whole 
- Validating that the system is complete and will work as expected
- Verifying that functional and non-functional behaviors of the system are as specified  

##### Types
- UAT - User Acceptance Testing
   - Intended to be emulated like real users
- OAT - Operational Acceptance Testing
   - Operations or systems administrator staff.
      - Testing backup and restore.
      - Installing, uninstalling, and upgrading.
      - Disaster Recovery.
      - User Management
      - Maintenance Tasks.
      - Data load, and migration tasks
      - security vulnerabilities
      - Performance testing.
- Contractual, and regulatory acceptance testing
- Alpha, and beta testing.

##### Test Basis 
- Business processes
- User or business requirements
- Regulations, legal contracts and standards
- Use cases and/or user stories
- System requirements 
- System or user documentation 
- Installation procedures
- Risk analysis reports

##### Test Objects 
- System under test
- System configuration and configuration data
- Business processes for a fully integrated system
- Recovery systems and hot sites (for business continuity and disaster recovery testing)
- Operational and maintenance processes
- Forms
- Reports
- Existing and converted production data

---