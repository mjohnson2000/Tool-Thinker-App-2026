"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackFormProps {
  stepId: string
  onSubmitted?: () => void
}

export function FeedbackForm({ stepId, onSubmitted }: FeedbackFormProps) {
  const [ratingClarity, setRatingClarity] = useState(0)
  const [ratingUsefulness, setRatingUsefulness] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (ratingClarity === 0 || ratingUsefulness === 0) {
      alert("Please provide ratings for both clarity and usefulness")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          ratingClarity,
          ratingUsefulness,
          notes: notes || undefined,
        }),
      })

      if (res.ok) {
        setRatingClarity(0)
        setRatingUsefulness(0)
        setNotes("")
        onSubmitted?.()
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Feedback</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clarity (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setRatingClarity(rating)}
                className={`w-10 h-10 rounded-full border-2 transition ${
                  ratingClarity >= rating
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usefulness (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setRatingUsefulness(rating)}
                className={`w-10 h-10 rounded-full border-2 transition ${
                  ratingUsefulness >= rating
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional feedback..."
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </form>
  )
}




