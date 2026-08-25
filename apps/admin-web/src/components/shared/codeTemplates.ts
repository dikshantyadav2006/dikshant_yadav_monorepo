export interface CodeTemplate {
  id: string;
  name: string;
  category: 'ui' | 'business' | 'portfolio';
  runtime: 'react' | 'html';
  description: string;
  code: string;
  config?: {
    name: string;
    description?: string;
    props?: Record<string, string>;
  };
}

export const codeTemplates: CodeTemplate[] = [
  // ── UI Templates ──────────────────────────────────────────
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'ui',
    runtime: 'react',
    description: 'Full-width hero with animated title, subtitle, and CTA button.',
    config: {
      name: 'Hero',
      props: { title: 'string', subtitle: 'string', ctaText: 'string' },
    },
    code: `import { motion } from "framer-motion";

export const config = {
  name: "Hero",
  props: {
    title: "string",
    subtitle: "string",
    ctaText: "string",
  },
};

export default function Hero({ title, subtitle, ctaText }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[500px] px-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold tracking-tight mb-6"
      >
        {title || "Welcome"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-xl text-muted-foreground max-w-2xl mb-8"
      >
        {subtitle || "Build something amazing today."}
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
      >
        {ctaText || "Get Started"}
      </motion.button>
    </section>
  );
}`,
  },
  {
    id: 'pricing-grid',
    name: 'Pricing Grid',
    category: 'ui',
    runtime: 'react',
    description: '3-column pricing cards with highlighted option.',
    config: {
      name: 'PricingGrid',
      props: { title: 'string' },
    },
    code: `import { motion } from "framer-motion";

export const config = {
  name: "PricingGrid",
  props: { title: "string" },
};

const plans = [
  { name: "Starter", price: "$9", period: "/mo", features: ["5 projects", "10GB storage", "Email support"] },
  { name: "Pro", price: "$29", period: "/mo", features: ["Unlimited projects", "100GB storage", "Priority support", "Analytics"], highlighted: true },
  { name: "Enterprise", price: "$99", period: "/mo", features: ["Everything in Pro", "Custom domain", "SSO", "Dedicated manager"] },
];

export default function PricingGrid({ title }) {
  return (
    <section className="py-16 px-8">
      <h2 className="text-3xl font-bold text-center mb-12">{title || "Simple Pricing"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={\`rounded-2xl p-8 border \${plan.highlighted ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card"}\`}
          >
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="flex items-baseline gap-1 my-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={\`w-full py-2.5 rounded-lg font-semibold text-sm transition \${plan.highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}\`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}`,
  },
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion',
    category: 'ui',
    runtime: 'react',
    description: 'Interactive accordion with open/close state.',
    config: {
      name: 'FAQ',
      props: { title: 'string' },
    },
    code: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const config = {
  name: "FAQ",
  props: { title: "string" },
};

