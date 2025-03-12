---
title: "Webdriver BIDI"
description: "The mission of this article is to explore and explain WebDriver BiDi in a simple way, as well as to examine which frameworks are currently using it."
pubDate: "Tuesday March 11 2025"
heroImage: "https://www.w3.org/StyleSheets/TR/2021/logos/W3C"
badge: "Webdriver architecture"
tags: ["Browsers","Drivers", "Web Automation"]
---



# Exploring WebDriver BiDi: The Future of Browser Automation  

## Different Ways to Automate a Browser  

When it comes to browser automation for testing purposes, there are different approaches, each with its own strengths and weaknesses.  

### **1. WebDriver (Classic Approach)**  
This is the traditional way of automating browsers, where automation tools send WebDriver commands via **HTTP requests** through a driver, enabling communication with different browsers.  

#### **Strengths** ✅  
- Cross-browser support  
- W3C standard  
- Built for testing  

#### **Weaknesses** ❌  
- Slower due to its HTTP-based communication  
- Only provides high-level control  

### **2. CDP (Chrome DevTools Protocol)**  
CDP was initially created for debugging but later adopted for automation, with **Puppeteer** being one of the first frameworks to leverage it. It sends commands through CDP to control the browser via **WebSocket**, but it only works for **Chromium-based browsers**.  

#### **Strengths** ✅  
It offers **low-level control**, including:  
- Monitoring console messages  
- Intercepting network requests  
- Simulating device mode  
- Simulating geolocation  

---

## **WebDriver BiDi: The Best of Both Worlds**  

WebDriver BiDi (short for **Bidirectional WebDriver**) is a **cross-browser automation protocol** that combines the strengths of both **WebDriver Classic** and **CDP**.  

It’s a **new standard protocol** designed for automating web browsers while enabling **bidirectional communication**. WebDriver BiDi sends commands through the protocol over **WebSocket**, allowing **any automation tool to connect to any browser or driver** seamlessly.  

### **Why Are Low-Level Controls Important?**  
With WebDriver BiDi, automation tools can:  
- Capture **console messages**  
- Intercept **network requests**  
- Simulate **device mode**  
- Simulate **geographic locations**, etc.  

⚠️ **Note:** Classic WebDriver **cannot** implement all of these features natively since its architecture is based on HTTP requests. Some workarounds exist, but they are browser-specific.  

---

### **WebDriver BiDi: How is a new protocol implemented?**  

Developing a new automation protocol requires **coordinated efforts** from multiple providers working together. The process includes:  

1. **Specification** 📜  
   - A **Request for Comments (RFC)** process is used to gather feedback on the proposal.  

2. **Verification** ✅  
   - A series of **tests** that run across all platforms, ensuring a solid foundation for all implementations.  

3. **Implementation** 🛠️  
   - **Browsers** adopt the protocol based on the specifications and must pass the verification tests.  

---

### **Challenges of WebDriver BiDi**  

- **Handling high latency** without sacrificing performance.  
- **Avoiding excessive complexity**—a protocol that’s too complex would be difficult to implement, adopt, and work with.  
- **Realistic implementation**—considering the limitations of different browsers while ensuring a smooth integration.  

---

### **Want to Know More?**  

Check out the official **WebDriver BiDi roadmap**:  
[🔗 WebDriver BiDi Roadmap](https://github.com/w3c/webdriver-bidi/blob/main/roadmap.md)  

Current WebDriver Bidi specification
[🔗 WebDriver Bidi](https://w3c.github.io/webdriver-bidi/)


## Do All Browsers Support the WebDriver BiDi Protocol?

The **WebDriver BiDi protocol** is under active development, with browser vendors progressively implementing its features.  
However, **not all browsers fully support every aspect of WebDriver BiDi yet**.  
This partial support means that certain BiDi commands might not function as expected, potentially leading to errors during test executions.  

For the latest browser support status and updates, you can refer to this resource:  

[🔗 WebDriver BiDi Browser Support Status](https://wpt.fyi/results/webdriver/tests/bidi?label=master&label=stable&aligned)  

---

## Do All Frameworks Use WebDriver BiDi?

### **Selenium**  

Yes! **Selenium now supports the W3C WebDriver BiDi Protocol**, enhancing its capabilities for modern browser automation.  
With this integration, Selenium can:  

✅ **Listen to console log events** – Capture and analyze logs in real-time.  
✅ **Listen to JavaScript exceptions** – Receive immediate notifications about JavaScript errors during execution.  
✅ **Intercept network requests** – Modify or inspect network calls before they reach the server.  
✅ **Intercept network responses** – Monitor and manipulate responses from the server.  
✅ **Register basic authentication** – Handle authentication processes seamlessly.  

To implement these features, you can follow the detailed guide provided by BrowserStack:  

[🔗 Event-Driven Testing with Selenium BiDi](https://www.browserstack.com/docs/automate/selenium/bidi-event-driven-testing)  

Also, check the offical documentation for more details:
[🔗 Selenium BiDi documentation](https://www.selenium.dev/documentation/webdriver/bidi/)


### Cypress

Cypress now uses WebDriver BiDi for running test automation scripts in Firefox. Previously, it relied on CDP, but that will be deprecated starting with Firefox 129.

You can check out the official blog post for more details: [Cypress Support for Firefox Over WebDriver BiDi](https://www.cypress.io/blog/announcing-cypress-support-for-firefox-over-webdriver-bidi).

From the blog post, it looks like Cypress is also considering expanding WebDriver BiDi support to other browsers in the future.

### Playwright

Playwright does not currently use the WebDriver BiDi protocol. However, in 2024, a pull request introduced initial support for WebDriver BiDi in Playwright as an experiment. The goal was to evaluate the current state of the specification and its implementation, identifying major gaps and challenges before considering BiDi as Playwright’s main protocol. Check the [PR](https://github.com/microsoft/playwright/pull/32434/)

I haven't been able to find any recent updates on this integration.

### Webdriver IO
WDIO supports WebDriver BiDi, as noted in its [official documentation](https://webdriver.io/docs/api/webdriverBidi/). However, there are warnings that browser support is not guaranteed, and interfaces may change in the future. Since the standard is still under development, browser vendors will implement these capabilities on their own timelines.

## How to support the WebDriver BiDi protocol?
- Be a tester and adopter, helping to shape the future of WebDriver BiDi.
- Spread the word!
- Ask for support. File a feature request or check with your favourite tools on their plans for adopting WebDriverBiDi.
- Participate in the RFC, providing feedback on the APIs.

[WebDriver BiDi Repository](https://github.com/w3c/webdriver-bidi)

Please let me know your feedback. I’d be more than happy to update this article to keep it up to date.