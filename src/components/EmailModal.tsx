import { useState } from 'react'
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
            <p className="text-sm text-gray-600 mb-2">
              You can personalize this message if you'd like
            </p>
            <Textarea
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              disabled={isSending}
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
            disabled={isSending}
            className="bg-hempGreen hover:bg-hempGreen/90 text-white font-semibold"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
