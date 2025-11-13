export interface Department {
  id: string;
  name: string;
  allowedCategories: string[];
  description: string;
}

export const RAK_DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'Legal',
    allowedCategories: ['SERVICES', 'CONSULTANCY'],
    description: 'Legal services, advisory, and compliance',
  },
  {
    id: 'd2',
    name: 'HR',
    allowedCategories: ['SERVICES', 'CONSULTANCY', 'SUPPLIES'],
    description: 'Human resources and talent management',
  },
  {
    id: 'd3',
    name: 'Water Management',
    allowedCategories: ['WORKS', 'SERVICES', 'CONSULTANCY', 'SUPPLIES'],
    description: 'Water infrastructure, treatment, and distribution',
  },
  {
    id: 'd4',
    name: 'Parking Management',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES'],
    description: 'Parking facilities, systems, and operations',
  },
  {
    id: 'd5',
    name: 'Waste Management',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES'],
    description: 'Waste collection, disposal, and recycling',
  },
  {
    id: 'd6',
    name: 'Roads & Construction',
    allowedCategories: ['WORKS', 'CONSULTANCY', 'SUPPLIES'],
    description: 'Road construction, maintenance, and infrastructure',
  },
  {
    id: 'd7',
    name: 'Maintenance',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES'],
    description: 'Facility and equipment maintenance services',
  },
  {
    id: 'd8',
    name: 'Administration',
    allowedCategories: ['SERVICES', 'SUPPLIES', 'CONSULTANCY'],
    description: 'Administrative support and office management',
  },
  {
    id: 'd9',
    name: 'Procurement',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES', 'CONSULTANCY'],
    description: 'Centralized procurement and supply chain',
  },
  {
    id: 'd10',
    name: 'City Violation / Enforcement',
    allowedCategories: ['SERVICES', 'SUPPLIES'],
    description: 'Municipal code enforcement and violations',
  },
  {
    id: 'd11',
    name: 'Tolls Management',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES'],
    description: 'Toll systems, collection, and infrastructure',
  },
  {
    id: 'd12',
    name: 'Citizen-Centric Services',
    allowedCategories: ['SERVICES', 'CONSULTANCY', 'SUPPLIES'],
    description: 'Public service delivery and citizen engagement',
  },
  {
    id: 'd13',
    name: 'Landscape & Irrigation',
    allowedCategories: ['WORKS', 'SERVICES', 'SUPPLIES'],
    description: 'Landscaping, irrigation, and green spaces',
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return RAK_DEPARTMENTS.find(dept => dept.id === id);
}

export function getDepartmentAllowedCategories(departmentId: string): string[] {
  const department = getDepartmentById(departmentId);
  return department?.allowedCategories || [];
}
