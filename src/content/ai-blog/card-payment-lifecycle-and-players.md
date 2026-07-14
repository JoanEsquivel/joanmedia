---
title: "The Lifecycle of a Card Payment and the Players Who Move It"
description: "Follow a card payment from tap to settlement: the four-party model, gateways, processors, PSPs, and why approval and payment happen at different times."
pubDate: 2026-07-14
heroImage: "https://images.unsplash.com/photo-1750262701487-4ca222c89ef4?w=750&h=422&fit=crop"
category: "backend"
tags:
  - Payments
  - Card Networks
  - Payment Processing
  - Fintech
badge: "New"
series: "A Builder's Guide to Fintech and Payments"
seriesOrder: 2
---

## Table of Contents

1. [Two seconds, four companies, and no money](#two-seconds-four-companies-and-no-money)
2. [The cast](#the-cast)
3. [The three acts](#the-three-acts)
4. [Why the gap matters to anyone building](#why-the-gap-matters-to-anyone-building)
5. [Where orchestration comes in](#where-orchestration-comes-in)

---

## Two seconds, four companies, and no money

When you tap a card and the terminal flashes green, it feels atomic — one instant event. It is not. In those two seconds a message crossed several companies, a bank approved the charge without moving a cent, and the actual money stayed put. It will not reach the merchant for a day or two. This post takes that illusion apart: first the cast, then the three-act play they perform.

## The cast

Card payments run on a **four-party model** plus the technical plumbing that connects it. Think of it as a relay where each runner has exactly one job.

- **Cardholder** — the person paying.
- **Merchant** — the business getting paid.
- **Issuer (issuing bank)** — the cardholder's bank. It issued the card, holds the account, and decides whether to approve and fund a transaction.
- **Acquirer (acquiring bank)** — the merchant's bank. It lets the merchant accept cards, receives the settled funds, and carries the risk of chargebacks and fraud.

Between those four sit the connectors:

- **Card network / scheme** — Visa, Mastercard, Amex, Discover. They are the switch and the rulebook: they route messages between acquirer and issuer, settle funds, and set the rules for transactions and disputes.
- **Payment gateway** — captures card details securely at checkout and transmits them onward, handling encryption and first-line fraud checks.
- **Payment processor** — the technical service that carries the transaction between merchant, acquirer, and networks to get it authorized and settled.
- **PSP** — an aggregator like Stripe, Adyen, or PayPal that bundles gateway, processing, and often acquiring into one integration so a merchant can accept many methods at once.

### The two distinctions people always get wrong

**Network ≠ processor.** The card network is a neutral switch and rulebook; it has no direct contract with the merchant. The processor is the technical intermediary that plugs the acquirer and merchant into that switch.

**Acquirer ≠ processor.** Even when one company does both, the acquirer is the licensed *financial institution* that holds the merchant account and the risk, while the processor is the *technology* moving the messages. The distinction matters the moment something goes wrong, because risk and liability live with the acquirer, not the tech vendor.

## The three acts

Here is the single most important thing to internalize: **the transaction is approved in act one, priced in act two, and paid in act three — and those happen at different times.**

### Act 1 — Authorization (seconds, no money moves)

You tap. The gateway and processor send the transaction up to the card network, which routes it to the issuer. The issuer checks the card is valid, confirms funds or credit are available, runs fraud checks, and sends an approve/decline code back down the same path. On approval it places a **hold** on the funds. Nothing has been transferred yet. The green light means "the issuer promises the money is good," not "the money arrived."

### Act 2 — Clearing (the paperwork and the pricing)

Usually as an end-of-day batch, the acquirer submits the day's approved transactions to the card network. The network reconciles each one between acquirer and issuer and **calculates the fees**: interchange, scheme fees, assessments, and any cross-border charges. Clearing is where the transaction is formally recorded and where the merchant's true cost is determined.

### Act 3 — Settlement (money finally moves)

Funds move from the issuer to the acquirer through the network, and the acquirer deposits the **net** amount — sale value minus all fees — into the merchant's account, typically one to two business days after the sale.

## Why the gap matters to anyone building

The delay between "approved" and "paid" is not a bug; it is the structure. It explains a lot of payments engineering:

- **Refunds and chargebacks are separate flows**, not an "undo," because by the time a dispute happens the money has already settled and must be actively clawed back.
- **Auth and capture can be split**: hotels and rental companies authorize a hold and capture the final amount later.
- **Reconciliation is hard** because what you were approved for, what you were charged in fees, and what actually lands in your account are three different numbers arriving at three different times.

## Where orchestration comes in

Modern merchants rarely use one PSP. They add local payment methods, wallets, and backup processors — and something has to decide which one handles each transaction. That is **payment orchestration**: a layer above the PSPs that routes each payment to the best provider, retries failures, and exposes one integration. This "dynamic routing" optimizes for cost and authorization rate across providers. If the four-party model is the old core, orchestration is the fintech-era layer bolted on top.

Now that you can see who is in the chain and how a transaction flows through it, the next question is: who takes what slice, and what do all the fees and acronyms mean?
