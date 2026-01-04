"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.id}>
          <label
            htmlFor={question.id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {question.label}
            {question.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          {question.helpText && (
            <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
          )}
          {question.type === "textarea" ? (
            <Textarea
              id={question.id}
              value={values[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              required={question.required}
              rows={4}
              className="w-full"
            />
          ) : question.type === "select" ? (
            <select
              id={question.id}
              value={values[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              required={question.required}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              placeholder={question.placeholder}
              required={question.required}
              className="w-full"
            />
          )}
        </div>
      ))}
    </form>
  )
}




