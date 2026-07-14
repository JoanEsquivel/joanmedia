---
title: "Security, Fraud, Compliance, and Where Payments Are Heading"
description: "How payments defends itself with tokenization, 3D Secure, and KYC/AML, and the trends reshaping it: embedded finance and open banking."
pubDate: 2026-07-14
heroImage: "https://images.unsplash.com/photo-1768839722988-91767bb82b10?w=750&h=422&fit=crop"
category: "backend"
tags:
  - Payment Security
  - Fraud Prevention
  - 3D Secure
  - Embedded Finance
  - Open Banking
badge: "New"
series: "A Builder's Guide to Fintech and Payments"
seriesOrder: 5
---

## Table of Contents

1. [The system's job is to move money it can trust](#the-systems-job-is-to-move-money-it-can-trust)
2. [Security is layered because no single control is enough](#security-is-layered-because-no-single-control-is-enough)
3. [The tension underneath everything: security vs. friction](#the-tension-underneath-everything-security-vs-friction)
4. [Where the industry is heading](#where-the-industry-is-heading)
5. [The one thing to remember from the whole series](#the-one-thing-to-remember-from-the-whole-series)

---

## The system's job is to move money it can trust

Everything in the first four posts — the players, the lifecycle, the fees, the rails — assumes one thing works: that the money moving is legitimate and the person moving it is who they claim to be. That assumption is expensive to maintain. This final post covers how payments defends itself, the single tension underneath all of it, and the three trends reshaping the industry now.

## Security is layered because no single control is enough

There is no one silver bullet in payments security; the defenses are stacked so that if one fails, another still holds. The main layers:

- **Tokenization** protects the *data*. By replacing card numbers with useless stand-ins, it secures information both at rest and in transit — a breach yields tokens, not cards.
- **3D Secure (3DS)** protects the *identity*. It authenticates the person behind a card-not-present transaction. Introduced in 2001 as a clunky static password, modern **3DS2** uses device data and biometrics to authenticate most users invisibly, and has been shown to cut card-not-present fraud by nearly **60%**. It carries a commercial hook too: a successful 3DS authentication typically shifts chargeback liability from the merchant to the issuer.
- **AVS and CVV** add verification signals — address match and the code on the card.
- **KYC/AML** guards the front door so criminals cannot onboard in the first place (see Post 3).

Together these form a defense in depth: the token secures the data, 3DS confirms the person, and KYC/AML confirms the account should exist at all.

## The tension underneath everything: security vs. friction

Every one of those controls reduces fraud and adds friction — an extra step, a redirect, a challenge — and friction kills conversions. This is *the* central trade-off of payments product design. The industry's answer has been to push authentication into the background: device fingerprinting, risk scoring, and biometrics let low-risk transactions sail through while only suspicious ones get challenged. Unsurprisingly, fraud protection is the top reason merchants adopt authentication like 3DS in the first place. Whenever you design a checkout, you are choosing a point on this curve.

## Where the industry is heading

Three overlapping trends are rearranging the modules we have covered throughout this series.

### 1. Embedded finance

**Embedded finance** packages payments, lending, and banking into non-financial software, so a restaurant platform or a marketplace can offer accounts and card acceptance directly to its users. It is a large and fast-growing market: roughly **$148 billion in 2025**, projected to reach **$197 billion in 2026** (~31.5% CAGR) and **$588 billion by 2030** per Grand View Research. The economics are compelling — platforms report **2×–5× revenue per customer** after adding financial products, and Toast now earns **82–85% of its revenue** from fintech.

But there is a real counter-current. The Banking-as-a-Service model behind embedded finance relies on "sponsor banks," and since 2023 OCC and FDIC enforcement actions have scrutinized that arrangement, pushing some fintech programs to scramble for new bank partners. The lesson for builders: the regulatory foundation under embedded finance is still shifting.

### 2. Open banking and APIs

**Open banking** lets third parties access consumer-authorized financial data and initiate account-to-account payments — potentially bypassing cards entirely. APIs are the enabler, and the investment is serious: in 2026, 88% of organizations rank APIs a top priority, and some large banks devote nearly **14% of their IT budgets** to API initiatives.

The regulatory picture is genuinely unsettled, and honesty is warranted here. The EU is advancing **PSD3**. In the US, the CFPB's **Section 1033** open-banking rule was finalized in October 2024 and was once expected to bind large banks by April 2026 — but a federal court has **enjoined** it, and the CFPB, under new leadership, is **rewriting the rule** rather than enforcing it. The compliance deadline is paused and the outcome is uncertain. If you build on US open banking today, build for a moving target.

### 3. Real-time account-to-account payments

These first two trends converge on a third: as instant rails (Post 4) reach more banks and open banking makes initiating a bank-to-bank payment as easy as a card charge, some consumer spending may shift **off cards entirely**. That is precisely why the card networks are investing so heavily in tokenization, 3DS, and their own real-time products — they can see the account-to-account threat to interchange revenue.

## The one thing to remember from the whole series

Payments looks like a single instant event and is actually a **relay of specialized players moving a message now and money later**, each taking a named slice and holding a specific risk. Once you can see the seams — authorize vs. settle, network vs. processor, refund vs. chargeback, rail vs. wrapper, data security vs. identity vs. onboarding — the acronyms stop being noise and become a map. Every modern fintech trend, from embedded finance to open banking, is a rearrangement of these same modules. Learn the modules and you can read the whole industry.

### Where to go next

- Read a card network's public transaction-flow docs to see the actual message formats.
- Open a PSP sandbox (Stripe, Adyen) and run an authorization, capture, refund, and dispute in test mode.
- Skim the PCI DSS v4.0.1 summary so you understand "scope" before you ever touch card data.
