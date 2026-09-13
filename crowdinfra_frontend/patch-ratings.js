const fs = require('fs');
let code = fs.readFileSync('app/components/ratings.jsx', 'utf8');

code = code.replace(/const fetchReviews = async \(\) => \{[\s\S]*?fetchReviews\(\)/, `const fetchReviews = async () => {
      // Stubbed out rating-service since the microservices architecture does not include it yet
      setReviews([
        {
          _id: "1",
          username: "Alice",
          rating: 5,
          review: "Excellent tool for mapping out community infrastructure demands!",
          createdAt: new Date().toISOString()
        },
        {
          _id: "2",
          username: "Bob",
          rating: 4,
          review: "Really good, love the heatmaps feature.",
          createdAt: new Date().toISOString()
        }
      ])
    }
    fetchReviews()`);

fs.writeFileSync('app/components/ratings.jsx', code);
