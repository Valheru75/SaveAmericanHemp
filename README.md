# Don't Ban Hemp - Campaign Website

A grassroots mobilization platform to fight the 2026 federal hemp ban. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Mission

On November 12 or 13, 2025, President Trump signed legislation that effectively bans 95% of hemp products, threatening a $28 billion industry and over 100,000 jobs. We have until November 12, 2026 to stop this ban from taking effect.

This website enables rapid constituent action by:
- Looking up users' representatives
- Generating personalized emails to lawmakers
- Tracking campaign momentum
- Highlighting key villains funded by Big Alcohol

## ✨ Features

### MVP (Current Implementation)
- ⏱️ **Countdown Timer**: Real-time countdown to November 12, 2026 ban effective date
- 📊 **Campaign Stats**: Live metrics showing total users and emails sent
- 📧 **Lawmaker Lookup**: Google Civic API integration to find senators and representatives by ZIP code
- 📝 **Role-Based Templates**: 5 customized email templates (business owner, employee, consumer, medical user, veteran)
- 💬 **Email Modal**: Review and personalize messages before sending
- 🚀 **One-Click Action**: Send emails directly to lawmakers via Resend API

### Tech Stack
- **Frontend**: React 19, TypeScript 5, Vite 7, Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Email**: Resend API
- **APIs**: Google Civic Information API
- **Deployment**: Vercel (frontend) + Supabase (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Civic Information API key
- Resend account (for email sending)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StopTheHempBan.git
   cd StopTheHempBan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CIVIC_API_KEY=your_google_civic_key
   ```

4. **Run database migration**
   Apply `supabase/migrations/20251119000001_initial_schema.sql` in Supabase Dashboard SQL Editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Visit `http://localhost:5173`

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy Edge Functions to Supabase
5. Test complete user flow

## 🤝 Contributing

This is an urgent grassroots campaign. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- Email delivery by [Resend](https://resend.com/)

---

**Time is running out. Let's save the hemp industry together.**

🌿 **Don't Ban Hemp** 🌿
