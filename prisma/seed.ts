import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A criar dados de exemplo...')

  // Clear existing data
  await prisma.substitution.deleteMany()
  await prisma.shoppingListItem.deleteMany()
  await prisma.shoppingList.deleteMany()
  await prisma.mealPlanItem.deleteMany()
  await prisma.mealPlan.deleteMany()
  await prisma.mealHistory.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.ingredient.deleteMany()

  // ─── INGREDIENTS ──────────────────────────────────────────────
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Aveia', category: 'grains', unit: 'g', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Leite Meio-gordo', category: 'dairy', unit: 'ml', calories: 46, protein: 3.2, carbs: 4.8, fat: 1.5, costPer: 0.001 } }),
    prisma.ingredient.create({ data: { name: 'Banana', category: 'fruits', unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Iogurte Grego Natural', category: 'dairy', unit: 'g', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, costPer: 0.003 } }),
    prisma.ingredient.create({ data: { name: 'Skyr Natural', category: 'dairy', unit: 'g', calories: 60, protein: 11, carbs: 4, fat: 0.2, costPer: 0.004 } }),
    prisma.ingredient.create({ data: { name: 'Granola', category: 'grains', unit: 'g', calories: 471, protein: 10, carbs: 64, fat: 20, costPer: 0.005 } }),
    prisma.ingredient.create({ data: { name: 'Proteína Whey', category: 'supplements', unit: 'g', calories: 120, protein: 24, carbs: 3, fat: 1.5, costPer: 0.04 } }),
    prisma.ingredient.create({ data: { name: 'Peito de Frango', category: 'proteins', unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, costPer: 0.012 } }),
    prisma.ingredient.create({ data: { name: 'Peru Fatiado', category: 'proteins', unit: 'g', calories: 135, protein: 29, carbs: 0, fat: 1, costPer: 0.015 } }),
    prisma.ingredient.create({ data: { name: 'Ovo', category: 'proteins', unit: 'unidade', calories: 70, protein: 6, carbs: 0.6, fat: 5, costPer: 0.2 } }),
    prisma.ingredient.create({ data: { name: 'Arroz Branco', category: 'grains', unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, costPer: 0.0015 } }),
    prisma.ingredient.create({ data: { name: 'Massa Penne', category: 'grains', unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Carne Picada (Vaca)', category: 'proteins', unit: 'g', calories: 250, protein: 20, carbs: 0, fat: 18, costPer: 0.01 } }),
    prisma.ingredient.create({ data: { name: 'Abacate', category: 'fruits', unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15, costPer: 0.006 } }),
    prisma.ingredient.create({ data: { name: 'Pão de Forma Integral', category: 'grains', unit: 'fatia', calories: 80, protein: 3.5, carbs: 14, fat: 1.5, costPer: 0.2 } }),
    prisma.ingredient.create({ data: { name: 'Manteiga de Amendoim', category: 'fats', unit: 'g', calories: 588, protein: 25, carbs: 20, fat: 50, costPer: 0.01 } }),
    prisma.ingredient.create({ data: { name: 'Mel', category: 'sweeteners', unit: 'g', calories: 304, protein: 0.3, carbs: 82, fat: 0, costPer: 0.015 } }),
    prisma.ingredient.create({ data: { name: 'Brócolos', category: 'vegetables', unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, costPer: 0.004 } }),
    prisma.ingredient.create({ data: { name: 'Cenoura', category: 'vegetables', unit: 'g', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Queijo Quark', category: 'dairy', unit: 'g', calories: 68, protein: 12, carbs: 4, fat: 0.2, costPer: 0.006 } }),
    prisma.ingredient.create({ data: { name: 'Azeite', category: 'fats', unit: 'ml', calories: 884, protein: 0, carbs: 0, fat: 100, costPer: 0.01 } }),
    prisma.ingredient.create({ data: { name: 'Tomate', category: 'vegetables', unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, costPer: 0.003 } }),
    prisma.ingredient.create({ data: { name: 'Alface', category: 'vegetables', unit: 'g', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, costPer: 0.008 } }),
    prisma.ingredient.create({ data: { name: 'Frango Desfiado', category: 'proteins', unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, costPer: 0.012 } }),
    prisma.ingredient.create({ data: { name: 'Banana Madura', category: 'fruits', unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Cacau em Pó', category: 'other', unit: 'g', calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, costPer: 0.02 } }),
    prisma.ingredient.create({ data: { name: 'Amêndoa', category: 'nuts', unit: 'g', calories: 579, protein: 21, carbs: 22, fat: 50, costPer: 0.02 } }),
    prisma.ingredient.create({ data: { name: 'Massa Esparguete', category: 'grains', unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1, costPer: 0.002 } }),
    prisma.ingredient.create({ data: { name: 'Molho de Tomate', category: 'sauces', unit: 'g', calories: 35, protein: 1.5, carbs: 7, fat: 0.4, costPer: 0.003 } }),
    prisma.ingredient.create({ data: { name: 'Queijo Ralado', category: 'dairy', unit: 'g', calories: 402, protein: 25, carbs: 1.3, fat: 33, costPer: 0.012 } }),
  ])

  const ingMap: Record<string, string> = {}
  ingredients.forEach(i => { ingMap[i.name] = i.id })

  // ─── RECIPES ──────────────────────────────────────────────────
  const r1 = await prisma.recipe.create({
    data: {
      name: 'Overnight Oats Proteica',
      category: 'breakfast',
      description: 'Aveia de preparação noturna, rica em proteína e hidratos. Perfeita para começar o dia com energia.',
      prepMethod: '1. Mistura a aveia com o leite num frasco de vidro.\n2. Adiciona o iogurte grego e mistura bem.\n3. Adiciona a banana cortada em rodelas e o mel.\n4. Cobre e coloca no frigorífico durante a noite.\n5. De manhã, adiciona a granola por cima e serve.',
      servings: 1, prepTime: 10, isFavorite: true, rating: 5, opinion: 'loved',
      notes: 'Preparo sempre antes de dormir. Poupo imenso tempo de manhã.',
      wouldChange: 'Talvez adicionar sementes de chia para mais fibra.',
      bestTime: 'Pequeno-almoço', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['rápido', 'barato', 'muito proteico', 'bom para manhã', 'saciante']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Aveia'], quantity: 80, unit: 'g' },
          { ingredientId: ingMap['Leite Meio-gordo'], quantity: 150, unit: 'ml' },
          { ingredientId: ingMap['Iogurte Grego Natural'], quantity: 100, unit: 'g' },
          { ingredientId: ingMap['Banana'], quantity: 100, unit: 'g' },
          { ingredientId: ingMap['Granola'], quantity: 30, unit: 'g' },
          { ingredientId: ingMap['Mel'], quantity: 15, unit: 'g' },
        ]
      }
    }
  })

  const r2 = await prisma.recipe.create({
    data: {
      name: 'Panquecas de Banana e Aveia',
      category: 'breakfast',
      description: 'Panquecas proteicas sem farinha, ideais para o pequeno-almoço pós-treino.',
      prepMethod: '1. Esmaga bem a banana com um garfo.\n2. Bate os ovos e mistura com a banana.\n3. Adiciona a aveia e mistura.\n4. Aquece uma frigideira antiaderente com um fio de azeite.\n5. Despeja colheradas de massa e cozinha 2-3 minutos de cada lado.\n6. Serve com mel por cima.',
      servings: 2, prepTime: 15, isFavorite: true, rating: 4, opinion: 'loved',
      notes: 'Rendo 6-8 panquecas desta receita. Ótimas quentes.',
      wouldChange: 'Adicionar canela à massa.',
      bestTime: 'Pequeno-almoço / Pós-treino', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['rápido', 'barato', 'muito proteico', 'doce', 'saciante']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Banana Madura'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Ovo'], quantity: 3, unit: 'unidade' },
          { ingredientId: ingMap['Aveia'], quantity: 60, unit: 'g' },
          { ingredientId: ingMap['Mel'], quantity: 20, unit: 'g' },
          { ingredientId: ingMap['Azeite'], quantity: 5, unit: 'ml' },
        ]
      }
    }
  })

  const r3 = await prisma.recipe.create({
    data: {
      name: 'Arroz com Frango e Legumes',
      category: 'lunch',
      description: 'A refeição clássica de ganho muscular. Rica em proteína magra e hidratos complexos.',
      prepMethod: '1. Cozinha o arroz conforme indicações da embalagem.\n2. Tempera o frango com sal, pimenta e alho.\n3. Grelha o frango numa frigideira com azeite.\n4. Cozinha os brócolos e a cenoura a vapor durante 8 minutos.\n5. Serve o arroz com o frango fatiado e os legumes.',
      servings: 2, prepTime: 30, isFavorite: true, rating: 4, opinion: 'liked',
      notes: 'Preparo sempre em dose dupla para ter para o dia seguinte.',
      bestTime: 'Almoço', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['muito proteico', 'saciante', 'salgado', 'barato']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Peito de Frango'], quantity: 300, unit: 'g' },
          { ingredientId: ingMap['Arroz Branco'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Brócolos'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Cenoura'], quantity: 100, unit: 'g' },
          { ingredientId: ingMap['Azeite'], quantity: 15, unit: 'ml' },
        ]
      }
    }
  })

  const r4 = await prisma.recipe.create({
    data: {
      name: 'Massa com Carne Picada',
      category: 'dinner',
      description: 'Prato calórico e proteico. Óptimo para jantar após treino intenso.',
      prepMethod: '1. Cozinha a massa al dente.\n2. Refoga a carne picada com um fio de azeite.\n3. Adiciona o molho de tomate e deixa cozinhar 10 minutos.\n4. Mistura com a massa.\n5. Serve com queijo ralado por cima.',
      servings: 2, prepTime: 25, isFavorite: false, rating: 4, opinion: 'liked',
      notes: 'Calórico e saciante. Ótimo para dias de treino pesado.',
      bestTime: 'Jantar', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['muito proteico', 'saciante', 'salgado', 'barato']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Massa Penne'], quantity: 200, unit: 'g' },
          { ingredientId: ingMap['Carne Picada (Vaca)'], quantity: 250, unit: 'g' },
          { ingredientId: ingMap['Molho de Tomate'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Queijo Ralado'], quantity: 30, unit: 'g' },
          { ingredientId: ingMap['Azeite'], quantity: 10, unit: 'ml' },
        ]
      }
    }
  })

  const r5 = await prisma.recipe.create({
    data: {
      name: 'Iogurte com Granola e Fruta',
      category: 'snack',
      description: 'Snack rápido e nutritivo. Bom equilíbrio entre proteína, hidratos e sabor.',
      prepMethod: '1. Coloca o skyr numa taça.\n2. Adiciona a granola por cima.\n3. Corta a banana em rodelas e coloca por cima.\n4. Rega com mel se quiseres mais doce.',
      servings: 1, prepTime: 5, isFavorite: true, rating: 5, opinion: 'loved',
      notes: 'Levo para o trabalho num frasco. Super prático.',
      bestTime: 'Lanche da tarde', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['rápido', 'muito proteico', 'doce', 'saciante', 'bom para manhã']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Skyr Natural'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Granola'], quantity: 40, unit: 'g' },
          { ingredientId: ingMap['Banana'], quantity: 80, unit: 'g' },
          { ingredientId: ingMap['Mel'], quantity: 10, unit: 'g' },
        ]
      }
    }
  })

  const r6 = await prisma.recipe.create({
    data: {
      name: 'Sandes Proteica de Frango',
      category: 'snack',
      description: 'Sandes completa e rica em proteína. Ideal para lanche ou refeição rápida.',
      prepMethod: '1. Tosta as fatias de pão.\n2. Barra com um pouco de azeite ou manteiga de amendoim.\n3. Adiciona as fatias de frango grelhado.\n4. Coloca o tomate e a alface.\n5. Tempera com sal e pimenta.',
      servings: 1, prepTime: 10, isFavorite: false, rating: 3, opinion: 'neutral',
      notes: 'Prático mas podia ser mais saboroso. Boa opção quando não há tempo.',
      wouldChange: 'Adicionar mais tempero ao frango.',
      bestTime: 'Lanche / Almoço ligeiro', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['rápido', 'muito proteico', 'salgado']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Pão de Forma Integral'], quantity: 2, unit: 'fatia' },
          { ingredientId: ingMap['Frango Desfiado'], quantity: 120, unit: 'g' },
          { ingredientId: ingMap['Tomate'], quantity: 80, unit: 'g' },
          { ingredientId: ingMap['Alface'], quantity: 30, unit: 'g' },
          { ingredientId: ingMap['Azeite'], quantity: 5, unit: 'ml' },
        ]
      }
    }
  })

  const r7 = await prisma.recipe.create({
    data: {
      name: 'Batido Hipercalórico',
      category: 'post-workout',
      description: 'Batido denso em calorias e proteína. Perfeito para pós-treino quando não há apetite.',
      prepMethod: '1. Coloca todos os ingredientes no liquidificador.\n2. Tritura até obter uma consistência homogénea.\n3. Serve imediatamente.',
      servings: 1, prepTime: 5, isFavorite: true, rating: 4, opinion: 'liked',
      notes: 'O melhor pós-treino quando não consigo comer nada sólido. Carregado mas resulta.',
      bestTime: 'Pós-treino', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['rápido', 'muito proteico', 'saciante', 'doce']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Banana Madura'], quantity: 150, unit: 'g' },
          { ingredientId: ingMap['Leite Meio-gordo'], quantity: 300, unit: 'ml' },
          { ingredientId: ingMap['Proteína Whey'], quantity: 30, unit: 'g' },
          { ingredientId: ingMap['Manteiga de Amendoim'], quantity: 30, unit: 'g' },
          { ingredientId: ingMap['Aveia'], quantity: 40, unit: 'g' },
          { ingredientId: ingMap['Cacau em Pó'], quantity: 10, unit: 'g' },
        ]
      }
    }
  })

  const r8 = await prisma.recipe.create({
    data: {
      name: 'Tosta com Ovos e Abacate',
      category: 'breakfast',
      description: 'Pequeno-almoço rico em gorduras saudáveis e proteína. Muito saciante.',
      prepMethod: '1. Tosta as fatias de pão.\n2. Esmaga o abacate com um garfo, tempera com sal e sumo de limão.\n3. Barra o abacate na torrada.\n4. Faz os ovos mexidos ou escalfados.\n5. Coloca os ovos por cima do abacate.\n6. Tempera com pimenta e um fio de azeite.',
      servings: 1, prepTime: 15, isFavorite: true, rating: 5, opinion: 'loved',
      notes: 'O meu favorito ao fim de semana. Vale mesmo a pena o abacate quando está barato.',
      bestTime: 'Pequeno-almoço', wouldRepeat: true, worthCost: true,
      tags: JSON.stringify(['muito proteico', 'saciante', 'salgado', 'bom para manhã']),
      ingredients: {
        create: [
          { ingredientId: ingMap['Pão de Forma Integral'], quantity: 2, unit: 'fatia' },
          { ingredientId: ingMap['Abacate'], quantity: 80, unit: 'g' },
          { ingredientId: ingMap['Ovo'], quantity: 3, unit: 'unidade' },
          { ingredientId: ingMap['Azeite'], quantity: 5, unit: 'ml' },
        ]
      }
    }
  })

  // ─── MEAL HISTORY ─────────────────────────────────────────────
  const today = new Date()
  const historyData = [
    { daysAgo: 0, mealType: 'breakfast', recipeId: r1.id, servings: 1, satisfaction: 5, wouldRepeat: true, notes: 'Preparei ontem à noite. Excelente!' },
    { daysAgo: 0, mealType: 'lunch', recipeId: r3.id, servings: 2, satisfaction: 4, wouldRepeat: true, notes: 'Comi no trabalho.' },
    { daysAgo: 0, mealType: 'snack', recipeId: r5.id, servings: 1, satisfaction: 5, wouldRepeat: true },
    { daysAgo: 1, mealType: 'breakfast', recipeId: r8.id, servings: 1, satisfaction: 5, wouldRepeat: true, notes: 'Abacate perfeito hoje.' },
    { daysAgo: 1, mealType: 'post-workout', recipeId: r7.id, servings: 1, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 1, mealType: 'dinner', recipeId: r4.id, servings: 2, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 2, mealType: 'breakfast', recipeId: r2.id, servings: 2, satisfaction: 4, wouldRepeat: true, notes: 'Fiz panquecas ao fim de semana.' },
    { daysAgo: 2, mealType: 'lunch', recipeId: r3.id, servings: 2, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 2, mealType: 'snack', recipeId: r6.id, servings: 1, satisfaction: 3, wouldRepeat: true },
    { daysAgo: 3, mealType: 'breakfast', recipeId: r1.id, servings: 1, satisfaction: 5, wouldRepeat: true },
    { daysAgo: 3, mealType: 'lunch', recipeId: r4.id, servings: 2, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 4, mealType: 'breakfast', recipeId: r8.id, servings: 1, satisfaction: 5, wouldRepeat: true },
    { daysAgo: 4, mealType: 'post-workout', recipeId: r7.id, servings: 1, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 5, mealType: 'breakfast', recipeId: r1.id, servings: 1, satisfaction: 5, wouldRepeat: true },
    { daysAgo: 5, mealType: 'lunch', recipeId: r3.id, servings: 2, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 6, mealType: 'breakfast', recipeId: r2.id, servings: 2, satisfaction: 4, wouldRepeat: true },
    { daysAgo: 6, mealType: 'dinner', recipeId: r4.id, servings: 2, satisfaction: 4, wouldRepeat: true },
  ]

  for (const h of historyData) {
    const date = new Date(today)
    date.setDate(date.getDate() - h.daysAgo)
    date.setHours(h.mealType === 'breakfast' ? 8 : h.mealType === 'lunch' ? 13 : h.mealType === 'snack' ? 16 : h.mealType === 'post-workout' ? 19 : 20, 0, 0, 0)
    await prisma.mealHistory.create({
      data: { date, mealType: h.mealType, recipeId: h.recipeId, servings: h.servings, satisfaction: h.satisfaction, wouldRepeat: h.wouldRepeat, notes: h.notes }
    })
  }

  // ─── MEAL PLAN ────────────────────────────────────────────────
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const plan = await prisma.mealPlan.create({
    data: { name: 'Semana Atual', weekStart: monday, weekEnd: sunday, notes: 'Plano focado em ganho de massa muscular.' }
  })

  const planItems = [
    // Monday
    { day: 0, mealType: 'breakfast', recipeId: r1.id, servings: 1 },
    { day: 0, mealType: 'lunch', recipeId: r3.id, servings: 2 },
    { day: 0, mealType: 'snack', recipeId: r5.id, servings: 1 },
    { day: 0, mealType: 'post-workout', recipeId: r7.id, servings: 1 },
    // Tuesday
    { day: 1, mealType: 'breakfast', recipeId: r8.id, servings: 1 },
    { day: 1, mealType: 'lunch', recipeId: r3.id, servings: 2 },
    { day: 1, mealType: 'snack', recipeId: r6.id, servings: 1 },
    { day: 1, mealType: 'dinner', recipeId: r4.id, servings: 2 },
    // Wednesday
    { day: 2, mealType: 'breakfast', recipeId: r1.id, servings: 1 },
    { day: 2, mealType: 'lunch', recipeId: r4.id, servings: 2 },
    { day: 2, mealType: 'snack', recipeId: r5.id, servings: 1 },
    { day: 2, mealType: 'post-workout', recipeId: r7.id, servings: 1 },
    // Thursday
    { day: 3, mealType: 'breakfast', recipeId: r8.id, servings: 1 },
    { day: 3, mealType: 'lunch', recipeId: r3.id, servings: 2 },
    { day: 3, mealType: 'snack', recipeId: r5.id, servings: 1 },
    // Friday
    { day: 4, mealType: 'breakfast', recipeId: r2.id, servings: 2 },
    { day: 4, mealType: 'lunch', recipeId: r3.id, servings: 2 },
    { day: 4, mealType: 'post-workout', recipeId: r7.id, servings: 1 },
    // Saturday
    { day: 5, mealType: 'breakfast', recipeId: r8.id, servings: 1 },
    { day: 5, mealType: 'lunch', recipeId: r4.id, servings: 2 },
    { day: 5, mealType: 'snack', recipeId: r5.id, servings: 1 },
    // Sunday
    { day: 6, mealType: 'breakfast', recipeId: r2.id, servings: 2 },
    { day: 6, mealType: 'lunch', recipeId: r3.id, servings: 2 },
    { day: 6, mealType: 'dinner', recipeId: r4.id, servings: 2 },
  ]

  for (const item of planItems) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + item.day)
    await prisma.mealPlanItem.create({ data: { planId: plan.id, recipeId: item.recipeId, date, mealType: item.mealType, servings: item.servings } })
  }

  // ─── SHOPPING LIST ────────────────────────────────────────────
  const shoppingList = await prisma.shoppingList.create({ data: { name: 'Compras desta semana', planId: plan.id } })
  const shopItems = [
    { name: 'Aveia', ingredientId: ingMap['Aveia'], quantity: 500, unit: 'g', estimatedCost: 1.0, category: 'grains', usedInCount: 3 },
    { name: 'Leite Meio-gordo', ingredientId: ingMap['Leite Meio-gordo'], quantity: 1200, unit: 'ml', estimatedCost: 1.2, category: 'dairy', usedInCount: 2 },
    { name: 'Peito de Frango', ingredientId: ingMap['Peito de Frango'], quantity: 1200, unit: 'g', estimatedCost: 14.4, category: 'proteins', usedInCount: 4 },
    { name: 'Arroz Branco', ingredientId: ingMap['Arroz Branco'], quantity: 600, unit: 'g', estimatedCost: 0.9, category: 'grains', usedInCount: 4 },
    { name: 'Skyr Natural', ingredientId: ingMap['Skyr Natural'], quantity: 600, unit: 'g', estimatedCost: 2.4, category: 'dairy', usedInCount: 3 },
    { name: 'Banana', ingredientId: ingMap['Banana'], quantity: 1000, unit: 'g', estimatedCost: 2.0, category: 'fruits', usedInCount: 4 },
    { name: 'Proteína Whey', ingredientId: ingMap['Proteína Whey'], quantity: 90, unit: 'g', estimatedCost: 3.6, category: 'supplements', usedInCount: 3 },
    { name: 'Manteiga de Amendoim', ingredientId: ingMap['Manteiga de Amendoim'], quantity: 90, unit: 'g', estimatedCost: 0.9, category: 'fats', usedInCount: 3 },
    { name: 'Ovos', ingredientId: ingMap['Ovo'], quantity: 15, unit: 'unidade', estimatedCost: 3.0, category: 'proteins', usedInCount: 2 },
    { name: 'Abacate', ingredientId: ingMap['Abacate'], quantity: 240, unit: 'g', estimatedCost: 1.44, category: 'fruits', usedInCount: 2 },
    { name: 'Massa Penne', ingredientId: ingMap['Massa Penne'], quantity: 600, unit: 'g', estimatedCost: 1.2, category: 'grains', usedInCount: 3 },
    { name: 'Carne Picada', ingredientId: ingMap['Carne Picada (Vaca)'], quantity: 750, unit: 'g', estimatedCost: 7.5, category: 'proteins', usedInCount: 3 },
  ]
  for (const item of shopItems) {
    await prisma.shoppingListItem.create({ data: { listId: shoppingList.id, ...item } })
  }

  // ─── SUBSTITUTIONS ────────────────────────────────────────────
  await prisma.substitution.createMany({
    data: [
      { ingredientId: ingMap['Iogurte Grego Natural'], substituteId: ingMap['Skyr Natural'], reason: 'Mais proteico, menos gordura', similarCalories: true, similarProtein: true, similarFunction: true, cheaperOption: false },
      { ingredientId: ingMap['Iogurte Grego Natural'], substituteId: ingMap['Queijo Quark'], reason: 'Similar em proteína, mais barato', similarCalories: true, similarProtein: true, similarFunction: true, cheaperOption: true },
      { ingredientId: ingMap['Peito de Frango'], substituteId: ingMap['Peru Fatiado'], reason: 'Proteína similar, diferente sabor', similarCalories: true, similarProtein: true, similarFunction: true, cheaperOption: false },
      { ingredientId: ingMap['Massa Penne'], substituteId: ingMap['Massa Esparguete'], reason: 'Mesmo valor nutricional', similarCalories: true, similarProtein: true, similarFunction: true, cheaperOption: false },
      { ingredientId: ingMap['Aveia'], substituteId: ingMap['Granola'], reason: 'Alternativa mais doce, mais calorias', similarCalories: false, similarProtein: false, similarFunction: true, cheaperOption: false },
    ]
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log(`   📖 ${8} receitas criadas`)
  console.log(`   📅 ${historyData.length} registos de histórico`)
  console.log(`   🗓️  1 plano semanal com ${planItems.length} refeições`)
  console.log(`   🛒 1 lista de compras com ${shopItems.length} itens`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
