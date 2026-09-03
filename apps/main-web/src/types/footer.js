/**
 * @typedef {Object} NavLink
 * @property {string} label - Link text
 * @property {string} href - Link destination
 * @property {string} [target] - Link target (_blank, _self, etc.)
 * @property {string} [rel] - Link rel attribute
 * @property {boolean} [external] - Whether the link opens an external destination
 */

/**
 * @typedef {Object} SocialLink
 * @property {'instagram' | 'telegram' | 'facebook' | 'linkedin' | 'dribbble' | 'behance' | 'github'} platform
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
 * @property {string[]} [taglines] - Role / focus taglines
 * @property {string} [statement] - Large statement text
 * @property {string} [builtWith] - Tech stack line
 */

/**
 * @typedef {Object} FooterContent
 * @property {FooterBrand} brand
 * @property {NavLink[]} navigation
 * @property {NavLink[]} contactLinks - Email + social contact links
 * @property {SocialLink[]} socials
 * @property {NavLink[]} legal - Legal links (privacy, terms)
 * @property {FooterContact} contact
 */

export {};
