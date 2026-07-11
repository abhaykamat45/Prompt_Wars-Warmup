import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the Gemini API
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            breakfast: { name: 'Eggs', description: 'Fried', ingredients: ['Eggs'], instructions: ['Fry'] },
            lunch: { name: 'Sandwich', description: 'Ham', ingredients: ['Bread'], instructions: ['Make'] },
            dinner: { name: 'Pasta', description: 'Tomato', ingredients: ['Pasta'], instructions: ['Boil'] },
            groceryChecklist: [{ item: 'Eggs', estimatedCost: 5.00 }],
            totalEstimatedCost: 5.00,
            substitutions: [],
            timeline: ['Morning: Eggs']
          })
        })
      };
    }
  };
});

describe('App Component', () => {
  it('renders form inputs', () => {
    render(<App />);
    expect(screen.getByLabelText(/Number of People/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Daily Budget/i)).toBeInTheDocument();
  });

  it('shows error if API key is missing', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Meal Plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/Please provide a Gemini API Key/i)).toBeInTheDocument();
    });
  });

  it('submits valid inputs and displays the meal plan', async () => {
    render(<App />);
    
    // Fill required API key
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'test-key' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Generate Meal Plan/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Budget Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Within Budget/i)).toBeInTheDocument();
      expect(screen.getByText(/Eggs: \$5.00/i)).toBeInTheDocument();
    });
  });
});
