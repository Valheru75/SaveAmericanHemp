import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserRole } from '@/lib/supabase'

interface ActionFormProps {
  onSubmit: (email: string, zipCode: string, role: UserRole) => void | Promise<void>
  isLoading?: boolean
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'employee', label: 'Employee' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'medical_user', label: 'Medical User' },
  { value: 'veteran', label: 'Veteran' },
]

export function ActionForm({ onSubmit, isLoading = false }: ActionFormProps) {
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [errors, setErrors] = useState<{
    email?: string
    zipCode?: string
    role?: string
  }>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateZipCode = (zip: string): boolean => {
    return /^\d{5}$/.test(zip)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value.replace(/\D/g, ''))
    if (errors.zipCode) {
      setErrors(prev => ({ ...prev, zipCode: undefined }))
    }
  }

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole)
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!zipCode) {
      newErrors.zipCode = 'Zip code is required'
    } else if (!validateZipCode(zipCode)) {
      newErrors.zipCode = 'Please enter a valid 5-digit zip code'
    }

    if (!role) {
      newErrors.role = 'Please select your role'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear errors and submit
    setErrors({})
    await onSubmit(email, zipCode, role as UserRole)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-center">
          Find Your Representatives
        </CardTitle>
        <p id="form-description" className="text-center text-gray-600 mt-2">
          Enter your information to see who represents you and send them a message
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" aria-describedby="form-description">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Zip Code Field */}
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code *</Label>
            <Input
              id="zipCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="12345"
              maxLength={5}
              value={zipCode}
              onChange={handleZipChange}
              disabled={isLoading}
              className={errors.zipCode ? 'border-red-500' : ''}
              autoComplete="postal-code"
              aria-invalid={!!errors.zipCode}
              aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
            />
            {errors.zipCode && (
              <p id="zipCode-error" className="text-sm text-red-500" role="alert">
                {errors.zipCode}
              </p>
            )}
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label htmlFor="role">I am a... *</Label>
            <Select
              value={role}
              onValueChange={handleRoleChange}
              disabled={isLoading}
            >
              <SelectTrigger
                id="role"
                className={errors.role ? 'border-red-500' : ''}
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? 'role-error' : undefined}
              >
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p id="role-error" className="text-sm text-red-500" role="alert">
                {errors.role}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-hempGreen hover:bg-hempGreen/90 text-white font-semibold text-lg py-6"
            disabled={isLoading}
          >
            {isLoading ? 'Finding Representatives...' : 'Find My Representatives'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
