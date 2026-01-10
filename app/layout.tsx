import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Chatbot } from "@/components/Chatbot"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AuthProvider } from "@/contexts/AuthContext"
import { OnboardingWrapper } from "@/components/OnboardingWrapper"
import { JourneySidebar } from "@/components/JourneySidebar"
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts"

export const metadata: Metadata = {
  title: "Tool Thinker - Tools That Help Founders Make Progress",
  description: "Tools That Help Founders Make Progress",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <OnboardingWrapper>
              <Navigation />
              <JourneySidebar />
              <main>{children}</main>
              <Footer />
              <Chatbot />
              <KeyboardShortcuts />
            </OnboardingWrapper>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

