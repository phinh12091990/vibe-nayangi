import { useStorage } from '../hooks/useStorage';

const ALLERGY_LIST = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng'];

export default function HistoryPage() {
  const { history, foods, allergies, toggleAllergy } = useStorage();
  
  // Lật ngược lịch sử để món mới nhất lên đầu
  const displayHistory = [...history].reverse();

  return (
    <div className="page-container">
      <h2>Dị ứng của bạn</h2>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Hệ thống sẽ loại cứng các món chứa nguyên liệu bạn chọn dưới đây:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALLERGY_LIST.map(al => (
            <div 
              key={al} 
              onClick={() => toggleAllergy(al)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                background: allergies.includes(al) ? 'rgba(255, 94, 58, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${allergies.includes(al) ? 'var(--primary)' : 'transparent'}`,
                color: allergies.includes(al) ? 'var(--primary)' : 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {al}
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        Nhật ký <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({history.length} bữa)</span>
      </h2>
      
      {history.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Bạn chưa chốt món nào. Hãy ra màn hình chính quay thử nhé!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayHistory.map((h, i) => {
            const food = foods.find(f => f.id === h.foodId);
            if (!food) return null;
            const date = new Date(h.timestamp);
            return (
              <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                <div style={{ fontSize: '2rem', marginRight: '16px' }}>{food.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{food.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {h.mealType} • {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
