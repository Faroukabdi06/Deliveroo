/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders landing page logo', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /deliveroo/i })).toBeInTheDocument()
})
