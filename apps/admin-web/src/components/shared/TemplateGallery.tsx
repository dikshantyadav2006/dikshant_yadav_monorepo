'use client';

import React, { useState } from 'react';
import {
  Search,
  Layout,
  DollarSign,
  HelpCircle,
  Quote,
  Clock,
  Grid3X3,
  Image,
  Megaphone,
  Briefcase,
  FileText,
  Globe,
  Mail,
  Sparkles,
} from 'lucide-react';
import { codeTemplates, type CodeTemplate } from './codeTemplates';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ui: <Layout className="w-3 h-3" />,
  business: <Briefcase className="w-3 h-3" />,
  portfolio: <Image className="w-3 h-3" />,
};

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'hero-section': <Sparkles className="w-5 h-5 text-indigo-400" />,
  'pricing-grid': <DollarSign className="w-5 h-5 text-green-400" />,
  'faq-accordion': <HelpCircle className="w-5 h-5 text-amber-400" />,
  'testimonial-carousel': <Quote className="w-5 h-5 text-pink-400" />,
  'cta-banner': <Megaphone className="w-5 h-5 text-rose-400" />,
  'feature-grid': <Grid3X3 className="w-5 h-5 text-cyan-400" />,
  'work-showcase': <Image className="w-5 h-5 text-violet-400" />,
  'case-study': <FileText className="w-5 h-5 text-blue-400" />,
  'product-launch': <Sparkles className="w-5 h-5 text-orange-400" />,
  'announcement-banner': <Megaphone className="w-5 h-5 text-red-400" />,
  'portfolio-hero': <Image className="w-5 h-5 text-purple-400" />,
  'blog-hero': <FileText className="w-5 h-5 text-teal-400" />,
  'html-landing': <Globe className="w-5 h-5 text-sky-400" />,
  'html-email': <Mail className="w-5 h-5 text-emerald-400" />,
};

interface TemplateGalleryProps {
  onSelect: (template: CodeTemplate) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = codeTemplates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ui', 'business', 'portfolio'];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border/40">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-2 py-1 text-[10px] font-semibold rounded-md transition ${
            !activeCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition capitalize ${
              activeCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {CATEGORY_ICONS[cat]}
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="w-full text-left rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:bg-muted/20 transition group overflow-hidden"
          >
            {/* Mini Preview */}
            <div className="h-20 bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center border-b border-border/20 group-hover:from-primary/5 group-hover:to-primary/10 transition">
              <div className="opacity-40 group-hover:opacity-70 transition">
                {TEMPLATE_ICONS[template.id] || <Layout className="w-5 h-5" />}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition">
                  {template.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    {template.category}
                  </span>
                  <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    {template.runtime}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                {template.description}
              </p>
              {template.config?.props && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {Object.keys(template.config.props).map((key) => (
                    <span
                      key={key}
                      className="text-[8px] font-mono text-primary/70 bg-primary/5 px-1 py-0.5 rounded"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-5 h-5 mb-2 opacity-40" />
            <span className="text-xs">No templates found</span>
          </div>
        )}
      </div>
    </div>
  );
}
