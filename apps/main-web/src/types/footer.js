/**
 * @typedef {Object} NavLink
 * @property {string} label - Link text
 * @property {string} href - Link destination
 * @property {string} [target] - Link target (_blank, _self, etc.)
 * @property {string} [rel] - Link rel attribute
 */

/**
 * @typedef {Object} SocialLink
 * @property {'instagram' | 'telegram' | 'facebook' | 'linkedin' | 'dribbble' | 'behance'} platform
 * @property {string} href - Social profile URL
 * @property {string} label - Platform display name
 */

/**
 * @typedef {Object} FooterContact
 * @property {string} phone - Phone number
 * @property {string} email - Email address
 * @property {string} address - Physical address or location text
 */

/**
 * @typedef {Object} FooterBrand
 * @property {string} name - Brand name (short)
 * @property {string} [fullName] - Full brand name
 */

/**
 * @typedef {Object} FooterContent
 * @property {FooterBrand} brand
 * @property {NavLink[]} navigation
 * @property {NavLink[]} externalLinks
 * @property {SocialLink[]} socials
 * @property {FooterContact} contact
 */

export {};
