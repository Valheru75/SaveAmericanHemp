import { useState } from 'react'
import { CountdownTimer } from './components/CountdownTimer'
import { CampaignStats } from './components/CampaignStats'
import { ActionForm } from './components/ActionForm'
import { LawmakerResults } from './components/LawmakerResults'
import { EmailModal } from './components/EmailModal'
import { useLawmakerLookup } from './hooks/useLawmakerLookup'
import { createUser } from './services/users'
import { sendEmailToLawmaker } from './services/emails'
import { getEmailTemplate } from './lib/emailTemplates'
import type { Lawmaker, UserRole, User } from './lib/supabase'

function App() {
  const { lookup, result, loading } = useLawmakerLookup()
  const [user, setUser] = useState<User | null>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedLawmaker, setSelectedLawmaker] = useState<Lawmaker | null>(null)

  const handleFormSubmit = async (email: string, zipCode: string, role: UserRole) => {
    try {
      // Create or get existing user
      const newUser = await createUser({ email, zipCode, role })
      setUser(newUser)

      // Lookup lawmakers
      await lookup(zipCode)
    } catch (err) {
      console.error('Failed to lookup lawmakers:', err)
      // Error is already shown in ActionForm via useLawmakerLookup hook
    }
  }

  const handleSendEmail = (lawmaker: Lawmaker) => {
    if (!user) return
    setSelectedLawmaker(lawmaker)
    setEmailModalOpen(true)
  }

  const handleEmailSend = async (editedBody: string) => {
    if (!user || !selectedLawmaker) return

    const emailTemplate = getEmailTemplate(user.role, selectedLawmaker, user.name)

    await sendEmailToLawmaker({
      userId: user.id,
      lawmakerId: selectedLawmaker.id,
      emailSubject: emailTemplate.subject,
      emailBody: editedBody,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Don't Ban Hemp
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Congress banned 95% of hemp products. We have one year to stop it.
            </p>
          </div>
          <CountdownTimer />
          <CampaignStats />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4">
        {!result ? (
          <ActionForm onSubmit={handleFormSubmit} isLoading={loading} />
        ) : (
          <LawmakerResults
            senators={result.senators}
            representative={result.representative}
            onSendEmail={handleSendEmail}
          />
        )}
      </div>

      {/* Email Modal */}
      {user && selectedLawmaker && (
        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          lawmaker={selectedLawmaker}
          emailTemplate={getEmailTemplate(user.role, selectedLawmaker, user.name)}
          onSend={handleEmailSend}
        />
      )}
    </div>
  )
}

export default App
