/**
 * Footer Links & Contact Information
 * Centralized configuration for all footer content
 *
 * @type {import('../types/footer.js').FooterContent}
 */

export const footerContent = {
  brand: {
    name: 'Dikshant Yadav',
    fullName: 'Dikshant Yadav',
    taglines: [
      'Frontend Developer',
      'Creative Technologist',
      'Cybersecurity Enthusiast',
    ],
    statement: 'Frontend Developer',
    builtWith: 'Built with React, Next.js, GSAP',
  },

  navigation: [
    {
      label: 'About',
      href: '/',
    },
    {
      label: 'Works',
      href: 'https://work.dikshantyadav.in',
      external: true,
    },
    {
      label: 'Posts',
      href: 'https://post.dikshantyadav.in',
      external: true,
    },
    {
      label: 'Contact',
      href: '/connect',
    },
  ],

  contactLinks: [
    {
      label: 'hello@dikshantyadav.in',
      href: 'mailto:hello@dikshantyadav.in',
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com/dikshantyadav.in',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/dikshantyadav2006',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/dikshant-yadav',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ],

  socials: [
    {
      platform: 'Instagram',
      label: 'Instagram',
      href: 'https://instagram.com/dikshantyadav.in',
    },
    {
      platform: 'GitHub',
      label: 'GitHub',
      href: 'https://github.com/dikshantyadav2006',
    },
    {
      platform: 'LinkedIn',
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/dikshant-yadav',
    },
  ],

  legal: [
    {
      label: 'Privacy',
      href: '/privacy',
    },
    {
      label: 'Terms',
      href: '/terms',
    },
  ],

  contact: {
    phone: '+91 70818 84742',
    email: 'hello@dikshantyadav.in',
    address: 'Delhi, India',
  },
};
