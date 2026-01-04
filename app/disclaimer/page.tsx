export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Disclaimer</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
              <h2 className="text-xl font-semibold text-red-900 mb-3">Important Disclaimer</h2>
              <p className="text-red-800 leading-relaxed">
                <strong>Tool Thinker provides informational tools and frameworks only.</strong> The Service is not intended to provide professional, legal, financial, or business advice. All content, including AI-generated content, is for informational and educational purposes only.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Professional Advice</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The information provided by Tool Thinker ("we," "us," or "our") on toolthinker.com (the "Service") is for general informational purposes only. All information on the Service is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">The Service does not constitute professional advice.</strong> You should not rely on the Service as a substitute for professional advice from qualified professionals, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                <li>Legal professionals (lawyers, attorneys)</li>
                <li>Financial advisors and accountants</li>
                <li>Business consultants and strategists</li>
                <li>Tax professionals</li>
                <li>Investment advisors</li>
                <li>Other qualified professionals relevant to your specific situation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI-Generated Content Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Tool Thinker uses artificial intelligence (AI) to generate content, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Business model recommendations</li>
                <li>Marketing strategies and blueprints</li>
                <li>Framework outputs and analyses</li>
                <li>Consultation responses</li>
                <li>Other AI-generated content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong className="text-gray-900">You acknowledge and agree that:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                <li>AI-generated content is provided for informational and educational purposes only</li>
                <li>AI-generated content may contain errors, inaccuracies, or outdated information</li>
                <li>AI-generated content should not be considered as professional, legal, financial, or business advice</li>
                <li>You are solely responsible for verifying and validating any AI-generated content before use</li>
                <li>Tool Thinker is not responsible for any decisions made based on AI-generated content</li>
                <li>You should consult with qualified professionals before making business, legal, or financial decisions based on AI-generated content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service is provided on an "as is" and "as available" basis. Tool Thinker makes no representations or warranties of any kind, express or implied, as to the operation of the Service, or the information, content, materials, or products included on the Service. You expressly agree that your use of the Service is at your sole risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong className="text-gray-900">To the fullest extent permitted by applicable law, Tool Thinker shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your use or inability to use the Service</li>
                <li>Any conduct or content of third parties on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                <li>Any decisions made or actions taken based on information provided by the Service</li>
                <li>Any losses, damages, or consequences resulting from your use of AI-generated content</li>
                <li>Any business losses, including but not limited to loss of profits, revenue, data, or business opportunities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your use of the Service and any decisions made based on information provided</li>
                <li>Verifying the accuracy, completeness, and applicability of any information before relying on it</li>
                <li>Seeking appropriate professional advice when necessary</li>
                <li>Any losses, damages, or consequences resulting from your use of the Service</li>
                <li>Ensuring that your use of the Service complies with all applicable laws and regulations</li>
                <li>Maintaining the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">External Links</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service may contain links to external websites that are not provided or maintained by or in any way affiliated with Tool Thinker. Tool Thinker does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites. The inclusion of any link does not imply endorsement by Tool Thinker.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Endorsement</h2>
              <p className="text-gray-700 leading-relaxed">
                Reference to any specific commercial products, processes, or services, or the use of any trade, firm, or corporation name is for the information and convenience of the public, and does not constitute endorsement, recommendation, or favoring by Tool Thinker.
              </p>
            </section>

            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Summary</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Tool Thinker is for informational purposes only.</strong> The Service provides tools, frameworks, and AI-generated content for educational and informational use. It is not a substitute for professional advice.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Tool Thinker is not responsible for any losses, damages, or consequences</strong> resulting from your use of the Service or any decisions made based on information provided by the Service. Always consult with qualified professionals before making important business, legal, or financial decisions.
              </p>
            </section>

            <section className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                If you have any questions about this Disclaimer, please contact us through our <a href="/contact" className="text-gray-900 underline">Contact Us</a> page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


