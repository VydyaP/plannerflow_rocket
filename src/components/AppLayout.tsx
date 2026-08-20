'use client';
import React from 'react';
import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import { Toaster } from 'sonner';
import { fadeInUp } from '@/lib/motion';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePath={activePath} />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8"
        >
          {children}
        </motion.div>
      </main>
      <BottomTabBar activePath={activePath} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </div>
  );
}