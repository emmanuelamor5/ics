import React, { useEffect, useState } from 'react';

function StagesList() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/stages') // Update if your backend URL is different
      .then((response) => response.json())
      .then((data) => {
        setStages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stages:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading stages...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Stages</h2>
      <ul className="list-disc pl-5">
        {stages.map((stage) => (
          <li key={stage.stage_id}>
            {stage.name} - ({stage.latitude}, {stage.longitude})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StagesList;
