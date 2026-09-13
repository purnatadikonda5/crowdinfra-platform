const fs = require('fs');
let code = fs.readFileSync('app/search-demands/page.js', 'utf8');

// 1. URLs
code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");

// 2. Fetch demands extraction
// Replace `setDemands(response.data)` with `.content || []`
code = code.replace(/setDemands\(response\.data\)/g, "setDemands(response.data.content || [])");
code = code.replace(/setFilteredDemands\(response\.data\)/g, "setFilteredDemands(response.data.content || [])");

// 3. Location fields for distance calculation
code = code.replace(/const demandLat = demand\.location\.lat/g, "const demandLat = demand.location?.y || demand.location?.lat");
code = code.replace(/const demandLng = demand\.location\.lng/g, "const demandLng = demand.location?.x || demand.location?.lng");

// 4. Categories list
const newCategories = `<option value='PUBLIC_SERVICE'>public service</option>
                <option value='TRANSPORTATION'>transportation</option>
                <option value='UTILITIES'>utilities</option>
                <option value='EDUCATION'>education</option>
                <option value='HEALTHCARE'>healthcare</option>
                <option value='OTHER'>other</option>`;
code = code.replace(/<option value='restaurant'>public service<\/option>[\s\S]*?<option value='services'>other<\/option>/, newCategories);

// 5. Add comments state and fetch logic
const commentsLogic = `
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
code = code.replace(/const handleMarkerClick = \(demand\) => \{[^}]+\}/, `const handleMarkerClick = (demand) => {\n    setSelectedDemand(demand)\n    fetchComments(demand.id)\n  }\n${commentsLogic}`);

// 6. Update POST comment endpoint mapping
code = code.replace(/const response = await axios\.post\([\s\S]*?`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:8085'\}\/api\/demands\/\$\{demandId\}\/comments`[\s\S]*?withCredentials: true \} \/\/ Ensures cookies \(and auth\) are sent\.[\s\S]*?\)/, 
`const response = await axios.post(
        \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/comments/\${demandId}\`,
        { text: newComment },
        { withCredentials: true }
      )`);

// 7. Update how the new comment is appended (not relying on updatedDemand)
code = code.replace(/\/\/ The backend returns the updated demand with the new comment\.[\s\S]*?setNewComment\(''\)/, 
`setComments([response.data, ...comments])
      setNewComment('')`);

// 8. Replace `selectedDemand.comments` with `comments` array
code = code.replace(/\{\(selectedDemand\.comments \|\| \[\]\)\.map\(\(comment, index\) => \(/g, `{comments.map((comment, index) => (`);
code = code.replace(/\{\(selectedDemand\.comments \|\| \[\]\)\.length === 0 && \(/g, `{comments.length === 0 && (`);

// 9. Fix userName and createdAt bindings
code = code.replace(/<span>\{comment\.user\}<\/span>/g, `<span>{comment.userName}</span>`);
code = code.replace(/\{new Date\(comment\.timestamp\)\.toLocaleString\(\)\}/g, `{new Date(comment.createdAt).toLocaleString()}`);

fs.writeFileSync('app/search-demands/page.js', code);
