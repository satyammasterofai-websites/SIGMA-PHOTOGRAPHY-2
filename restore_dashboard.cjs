const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// The first missing piece: end of DashboardHome map and start of MyOrders
// At line 316: <h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>
// it should close the h3, close the flex, add ID, close the div, close the flex, add status, close flex, close map, close div, close DashboardHome, start MyOrders.

const fix1_find = `                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>
                      ).filter(o => o.type !== "service_enquiry");`;

const fix1_replace = `                    </div>
                    <p className="text-xs text-gray-500">ID: {order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={\`px-3 py-1 rounded-full text-xs font-bold \${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }\`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter((o: any) => o.type !== "service_enquiry");`;

code = code.replace(fix1_find, fix1_replace);

const fix2_find = `                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.templateName || "Order"}
                      </h3>
                         
                          </span>
                        </>
                      )}`;

const fix2_replace = `                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        Order ID:{" "}
                        <span className="font-mono text-xs">{order.displayId || order.id}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      {order.price && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-gray-900">
                            ₹{order.price}
                          </span>
                        </>
                      )}
                    </div>`;

code = code.replace(fix2_find, fix2_replace);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
