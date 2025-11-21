import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Lawmaker } from '@/lib/supabase'
import type { EmailTemplate } from '@/lib/emailTemplates'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  lawmaker: Lawmaker
  emailTemplate: EmailTemplate
  onSend: (editedBody: string) => Promise<void>
}

export function EmailModal({
  isOpen,
  onClose,
  lawmaker,
  emailTemplate,
  onSend,
}: EmailModalProps) {
  const [emailBody, setEmailBody] = useState(emailTemplate.body)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync email body when template changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEmailBody(emailTemplate.body)
      setError(null)
    }
  }, [emailTemplate.body, isOpen])

  const handleSend = async () => {
    setIsSending(true)
    setError(null)

    try {
      await onSend(emailBody)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (!isSending) {
      setEmailBody(emailTemplate.body) // Reset on close
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Send Email to {lawmaker.name}
          </DialogTitle>
          <DialogDescription>
            Review and personalize your message before sending
          </DialogDescription>
        </DialogHeader>

        {/* Lawmaker Information */}
        <div className="bg-blue-50 p-3 rounded-md space-y-1">
          <p className="text-sm">
            <span className="font-semibold">Chamber:</span>{' '}
            {lawmaker.chamber === 'senate' ? 'Senate' : 'House'}
          </p>
          <p className="text-sm">
            <span className="font-semibold">State:</span> {lawmaker.state}
          </p>
          {lawmaker.district && (
            <p className="text-sm">
              <span className="font-semibold">District:</span> {lawmaker.district}
            </p>
          )}
          {lawmaker.party && (
            <p className="text-sm">
              <span className="font-semibold">Party:</span> {lawmaker.party}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Subject Line (Read-only) */}
          <div>
            <Label htmlFor="subject" className="text-base font-semibold">
              Subject
            </Label>
            <div className="mt-1 p-3 bg-gray-50 border rounded-md">
              {emailTemplate.subject}
            </div>
          </div>

          {/* Email Body (Editable) */}
          <div>
            <Label htmlFor="body" className="text-base font-semibold">
              Message
            </Label>
            <p id="body-help-text" className="text-sm text-gray-600 mb-2">
              You can personalize this message if you'd like
            </p>
            <Textarea
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              disabled={isSending}
              aria-label="Email message body"
              aria-describedby="body-help-text"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !emailBody.trim()}
            className="bg-hempGreen hover:bg-hempGreen/90 text-white font-semibold"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
