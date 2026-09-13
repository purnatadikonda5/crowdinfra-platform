const fs = require('fs');
let code = fs.readFileSync('app/profile/page.js', 'utf8');

code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");

const stateCode = `
  const [demands, setDemands] = useState([])
  const [properties, setProperties] = useState([])

  useEffect(() => {
    if (activeTab === 'activity') {
      axios.get(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/demands/user/me\`, { withCredentials: true })
        .then(res => setDemands(res.data || []))
        .catch(err => console.error("Failed to fetch demands", err))
    } else if (activeTab === 'properties') {
      axios.get(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/properties/user/me\`, { withCredentials: true })
        .then(res => setProperties(res.data || []))
        .catch(err => console.error("Failed to fetch properties", err))
    }
  }, [activeTab])
`;

code = code.replace(/const router = useRouter\(\)/, `const router = useRouter()\n${stateCode}`);

// Replace the dummy activity map
code = code.replace(/\{\(\s*user\.recentActivity \|\| \[[\s\S]*?\]\s*\)\.map\(\(activity, index\) => \([\s\S]*?\}\)/, 
`{demands.length > 0 ? demands.map((demand, index) => (
                        <div
                          key={demand.id || index}
                          className='bg-gray-700/30 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-700/50 transition-colors cursor-pointer'
                          onClick={() => router.push(\`/viewrequest?id=\${demand.id}\`)}
                        >
                          <div className='flex justify-between'>
                            <p className='font-medium text-blue-400'>
                              {demand.category}
                            </p>
                            <p className='text-gray-400 text-sm'>
                              {new Date(demand.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className='text-gray-300 mt-1'>
                            {demand.title}
                          </p>
                        </div>
                      )) : <p className='text-gray-400'>No recent demands.</p>}`);


// Replace the dummy properties map
code = code.replace(/\{user\.properties > 0 \? \([\s\S]*?\)\s*:\s*\([\s\S]*?No properties listed yet.<\/p>\s*\)\}/, 
`{properties.length > 0 ? (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {properties.map((property, index) => (
                          <div
                            key={property.id || index}
                            className='bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300'
                          >
                            <img
                              src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                              alt={property.title}
                              className='w-full h-48 object-cover'
                            />
                            <div className='p-4'>
                              <h3 className='text-lg font-semibold text-white'>
                                {property.title}
                              </h3>
                              <p className='text-gray-400 flex items-center gap-1 text-sm my-1'>
                                <MapPin className='w-3 h-3'/> {property.address || 'No address provided'}
                              </p>
                              <p className='text-blue-400 font-medium mt-2'>
                                $\\{property.price\\}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-400'>No properties listed yet.</p>
                    )}`);

fs.writeFileSync('app/profile/page.js', code);
