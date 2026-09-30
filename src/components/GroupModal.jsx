import { useState } from 'react';
import { Users, X, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';

const COMMON_ALLERGIES = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Sữa'];

export default function GroupModal({ isOpen, onClose, groupMembers, toggleGroupMember, addGroupMember, removeGroupMember }) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAllergies, setNewMemberAllergies] = useState([]);

  if (!isOpen) return null;

  const handleToggleNewAllergy = (allergy) => {
    setNewMemberAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addGroupMember(newMemberName.trim(), newMemberAllergies);
    setNewMemberName('');
    setNewMemberAllergies([]);
  };

  const activeMembers = groupMembers.filter(m => m.active);
  const combinedGroupAllergies = Array.from(new Set(activeMembers.flatMap(m => m.allergies || [])));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ăn Cùng Đồng Nghiệp</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dung hòa kiêng cữ & tìm món an toàn cho cả nhóm
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Group Summary Box */}
        <div className="glass-panel" style={{ padding: '12px 14px', marginBottom: '16px', background: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Thành viên đi ăn ({activeMembers.length} người):</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>
              {activeMembers.map(m => m.name.split(' ')[0]).join(', ') || 'Chỉ mình bạn'}
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: combinedGroupAllergies.length > 0 ? '#ffb74d' : 'var(--text-muted)' }}>
            <ShieldAlert size={15} />
            <span>
              {combinedGroupAllergies.length > 0 
                ? `Kiêng cữ chung cần né: ${combinedGroupAllergies.join(', ')}`
                : 'Cả nhóm không có kiêng cữ dị ứng đặc biệt'}
            </span>
          </div>
        </div>

        {/* Members List */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            DANH SÁCH ĐỒNG NGHIỆP (Tích chọn ai đi ăn hôm nay):
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {groupMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => toggleGroupMember(member.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  background: member.active ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${member.active ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '6px', 
                    border: member.active ? 'none' : '2px solid var(--text-dim)', 
                    background: member.active ? '#38bdf8' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0b0d17'
                  }}>
                    {member.active && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: member.active ? '#ffffff' : 'var(--text-muted)' }}>
                      {member.name}
                    </div>
                    {member.allergies && member.allergies.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#ffb74d' }}>
                        Né: {member.allergies.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {member.id !== 'g1' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroupMember(member.id);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                    title="Xóa bạn này"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Member Form */}
        <form onSubmit={handleAddMember} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            + Thêm đồng nghiệp mới:
          </span>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Tên đồng nghiệp (VD: Lan Marketing)"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Thêm
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '4px' }}>Kiêng món:</span>
            {COMMON_ALLERGIES.map(a => (
              <button
                key={a}
                type="button"
                className={`glass-pill ${newMemberAllergies.includes(a) ? 'active' : ''}`}
                style={{ 
                  padding: '3px 8px', 
                  fontSize: '0.72rem', 
                  cursor: 'pointer',
                  borderColor: newMemberAllergies.includes(a) ? '#ff5238' : 'rgba(255,255,255,0.1)',
                  color: newMemberAllergies.includes(a) ? '#ff7a18' : 'var(--text-muted)'
                }}
                onClick={() => handleToggleNewAllergy(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </form>

        {/* Modal Actions */}
        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', padding: '12px' }}>
            Hoàn tất & Áp dụng
          </button>
        </div>

      </div>
    </div>
  );
}
