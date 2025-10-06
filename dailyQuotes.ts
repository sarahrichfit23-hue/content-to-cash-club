export const DAILY_QUOTES = [
  "Your content today could change someone's life tomorrow.",
  "Consistency beats perfection every single time.",
  "The best time to start was yesterday. The next best time is now.",
  "Your voice matters. Your story matters. Share it boldly.",
  "Small daily improvements lead to stunning long-term results.",
  "Don't wait for inspiration. Create it through action.",
  "Every expert was once a beginner who refused to quit.",
  "Your audience is waiting for the real, authentic you.",
  "Progress over perfection. Always.",
  "The content you create today builds the empire of tomorrow.",
  "Doubt kills more dreams than failure ever will.",
  "You don't need to be great to start, but you need to start to be great.",
  "Your message has the power to transform lives. Don't hold back.",
  "Comparison is the thief of joy. Focus on your own journey.",
  "The world needs your unique perspective. Show up and share it.",
  "Discipline is choosing what you want most over what you want now.",
  "Your consistency will inspire others more than your perfection ever could.",
  "Every post is a seed. Keep planting, keep growing.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Be so good they can't ignore you.",
  "Your content is your legacy. Make it count.",
  "The only way to do great work is to love what you do.",
  "Don't be afraid to give up the good to go for the great.",
  "Your potential is endless. Your impact is limitless.",
  "The difference between who you are and who you want to be is what you do.",
  "Create content that adds value, not just noise.",
  "Your breakthrough is on the other side of consistency.",
  "Show up today. Your future self will thank you.",
  "Excellence is not a destination; it's a continuous journey.",
  "The only impossible journey is the one you never begin."
];

export function getTodaysQuote(): string {
  const dayOfMonth = new Date().getDate();
  return DAILY_QUOTES[(dayOfMonth - 1) % DAILY_QUOTES.length];
}
