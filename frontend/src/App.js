import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:30011/api') 
      .then(res => res.json())
      .then(json => setData(json.message))
      .catch(err => console.error("API error:", err));
  }, []);

  return (
    <div>
      <h1>Tes Frontend</h1>
      <p>coba tes dari backend: {data}</p>
    </div>
  );
}

export default App;