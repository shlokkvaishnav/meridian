'use client';

import { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Reduced our P95 review time from 4.2 days to 1.1 days in just 2 weeks. The insights were spot-on.',
    author: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'TechCorp',
    metric: '67% faster reviews',
  },
  {
    quote: 'Finally, a tool that shows us what\'s actually happening with our PRs. The burnout detection saved us from losing a key engineer.',
    author: 'Marcus Rodriguez',
    role: 'VP of Engineering',
    company: 'StartupXYZ',
    metric: 'Prevented burnout',
  },
  {
    quote: 'The DORA metrics dashboard gave us the data we needed to justify hiring two more engineers. ROI was clear.',
    author: 'Alex Kim',
    role: 'CTO',
    company: 'ScaleUp Inc',
    metric: '41% cycle time reduction',
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <div className="relative">
      <div className="glass-card noise p-8 md:p-12 relative overflow-hidden">
        <Quote className="absolute top-6 left-6 h-8 w-8 text-violet-500/20" />
        
        <div className="relative z-10">
          <p className="text-lg md:text-xl text-slate-200 mb-6 leading-relaxed max-w-3xl">
            "{current.quote}"
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white mb-1">{current.author}</div>
              <div className="text-sm text-slate-400">
                {current.role} at {current.company}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-medium text-emerald-400">{current.metric}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="h-8 w-8 border border-white/[0.06] hover:bg-white/[0.05]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-8 w-8 border border-white/[0.06] hover:bg-white/[0.05]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-violet-500'
                : 'w-2 bg-white/[0.2] hover:bg-white/[0.3]'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
