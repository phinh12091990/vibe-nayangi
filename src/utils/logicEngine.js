export function spin(foods, history, allergies, currentMealType, profile = null) {
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

  // Check BMI if profile exists
  let isOverweight = false;
  let bmiVal = null;
  if (profile && profile.weight && profile.height) {
    const hM = profile.height / 100;
    if (hM > 0) {
      bmiVal = Number((profile.weight / (hM * hM)).toFixed(1));
      isOverweight = bmiVal >= 23; // Asian standard
    }
  }

  let totalWeight = 0;
  const weightedList = available.map(food => {
    let weight = 10; // Điểm cơ bản
    let reasons = [];

    // Chống ngán
    if (food.id === lastFoodId) {
      weight = 0; // Vừa ăn xong bữa trước, không ra lại
    } else if (recentFoodIds.includes(food.id)) {
      weight -= 6;
    } else {
      weight += 6;
    }

    // Ưu tiên theo Mục tiêu Sức khỏe & Thể trạng (Body Profile)
    if (profile && profile.goal) {
      if (profile.goal === 'Giảm cân') {
        if (food.nutrition === 'Rau củ') {
          weight += 20;
          reasons.push("món này dồi dào chất xơ, ít calo, rất chuẩn cho mục tiêu giảm mỡ của bạn");
        } else if (food.nutrition === 'Thịt trắng') {
          weight += 12;
          reasons.push("đạm thịt trắng nạc giúp no lâu mà không lo tích mỡ thừa");
        } else if (food.nutrition === 'Tinh bột') {
          weight = Math.max(2, weight - 8);
        }
      } else if (profile.goal === 'Tăng cơ') {
        if (food.nutrition === 'Thịt đỏ' || food.nutrition === 'Thịt trắng' || food.name.includes('trứng')) {
          weight += 18;
          reasons.push("cung cấp nguồn protein chất lượng cao hỗ trợ phát triển cơ bắp");
        }
      } else if (profile.goal === 'Thanh lọc') {
        if (food.nutrition === 'Rau củ' || food.nutrition === 'Cá') {
          weight += 18;
          reasons.push("món ăn nhẹ bụng thanh đạm, giúp cơ thể thải độc và phục hồi");
        }
      }
    }

    // Ưu tiên theo BMI nếu đang thừa cân
    if (isOverweight && (food.nutrition === 'Rau củ' || food.nutrition === 'Cá')) {
      weight += 10;
      if (reasons.length === 0) {
        reasons.push(`chỉ số thể trạng BMI (${bmiVal}) gợi ý bạn nên ưu tiên món thanh nhẹ, ít dầu mỡ`);
      }
    }

    // Bổ sung dinh dưỡng thiếu hụt 5 bữa gần nhất
    if (missingFish && food.nutrition === 'Cá') {
      weight += 15;
      reasons.push("bạn chưa ăn cá hoặc hải sản trong 5 bữa gần đây");
    }
    if (missingVeggie && food.nutrition === 'Rau củ') {
      weight += 15;
      reasons.push("đã lâu bạn chưa có món rau xanh nào vào bụng");
    }

    // Thời tiết ngẫu nhiên mô phỏng
    const isRaining = Math.random() > 0.88;
    if (isRaining && ['Bún bò Huế', 'Phở bò', 'Phở gà', 'Lẩu Thái', 'Bánh canh cua', 'Hủ tiếu mực ống'].includes(food.name)) {
      weight += 10;
      reasons.push("không khí hôm nay rất hợp để thưởng thức một tô món nước ấm nóng");
    }

    if (weight < 0) weight = 0;

    if (reasons.length === 0) {
      if (recentFoodIds.includes(food.id)) {
        reasons.push("đây là lựa chọn an toàn dù bạn mới ăn cách đây không lâu");
      } else {
        reasons.push("đã khá lâu rồi bạn chưa đổi vị với món này");
      }
    }

    totalWeight += weight;
    return { ...food, weight, reason: reasons[0] };
  });

  if (totalWeight === 0) {
    weightedList.forEach(f => f.weight = 1);
    totalWeight = weightedList.length;
  }

  // 3. Quay số theo trọng số tích lũy
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
