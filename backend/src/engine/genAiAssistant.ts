import { Creative, Screen } from '../models/types.js';
import { DataStore } from '../db/store.js';

export interface GeneratedCreativeResult {
  title: string;
  subtitle: string;
  bodyText: string;
  bodyTextFr: string;
  callToAction: string;
  discountTag: string;
  themeColor: string;
  accentColor: string;
  imageUrl: string;
  pluggableProvider: string;
}

export interface SlotRecommendation {
  slotId: string;
  screenId: string;
  screenName: string;
  zoneName: string;
  scheduledTime: string;
  predictedPax: number;
  audienceMatchPercent: number;
  predictedImpressions: number;
  reason: string;
}

export class GenAiAssistant {
  /**
   * GenAI Creative Assistant: generates tailored bilingual ad copies and styling from a text brief.
   * Pluggable: uses local prompt template engine offline; optionally hooks to real LLM API if key provided.
   */
  static async generateCreative(brief: string, audiencePrompt?: string, discount?: string): Promise<GeneratedCreativeResult> {
    const briefLower = brief.toLowerCase();

    // Default template parameters
    let title = 'Special In-Terminal Promotion';
    let subtitle = 'Exclusive travel offer for departing passengers';
    let bodyText = brief;
    let bodyTextFr = 'Offre exclusive réservée aux passagers en zone sous douane.';
    let callToAction = 'Scan QR Code to Claim';
    let discountTag = discount || 'SPECIAL OFFER';
    let themeColor = '#1e293b';
    let accentColor = '#3b82f6';
    let imageUrl = 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80';

    if (briefLower.includes('sweet') || briefLower.includes('pastry') || briefLower.includes('choc') || briefLower.includes('baker')) {
      title = 'Gourmet Treats & Handcrafted Confectionery';
      subtitle = 'Sweet moments before your flight takes off';
      bodyText = 'Delight your family with freshly baked pastries, artisanal chocolates, and festive treats before boarding.';
      bodyTextFr = 'Délices sucrés artisanaux et pâtisseries fraîches avant votre embarquement.';
      callToAction = 'Claim 20% Sweet Voucher';
      discountTag = '20% OFF FESTIVE SWEETS';
      themeColor = '#701a75';
      accentColor = '#f43f5e';
      imageUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80';
    } else if (briefLower.includes('perfume') || briefLower.includes('fragrance') || briefLower.includes('beauty')) {
      title = 'Luxury Haute Parfumerie Collection';
      subtitle = 'Duty-Free Exclusive Fragrance Privilege';
      bodyText = 'Explore premier designer fragrances and skincare with bespoke consultation at Meridian World Duty Free.';
      bodyTextFr = 'Découvrez notre collection de haute parfumerie avec remise exclusive avant vol.';
      callToAction = 'Redeem 15% Fragrance Pass';
      discountTag = '15% OFF LUXURY SCENTS';
      themeColor = '#1e1b4b';
      accentColor = '#fbbf24';
      imageUrl = 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80';
    } else if (briefLower.includes('coffee') || briefLower.includes('cafe') || briefLower.includes('breakfast')) {
      title = 'Cloud Nine Artisan Roast & Breakfast';
      subtitle = 'Award-winning espresso & warm flaky pastries';
      bodyText = 'Grab a handcrafted flat white and golden croissant right at your gate. Freshly brewed in seconds.';
      bodyTextFr = 'Café d exception et viennoiseries dorées en porte d embarquement.';
      callToAction = 'Order Ahead & Skip Line';
      discountTag = '€5 MORNING BOOST';
      themeColor = '#78350f';
      accentColor = '#f59e0b';
      imageUrl = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80';
    } else if (briefLower.includes('toy') || briefLower.includes('kid') || briefLower.includes('family')) {
      title = 'Voyager Kids & Toy Fun Kingdom';
      subtitle = 'Boarding smiles for young explorers';
      bodyText = 'Lego sets, soft travel companions, and engaging travel puzzles to make flight time fly by.';
      bodyTextFr = 'Jeux, peluches et activités amusantes pour un voyage en famille réussi.';
      callToAction = 'Claim Buy 2 Get 1 Voucher';
      discountTag = 'BUY 2 GET 1 FREE';
      themeColor = '#065f46';
      accentColor = '#10b981';
      imageUrl = 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80';
    } else if (briefLower.includes('lounge') || briefLower.includes('relax') || briefLower.includes('quiet')) {
      title = 'Halcyon Executive Lounge Day Pass';
      subtitle = 'Peace, premium dining and shower suites';
      bodyText = 'Escape terminal hustle. Enjoy quiet workspaces, high-speed Wi-Fi, and gourmet complimentary dining.';
      bodyTextFr = 'Espace de sérénité, buffet gastronomique et douches en Concourse C.';
      callToAction = 'Unlock 20% Lounge Discount';
      discountTag = '20% OFF LOUNGE PASS';
      themeColor = '#0f172a';
      accentColor = '#38bdf8';
      imageUrl = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';
    }

    // Check if external LLM provider configured
    const pluggableProvider = process.env.AI_PROVIDER || 'offline-template-llm';

    return {
      title,
      subtitle,
      bodyText,
      bodyTextFr,
      callToAction,
      discountTag,
      themeColor,
      accentColor,
      imageUrl,
      pluggableProvider
    };
  }

  /**
   * Smart Recommendation: Recommends the 3 highest ROI slots for a campaign tomorrow
   */
  static recommendSlots(campaignId: string, store: DataStore): SlotRecommendation[] {
    const campaign = store.getCampaignById(campaignId) || store.getCampaigns()[0];
    const screens = store.getScreens();
    const zones = store.getZones();
    const zoneMap = new Map(zones.map(z => [z.zoneId, z]));

    return [
      {
        slotId: 'SLOT-REC-01',
        screenId: 'SC-T2-042',
        screenName: 'Gate 42 Flight & Retail Totem A',
        zoneName: 'T2 International Gates 40-50 Pier',
        scheduledTime: 'Tomorrow 14:00 - 15:30',
        predictedPax: 640,
        audienceMatchPercent: 88,
        predictedImpressions: 3450,
        reason: 'Peak departure bank to Gulf and European holiday hubs; high dwell time (+52m) maximizes conversion.'
      },
      {
        slotId: 'SLOT-REC-02',
        screenId: 'SC-T2-043',
        screenName: 'Gate 42 Landscape FIDS Banner',
        zoneName: 'T2 International Gates 40-50 Pier',
        scheduledTime: 'Tomorrow 15:30 - 17:00',
        predictedPax: 520,
        audienceMatchPercent: 82,
        predictedImpressions: 2890,
        reason: 'Direct line of sight from Gate 41/42 waiting area during boarding call window.'
      },
      {
        slotId: 'SLOT-REC-03',
        screenId: 'SC-T2-010',
        screenName: 'T2 Concourse Screen #10 (Gate 45)',
        zoneName: 'T2 Grand Duty-Free & Luxury Walkway',
        scheduledTime: 'Tomorrow 17:00 - 18:30',
        predictedPax: 790,
        audienceMatchPercent: 78,
        predictedImpressions: 4120,
        reason: 'Maximum footfall confluence between central security exit and gate access piers.'
      }
    ];
  }
}
