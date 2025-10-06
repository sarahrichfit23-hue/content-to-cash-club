import { ContentPack } from '@/types';

export const seedPack: ContentPack = {
  month: '2025-10',
  theme: 'Holiday Prep & Habit Reboot',
  releaseDate: new Date('2025-10-01'),
  assets: [
    {
      id: 'r1',
      type: 'reel',
      title: 'Stop-Start Hook',
      baseContent: 'Stop thinking January is your fresh start. Start building momentum NOW while everyone else is checked out. Your future self will thank you.',
    },
    {
      id: 'r2',
      type: 'reel',
      title: 'Pattern Interrupt',
      baseContent: 'The scale went up 2lbs overnight? Good. That means your muscles are holding water from actually training. Progress isn\'t always down.',
    },
    {
      id: 'r3',
      type: 'reel',
      title: 'Truth Bomb',
      baseContent: 'Your morning routine doesn\'t need to be 2 hours. 15 minutes of intentional movement beats scrolling Instagram in bed every time.',
    },
    {
      id: 'car1',
      type: 'carousel',
      title: '7 Holiday Survival Tactics',
      baseContent: 'Slide 1: Holiday Survival Guide\nSlide 2: Eat protein first at parties\nSlide 3: Bring a healthy dish to share\nSlide 4: Schedule workouts like meetings\nSlide 5: Set boundaries with food pushers\nSlide 6: Track wins, not weight\nSlide 7: DM "SURVIVE" for my guide',
    },
    {
      id: 'cap1',
      type: 'caption',
      title: 'Vulnerability Post',
      baseContent: 'I used to hide during the holidays. Oversized sweaters, avoiding photos, making excuses. Now? I show up fully—for myself first. Your transformation isn\'t about the weight you lose. It\'s about the life you gain back.',
    },
    {
      id: 'e1',
      type: 'email',
      title: 'Quick Win Email',
      baseContent: 'Subject: The 10-minute trick that changed everything\n\nI was exhausted, overwhelmed, and convinced I needed 2 hours to work out. Then I tried this: 10 minutes. Every morning. Non-negotiable. The result? Down 15lbs in 8 weeks. Not from the 10 minutes of exercise. From the identity shift. I became someone who shows up.',
    },
    {
      id: 'dm1',
      type: 'dm',
      title: 'New Follower Sequence',
      baseContent: 'Message 1: Hey! Saw you followed—are you working on any health goals right now?\n\nMessage 2: No pressure, but I have a free guide that\'s helped 100+ women get started. Want me to send it?\n\nMessage 3: Awesome! Here\'s the link [LINK]. Let me know if you have questions!',
    },
    {
      id: 'sw1',
      type: 'swipe',
      title: 'Power DM Opener',
      baseContent: 'I noticed you\'ve been liking my posts about [SPECIFIC TOPIC]. Are you dealing with [SPECIFIC STRUGGLE] too?',
    }
  ]
};
