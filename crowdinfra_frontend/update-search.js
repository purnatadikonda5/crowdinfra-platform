const fs = require('fs');
let code = fs.readFileSync('app/search-demands/page.js', 'utf8');

code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");
code = code.replace(/\/api\/demands/g, "/api/demand");
code = code.replace(/setDemands\(response\.data\)/, "setDemands(response.data.content || [])");
code = code.replace(/setFilteredDemands\(response\.data\)/, "setFilteredDemands(response.data.content || [])");
code = code.replace(/const demandLat = demand\.location\.lat/, "const demandLat = demand.location?.y || demand.location?.lat");
code = code.replace(/const demandLng = demand\.location\.lng/, "const demandLng = demand.location?.x || demand.location?.lng");

const commentState = `
  const [comments, setComments] = useState([])
  const fetchComments = async (demandId) => {
      try {
        const res = await axios.get(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/comments/\${demandId}\`, { withCredentials: true })
        setComments(res.data || [])
      } catch (err) {
        console.error("Failed to fetch comments", err)
      }
  }
`;

code = code.replace(/const handleMarkerClick = \(demand\) => \{[^}]+\}/, `const handleMarkerClick = (demand) => {\n    setSelectedDemand(demand)\n    fetchComments(demand.id)\n  }\n${commentState}`);

code = code.replace(/const response = await axios\.post\([\s\S]*?`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:8085'\}\/api\/demand\/\$\{demandId\}\/comments`[\s\S]*?withCredentials: true \}\s*\)/, 
`const response = await axios.post(
        \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/comments/\${demandId}\`,
        { text: newComment },
        { withCredentials: true }
      )`);

code = code.replace(/\/\/ The backend returns the updated demand with the new comment\.[\s\S]*?setNewComment\(''\)/, 
`setComments([response.data, ...comments])
      setNewComment('')`);

code = code.replace(/<option value='restaurant'>public service<\/option>[\s\S]*?<option value='services'>other<\/option>/,
`<option value='PUBLIC_SERVICE'>public service</option>
                <option value='TRANSPORTATION'>transportation</option>
                <option value='UTILITIES'>utilities</option>
                <option value='EDUCATION'>education</option>
                <option value='HEALTHCARE'>healthcare</option>
                <option value='OTHER'>other</option>`);

code = code.replace(/\{\(selectedDemand\.comments \|\| \[\]\)\.map\(\(comment, index\) => \([\s\S]*?\}\)/, 
`{comments.map((comment, index) => (
                        <div
                          key={comment.id || index}
                          className='bg-gray-800/50 p-3 rounded-lg'
                        >
                          <div className='flex justify-between text-sm text-gray-400 mb-1'>
                            <span>{comment.userName}</span>
                            <span>
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className='text-gray-200'>{comment.text}</p>
                        </div>
                      ))}`);
code = code.replace(/\{\(selectedDemand\.comments \|\| \[\]\)\.length === 0 && \(/, `{comments.length === 0 && (`);

fs.writeFileSync('app/search-demands/page.js', code);
