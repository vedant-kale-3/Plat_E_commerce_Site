import {
  Droplets,
  Sun,
  Thermometer,
  Flower2,
  type LucideIcon,
} from 'lucide-react';

export interface CareBasic {
  icon: LucideIcon;
  title: string;
  tips: string[];
}

export const careBasics: CareBasic[] = [
  {
    icon: Droplets,
    title: 'Watering',
    tips: [
      'Water when the top 1–2 inches of soil feel dry to the touch.',
      'Water thoroughly until it drains from the bottom, then empty the saucer.',
      'Reduce watering in winter when growth slows down.',
      'Lukewarm water is best — cold water can shock the roots.',
    ],
  },
  {
    icon: Sun,
    title: 'Light',
    tips: [
      'Bright, indirect light suits most houseplants — near an east or west window.',
      'Low-light plants tolerate north-facing rooms but grow slower.',
      'Rotate pots a quarter turn weekly for even, upright growth.',
      'Leggy stems reaching for the window mean the plant needs more light.',
    ],
  },
  {
    icon: Thermometer,
    title: 'Humidity & Temperature',
    tips: [
      'Most tropical plants love 50–60% humidity — group plants or use a pebble tray.',
      'Keep room temperatures between 18–27°C for healthy growth.',
      'Avoid draughty windows, radiators, and air-conditioning vents.',
      'Misting helps, but a small humidifier works far better in dry homes.',
    ],
  },
  {
    icon: Flower2,
    title: 'Soil & Repotting',
    tips: [
      'Use a well-draining potting mix — add perlite for extra aeration.',
      'Repot every 1–2 years, or when roots circle the pot or grow out the drain hole.',
      'Choose a pot only 2–5 cm wider than the current one — too big stays soggy.',
      'Refresh the top layer of soil annually to replenish nutrients.',
    ],
  },
];

export interface TroubleshootIssue {
  symptom: string;
  cause: string;
  fix: string[];
}

export const troubleshooting: TroubleshootIssue[] = [
  {
    symptom: 'Yellow leaves',
    cause: 'Most often overwatering. The roots sit in soggy soil and can\'t breathe, so the oldest leaves yellow and drop.',
    fix: [
      'Let the top 2 inches of soil dry before the next watering.',
      'Check that the pot has a drainage hole and empty the saucer.',
      'If the soil smells sour, repot into fresh, well-draining mix.',
    ],
  },
  {
    symptom: 'Brown, crispy leaf tips',
    cause: 'Low humidity or underwatering. The leaf margins dry out and turn brown and papery.',
    fix: [
      'Raise humidity with a pebble tray or small humidifier nearby.',
      'Water consistently — don\'t let the plant wilt between waterings.',
      'Trim the brown tips with clean scissors; they won\'t recover.',
    ],
  },
  {
    symptom: 'Drooping or wilting',
    cause: 'Either severe thirst or root rot from chronic overwatering. Check the soil to tell them apart.',
    fix: [
      'If the soil is bone dry, give a thorough soak and let it drain.',
      'If the soil is wet and smelly, remove the plant and trim black roots.',
      'Repot into fresh dry mix and hold off watering for a week.',
    ],
  },
  {
    symptom: 'Pests (spider mites & mealybugs)',
    cause: 'Dry, stagnant air invites sap-sucking pests that leave fine webbing or cottony clusters.',
    fix: [
      'Wipe leaves with a damp cloth to remove pests and webbing.',
      'Spray with insecticidal soap or a neem oil solution weekly.',
      'Isolate the affected plant so pests don\'t spread to others.',
    ],
  },
  {
    symptom: 'Slow or no new growth',
    cause: 'Usually insufficient light, root-bound conditions, or a lack of nutrients during the growing season.',
    fix: [
      'Move the plant to a brighter spot, away from direct sun.',
      'Check the roots — if circling tightly, it\'s time to repot.',
      'Feed with a balanced liquid fertiliser monthly in spring and summer.',
    ],
  },
];

export interface SeasonalGuide {
  season: string;
  icon: LucideIcon;
  accent: string;
  checklist: string[];
  tip: string;
}

export const seasonalGuide: SeasonalGuide[] = [
  {
    season: 'Spring',
    icon: Flower2,
    accent: 'bg-forest-500',
    checklist: [
      'Begin monthly feeding with a balanced fertiliser.',
      'Repot plants that have outgrown their containers.',
      'Prune leggy winter growth to encourage bushy new shoots.',
      'Check for pests as warmth returns and new growth appears.',
    ],
    tip: 'Spring is the best time to propagate — cuttings root fastest now.',
  },
  {
    season: 'Summer',
    icon: Sun,
    accent: 'bg-amber-500',
    checklist: [
      'Water more frequently as heat and growth increase.',
      'Keep humidity up on hot, dry days with misting or a humidifier.',
      'Watch for sunburn on leaves near south-facing windows.',
      'Move plants outdoors only if acclimated to direct sun gradually.',
    ],
    tip: 'Rotate pots weekly so all sides get even light during peak growth.',
  },
  {
    season: 'Fall',
    icon: Flower2,
    accent: 'bg-orange-600',
    checklist: [
      'Reduce watering as growth slows and days shorten.',
      'Stop fertilising by late autumn to let plants rest.',
      'Clean windows and wipe leaves to maximise weaker light.',
      'Move tender plants away from cold draughty windows.',
    ],
    tip: 'Take cuttings before winter — they root slower but still take.',
  },
  {
    season: 'Winter',
    icon: Thermometer,
    accent: 'bg-sky-600',
    checklist: [
      'Water sparingly — most plants need half their summer amount.',
      'Keep plants away from heaters and cold draughts alike.',
      'Hold off on repotting until spring growth resumes.',
      'Add a grow light for plants struggling with short days.',
    ],
    tip: 'A cheap LED grow light for 8 hours a day can save a winter-weary plant.',
  },
];