const faqs = [
  { q: "How do I get started?", a: "Simply sign up and follow the onboarding steps. It takes less than 5 minutes." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time with no penalties." },
  { q: "Is there a free trial?", a: "We offer a 14-day free trial with full access to all features." },
  { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee if you're not satisfied." },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex justify-between items-center p-5 text-left font-semibold">
        {item.q}
        <span className={\`text-xl transition-transform \${isOpen ? "rotate-45" : ""}\`}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ title }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="py-16 px-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">{title || "Frequently Asked Questions"}</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} item={faq} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
        ))}
      </div>
    </section>
  );
}`,
  },
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    category: 'ui',
    runtime: 'react',
    description: 'Full-width gradient call-to-action banner.',
    config: {
      name: 'CTABanner',
      props: { title: 'string', subtitle: 'string', buttonText: 'string' },
    },
    code: `import { motion } from "framer-motion";

export const config = {
  name: "CTABanner",
  props: { title: "string", subtitle: "string", buttonText: "string" },
};

export default function CTABanner({ title, subtitle, buttonText }) {
  return (
    <section className="relative overflow-hidden rounded-2xl mx-8 my-8">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90" />
      <div className="relative z-10 py-16 px-12 text-center text-primary-foreground">
        <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-4">
          {title || "Ready to Get Started?"}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
          {subtitle || "Join thousands of users building the future."}
        </motion.p>
        <motion.button initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition">
          {buttonText || "Start Free Trial"}
        </motion.button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    category: 'ui',
    runtime: 'react',
    description: '3x2 grid with lucide-react icons.',
    config: {
      name: 'FeatureGrid',
      props: { title: 'string' },
    },
    code: `import { Zap, Shield, Globe, Layers, Code, Users } from "lucide-react";
import { motion } from "framer-motion";

export const config = {
  name: "FeatureGrid",
  props: { title: "string" },
};

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed at every level." },
  { icon: Shield, title: "Secure by Default", desc: "Enterprise-grade security built in." },
  { icon: Globe, title: "Global CDN", desc: "Deployed across 200+ edge locations." },
  { icon: Layers, title: "Scalable", desc: "Grows with your business seamlessly." },
  { icon: Code, title: "Developer First", desc: "Built by developers, for developers." },
  { icon: Users, title: "Team Collaboration", desc: "Real-time collaboration tools included." },
];

export default function FeatureGrid({ title }) {
  return (
    <section className="py-16 px-8">
      <h2 className="text-3xl font-bold text-center mb-12">{title || "Why Choose Us"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}`,
  },
  {
    id: 'testimonial-carousel',
    name: 'Testimonial Carousel',
    category: 'ui',
    runtime: 'react',
    description: 'Auto-rotating testimonial cards.',
    config: {
      name: 'Testimonials',
      props: { title: 'string' },
    },
    code: `import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const config = {
  name: "Testimonials",
  props: { title: "string" },
};

const testimonials = [
  { name: "Sarah Chen", role: "CTO, TechCorp", text: "This platform transformed how we build products. Absolutely incredible." },
  { name: "Marcus Johnson", role: "Founder, StartupXYZ", text: "The best investment we made this year. Our team productivity doubled." },
  { name: "Elena Rodriguez", role: "Design Lead, CreativeCo", text: "Beautiful, fast, and reliable. Everything we needed in one tool." },
];

export default function Testimonials({ title }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 px-8 text-center">
      <h2 className="text-3xl font-bold mb-12">{title || "What People Say"}</h2>
      <div className="max-w-2xl mx-auto relative h-48">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0">
            <p className="text-lg italic text-muted-foreground mb-6">"{testimonials[current].text}"</p>
            <div className="font-bold">{testimonials[current].name}</div>
            <div className="text-sm text-muted-foreground">{testimonials[current].role}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={\`w-2 h-2 rounded-full transition \${i === current ? "bg-primary" : "bg-muted-foreground/30"}\`} />
        ))}
      </div>
    </section>
  );
}`,
  },

  // ── Business Templates ──────────────────────────────────────
  {
    id: 'work-showcase',
    name: 'Work Showcase',
    category: 'business',
    runtime: 'react',
    description: 'Project hero with image grid and description.',
    config: {
      name: 'WorkShowcase',
      props: { title: 'string', description: 'string' },
    },
    code: `import { motion } from "framer-motion";

export const config = {
  name: "WorkShowcase",
  props: { title: "string", description: "string" },
};

export default function WorkShowcase({ title, description }) {
  return (
    <section className="py-12 px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-4xl font-bold mb-4">{title || "Project Name"}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl">{description || "A brief description of this amazing project and what was accomplished."}</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">Hero Image</div>
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">Image 1</div>
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">Image 2</div>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'case-study',
    name: 'Case Study Layout',
    category: 'business',
    runtime: 'react',
    description: 'Problem → Solution → Results timeline.',
    config: {
      name: 'CaseStudy',
      props: { title: 'string' },
    },
    code: `import { motion } from "framer-motion";

export const config = {
  name: "CaseStudy",
  props: { title: "string" },
};

const steps = [
  { label: "Problem", text: "The client needed to modernize their legacy system while maintaining zero downtime." },
  { label: "Solution", text: "We designed a microservices architecture with gradual migration and feature flags." },
  { label: "Results", text: "99.9% uptime, 3x faster response times, and 60% reduction in infrastructure costs." },
];

export default function CaseStudy({ title }) {
  return (
    <section className="py-16 px-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-16">{title || "Case Study"}</h2>
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div key={step.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="relative pl-20">
              <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background" />
              <h3 className="text-xl font-bold mb-2">{step.label}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'business',
    runtime: 'react',
    description: 'Feature highlights with CTA and metrics.',
    config: {
      name: 'ProductLaunch',
      props: { title: 'string', subtitle: 'string' },
    },
    code: `import { motion } from "framer-motion";
import { Zap, BarChart, Globe } from "lucide-react";

export const config = {
  name: "ProductLaunch",
  props: { title: "string", subtitle: "string" },
};

const metrics = [
  { icon: Zap, value: "10x", label: "Faster" },
  { icon: BarChart, value: "99.9%", label: "Uptime" },
  { icon: Globe, value: "50+", label: "Countries" },
];

export default function ProductLaunch({ title, subtitle }) {
  return (
    <section className="py-20 px-8 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-6">NEW</span>
        <h1 className="text-5xl font-bold mb-6">{title || "Introducing v2.0"}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{subtitle || "The next generation of our platform is here."}</p>
        <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition">Learn More</button>
      </motion.div>
      <div className="flex justify-center gap-12 mt-16">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
            <m.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{m.value}</div>
            <div className="text-sm text-muted-foreground">{m.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}`,
  },
  {
    id: 'announcement-banner',
    name: 'Announcement Banner',
    category: 'business',
    runtime: 'react',
    description: 'Eye-catching banner with dismiss and link.',
    config: {
      name: 'AnnouncementBanner',
      props: { title: 'string', link: 'string' },
    },
    code: `import { useState } from "react";
import { X } from "lucide-react";

export const config = {
  name: "AnnouncementBanner",
  props: { title: "string", link: "string" },
};

export default function AnnouncementBanner({ title, link }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-center gap-4 relative">
      <p className="text-sm font-medium">
        {title || "🎉 New feature released! Check it out."}
      </p>
      {link && (
        <a href={link} className="text-sm font-bold underline underline-offset-2 hover:opacity-80 transition">
          Learn more →
        </a>
      )}
      <button onClick={() => setVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}`,
  },

  // ── Portfolio Templates ──────────────────────────────────────
  {
    id: 'portfolio-hero',
    name: 'Portfolio Hero',
    category: 'portfolio',
    runtime: 'react',
    description: 'Large title with subtitle and scroll indicator.',
    config: {
      name: 'PortfolioHero',
      props: { title: 'string', subtitle: 'string' },
    },
    code: `import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const config = {
  name: "PortfolioHero",
  props: { title: "string", subtitle: "string" },
};

export default function PortfolioHero({ title, subtitle }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[600px] px-8 text-center">
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
        {title || "Creative Developer"}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground max-w-xl">
        {subtitle || "Building digital experiences that matter."}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-12">
        <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
}`,
  },
  {
    id: 'blog-hero',
    name: 'Blog Hero',
    category: 'portfolio',
    runtime: 'react',
    description: 'Article header with author, date, and reading time.',
    config: {
      name: 'BlogHero',
      props: { title: 'string', subtitle: 'string' },
    },
    code: `import { Calendar, Clock, User } from "lucide-react";

export const config = {
  name: "BlogHero",
  props: { title: "string", subtitle: "string" },
};

export default function BlogHero({ title, subtitle }) {
  return (
    <header className="py-16 px-8 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{title || "My Latest Article"}</h1>
      <p className="text-lg text-muted-foreground mb-8">{subtitle || "A deep dive into modern web development."}</p>
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Author</span>
        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Aug 25, 2026</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 5 min read</span>
      </div>
    </header>
  );
}`,
  },
  {
    id: 'html-landing',
    name: 'HTML Landing Page',
    category: 'portfolio',
    runtime: 'html',
    description: 'Multi-section standalone landing page.',
    code: `<div class="min-h-screen">
  <nav class="flex items-center justify-between px-8 py-4 border-b border-border">
    <span class="font-bold text-lg">Brand</span>
    <div class="flex gap-6 text-sm text-muted-foreground">
      <a href="#" class="hover:text-foreground transition">Features</a>
      <a href="#" class="hover:text-foreground transition">Pricing</a>
      <a href="#" class="hover:text-foreground transition">About</a>
    </div>
  </nav>

  <section class="flex flex-col items-center justify-center py-32 px-8 text-center">
    <h1 class="text-5xl font-bold mb-6">Build Something Amazing</h1>
    <p class="text-xl text-muted-foreground max-w-2xl mb-8">The all-in-one platform for modern teams. Ship faster, scale easier.</p>
    <div class="flex gap-4">
      <button class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Get Started</button>
      <button class="px-8 py-3 border border-border rounded-lg hover:bg-muted transition">Learn More</button>
    </div>
  </section>

  <section class="py-20 px-8 bg-muted/30">
    <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
    <div class="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div class="p-6 rounded-xl border border-border bg-card">
        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-600 font-bold">⚡</div>
        <h3 class="font-bold mb-2">Fast</h3>
        <p class="text-sm text-muted-foreground">Lightning-fast performance out of the box.</p>
      </div>
      <div class="p-6 rounded-xl border border-border bg-card">
        <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4 text-green-600 font-bold">🔒</div>
        <h3 class="font-bold mb-2">Secure</h3>
        <p class="text-sm text-muted-foreground">Enterprise-grade security by default.</p>
      </div>
      <div class="p-6 rounded-xl border border-border bg-card">
        <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-purple-600 font-bold">📱</div>
        <h3 class="font-bold mb-2">Responsive</h3>
        <p class="text-sm text-muted-foreground">Works perfectly on every device.</p>
      </div>
    </div>
  </section>

  <footer class="py-8 px-8 border-t border-border text-center text-sm text-muted-foreground">
    &copy; 2026 Brand. All rights reserved.
  </footer>
</div>`,
  },
  {
    id: 'html-email',
    name: 'HTML Email Template',
    category: 'portfolio',
    runtime: 'html',
    description: 'Table-based email layout.',
    code: `<div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome Aboard!</h1>
    <p style="color: rgba(255,255,255,0.85); margin-top: 12px;">We're excited to have you.</p>
  </div>
  <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="color: #374151; line-height: 1.6;">Hi there,</p>
    <p style="color: #374151; line-height: 1.6;">Thank you for signing up. Here's what you can do next:</p>
    <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
      <li>Complete your profile</li>
      <li>Explore the dashboard</li>
      <li>Connect your team</li>
    </ul>
    <div style="text-align: center; margin: 24px 0;">
      <a href="#" style="display: inline-block; padding: 12px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Dashboard</a>
    </div>
    <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px;">If you didn't create this account, ignore this email.</p>
  </div>
</div>`,
  },
];
