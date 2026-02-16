"use client";

import { Button } from "@/components/ui/button";
import { Smartphone, Download, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export function AppDownloadSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Smartphone className="h-10 w-10" />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Download Our App
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Book services on the go, track your bookings in real-time, and get exclusive app-only offers
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-base font-semibold shadow-xl"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download for iOS
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 h-14 px-8 text-base font-semibold backdrop-blur-sm"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download for Android
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <span>Scan QR Code</span>
              </div>
              <span>•</span>
              <span>Available on App Store & Google Play</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
