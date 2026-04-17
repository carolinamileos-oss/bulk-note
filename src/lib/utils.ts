import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function formatMacro(value: number, unit: string = 'g'): string {
  return `${Math.round(value * 10) / 10}${unit}`
}

export function calculateRecipeMacros(ingredients: Array<{
  quantity: number
  unit: string
  ingredient: { calories: number; protein: number; carbs: number; fat: number; costPer: number; unit: string }
}>) {
  let calories = 0, protein = 0, carbs = 0, fat = 0, cost = 0

  for (const item of ingredients) {
    const qty = item.quantity
    const ing = item.ingredient

    // Normalize: if ingredient is per 100g and quantity is in g, divide by 100
    const factor = (item.unit === 'g' || item.unit === 'ml') ? qty / 100 : qty

    calories += ing.calories * factor
    protein += ing.protein * factor
    carbs += ing.carbs * factor
    fat += ing.fat * factor
    cost += ing.costPer * qty
  }

  return { calories, protein, carbs, fat, cost }
}

export const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Pequeno-almoço',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
  'pre-workout': 'Pré-treino',
  'post-workout': 'Pós-treino',
}

export const CATEGORY_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-800',
  lunch: 'bg-sage-100 text-sage-800',
  dinner: 'bg-blue-100 text-blue-800',
  snack: 'bg-pink-100 text-pink-800',
  'pre-workout': 'bg-orange-100 text-orange-800',
  'post-workout': 'bg-emerald-100 text-emerald-800',
}

export const OPINION_LABELS: Record<string, string> = {
  loved: '❤️ Adorei',
  liked: '👍 Gostei',
  neutral: '😐 Mais ou menos',
  disliked: '👎 Não gostei',
}

export function getWeekDates(date: Date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}
