'use client';

import ProjectBento from '@/components/project/ProjectBento';
import { useAccent } from '@/components/project/AccentContext';

interface BlockBentoProps {
  story: string;
  client: string;
  year: string;
  services: string[];
  timeline: string;
  role: string;
  techStack: string[];
  results: string;
}

export default function BlockBento(props: BlockBentoProps) {
  const { accent } = useAccent();
  return <ProjectBento {...props} accentColor={accent} />;
}
