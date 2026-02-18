export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface PatientFormData {
  name: string
  phone: string
  age: string
  emergencyType: string
  bloodGroup?: string
  gender?: string
}

export function validatePatientInfo(data: PatientFormData): ValidationResult {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Patient name is required"
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters"
  } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
    errors.name = "Name can only contain letters and spaces"
  }

  // Phone validation (Indian format)
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = "Phone number is required"
  } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit Indian mobile number"
  }

  // Age validation
  if (!data.age || data.age.trim().length === 0) {
    errors.age = "Age is required"
  } else {
    const ageNum = Number.parseInt(data.age)
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      errors.age = "Enter a valid age between 0-150"
    }
  }

  // Emergency type validation
  if (!data.emergencyType || data.emergencyType.trim().length === 0) {
    errors.emergencyType = "Emergency type is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: "Phone number is required" }
  }

  const cleaned = phone.replace(/\s/g, "")
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, error: "Enter valid 10-digit mobile number starting with 6-9" }
  }

  return { isValid: true }
}

export function validateAge(age: string): { isValid: boolean; error?: string } {
  if (!age || age.trim().length === 0) {
    return { isValid: false, error: "Age is required" }
  }

  const ageNum = Number.parseInt(age)
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
    return { isValid: false, error: "Enter valid age (0-150)" }
  }

  return { isValid: true }
}

export function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, "")
}
