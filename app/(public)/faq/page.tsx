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
          answer: "Click on the 'Sign Up' button in the top right corner, fill in your details including name, email, and password. You'll receive a verification email to confirm your account.",
        },
        {
          question: "How do I book a service?",
          answer: "Browse our services page, select the service you need, choose a professional, pick a date and time, and complete the booking. You'll receive a confirmation email with all the details.",
        },
        {
          question: "How do I become a professional?",
          answer: "Visit our 'Become a Professional' page, fill out the application form with your details and experience. Our team will review your application and get back to you within 24-48 hours.",
        },
        {
          question: "What information do I need to provide?",
          answer: "For customers: Basic information like name, email, phone number, and address. For professionals: Additional documents like ID proof, experience certificates, and bank account details.",
        },
      ],
    },
    {
      category: "Bookings & Services",
      questions: [
        {
          question: "How do I cancel a booking?",
          answer: "Go to your bookings page, find the booking you want to cancel, and click 'Cancel'. Cancellation policies vary by service type - check the terms before canceling.",
        },
        {
          question: "Can I reschedule a booking?",
          answer: "Yes, you can reschedule your booking up to 24 hours before the scheduled time. Go to your booking details and click 'Reschedule' to choose a new date and time.",
        },
        {
          question: "What if I'm not satisfied with the service?",
          answer: "We take customer satisfaction seriously. Contact our support team within 48 hours of service completion. We'll investigate and work to resolve the issue, which may include a refund or re-service.",
        },
        {
          question: "How are service prices determined?",
          answer: "Service prices are set by professionals based on factors like service type, duration, and complexity. Prices are displayed upfront before booking, so you know exactly what you'll pay.",
        },
      ],
    },
    {
      category: "Payments",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment partners.",
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard encryption and secure payment gateways. We never store your full card details on our servers. All transactions are PCI DSS compliant.",
        },
        {
          question: "What is your refund policy?",
          answer: "Refunds are processed based on our cancellation policy. If you cancel within the allowed time frame, you'll receive a full refund. Refunds are processed within 5-7 business days to your original payment method.",
        },
        {
          question: "When do I get charged?",
          answer: "Payment is processed when you confirm your booking. For some services, a partial payment may be taken upfront with the remainder due after service completion.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I update my profile information?",
          answer: "Go to your profile page, click 'Edit Profile', make your changes, and save. Some changes like email may require verification.",
        },
        {
          question: "How do I change my password?",
          answer: "Go to your profile settings, click on 'Change Password', enter your current password and new password, then confirm the change.",
        },
        {
          question: "How do I verify my account?",
          answer: "Account verification helps build trust. For customers, verify your email and phone number. For professionals, additional verification including ID proof and background checks are required.",
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account from your profile settings. Note that this action is permanent and all your data will be removed. Make sure to cancel any active bookings first.",
        },
      ],
    },
    {
      category: "For Professionals",
      questions: [
        {
          question: "How do I get paid?",
          answer: "Payments are transferred directly to your registered bank account. Payments are processed weekly or bi-weekly depending on your preference. You can track earnings in your dashboard.",
        },
        {
          question: "What documents do I need?",
          answer: "You'll need a valid government ID (Aadhaar, PAN, or Passport), proof of address, bank account details, and any relevant professional certificates or licenses.",
        },
        {
          question: "How do I set my availability?",
          answer: "Go to your professional dashboard, navigate to 'Availability', and set your working hours and days. You can also block specific dates if needed.",
        },
        {
          question: "What commission do you charge?",
          answer: "Our platform fee varies by service category and is clearly outlined in your professional agreement. There are no hidden fees - you'll see exactly what you'll earn for each booking.",
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <HelpCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
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
                      <Card key={questionIdx} className="transition-all hover:shadow-md">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleQuestion(currentIndex)}
                            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
                          >
                            <span className="pr-8 font-semibold text-lg">{faq.question}</span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="border-t px-6 pb-6 pt-4">
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Still Have Questions?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
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
