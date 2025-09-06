import { render, screen } from '@testing-library/react';
import { expect, test } from '@jest/globals';
import '@testing-library/jest-dom';
import App from './App';

test('renders learn react link', () => {
  render(<App user={{ id: 'test-user' }} />);
  // O App não possui mais o texto "learn react", então vamos testar o título principal
  const titleElement = screen.getByText(/mSaaS Calendário/i);
  expect(titleElement).toBeInTheDocument();
});
