'use client';

import { useEffect, useState } from 'react';
import {
  Instagram,
  Linkedin,
  Github,
  Twitter,
  Mail,
  Phone,
  Globe,
  ExternalLink,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  email: Mail,
  phone: Phone,
};

interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/social-links`)
      .then((res) => res.json())
      .then((data) => setLinks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (links.length === 0) return null;

  return (
    <ul className="space-y-2 text-sm">
      {links.map((link, i) => {
        const Icon = iconMap[link.platform?.toLowerCase()] || Globe;
        return (
          <li key={i}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline underline-offset-4"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{link.label}</span>
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/60" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
