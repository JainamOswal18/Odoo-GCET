// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getRelativeTime = (date) => {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(date)
}

// Calculate days between two dates
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Include both start and end date
}

// Get current month and year
export const getCurrentMonth = () => {
  const now = new Date()
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
    monthName: now.toLocaleDateString('en-US', { month: 'long' })
  }
}

// Get days in month
export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate()
}

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone
export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  return re.test(phone)
}

// Password strength checker
export const checkPasswordStrength = (password) => {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++
  
  if (strength <= 2) return { level: 'weak', color: 'error', percentage: 33 }
  if (strength <= 3) return { level: 'medium', color: 'warning', percentage: 66 }
  return { level: 'strong', color: 'success', percentage: 100 }
}

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Calculate salary components
export const calculateSalaryComponents = (basicSalary) => {
  const components = {
    basic: basicSalary,
    hra: basicSalary * 0.5,
    standardAllowance: basicSalary * 0.1667,
    performanceBonus: basicSalary * 0.0833,
    leaveTravelAllowance: basicSalary * 0.0833,
    fixedAllowance: basicSalary * 0.1167
  }
  
  components.totalEarnings = Object.values(components).reduce((sum, val) => sum + val, 0)
  
  components.professionalTax = 200
  components.providentFund = basicSalary * 0.12
  components.totalDeductions = components.professionalTax + components.providentFund
  
  components.netSalary = components.totalEarnings - components.totalDeductions
  
  return components
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Class name helper
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
