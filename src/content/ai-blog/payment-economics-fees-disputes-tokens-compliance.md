---
title: "The Economics and Vocabulary of Payments: Fees, Disputes, Tokens, and Compliance"
description: "Decode payment fees and jargon: interchange, scheme fees, refunds vs. chargebacks, tokenization, PCI DSS, and KYC/AML."
pubDate: 2026-07-14
heroImage: "https://images.unsplash.com/photo-1778546978267-b93e8c6ea099?w=750&h=422&fit=crop"
category: "backend"
tags:
  - Payments
  - Interchange Fees
  - Tokenization
  - PCI DSS
  - Compliance
badge: "New"
series: "A Builder's Guide to Fintech and Payments"
seriesOrder: 3
---

## Table of Contents

1. [The €100 that isn't €100](#the-100-that-isnt-100)
2. [Interchange: the biggest slice](#interchange-the-biggest-slice)
3. [Scheme fees and the rest](#scheme-fees-and-the-rest)
4. [Refunds vs. chargebacks — not the same thing](#refunds-vs-chargebacks--not-the-same-thing)
5. [Tokenization: making stolen data worthless](#tokenization-making-stolen-data-worthless)
6. [PCI DSS: the security rulebook](#pci-dss-the-security-rulebook)
7. [KYC and AML: knowing who is moving money](#kyc-and-aml-knowing-who-is-moving-money)
8. [The quick glossary](#the-quick-glossary)

---

## The €100 that isn't €100

Sell something for €100 and you will not receive €100. Somewhere between the sale and your bank account, a set of players each takes a slice, and every slice has a name. This post decodes those names — the fees, the dispute types, and the security and compliance terms that show up in every payments conversation. Learn this vocabulary and merchant statements, contracts, and product docs stop being noise.

## Interchange: the biggest slice

**Interchange** is a fee the acquirer pays to the *issuer* on every card transaction. The card network sets the rate, and it is ultimately passed through to the merchant. It exists to compensate the issuer for funding the transaction, running the account, and carrying credit risk.

Interchange is not a single number. It varies by:

- **Card type** — rewards, business, and premium cards cost more than plain debit. Those airline miles are funded by higher interchange.
- **Card-present vs. card-not-present** — tapping in person is cheaper than an online or phone payment, which carries more fraud risk.
- **Merchant category and geography** — higher-risk sectors and cross-border transactions cost more.

The scale is striking. Interchange made up roughly **70–90% of US card processing costs in 2021**, and in 2025 US merchants paid an estimated **$185 billion** in total processing fees — a record — of which about **$130–145 billion** was interchange alone. When people say cards are expensive, this is what they mean.

## Scheme fees and the rest

**Scheme fees (assessments)** are what the card network charges for using its rails and rulebook. They are smaller than interchange and go to Visa/Mastercard rather than the issuer. Add the processor's and acquirer's own markups and you have the merchant's full cost of acceptance. The important mental model: **the money flows through the chain and each layer deducts before passing it on** — network takes the amount minus interchange to the processor, the processor deducts its fee, the acquirer deducts its fee and deposits the rest.

## Refunds vs. chargebacks — not the same thing

These get used interchangeably and should not be.

- A **refund** is *voluntary and merchant-initiated*: the merchant sends money back to the customer through the normal payment network.
- A **chargeback** is *involuntary and customer-initiated*: the cardholder disputes the transaction through their issuing bank, which forcibly reverses it — usually charging the merchant a fee on top.

Because the **acquirer carries chargeback risk**, a merchant with too many chargebacks can lose their ability to accept cards at all. Chargebacks are therefore both a fraud-and-disputes problem and a business-survival problem, which is why so much of payments tooling exists to prevent and fight them.

## Tokenization: making stolen data worthless

**Tokenization** replaces a sensitive card number with a random, non-sensitive stand-in — a **token** — stored in a secure vault. The token works across the whole lifecycle: repeat billing, refunds, and chargebacks all reference the token, and the processor maps it back to the real number only inside the vault. If an attacker steals the token, they steal nothing usable.

## PCI DSS: the security rulebook

Any business that touches card data must comply with **PCI DSS** (Payment Card Industry Data Security Standard). The current version is **v4.0.1**, and its 51 "future-dated" requirements became mandatory on **31 March 2025 with no grace period**. v4.0.1 itself added no new requirements — it only clarified v4.0.

Here is where tokenization and PCI connect, and why it matters commercially: by removing raw card numbers from your environment, you shrink the **scope** — the set of systems, people, and processes that fall under a PCI audit. Smaller scope means lower audit cost and less security infrastructure to maintain. "Reduce your PCI scope" is one of the most common reasons teams adopt tokenization or a PSP that handles card data for them.

## KYC and AML: knowing who is moving money

Before a fintech lets anyone move money, it must know who they are.

- **KYC (Know Your Customer)** verifies a customer's identity and assesses their risk *at onboarding*.
- **AML (Anti-Money Laundering)** is the broader framework — using KYC plus ongoing transaction monitoring and reporting — to detect and prevent financial crime.

Fintechs are especially exposed because onboarding is fully digital, giving criminals a low-friction path to launder money through peer-to-peer transfers and exchanges. The stakes are real: getting it wrong invites multi-million-dollar fines, license revocation, and lost trust. This is why "onboarding" in fintech is never just a signup form.

## The quick glossary

| Term | One-line meaning |
|---|---|
| Interchange | Fee acquirer pays issuer per transaction; the biggest slice |
| Scheme fee | Fee the card network charges for its rails |
| Refund | Merchant voluntarily returns funds |
| Chargeback | Customer forces a reversal via their bank |
| Tokenization | Replace card number with a useless stand-in |
| PCI DSS | Security standard for handling card data (v4.0.1) |
| KYC | Verify identity at onboarding |
| AML | Ongoing monitoring to prevent financial crime |

With the money and the vocabulary in hand, the next question is: cards are only one way to move value — what are the others?
