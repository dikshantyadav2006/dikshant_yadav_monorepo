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
  },

  navigation: [
    {
      label: 'About Me',
      href: 'about',
    },
    {
      label: 'Works',
      href: 'https://work.dikshantyadav.in',
      external: true,
    },
    // {
    //   label: 'Contact',
    //   href: 'contact',
    // },
  ],

  externalLinks: [
    {
      label: 'GitHub',
      href: 'https://github.com/dikshantyadav2006',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    // {
    //   label: 'LinkedIn',
    //   href: 'https://linkedin.com/in/dikshant-yadav',
    //   target: '_blank',
    //   rel: 'noopener noreferrer',
    // },
    // {
    //   label: 'Resume',
    //   href: '/resume.pdf',
    //   target: '_blank',
    //   rel: 'noopener noreferrer',
    // },
  ],

  socials: [
    {
      platform: 'Instagram',
      label: 'Instagram',
      href: 'https://instagram.com/dikshantyadav.in',
    },
    // {
    //   platform: 'X',
    //   label: 'X / Twitter',
    //   href: 'https://x.com/dikshantyadav',
    // },
    {
      platform: 'GitHub',
      label: 'GitHub',
      href: 'https://github.com/dikshantyadav2006',
    },
    // {
    //   platform: 'LinkedIn',
    //   label: 'LinkedIn',
    //   href: 'https://linkedin.com/in/dikshant',
    // },
  ],

  contact: {
    phone: '+91 70818 84742',
    email: 'hello@dikshantyadav.in',
    address: 'Delhi, India',
  },
};
