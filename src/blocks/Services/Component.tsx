import React from 'react'
import { cn } from '@/utilities/ui'
import { RevealOnScroll } from '@/components/RevealOnScroll'

interface ServiceItem {
  title: string
  description: string
}

interface ServicesBlockProps {
  heading?: string
  description?: string
  services?: ServiceItem[]
}

export const ServicesBlock: React.FC<ServicesBlockProps> = ({ heading, description, services }) => {
  if (!services?.length) return null

  return (
    <section className="section-warm py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="mb-16 max-w-2xl">
            {heading && (
              <h2 className="text-headline mb-4">{heading}</h2>
            )}
            {description && (
              <p className="text-body text-muted-foreground">{description}</p>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll stagger>
          <dl className="divide-y divide-border">
            {services.map((service, index) => (
              <div
                key={index}
                className={cn(
                  'group grid grid-cols-1 gap-4 py-10 md:grid-cols-[1fr_2fr]',
                  'transition-colors duration-200 hover:bg-accent/40',
                  'px-4 -mx-4 rounded-[var(--radius)]',
                )}
              >
                <dt>
                  <span className="text-label text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-title mt-2 group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </p>
                </dt>
                <dd>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </div>
    </section>
  )
}
