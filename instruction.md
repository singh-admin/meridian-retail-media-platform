# Challenge overview
Build a locally runnable, demo-ready prototype of an airport retail media platform: ads and promotions on airport screens, triggered by live flight and passenger-flow data. The POC must win the room in a 15-minute demo to airport operator and advertiser stakeholders using a deployed URL demo playground.

# Product context and roles
The platform provides airport digital-screen inventory to retailers, F&B outlets and airlines, and times each ad to the passengers actually in front of the screen. Flight data from the AODB tells the system who is where and for how long: a delayed Dubai flight at Gate 42 means 280 international passengers with 40 extra minutes near duty-free.


Role	Who	What they want from the platform
Platform Admin	Platform operator	Network health, revenue, screen uptime, bugs and incidents, onboarding of vendors, locations, F&B retailers, airlines and screens
Retailer	Shop or F&B outlet on the airside	Run and reuse campaigns, live impressions and conversions, passenger flow near the store, time-limited promo codes, campaign history and ROI
Media Manager	Platform operator's ad sales and inventory team	Sell and schedule inventory, approve creatives, pricing and yield, occupancy of every screen and slot, advertiser reporting
Airline Representative	Airline marketing or station manager	Gate and boarding-area messaging for their own flights, upgrade and lounge upsell, delay goodwill offers, co-branded promotions with retailers
Passenger (simulated)	Traveller in front of a screen	Relevant offers, flight info next to the ad, scan-to-claim QR with a countdown, shareable codes for family


No login exists. A role switcher in the header changes the persona, and the retailer and airline views also switch between sample companies (for example, a duty-free store, a coffee chain, a low-cost airline and a full-service airline, all with fictional names).

# Data model and adapters
All airport data is mocked, but every mock must look exactly like what a real source would send, so going live means writing one new adapter and nothing else. The app core only ever sees a canonical internal model; adapters translate source formats into it.

+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+
| Source standard       | What it supplies                            | POC mock format             | Canonical entities                          |
+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+
| AODB flight movements | Schedule, estimated and actual times        | CSV or JSON, one row per    | [Flight] [GateAssignment]                   |
| (any AODB vendor)     | (A-CDM: TOBT, TSAT, AIBT, AOBT), stand,     | flight leg, 33 columns as   | [AircraftType]                              |
|                       | gate, check-in counters, belt, aircraft,    | in the sample AODB file     |                                             |
|                       | pax count, status, delay codes              |                             |                                             |
+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+
| IATA AIDX XML         | Real-time flight-leg updates                | XML messages pushed on      | [FlightEvent]                               |
|                       | (IATA_AIDX_FlightLegNotifRQ): status        | a simulated feed            |                                             |
|                       | changes, gate changes, delays               |                             |                                             |
+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+
| ACI ACRIS             | Terminals, concourses, checkpoints, zones,  | NGSI-LD style JSON entities | [Terminal] [Zone] [Checkpoint]              |
| (FIWARE Smart Data    | passenger queues and queue measurements     |                             | [QueueMeasurement]                          |
| Models)               |                                             |                             |                                             |
+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+
| Platform-owned        | Screens, retailers, outlets, campaigns,     | Tables in the app database  | [Screen] [Advertiser] [Outlet] [Campaign]   |
| (no standard)         | creatives, promo codes, impressions,        |                             | [Creative] [PromoCode] [Impression]         |
|                       | redemptions                                 |                             | [Redemption]                                |
+-----------------------+---------------------------------------------+-----------------------------+---------------------------------------------+

# Adapter contract. Each source has an interface such as FlightSource.stream(): AsyncIterable<FlightEvent> with a mock implementation and a stub Live implementation. Switching is a single config value (FLIGHT_SOURCE=mock-aidx | vendor-api).

# Derived signal: passenger presence. The core value is the ZonePresence estimate per zone and per 5-minute window: how many passengers, which nationalities and destinations, domestic or international, and their dwell time. It is computed from flights at nearby gates (pax count × time to boarding) and ACRIS queue data. Every ad decision and every dashboard KPI uses it.

# Reference samples are attached to the challenge, re-labelled to the fictional airport before sharing (aodb-samples/): a synthetic one-day AODB file (320 flights), an illustrative AIDX flight-leg message, and the public ACRIS entity schemas.


# Audience matching and decision rules
Every ad slot on every screen goes to the campaign whose target audience best matches the estimated crowd in front of that screen for the next few minutes. The crowd profile, the rules, the scores and the reason for each decision must be visible and understandable in every role.

