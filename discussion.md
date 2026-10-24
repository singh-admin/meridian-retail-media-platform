# Important: Playground URL Requirement and Sample Resource Package !!

# Harshit.Chudasama
Copilot
Author
1 post
Posted: 23 Oct 2026, 14:43
Please note that a fully working and accessible playground URL is mandatory for this challenge. Leadership will use the deployed solution for demonstration and review and will not be able to run submissions locally through Docker.

A local Docker setup is still required as part of the technical deliverables, but it does not replace the deployed playground URL. The playground should be preconfigured, ready to demonstrate, and available throughout the review period.

We have also attached a ZIP package containing the sample files referenced in the challenge specification, including:

A synthetic AODB flight dataset
An illustrative IATA AIDX flight-leg XML message
A README with details about the sample data and its intended adapter usage
Please review these resources carefully and use them as reference inputs for your data adapters and implementation.

If you have any questions, please post them in the forum so that the clarification remains visible to all participants.

Playground.zip




# Harshit.Chudasama
Copilot
Author
1 post
Posted: 23 Oct 2026, 14:35
Your goal is to build a locally runnable, demo-ready platform that uses simulated live flight and passenger-flow data to deliver relevant advertisements and promotions across airport screens.

Your solution should demonstrate dynamic audience matching, explainable campaign decisions, real-time event handling, role-based dashboards, campaign management, promo-code redemption, airport data adapters, and a clear cause-and-effect journey across the platform.

All mandatory workflows must be functional through the deployed playground and the locally runnable solution. Please review the complete challenge specification and supplied resources carefully before starting.

If you have any questions, post them in the forum so that all clarifications remain visible to every participant.

Good luck, and we look forward to reviewing your solutions!




# jaypatel1325
Author
1 post
Posted: 23 Oct 2026, 22:28
Exact Scores: Must the demo display exactly 0.86, 0.52, and 0.21 with 71%, 49%, and 18% match? The spec gives no formula, and 71% × 1.5 is not 0.86. Is any deterministic, logged formula acceptable as long as the example reproduces?

Many Phones, One QR: When a crowd scans the same screen QR, should every phone get its own code and its own redemption? Is there any cap per offer beyond budget and boarding-close expiry?

Remembering the Code on the Phone: May the claim page store its own code in the browser so a refresh does not create a second one? Nothing about the phone is stored server-side. Does this count as the "device tracking" the spec rules out?

LLM in the Decision Loop: "Smart, optimized algorithm and/or AI Agent based on LLMs": is a deterministic algorithm with the evidence verifier, and no LLM call per decision, acceptable? The LLM would then be used only for the creative assistant.

Missing ACRIS Samples: The sample README mentions an ACRIS folder with the FIWARE entity schemas, but the ZIP does not contain it. Can you share it, or is the public FIWARE dataModel.ACRIS repository the reference?

Inventory "Booked": When ad selection is dynamic every 15 seconds, what makes a screen-hour "booked" versus "available" in the inventory calendar, and what is the unit of "suggested price per slot"?

Sub-Pages: Do tabs inside one page count against "up to three sub-pages" per role?

Money Definitions: Is "revenue today" on the admin strip the platform's ad revenue, and is retailer "revenue attributed" redemptions × offer value, with ROI = (attributed − spend) / spend?

0
0
Reply
Quote
H
# Harshit.Chudasama
Copilot
1 post
Posted: 24 Oct 2026, 10:15
Exact scores: The example scores are illustrative. A documented, deterministic formula is acceptable if the Gate 42 scenario produces a reasonable ranking, applies filters and boosts correctly, and clearly logs the decision. Scores should not be hardcoded.

Multiple QR scans: Each phone may receive a separate claim code and redemption. No additional cap is mandatory beyond budget and expiry rules, though configurable limits or duplicate-claim protection are allowed.

Remembering codes: The claim page may store the issued code locally to prevent duplicate codes on refresh. This is acceptable as long as there is no device fingerprinting, identity tracking, or persistent passenger profiling.

LLM decision loop: An LLM call is not required for every ad decision. A deterministic and explainable algorithm is acceptable for matching and selection. The LLM may be used for the creative assistant or another meaningful AI capability.

ACRIS samples: The public FIWARE dataModel.ACRIS schemas may be used as the reference. Participants may create representative NGSI-LD mock entities and process them through the required adapter.

Inventory definitions: “Booked” means capacity allocated to approved campaigns; “available” means unallocated capacity; and “premium” means higher-value capacity based on predicted passenger presence. Pricing may be per 15-second play, screen-hour, or another clearly defined and consistently applied unit.

Sub-pages: Tabs, drawers, modals, and dashboard panels do not automatically count as separate sub-pages. The intent is to keep each role’s navigation focused and demo-friendly.

Money definitions: Admin revenue means platform ad revenue. Retailer attributed revenue means simulated sales linked to redemptions. ROI may be calculated as (attributed revenue − campaign spend) / campaign spend. All assumptions should be documented and used consistently.