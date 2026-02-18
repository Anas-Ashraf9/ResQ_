'use client'

import { Card } from '@/components/ui/card'

interface AmbulanceTypeCardProps {
  id: string
  name: string
  description: string
  price: string
  icon: string
  estimatedTime: string
  features: string[]
  specs: {
    equipment: string
    staff: string
    capacity: string
  }
  isSelected: boolean
  onClick: () => void
}

export default function AmbulanceTypeCard({
  name,
  description,
  price,
  icon,
  estimatedTime,
  features,
  specs,
  isSelected,
  onClick,
}: AmbulanceTypeCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`p-6 cursor-pointer transition-all duration-300 transform border-2 hover:shadow-lg ${
        isSelected
          ? 'border-primary bg-primary/5 scale-105 shadow-lg'
          : 'border-border hover:border-primary/50 bg-card hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{icon}</div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{price}</p>
          <p className="text-xs text-muted-foreground mt-1">Flat Rate</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <div className="mb-4 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
        <p className="text-xs text-muted-foreground font-semibold">⏱ Estimated Arrival</p>
        <p className="text-sm font-bold text-foreground mt-1">{estimatedTime}</p>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Features</p>
        <ul className="space-y-1">
          {features.slice(0, 4).map((feature, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-primary font-bold">✓</span>
              {feature}
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-xs text-muted-foreground italic">+{features.length - 4} more features</li>
          )}
        </ul>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Equipment:</span>
          <span className="font-semibold text-foreground">{specs.equipment}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Staff:</span>
          <span className="font-semibold text-foreground text-right">{specs.staff}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="font-semibold text-foreground">{specs.capacity}</span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 p-2 bg-primary/10 rounded-lg border border-primary/30 text-center">
          <p className="text-xs font-bold text-primary">✓ Selected</p>
        </div>
      )}
    </Card>
  )
}
