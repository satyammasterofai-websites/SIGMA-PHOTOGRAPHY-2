const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const target = `        </button>
      </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">`;

const replacement = `        </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600"
          >
            <input 
              type="checkbox" 
              checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800 pointer-events-none"
            />
            Select All
          </button>
        </div>
      </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
