import React from 'react';
import ReactDOM from 'react-dom';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Button,
  TextSwap,
  ContentRenderer,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  GalleryBlock,
  QuoteBlock,
  DividerBlock,
  CodeBlock,
  EmbedBlock,
  QuestionBlock,
  PollBlock,
  ButtonBlock,
  AIBlock,
  DomainNetwork,
  defaultDomains,
} from '@dikshant/ui';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export const importMap: Record<string, any> = {
  'react': React,
  'react/jsx-runtime': React,
  'react/jsx-dev-runtime': React,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOM,

  '@dikshant/ui': {
    Button,
    TextSwap,
    ContentRenderer,
    HeadingBlock,
    TextBlock,
    ImageBlock,
    VideoBlock,
    GalleryBlock,
    QuoteBlock,
    DividerBlock,
    CodeBlock,
    EmbedBlock,
    QuestionBlock,
    PollBlock,
    ButtonBlock,
    AIBlock,
    DomainNetwork,
    defaultDomains,
  },

  'framer-motion': {
    motion,
    AnimatePresence,
    useAnimation,
    useInView,
    useMotionValue,
    useTransform,
    useSpring,
  },

  'lucide-react': LucideIcons,

  'clsx': { default: clsx },
  'class-variance-authority': { cva },
  'tailwind-merge': { twMerge },
};

export const categorizedImports = {
  react: {
    'react': [
      'useState', 'useEffect', 'useRef', 'useCallback',
      'useMemo', 'useContext', 'createContext', 'memo', 'forwardRef',
    ],
    'react-dom/client': ['createRoot'],
  },
  ui: {
    '@dikshant/ui': [
      'Button', 'TextSwap', 'ContentRenderer',
      'HeadingBlock', 'TextBlock', 'ImageBlock', 'VideoBlock',
      'GalleryBlock', 'QuoteBlock', 'DividerBlock', 'CodeBlock',
      'EmbedBlock', 'QuestionBlock', 'PollBlock', 'ButtonBlock',
      'AIBlock', 'DomainNetwork', 'defaultDomains',
    ],
  },
  motion: {
    'framer-motion': [
      'motion', 'AnimatePresence', 'useAnimation', 'useInView',
      'useMotionValue', 'useTransform', 'useSpring',
    ],
  },
  icons: {
    'lucide-react': [
      'ArrowRight', 'Check', 'ChevronDown', 'ChevronUp', 'X',
      'Plus', 'Minus', 'Search', 'Menu', 'Star', 'Heart',
      'ExternalLink', 'Mail', 'Phone', 'MapPin', 'Calendar',
      'Clock', 'Users', 'Zap', 'Shield', 'Globe', 'Code',
      'Database', 'Layers', 'Monitor', 'Smartphone', 'Settings',
      'Play', 'Pause',
    ],
  },
};
