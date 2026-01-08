"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, CheckCircle2 } from "lucide-react"
import type { Question } from "@/types/frameworks"

interface QuestionFormProps {
  questions: Question[]
  initialValues?: Record<string, any>
  onChange?: (values: Record<string, any>) => void
  onSubmit?: (values: Record<string, any>) => void
}

export function QuestionForm({
  questions,
  initialValues = {},
  onChange,
  onSubmit,
}: QuestionFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (id: string, value: any) => {
    const newValues = { ...values, [id]: value }
    setValues(newValues)
    onChange?.(newValues)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  const [expandedHelp, setExpandedHelp] = useState<Record<string, boolean>>({})
  const [showExamples, setShowExamples] = useState<Record<string, boolean>>({})

  const toggleHelp = (questionId: string) => {
    setExpandedHelp(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const toggleExample = (questionId: string) => {
    setShowExamples(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isQuestionAnswered = (questionId: string) => {
    const value = values[questionId]
    return value && value.toString().trim().length > 0
  }

  const validateField = (question: Question, value: any): string | null => {
    if (question.required && (!value || value.toString().trim().length === 0)) {
      return "This field is required"
    }
    
    if (value && question.minLength && value.toString().trim().length < question.minLength) {
      return `Please provide at least ${question.minLength} characters`
    }
    
    if (value && question.maxLength && value.toString().trim().length > question.maxLength) {
      return `Please limit to ${question.maxLength} characters`
    }
    
    if (value && question.validation) {
      return question.validation(value)
    }
    
    return null
  }

  const handleBlur = (questionId: string, question: Question) => {
    const value = values[questionId]
    const error = validateField(question, value)
    if (error) {
      setFieldErrors(prev => ({ ...prev, [questionId]: error }))
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question, index) => {
        const isAnswered = isQuestionAnswered(question.id)
        const hasHelp = question.helpText || question.example
        
        return (
          <div key={question.id} className="relative">
            {/* Question Number & Status */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                  {index + 1}
                </span>
                <label
                  htmlFor={question.id}
                  className="text-sm font-medium text-gray-700"
                >
                  {question.label}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              </div>
              {isAnswered && (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* Help Text & Example */}
            {hasHelp && (
              <div className="mb-2 space-y-1">
                {question.helpText && (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleHelp(question.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-0.5"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{expandedHelp[question.id] ? "Hide" : "Show"} help</span>
                    </button>
                  </div>
                )}
                {expandedHelp[question.id] && question.helpText && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
                    <p className="font-medium text-blue-900 mb-1">💡 Tip:</p>
                    <p>{question.helpText}</p>
                  </div>
                )}
                {question.example && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExample(question.id)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      {showExamples[question.id] ? "Hide" : "Show"} example
                    </button>
                    {showExamples[question.id] && question.example && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs">
                        <p className="font-medium text-purple-900 mb-1">📝 Example:</p>
                        <p className="text-gray-700 italic">{question.example}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {question.type === "textarea" ? (
              <Textarea
                id={question.id}
                value={values[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                onBlur={() => handleBlur(question.id, question)}
                placeholder={question.placeholder}
                required={question.required}
                rows={4}
                className={`w-full ${
                  fieldErrors[question.id] 
                    ? 'border-red-300 focus:border-red-400' 
                    : isAnswered 
                      ? 'border-green-300 focus:border-green-400' 
                      : ''
                }`}
              />
            ) : question.type === "select" ? (
              <select
                id={question.id}
                value={values[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                onBlur={() => handleBlur(question.id, question)}
                required={question.required}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${
                  fieldErrors[question.id]
                    ? 'border-red-300'
                    : isAnswered 
                      ? 'border-green-300' 
                      : 'border-input'
                }`}
              >
                <option value="">Select...</option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={question.id}
                type={question.type}
                value={values[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                onBlur={() => handleBlur(question.id, question)}
                placeholder={question.placeholder}
                required={question.required}
                className={`w-full ${
                  fieldErrors[question.id] 
                    ? 'border-red-300 focus:border-red-400' 
                    : isAnswered 
                      ? 'border-green-300 focus:border-green-400' 
                      : ''
                }`}
              />
            )}
            {fieldErrors[question.id] && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {fieldErrors[question.id]}
              </p>
            )}
            {question.minLength && values[question.id] && (
              <p className="mt-1 text-xs text-gray-500">
                {values[question.id].toString().length} / {question.minLength}+ characters
                {values[question.id].toString().length < question.minLength && (
                  <span className="text-orange-600 ml-1">
                    (need {question.minLength - values[question.id].toString().length} more)
                  </span>
                )}
              </p>
            )}
          </div>
        )
      })}
    </form>
  )
}




