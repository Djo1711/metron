import { useState } from 'react'

/**
 * Composant Tooltip réutilisable avec style glassmorphism amélioré
 * Usage: <Tooltip content="Explication ici">Terme financier</Tooltip>
 */
export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900/95 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900/95 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900/95 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900/95 border-t-transparent border-b-transparent border-l-transparent'
  }

  return (
    <div className="relative inline-block">
      <div
        className="cursor-help border-b border-dotted border-metron-purple/50 inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}>
          <div className="bg-gray-900/95 backdrop-blur-xl px-5 py-4 rounded-xl border border-metron-purple/40 shadow-2xl shadow-metron-purple/20 min-w-[280px] max-w-md">
            <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">
              {content}
            </p>
          </div>
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Composant InfoIcon pour les tooltips sur les cartes
 */
export function InfoIcon({ content, className = "" }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`text-metron-purple/60 hover:text-metron-purple transition-colors ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fadeIn">
          <div className="bg-gray-900/95 backdrop-blur-xl px-5 py-4 rounded-xl border border-metron-purple/40 shadow-2xl shadow-metron-purple/20 min-w-[280px] max-w-md">
            <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">
              {content}
            </p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-t-gray-900/95 border-l-transparent border-r-transparent border-b-transparent" />
        </div>
      )}
    </div>
  )
}