import { useState } from "react";
import { searchProviders } from "../services/providerService";

function SearchProviders() {
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await searchProviders(query);
      setProviders(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div>
      <h2>Search Providers</h2>

      <input
        type="text"
        placeholder="Search service..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      <div>
        {providers.map((p) => (
          <div key={p.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
            <h3>{p.businessName}</h3>
            <p>{p.description}</p>
            <p>Experience: {p.experienceYears} years</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchProviders;