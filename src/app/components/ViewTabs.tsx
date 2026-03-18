'use client'

import { motion } from 'framer-motion'
import { Calendar, Grid3X3, LayoutGrid } from 'lucide-react'

export type ViewType = 'daily' | 'monthly' | 'yearly'

interface ViewTabsProps {
  current: ViewType
  onChange: (view: ViewType) => void
}

const tabs: { id: ViewType; label: string; icon: typeof Calendar }[] = [
  { id: 'daily', label: 'Daily', icon: Calendar },
  { id: 'monthly', label: 'Monthly', icon: LayoutGrid },
  { id: 'yearly', label: 'Yearly', icon: Grid3X3 },
]

export default function ViewTabs({ current, onChange }: ViewTabsProps) {
  return (
    <div className="view-tabs">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = current === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`view-tab ${isActive ? 'view-tab-active' : ''}`}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="viewTabIndicator"
                className="view-tab-indicator"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
