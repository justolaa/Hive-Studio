import { X, Columns, Image, Code } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-hive text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">How to use Hive Studio</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Section 1 */}
          <div className="flex gap-4">
            <div className="bg-red-50 p-2 rounded-lg h-fit text-hive"><Columns size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Dual Columns</h3>
              <p className="text-sm text-gray-600 mt-1">
                Use the <b>Dual</b> button in the toolbar. The text is separated by <code className="bg-gray-100 px-1 rounded">---</code>.
              </p>
              <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 text-xs font-mono text-gray-500">
                [dual]<br/>
                English text...<br/>
                ---<br/>
                Spanish text...<br/>
                [/dual]
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex gap-4">
            <div className="bg-red-50 p-2 rounded-lg h-fit text-hive"><Image size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Images & Dividers</h3>
              <p className="text-sm text-gray-600 mt-1">
                Use the <b>Insert Divider</b> button to add assets. 
                Always use standard HTML <code className="bg-gray-100 px-1 rounded">&lt;img&gt;</code> tags for better compatibility.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex gap-4">
            <div className="bg-red-50 p-2 rounded-lg h-fit text-hive"><Code size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Templates</h3>
              <p className="text-sm text-gray-600 mt-1">
                Click <b>"Load Blueprint"</b> to overwrite your editor with a pre-made structure. Perfect for starting a new post!
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <button 
            onClick={onClose}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition text-sm font-medium"
          >
            Got it, let's write!
          </button>
        </div>
      </div>
    </div>
  );
}