AI decision pipeline: evidence-first crowd-to-screen matching. Every ad decision comes from measured data only: AODB and AIDX flight events, ACRIS queue and zone gauges, and live screen, scan and redemption metrics. Each input carries its source, timestamp and freshness. The AI scores and ranks campaigns against the crowd profile, but a decision is only executed once deterministic checks confirm it: every input it cites must exist in a trusted feed and be fresh enough, every hard rule must pass, and the score must be reproducible from the logged inputs. If any check fails, the AI’s choice is rejected and the screen falls back to a rule-based default. Nothing the AI asserts is used unless it traces back to a recorded data point, so a hallucinated fact cannot reach a screen. Every decision is logged with its evidence trail, so any role can audit why an ad played.



# Crowd profile: what the system knows about the crowd
A profile is built per flight, then rolled up per screen and per 5-minute window, weighted by how close each gate is to the screen and how long until boarding. All attributes are aggregated shares ("62% holiday travellers"), never data about a person.


+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Attribute        | Values                                        | POC mock source                   | Real source later           |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Destination and  | City, country, region; domestic or            | AODB origin, destination, via     | AODB                        |
| arrival source   | international; connecting from                |                                   |                             |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Trip purpose     | Business, holiday, visiting family and        | Route type, day of week and time  | Airline aggregated booking  |
|                  | friends, student, religious                   | of day rules, mocked shares       | mix, surveys                |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Party type       | Solo, couple, family with children, group     | Mocked per route and season       | Airline aggregated PNR      |
|                  |                                               | (school holidays raise families)  | statistics                  |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Age band         | Under 12, 12-17, 18-24, 25-34, 35-44, 45-54,  | Mocked distribution per route     | Airline aggregates,         |
|                  | 55+                                           |                                   | anonymous audience sensors  |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Gender split     | % female, % male                              | Mocked per route                  | Airline aggregates,         |
|                  |                                               |                                   | anonymous audience sensors  |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Cabin and spend  | Economy, premium economy, business; frequent- | Aircraft seat configuration +     | Airline aggregates          |
| tier             | flyer share                                   | mocked fare mix                   |                             |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Nationality and  | Top 3 nationalities and languages             | Route                             | APIS aggregates             |
| language         |                                               |                                   | (international)             |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Time context     | Dwell minutes to boarding, delay minutes,     | AODB times + event calendar       | AODB                        |
|                  | time of day, festival or holiday period       |                                   |                             |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+
| Crowd size       | Passengers in the zone now and in the next    | Pax count x gate proximity        | AODB + ACRIS queue and      |
|                  | 30 min                                        |                                   | sensor data                 |
+------------------+-----------------------------------------------+-----------------------------------+-----------------------------+


The mock generator must give every flight a profile like this, and the profiles must be plausible: a Monday 07:00 domestic flight skews to business travellers aged 25–44; a Friday evening holiday route skews to families and couples.

# Campaign targeting: what the advertiser asks for
• Segment weights: how much each segment matters, 0 to 1 (for example, Family 1.0, Holiday 0.8, Business 0.1).
• Hard filters: conditions that must be true (international only, destination in the Gulf region, dwell of 15 minutes or more, at least 100 passengers in the zone).
• Placement: zones, screens or gates, plus a schedule.
• Budget and limits: total budget, daily cap, frequency cap per screen.
• Triggers (optional): delay over N minutes, gate change, boarding starts, festival day.


# Decision pipeline: run per screen for every slot (about every 15 seconds)
• Profile: build the crowd profile for this screen's catchment for the next slot window.
• Filter: drop campaigns that fail a hard rule: schedule, placement, approval status, brand safety, domestic or international, destination, minimum crowd size, budget exhausted.
• Score: score every remaining campaign based on smart, optimized algorithm and/or AI Agent decision based on LLMs.
• Apply business rules: airline priority in its own boarding window, competitor separation (no two perfume brands back to back), frequency cap, budget pacing.
• Choose and log: play the highest score and store the full decision: profile, candidates, scores, and the winning reason.
• Learn: scans and redemptions per segment update each campaign's conversion estimate, so the next decisions improve.

Worked example (must be reproducible in the demo). Gate 42 at 14:10. The crowd is flight XY501 to DXB (240 pax, delayed 45 min) plus flight ZQ88 to a beach destination (180 pax). Profile: holiday 58%, family 31%, business 22%, international 57%, median dwell 52 min.


