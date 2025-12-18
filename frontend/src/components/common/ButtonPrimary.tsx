import { motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { Icons } from "../Icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface ButtonPrimaryProps {
  // Project icons
  icon?: keyof typeof Icons
  // Lucide icons
  lucideIcon?: React.ComponentType<{ size?: number; className?: string }>
  text?: string
  expanded: boolean
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"]
  className?: string
  iconFlipped?: boolean
  // Custom colors
  color?: 'cyan' | 'emerald' | 'orange' | 'red' | 'default'
  // Animation control
  disableAnimations?: boolean
  active?: boolean; // Adicionado
}

export function ButtonPrimary({
  icon,
  lucideIcon,
  text,
  expanded,
  onClick,
  className,
  iconFlipped,
  color = 'default',
  disableAnimations = false,
  active = false, // Adicionado
}: ButtonPrimaryProps) {
  const ProjectIcon = icon ? Icons[icon] : null
  const LucideIcon = lucideIcon

  const measureRef = useRef<HTMLSpanElement>(null)

  // Calcula uma largura estimada baseada no comprimento do texto
  const getEstimatedTextWidth = (text: string): number => {
    if (!text) return 0
    // Estimativa baseada em caracteres (aproximadamente 7px por caractere + padding)
    return Math.ceil(text.length * 7) + 16
  }

  const estimatedWidth = text ? getEstimatedTextWidth(text) : 0
  const [measuredWidth, setMeasuredWidth] = useState<number>(estimatedWidth)
  const [hasMeasuredWidth, setHasMeasuredWidth] = useState(false)

  // Mede a largura real do texto após a renderização
  useEffect(() => {
    if (measureRef.current && text) {
      const realWidth = measureRef.current.scrollWidth + 8
      setMeasuredWidth(realWidth)
      setHasMeasuredWidth(true)
    }
  }, [text])

  // Usa a largura medida se disponível, senão usa a estimada
  const textWidth = hasMeasuredWidth ? measuredWidth : estimatedWidth

  const isJustIcon = !text

  // Classes CSS para cores usando apenas Tailwind
  const getColorClasses = () => {
    const baseClasses = "text-zinc-600 dark:text-zinc-300"

    switch (color) {
      case 'cyan':
        return `text-cyan-500 dark:text-cyan-400 ${active ? 'bg-cyan-50 dark:bg-cyan-400/10' : 'hover:bg-cyan-50 dark:hover:bg-cyan-400/10'}`
      case 'emerald':
        return `text-emerald-500 dark:text-emerald-400 ${active ? 'bg-emerald-50 dark:bg-emerald-400/10' : 'hover:bg-emerald-50 dark:hover:bg-emerald-400/10'}`
      case 'orange':
        return `text-orange-500 dark:text-orange-400 ${active ? 'bg-orange-50 dark:bg-orange-400/10' : 'hover:bg-orange-50 dark:hover:bg-orange-400/10'}`
      case 'red':
        return `text-red-500 dark:text-red-400 ${active ? 'bg-red-50 dark:bg-red-400/10' : 'hover:bg-red-50 dark:hover:bg-red-400/10'}`
      default:
        return `${baseClasses} ${active ? 'bg-zinc-100 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-600'}`
    }
  }

  const colorClasses = getColorClasses()

  const buttonClass = [
    "group flex items-center transition-colors duration-200 rounded-[8px] overflow-hidden cursor-pointer",
    isJustIcon ? "w-10 h-10 min-w-10 justify-center" : expanded ? "w-full h-10 px-2 justify-start" : "w-10 h-10 min-w-10 justify-center",
    colorClasses,
    className,
  ].join(' ')

  const buttonContent = (
    <>
      {/* Elemento invisível para medir a largura do texto */}
      {text && (
        <span
          ref={measureRef}
          className="absolute -top-[9999px] left-0 ml-2 text-sm whitespace-nowrap"
          aria-hidden="true"
        >
          {text}
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        className={buttonClass}
      >
        {/* Icon - Sempre visível, nunca desaparece */}
        <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
          <motion.span
            className={`inline-flex ${active && !expanded
              ? color === 'red' ? 'text-red-500 dark:text-red-400'
                : color === 'emerald' ? 'text-emerald-500 dark:text-emerald-400'
                  : color === 'orange' ? 'text-orange-500 dark:text-orange-400'
                    : color === 'cyan' ? 'text-cyan-500 dark:text-cyan-400'
                      : 'text-cyan-400'
              : ''
              }`}
            initial={{ scaleX: iconFlipped ? -1 : 1 }}
            animate={{ scaleX: iconFlipped ? -1 : 1 }}
            transition={disableAnimations ? { duration: 0 } : {
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {ProjectIcon && <ProjectIcon size={20} />}
            {LucideIcon && <LucideIcon size={20} />}
          </motion.span>
        </div>

        {/* Active indicator dot - removed as requested */}
        {/* {active && expanded && (
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 ml-2"></div>
        )} */}

        {/* Text - Animado para entrar e sair com transição suave */}
        {text && (
          <motion.div
            className="overflow-hidden"
            initial={{ width: expanded ? textWidth : 0 }}
            animate={{ width: expanded ? textWidth : 0 }}
            transition={disableAnimations ? { duration: 0 } : {
              duration: 0.3,
              ease: [0.25, 1, 0.5, 1]
            }}
          >
            <motion.span
              initial={{
                opacity: expanded ? 1 : 0,
                x: expanded ? 0 : -10
              }}
              animate={{
                opacity: expanded ? 1 : 0,
                x: expanded ? 0 : -10
              }}
              transition={disableAnimations ? { duration: 0 } : {
                opacity: {
                  duration: expanded ? 0.2 : 0.1,
                  delay: expanded ? 0.1 : 0
                },
                x: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
              className={`text-sm whitespace-nowrap block ${active && expanded ? 'ml-1' : 'ml-2'} text-zinc-900 dark:text-white`}
            >
              {text}
            </motion.span>
          </motion.div>
        )}
      </button>
    </>
  )

  // Se não estiver expandido e tiver texto, mostra tooltip
  if (!expanded && text) {
    return (
      <>
        {/* Elemento invisível para medir a largura do texto */}
        {text && (
          <span
            ref={measureRef}
            className="absolute -top-[9999px] left-0 ml-2 text-sm whitespace-nowrap"
            aria-hidden="true"
          >
            {text}
          </span>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onClick}
              className={buttonClass}
            >
              {/* Icon - Sempre visível, nunca desaparece */}
              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                <motion.span
                  className={`inline-flex ${active && !expanded
                    ? color === 'red' ? 'text-red-500 dark:text-red-400'
                      : color === 'emerald' ? 'text-emerald-500 dark:text-emerald-400'
                        : color === 'orange' ? 'text-orange-500 dark:text-orange-400'
                          : color === 'cyan' ? 'text-cyan-500 dark:text-cyan-400'
                            : 'text-cyan-400'
                    : ''
                    }`}
                  initial={{ scaleX: iconFlipped ? -1 : 1 }}
                  animate={{ scaleX: iconFlipped ? -1 : 1 }}
                  transition={disableAnimations ? { duration: 0 } : {
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                >
                  {ProjectIcon && <ProjectIcon size={20} />}
                  {LucideIcon && <LucideIcon size={20} />}
                </motion.span>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </>
    )
  }

  // Se estiver expandido ou não tiver texto, não precisa de tooltip
  return buttonContent
}