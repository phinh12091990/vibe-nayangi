export function spin(foods, history, allergies, currentMealType) {
  // 1. Lọc cứng (Hard Filters)
  let available = foods.filter(f => !f.hidden);
  available = available.filter(f => f.categories.includes(currentMealType));
  available = available.filter(f => !((f.allergies || f.allergens || []).some(a => allergies.includes(a))));

  if (available.length === 0) {
    return { food: null, reason: "Không tìm thấy món phù hợp với cài đặt dị ứng và buổi ăn của bạn." };
  }

  // 2. Tính toán điểm số (Weights)
  const recentHistory = history.slice(-5);
  const recentFoodIds = recentHistory.map(h => h.foodId);
  const lastFoodId = recentFoodIds.length > 0 ? recentFoodIds[recentFoodIds.length - 1] : null;

  const recentNutrition = recentHistory.map(h => {
    const food = foods.find(f => f.id === h.foodId);
    return food ? food.nutrition : null;
  });

  const missingFish = !recentNutrition.includes('Cá');
  const missingVeggie = !recentNutrition.includes('Rau củ');

  let totalWeight = 0;
  const weightedList = available.map(food => {
    let weight = 10; // Điểm cơ bản
    let reasons = [];

    // Chống ngán
    if (food.id === lastFoodId) {
      weight = 0; // Vừa ăn xong, không ra lại
    } else if (recentFoodIds.includes(food.id)) {
      weight -= 5;
    } else {
      weight += 5;
    }

    // Bổ sung dinh dưỡng
    if (missingFish && food.nutrition === 'Cá') {
      weight += 15;
      reasons.push("bạn chưa ăn cá hoặc hải sản trong 5 bữa gần đây");
    }
    if (missingVeggie && food.nutrition === 'Rau củ') {
      weight += 15;
      reasons.push("đã lâu bạn chưa có món rau nào vào bụng");
    }

    // Thời tiết giả lập (Giả sử 10% cơ hội trời mưa)
    const isRaining = Math.random() > 0.9;
    if (isRaining && ['Bún bò Huế', 'Phở bò', 'Phở gà', 'Lẩu Thái', 'Bánh canh cua'].includes(food.name)) {
      weight += 10;
      reasons.push("không khí hôm nay rất hợp để ăn một món nước ấm nóng");
    }

    if (weight < 0) weight = 0;

    if (reasons.length === 0) {
      if (recentFoodIds.includes(food.id)) {
         reasons.push("đây là lựa chọn an toàn dù bạn mới ăn cách đây không lâu");
      } else {
         reasons.push(`đã khá lâu rồi bạn chưa đổi vị với món này`);
      }
    }

    totalWeight += weight;
    return { ...food, weight, reason: reasons[0] };
  });

  if (totalWeight === 0) {
      weightedList.forEach(f => f.weight = 1);
      totalWeight = weightedList.length;
  }

  // 3. Quay số dựa trên trọng số
  let random = Math.random() * totalWeight;
  let selected = null;
  for (const item of weightedList) {
    random -= item.weight;
    if (random <= 0) {
      selected = item;
      break;
    }
  }

  if (!selected) selected = weightedList[0];

  return { 
    food: selected, 
    reason: `👉 ${selected.reason}!`
  };
}