+------------------------------+------------------------------------+----------------+------------------+-------------+--------------------------+
| Candidate campaign           | Targets                            | Audience match | Boost            | Final score | Result                   |
+------------------------------+------------------------------------+----------------+------------------+-------------+--------------------------+
| Duty-free perfume, 15% off   | International, holiday, adults     | 71%            | 1.5 (delay rule) | 0.86        | Plays                    |
|                              | 25-54                              |                |                  |             |                          |
+------------------------------+------------------------------------+----------------+------------------+-------------+--------------------------+
| Toy store, buy 2 get 1       | Family with children               | 49%            | 1.0              | 0.52        | Next in rotation         |
+------------------------------+------------------------------------+----------------+------------------+-------------+--------------------------+
| Business lounge day pass     | Business, premium cabin            | 18%            | 1.0              | 0.21        | Filtered to other gates  |
+------------------------------+------------------------------------+----------------+------------------+-------------+--------------------------+


How each role sees the matching
Role	What they see and control

Platform Admin	Rule engine settings (global weights, exploration %, frequency caps, competitor separation), a searchable decision log, and the version of the segment model in use

Retailer	Live audience-match preview while building a campaign ("matches 64% of the crowd at Gates 40–45 from 14:00 to 16:00; expected 3,100 impressions and 95 redemptions"), performance by segment after the run ("families redeemed 3x more"), and suggested weight changes

Media Manager	Segment heatmap of segment × hour × zone to price inventory, a conflict view explaining why campaign A beat campaign B, and manual pin or override with a reason

Airline Representative	Aggregated crowd profile of their own flights, partner offers ranked by fit for their passengers, and what played at their gates and why

Passenger screen	A "Why this ad?" overlay showing the crowd profile bars, the top 3 candidates with scores, and the winning rule


# Screens per role
Each role gets one main dashboard and up to three sub-pages, all sharing one design system and one live clock (the simulation time). Items marked Must are scored; Should items earn extra points.

1. Platform Admin (operator console)
• Must: Live network map of the terminal (T1/T2 floor plan, stylised SVG is fine) with every screen as a dot, coloured online / degraded / offline, and a heat overlay of passenger presence.
• Must: KPI strip: screens online %, ad plays today, impressions, revenue today (configurable currency), active campaigns, average screen latency.
• Must: Incident and bug tracker: auto-raised alerts (screen offline > 5 min, feed lag, failed creative), with severity, owner and status.
• Must: Master data management (list + create/edit forms): vendors, outlets and F&B retailers, airlines, locations (terminal, zone, gate), screens (size, orientation, zone, nearest gates).
• Should: Data feed health: AODB / AIDX / ACRIS feed status, messages per minute, last message time, adapter in use.
• Should: Performance panel: API p95 latency, playlist build time, uptime over 7 days.

