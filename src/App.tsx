import { useState } from 'react';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [formData, setFormData] = useState({ budget: 50, diet: 'None', time: 60 });
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setPlan(null);

    try {
      if (!apiKey) return setError('API key required');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'PromptWars Warmup'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 1000,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: `Create a meal plan (Budget: $${formData.budget}, Diet: ${formData.diet}, Time: ${formData.time}m). Return EXACT JSON: {"breakfast":"...","lunch":"...","dinner":"...","groceryList":["..."],"substitutions":["..."],"budgetFeasible":true}`
            }
          ]
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'API Error');
      
      const content = data.choices[0].message.content;
      setPlan(JSON.parse(content || "{}"));
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>AI Cooking Planner</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <input type="password" placeholder="Gemini API Key (Optional for testing)" onChange={e => setApiKey(e.target.value)} />
        <input type="number" placeholder="Budget ($)" required min="1" value={formData.budget} onChange={e => setFormData({ ...formData, budget: +e.target.value })} />
        <input type="text" placeholder="Diet (e.g., Vegan)" value={formData.diet} onChange={e => setFormData({ ...formData, diet: e.target.value })} />
        <input type="number" placeholder="Time (mins)" required min="1" value={formData.time} onChange={e => setFormData({ ...formData, time: +e.target.value })} />
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Plan Meals'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {plan && (
        <div>
          <h2>Budget Feasible: {plan.budgetFeasible ? 'Yes ✅' : 'No ❌'}</h2>
          <h3>Breakfast</h3><p>{plan.breakfast}</p>
          <h3>Lunch</h3><p>{plan.lunch}</p>
          <h3>Dinner</h3><p>{plan.dinner}</p>
          <h3>Groceries</h3><ul>{plan.groceryList?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
          <h3>Substitutions</h3><ul>{plan.substitutions?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
