import type { UserRole, Lawmaker } from './supabase'

export interface EmailTemplate {
  subject: string
  body: string
}

/**
 * Extracts the last name from a full name, handling common suffixes
 * @param fullName - The full name of the lawmaker
 * @returns The last name
 */
function getLastName(fullName: string): string {
  const parts = fullName.trim().split(' ')

  if (parts.length === 0) {
    return 'Representative' // Fallback
  }

  if (parts.length === 1) {
    return parts[0]
  }

  // Remove common suffixes (Jr., Sr., III, etc.)
  const suffixes = ['Jr.', 'Sr.', 'III', 'II', 'IV', 'V', 'Jr', 'Sr']
  const lastPart = parts[parts.length - 1]

  if (suffixes.includes(lastPart)) {
    // Return second-to-last part if last part is a suffix
    return parts.length > 1 ? parts[parts.length - 2] : parts[0]
  }

  return lastPart
}

export function getEmailTemplate(
  role: UserRole,
  lawmaker: Lawmaker,
  userName?: string
): EmailTemplate {
  // Validate required fields
  if (!lawmaker.name || !lawmaker.state) {
    throw new Error('Lawmaker name and state are required for email template generation')
  }

  const honorific = lawmaker.chamber === 'senate' ? 'Senator' : 'Representative'
  const greeting = `Dear ${honorific} ${getLastName(lawmaker.name)},`

  const templates: Record<UserRole, EmailTemplate> = {
    business_owner: {
      subject: `Urgent: Protect Hemp Businesses - Oppose the 2026 Hemp Ban`,
      body: `${greeting}

I am writing as a hemp business owner in ${lawmaker.state} to urge you to oppose the federal hemp ban scheduled to take effect on November 12, 2026.

This ban will devastate our industry and destroy thousands of American jobs. Our business, like many others, operates legally and responsibly, providing safe products to consumers while contributing to our local economy.

The hemp industry supports over 100,000 jobs nationwide and generates billions in economic activity. A blanket ban ignores the legitimate uses of hemp and punishes law-abiding businesses for the actions of bad actors.

Instead of prohibition, we need:
- Clear, science-based regulations
- Enforcement against illegal products
- Support for legitimate hemp businesses

I urge you to support legislation that protects legal hemp commerce and the livelihoods of American entrepreneurs.

${userName ? `Sincerely,\n${userName}` : 'Sincerely,\nA Concerned Constituent'}`,
    },

    employee: {
      subject: `My Job is at Risk - Please Oppose the Hemp Ban`,
      body: `${greeting}

I am writing as an employee in the hemp industry in ${lawmaker.state} to ask for your help in stopping the federal hemp ban set for November 12, 2026.

My job—and the jobs of thousands of hardworking Americans—will disappear if this ban takes effect. Many of us have families to support and bills to pay. The hemp industry has provided stable employment and career opportunities in our communities.

This ban doesn't just hurt businesses; it hurts working people. We need our representatives to stand up for American workers and find solutions that protect jobs while addressing any legitimate concerns.

Please support legislation that preserves legal hemp commerce and protects American jobs.

${userName ? `Thank you,\n${userName}` : 'Thank you,\nA Concerned Constituent'}`,
    },

    consumer: {
      subject: `Protect Consumer Choice - Oppose the Hemp Ban`,
      body: `${greeting}

I am writing as a constituent in ${lawmaker.state} to express my strong opposition to the federal hemp ban scheduled for November 12, 2026.

As an adult consumer, I should have the right to make my own informed choices about legal hemp products. This ban is government overreach that treats responsible adults like children.

Hemp products have been legal and available for years. Many Americans use them safely and responsibly for various purposes. A blanket ban punishes millions of law-abiding citizens for the actions of a few bad actors.

We need smart regulation, not prohibition. Please support policies that:
- Protect consumer freedom
- Ensure product safety through testing and standards
- Target illegal operators without banning an entire industry

I urge you to stand up for personal freedom and oppose this ban.

${userName ? `Respectfully,\n${userName}` : 'Respectfully,\nA Concerned Constituent'}`,
    },

    medical_user: {
      subject: `This Ban Threatens My Health - Please Help`,
      body: `${greeting}

I am writing as someone who relies on legal hemp products for wellness purposes. The federal hemp ban scheduled for November 12, 2026, will take away products that have genuinely helped me.

Many Americans like me have found relief through legal hemp products when other options have failed or caused unwanted side effects. We are not criminals—we are people seeking natural alternatives for our health and well-being.

This ban will force people back to pharmaceuticals that may not work as well, cost more, or cause adverse effects. It ignores the experiences of thousands who have benefited from hemp products.

Please support legislation that:
- Allows continued access to legal hemp products
- Implements safety standards and testing
- Respects the choices of adults seeking natural wellness options

This is about more than business—it's about people's health and quality of life.

${userName ? `Sincerely,\n${userName}` : 'Sincerely,\nA Concerned Constituent'}`,
    },

    veteran: {
      subject: `Veteran's Appeal - Don't Take Away Our Hemp Access`,
      body: `${greeting}

I am a veteran writing to urge you to oppose the federal hemp ban set for November 12, 2026.

Many veterans have turned to legal hemp products as an alternative for managing stress, sleep issues, and other service-related challenges. After serving our country, we deserve the freedom to choose what works for our wellness—not to have the government take away legal options that have helped us.

Veterans face unique challenges, and hemp products have provided relief for many of us when traditional options fell short. This ban shows a lack of understanding of what veterans need and use.

I ask you to:
- Oppose the blanket ban on hemp products
- Support veterans' access to legal wellness alternatives
- Push for sensible regulation instead of prohibition

We served our country. We're asking you to serve us by protecting our freedom of choice.

${userName ? `Respectfully,\n${userName}\nVeteran` : 'Respectfully,\nA Concerned Veteran'}`,
    },
  }

  return templates[role]
}