2. Retailer (shop or F&B outlet)
• Must: Live dashboard for the selected outlet: impressions, scans, redemptions, conversion rate, revenue attributed, all ticking in real time.
• Must: Passenger flow near my store: footfall in the zone for the next 2 hours, derived from upcoming departures, with top destinations and nationalities ("Next 60 min: 1,240 pax, 38% international, top: DXB, LHR, SIN").
• Must: Campaign builder: pick creative, target zones/screens, audience rules (destination, domestic/international, dwell time, delay), schedule, budget; then preview on a mock screen.
• Must: Creative library: upload or reuse ad pages and templates, duplicate a past campaign in one click.
• Must: Promo codes: time-boxed codes and QR on screen that expire when the crowd moves on (for example, valid until the linked flight's boarding closes), with a share-to-family option producing a second code.
• Must: Campaign history: past campaigns with spend, impressions, redemptions, ROI, and a "run again" action.
• Should (proposed): Trigger rules: "if flight to DXB is delayed > 30 min, show 15% off at Gate 40–45 screens".
• Should (proposed): Stock-aware offers: pause a promo when the item is out of stock (mock toggle).
• Should (proposed): Budget pacing and simple A/B creative comparison.

3. Media Manager (operator ad sales and inventory)
• Must: Inventory calendar: every screen × hour, showing booked, available, and premium slots (premium = high predicted footfall).
• Must: Yield and pricing: suggested price per slot driven by predicted passenger presence; occupancy % and revenue forecast for the next 7 days.
• Must: Approval queue: creatives and campaigns awaiting review, with approve/reject and brand-safety checklist.
• Must: Advertiser overview: top advertisers by spend, campaigns running, under-delivering campaigns flagged.
• Should (proposed): Package builder: bundle screens (for example, "International departures premium pack") to sell to brands.
• Should (proposed): One-click advertiser report (PDF or shareable link).


4. Airline Representative
• Must: My flights today: list and timeline of the airline's departures at the airport with gate, status, delay, load factor.
• Must: Gate-area messaging: schedule sponsored content on screens at my gates for my boarding window, for example upgrade offers, lounge passes, destination partners.
• Must: Delay goodwill automation: when a flight is delayed past a threshold, auto-push a meal or lounge voucher co-funded with an F&B retailer to gate screens.
• Should (proposed): Co-marketing marketplace: retailers offer deals to an airline's passengers ("Airline X passengers get 10% at Café Y"), the airline accepts with one click.
• Should (proposed): Performance: impressions and redemptions among the airline's own passengers.

5. Passenger screen simulator
• Must: Full-screen view of a chosen physical screen (pick by gate or zone), rendering the current playlist in a 9:16 or 16:9 frame.
• Must: Context strip with nearby flights (FIDS-style) next to the ad.
• Must: Dynamic ad selection that visibly changes as simulation time moves and flights board, delay or depart.
• Must: Promo QR with a live countdown; scanning it with a real phone opens a mobile claim page served on the laptop's LAN address (the QR encodes the LAN IP, configurable) that records a redemption, visible immediately in the Retailer dashboard.
• Must: "Why this ad?" overlay showing the crowd profile, the top 3 candidate scores and the winning rule (see Audience matching).

# WOW features and demo script
The WOW is cause and effect across roles in under a minute: a flight event in the AODB feed changes what a passenger sees, the passenger claims a code, and money shows up on the retailer's dashboard.

# Required WOW features

• Simulation control bar (visible to all roles): play, pause, speed 1x / 10x / 60x, jump to time, and "inject event" buttons (delay flight, gate change, screen goes offline).
• Live cause-and-effect: an injected AIDX delay updates the Airline view, re-plans gate screens, triggers the retailer's delay rule and raises the passenger count in the zone, all within 2 seconds.
• Split-screen demo mode: passenger screen on the left, any role dashboard on the right.
• GenAI creative assistant (mocked offline, pluggable real provider): type a brief ("Festive sweets, 20% off, families flying domestic") and get a ready ad page in the template, in English and a second configured language.
• Smart recommendation: "Best 3 slots for this campaign tomorrow" with predicted impressions.


# Technical requirements
The app must run on a clean laptop with one command, offline, and look like a finished product.

Area	Requirement
• Stack	Open: any modern web frontend and backend framework. It must be a widely used, actively maintained open-source stack, and the submitter justifies the choice in the README
• Architecture	Separate frontend and backend; REST or GraphQL API plus WebSocket or SSE for live updates; adapter layer isolated from business logic
• Storage	Embedded or containerised database with migrations and a seed script; no paid or cloud services required
• Start	One command (docker compose up or equivalent) brings up everything on localhost
• Playground	Fully working URL of playground deployed your solution for review(only during challenge duration)
• Mock data	Generator that produces 1 day at the fictional airport, with fictional airline, brand and outlet names: ~900 flights, ~180 screens, 40 outlets, 10 airlines, 25 campaigns with 30 days of history
• Feeds	Mock AODB snapshot (CSV/JSON), AIDX XML message stream, ACRIS JSON entities, each behind an adapter interface
• AI	Pluggable provider; default mock returns template-based creatives so the demo works with no API key
• UI quality	Responsive at 1440px and 1920px; dark "control room" theme for Admin, light theme for business roles; mobile layout for the promo claim page; white-label product with a theme config (name, logo, colours) and no real airport, airline or brand marks; UI and ad content in English plus one configurable second language (i18n)
• Performance	Dashboard updates within 2 s of a feed event; 60x simulation runs without UI lag
• Docs	README, architecture diagram, adapter guide, API spec (OpenAPI or schema)

# Out of scope: real authentication, payments, real screen hardware (CMS/player), production hosting, and any per-passenger data. Targeting is aggregated by flight, zone and time window only; no boarding-pass, identity or device tracking.

# Deliverables
Source code (frontend + backend)
One-command local start (docker compose up or one equivalent command), seeded mock data included.
A README with setup, architecture, and a data adapter guide.
A fully working playground URL where the reviewer[s] will be able to review your submission deployed and pre-configured. It should be available during the challenge duration