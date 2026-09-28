import { useStorage } from '../hooks/useStorage';
import { Plus, Eye, EyeOff } from 'lucide-react';

export default function MenuPage() {
  const { foods, toggleFoodStatus } = useStorage();

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Sổ Món ({foods.length})</h2>
        <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => alert("Tính năng thêm món đang phát triển")}><Plus size={18} /> Thêm</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {foods.map(food => (
          <div key={food.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', opacity: food.hidden ? 0.5 : 1 }}>
            <div style={{ fontSize: '2rem', marginRight: '16px' }}>{food.emoji}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{food.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {food.nutrition} {((food.allergies || food.allergens || []).length > 0) && `• Dị ứng: ${(food.allergies || food.allergens).join(', ')}`}
              </p>
            </div>
            <button 
              onClick={() => toggleFoodStatus(food.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {food.hidden ? <EyeOff /> : <Eye color="var(--primary)" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
