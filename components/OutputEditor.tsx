"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface OutputEditorProps {
  output: Record<string, any>
  onSave?: (edited: Record<string, any>) => void
  readonly?: boolean
}

export function OutputEditor({ output, onSave, readonly = false }: OutputEditorProps) {
  const [edited, setEdited] = useState<Record<string, any>>(output)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setEdited(output)
  }, [output])

  const handleFieldChange = (key: string, value: any) => {
    setEdited({ ...edited, [key]: value })
    setIsEditing(true)
  }

  const handleSave = () => {
    onSave?.(edited)
    setIsEditing(false)
  }

  const renderField = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
            {key.replace(/_/g, " ")}
          </label>
          {readonly ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {value.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <Textarea
              value={value.join("\n")}
              onChange={(e) =>
                handleFieldChange(key, e.target.value.split("\n").filter(Boolean))
              }
              rows={value.length + 1}
              className="font-mono text-sm"
            />
          )}
        </div>
      )
    }

    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
          {key.replace(/_/g, " ")}
        </label>
        {readonly ? (
          <p className="text-gray-600 whitespace-pre-wrap">{value}</p>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            rows={Math.min(Math.max(value.split("\n").length, 3), 10)}
            className="font-mono text-sm"
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Output</h3>
        {!readonly && isEditing && (
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {Object.entries(edited).map(([key, value]) => renderField(key, value))}
      </div>
    </div>
  )
}



