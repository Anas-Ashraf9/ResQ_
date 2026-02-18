export const AMBULANCE_TYPES = [
  {
    id: 'basic',
    name: 'Basic Ambulance',
    description: 'Standard life support for non-critical transport',
    icon: '🚑',
    color: 'blue',
    estimatedTime: '8-10 mins',
    features: [
      'Two trained paramedics',
      'Oxygen supply',
      'First aid equipment',
      'GPS tracking',
      'Climate controlled'
    ],
    specs: {
      equipment: 'Basic',
      staff: '2 Paramedics',
      capacity: '1 Patient + 1 Attendant'
    }
  },
  {
    id: 'icu',
    name: 'Ambulance with ICU',
    description: 'Advanced life support with ICU facilities',
    icon: '🚑',
    color: 'orange',
    estimatedTime: '10-12 mins',
    features: [
      'Advanced life support equipment',
      'Cardiac monitor & defibrillator',
      'Ventilator support',
      'Intensive care trained staff',
      'Advanced medications'
    ],
    specs: {
      equipment: 'Advanced ICU',
      staff: '2 Advanced Paramedics + 1 Nurse',
      capacity: '1 Patient + 1 Attendant'
    }
  },
  {
    id: 'critical',
    name: 'Critical Care Ambulance',
    description: 'Mobile ICU for critical emergency situations',
    icon: '🚑',
    color: 'red',
    estimatedTime: '12-15 mins',
    features: [
      'Full ICU equipment',
      'Critical care specialists',
      'Advanced imaging capability',
      'Telemedicine support',
      'Direct hospital coordination'
    ],
    specs: {
      equipment: 'Full Critical Care',
      staff: '2 Advanced Paramedics + 2 Nurses + 1 Doctor',
      capacity: '1 Critical Patient + 2 Attendants'
    }
  },
  {
    id: 'neonatal',
    name: 'Neonatal Ambulance',
    description: 'Specialized transport for newborns and infants',
    icon: '🚑',
    color: 'pink',
    estimatedTime: '10-12 mins',
    features: [
      'Neonatal ICU equipment',
      'Temperature control pods',
      'Specialized pediatric staff',
      'Incubator support',
      'Gentle handling protocols'
    ],
    specs: {
      equipment: 'Neonatal ICU',
      staff: '2 Neonatal Specialists + 1 Nurse',
      capacity: '1-2 Neonates + Parents'
    }
  },
  {
    id: 'air',
    name: 'Air Ambulance',
    description: 'Helicopter for critical long-distance transport',
    icon: '🚁',
    color: 'purple',
    estimatedTime: '5-7 mins',
    features: [
      'Helicopter transport',
      'Flight doctor & paramedics',
      'Advanced flight medical equipment',
      'Long-distance capability',
      'Emergency landing sites'
    ],
    specs: {
      equipment: 'Helicopter Medical',
      staff: '1 Flight Doctor + 2 Paramedics + Pilot',
      capacity: '1 Critical Patient + 1 Attendant'
    }
  }
]
