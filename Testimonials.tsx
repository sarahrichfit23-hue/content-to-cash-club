import React from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Fitness & Nutrition Coach',
      image: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1759612482082_1dce1587.jpg',
      content: 'The monthly content packs are gold—strategic, on-brand, and nothing like the generic AI stuff out there. I finally have a system that keeps me showing up daily, and it\'s paying off. I grew my audience 3x in 30 days.',
      revenue: '$15K/month',
      growth: '3x audience growth'
    },
    {
      name: 'Jessica Chen',
      role: 'Hormone Health Specialist',
      image: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1759612525991_f1538e64.jpg',
      content: 'The hand-crafted content packs give me a starting point every month, and the AI helps me customize it to my voice. This platform took me from scattered to systemized. My engagement is through the roof and so are my sales.',
      revenue: '$22K/month',
      growth: '5x engagement'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Weight Loss Coach',
      image: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1759612552278_f9ef0a14.jpg',
      content: 'The daily challenges and AI tools save me hours every week. I\'m posting consistently for the first time ever and my income reflects it. This is the accountability I needed.',
      revenue: '$18K/month',
      growth: '10+ hours saved weekly'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Coaches Are Staying Consistent,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700 mt-2">
              Building Authority & Doubling Income
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
            Real transformations from coaches who stopped guessing and started growing with accountability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-olive-600 mb-4" />
              
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Now earning:</span>
                  <span className="font-bold text-olive-600">{testimonial.revenue}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>{testimonial.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 italic">
            "This isn't another course. This is my missing system."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
