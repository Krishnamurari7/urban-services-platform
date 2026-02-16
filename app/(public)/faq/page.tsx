"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "Click on the 'Sign Up' button in the top right corner, fill in your details including name, email, and password. You'll receive a verification email to confirm your account.",
        },
        {
          question: "How do I book a service?",
          answer:
            "Browse our services page, select the service you need, choose a professional, pick a date and time, and complete the booking. You'll receive a confirmation email with all the details.",
        },
        {
          question: "How do I become a professional?",
          answer:
            "Visit our 'Become a Professional' page, fill out the application form with your details and experience. Our team will review your application and get back to you within 24-48 hours.",
        },
        {
          question: "What information do I need to provide?",
          answer:
            "For customers: Basic information like name, email, phone number, and address. For professionals: Additional documents like ID proof, experience certificates, and bank account details.",
        },
      ],
    },
    {
      category: "Bookings & Services",
      questions: [
        {
          question: "How do I cancel a booking?",
          answer:
            "Go to your bookings page, find the booking you want to cancel, and click 'Cancel'. Cancellation policies vary by service type - check the terms before canceling.",
        },
        {
          question: "Can I reschedule a booking?",
          answer:
            "Yes, you can reschedule your booking up to 24 hours before the scheduled time. Go to your booking details and click 'Reschedule' to choose a new date and time.",
        },
        {
          question: "What if I'm not satisfied with the service?",
          answer:
            "We take customer satisfaction seriously. Contact our support team within 48 hours of service completion. We'll investigate and work to resolve the issue, which may include a refund or re-service.",
        },
        {
          question: "How are service prices determined?",
          answer:
            "Service prices are set by professionals based on factors like service type, duration, and complexity. Prices are displayed upfront before booking, so you know exactly what you'll pay.",
        },
      ],
    },
    {
      category: "Payments",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment partners.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes, we use industry-standard encryption and secure payment gateways. We never store your full card details on our servers. All transactions are PCI DSS compliant.",
        },
        {
          question: "What is your refund policy?",
          answer:
            "Refunds are processed based on our cancellation policy. If you cancel within the allowed time frame, you'll receive a full refund. Refunds are processed within 5-7 business days to your original payment method.",
        },
        {
          question: "When do I get charged?",
          answer:
            "Payment is processed when you confirm your booking. For some services, a partial payment may be taken upfront with the remainder due after service completion.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I update my profile information?",
          answer:
            "Go to your profile page, click 'Edit Profile', make your changes, and save. Some changes like email may require verification.",
        },
        {
          question: "How do I change my password?",
          answer:
            "Go to your profile settings, click on 'Change Password', enter your current password and new password, then confirm the change.",
        },
        {
          question: "How do I verify my account?",
          answer:
            "Account verification helps build trust. For customers, verify your email and phone number. For professionals, additional verification including ID proof and background checks are required.",
        },
        {
          question: "Can I delete my account?",
          answer:
            "Yes, you can delete your account from your profile settings. Note that this action is permanent and all your data will be removed. Make sure to cancel any active bookings first.",
        },
      ],
    },
    {
      category: "For Professionals",
      questions: [
        {
          question: "How do I get paid?",
          answer:
            "Payments are transferred directly to your registered bank account. Payments are processed weekly or bi-weekly depending on your preference. You can track earnings in your dashboard.",
        },
        {
          question: "What documents do I need?",
          answer:
            "You'll need a valid government ID (Aadhaar, PAN, or Passport), proof of address, bank account details, and any relevant professional certificates or licenses.",
        },
        {
          question: "How do I set my availability?",
          answer:
            "Go to your professional dashboard, navigate to 'Availability', and set your working hours and days. You can also block specific dates if needed.",
        },
        {
          question: "What commission do you charge?",
          answer:
            "Our platform fee varies by service category and is clearly outlined in your professional agreement. There are no hidden fees - you'll see exactly what you'll earn for each booking.",
        },
      ],
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-2xl bg-blue-100">
                <HelpCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
              Find quick answers to the most common questions about our platform
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-12">
                <h2 className="mb-6 text-2xl font-bold">{section.category}</h2>
                <div className="space-y-4">
                  {section.questions.map((faq, questionIdx) => {
                    const currentIndex = questionIndex++;
                    const isOpen = openIndex === currentIndex;
                    return (
                      <Card
                        key={questionIdx}
                        className="transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm"
                      >
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleQuestion(currentIndex)}
                            className="flex w-full items-center justify-between p-6 text-left transition-all duration-300 hover:bg-gray-50/80 rounded-t-lg"
                          >
                            <span className="pr-8 font-semibold text-lg text-gray-900">
                              {faq.question}
                            </span>
                            <div className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-300 ${isOpen ? 'bg-blue-100 text-primary rotate-180' : 'bg-gray-100 text-gray-600'}`}>
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="border-t border-gray-200/60 px-6 pb-6 pt-4 animate-in slide-in-from-top-2 duration-300">
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
              Still Have Questions?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 text-base font-medium text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
