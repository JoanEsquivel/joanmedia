---
title: "Beyond Cards: Payment Rails and Methods"
description: "A builder's map of payment rails—cards, ACH, wire, RTP, and FedNow—plus the wallets and BNPL wrappers that ride on top of them."
pubDate: 2026-07-14
heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=750&h=422&fit=crop"
category: "backend"
tags:
  - Payment Rails
  - ACH
  - FedNow
  - Real-Time Payments
  - Fintech
badge: "New"
series: "A Builder's Guide to Fintech and Payments"
seriesOrder: 4
---

## Table of Contents

1. [Cards are one road, not the whole map](#cards-are-one-road-not-the-whole-map)
2. [What a "rail" actually is](#what-a-rail-actually-is)
3. [The rails at a glance](#the-rails-at-a-glance)
4. [The rails in words](#the-rails-in-words)
5. [Wrappers, not rails: wallets and BNPL](#wrappers-not-rails-wallets-and-bnpl)
6. [The builder's takeaway: multi-rail is the norm](#the-builders-takeaway-multi-rail-is-the-norm)

---

## Cards are one road, not the whole map

The first three posts lived almost entirely in card world, because that is where most people first meet payments. But cards are just one **rail**. When your employer pays you, when you send a wire to close on a house, when a gig platform pays a driver instantly at midnight — those move on entirely different rails, each with its own trade-offs. This post maps the rails and the consumer-facing methods that ride on top of them.

## What a "rail" actually is

A **payment rail** is the combination of messaging formats, settlement processes, scheme rules, and access models that move value from one account to another. Rails differ mainly on four axes a builder should always ask about:

1. **Speed** — instant, same-day, or multi-day?
2. **Cost** — a percentage of the amount, or a flat fee?
3. **Finality** — reversible, or irrevocable once sent?
4. **Reach** — who can send and receive on it?

## The rails at a glance

| Rail | Speed | Typical cost | Finality | Best for |
|---|---|---|---|---|
| **Card networks** | Auth instant, settle 1–2 days | ~1.5–3.5% of amount | Reversible (chargebacks) | Consumer purchases |
| **ACH** (US) | 1–3 business days; same-day option | ~$0.60 per $100 | Reversible | Payroll, recurring bills |
| **Wire** | Same-day (domestic) | ~$20–$35 domestic; more cross-border | Irrevocable, guaranteed | Large / international transfers |
| **RTP** | Instant, 24/7/365 | ~$0.045 per transfer | Irrevocable, credit-push | Payouts, gig pay |
| **FedNow** | Instant, 24/7/365 | ~$0.045 per transfer | Irrevocable, credit-push | Same, for banks not on RTP |

## The rails in words

**Card networks** are fast to authorize but slow and expensive to settle, and — crucially — reversible via chargebacks. That reversibility is a feature for consumers (buyer protection) and a cost for merchants. They cost roughly 1.5–3.5% of the transaction.

**ACH** (Automated Clearing House) is the batch workhorse of US money movement — think of it as digitized checks. It settles in one to three business days (with a same-day option) and is cheap, around $0.60 per $100. That is why direct deposit and subscription billing run on ACH. The trade-off is the settlement gap: because money is not final immediately, ACH payments can bounce for insufficient funds or be returned as fraud.

**Wire transfers** are fast and final. Domestic wires often settle same-day and the funds are guaranteed and irrevocable, but they are expensive — up to around $35 to send. That combination makes wires the default for large or international transfers where finality is worth paying for.

**The instant rails — RTP and FedNow** — are the newest and most interesting. Both settle instantly, run 24/7/365, and are **credit-push and irrevocable**: only the payer can initiate, and once sent the payment cannot be pulled back. Credit-push is a structural fraud advantage over pull-based rails like cards and ACH, because no one can reach into your account and take money.

- **RTP**, run by The Clearing House since **2017**, raised its per-transaction ceiling from $1 million to **$10 million in February 2025**. It currently reaches roughly 70% of US bank accounts.
- **FedNow**, launched by the Federal Reserve in **July 2023**, settles through each bank's master account at the Fed and is built natively on the **ISO 20022** messaging standard.

The catch with instant rails is **reach**: both the sender's and the receiver's banks must be on the same rail for a payment to go through. Coverage is growing but not universal, which is why FedNow and RTP coexist rather than one simply winning.

## Wrappers, not rails: wallets and BNPL

Two things people call "payment methods" are actually wrappers around the rails above — they change the experience and who holds the risk, not the underlying plumbing.

**Digital wallets** — Apple Pay, Google Pay, PayPal, Venmo, Cash App, Zelle — store a tokenized card or a bank link and initiate payments on the rails beneath them. When you tap Apple Pay, a card network or bank rail is still doing the work; the wallet added tokenization and a nicer front end.

**Buy Now, Pay Later (BNPL)** splits a purchase into installments. The BNPL provider pays the merchant up front and takes on the consumer credit risk itself, collecting from the shopper over time. The novelty is the credit and risk model, not a new way of moving money.

## The builder's takeaway: multi-rail is the norm

No single rail wins on all four axes, so serious money-movement products use several and route dynamically. Combining rails gives redundancy, customer choice, faster processing, and clearer cash-flow visibility, and **dynamic routing** algorithms pick the best path per transaction based on cost, traffic, and authorization rates. When you evaluate a payments product, "which rails, and how do they route between them?" is often the most revealing question you can ask.

The rails move the money. The last piece is keeping that movement safe and legal — and seeing where the whole system is heading.
