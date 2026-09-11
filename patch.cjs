const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

const modalCode = `
      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 font-mono-code text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-slate-100">EDIT TEAM MEMBER</span>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">MEMBER ID</label>
                <input 
                  type="text" 
                  value={editingMember.id}
                  onChange={(e) => setEditingMember({...editingMember, id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">MEMBER NAME</label>
                <input 
                  type="text" 
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setEditingMember(null)} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                Cancel
              </button>
              <button 
                onClick={() => {
                  const originalMember = members.find(m => m.photoUrl === editingMember.photoUrl || m.name === editingMember.name);
                  if (originalMember) {
                    biometricEngine.updateMember(editingMember, originalMember.id);
                    showNotification(\`Updated \${editingMember.name}\`);
                  }
                  setEditingMember(null);
                }}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace("    </div>\n  );\n};\n", modalCode + "    </div>\n  );\n};\n");
fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
