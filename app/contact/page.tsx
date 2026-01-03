"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    // Create mailto link (you can replace this with an API endpoint later)
    const mailtoLink = `mailto:mjohnson@toolthinker.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`

    // Open email client
    window.location.href = mailtoLink

    // Simulate success (in production, you'd use an API endpoint)
    setTimeout(() => {
      setSubmitStatus("success")
      setIsSubmitting(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Have a question or want to get in touch? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                <a
                  href="mailto:mjohnson@toolthinker.com"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  mjohnson@toolthinker.com
                </a>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What We Can Help With</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• General inquiries about our tools</li>
                  <li>• Technical support</li>
                  <li>• Partnership opportunities</li>
                  <li>• Feedback and suggestions</li>
                  <li>• Media and press inquiries</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Thank you! Your message has been sent. We'll get back to you soon.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  There was an error sending your message. Please try again or email us directly.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Ways to Connect</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">For Support</h3>
              <p className="text-gray-600 text-sm">
                Need help with a tool or have a technical question? Email us at{" "}
                <a href="mailto:mjohnson@toolthinker.com" className="text-gray-900 hover:underline">
                  mjohnson@toolthinker.com
                </a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">For Partnerships</h3>
              <p className="text-gray-600 text-sm">
                Interested in collaborating or partnering with Tool Thinker? We'd love to discuss opportunities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">For Feedback</h3>
              <p className="text-gray-600 text-sm">
                Your feedback helps us improve. Share your thoughts, suggestions, or feature requests with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
