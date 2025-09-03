import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Layout({ children, title, showBackButton, onBack }: LayoutProps) {
  const hasHeader = !!title;

  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <div className="max-w-md mx-auto bg-neutral-50 min-h-screen shadow-2xl relative">
        {hasHeader && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-5 shadow-lg relative z-20"
          >
            <div className="flex items-center justify-between relative z-10">
              {showBackButton ? (
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </motion.button>
              ) : (
                <div className="w-10" />
              )}
              <h1 className="text-xl font-bold flex-1 text-center truncate px-2">
                {title}
              </h1>
              <div className="w-10" />
            </div>
          </motion.header>
        )}
        
        <main className={`p-4 ${hasHeader ? 'pt-4' : 'pt-6'} pb-28`}>
          {children}
        </main>
      </div>
    </div>
  );
}
