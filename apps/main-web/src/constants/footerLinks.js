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
    // {
    //   label: 'Services',
    //   href: 'services',
    // },
    {
      label: 'Works',
      href: 'works', // FOR WORKS PAGE I HAVE NEW WEBSITE https://work.dikshantyadav.in/
    },
  ],

  externalLinks: [
    {
      label: 'Dribbble',
      href: 'https://dribbble.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      label: 'Behance',
      href: 'https://behance.net',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ],

  socials: [
    {
      platform: 'instagram',
      href: 'https://instagram.com/dikshantyadav.in',
      label: 'Instagram',
    },
    {
      platform: 'telegram',
      href: 'https://telegram.com',
      label: 'Telegram',
    },
    {
      platform: 'facebook',
      href: 'https://facebook.com',
      label: 'Facebook',
    },
  ],

  contact: {
    phone: '+91 70818 84742',
    email: 'hello@dikshantyadav.in',
    address: 'Based in Delhi, India',
  },
};
