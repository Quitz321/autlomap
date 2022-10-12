import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the start time input', () => {
  render(<App />)
  expect(screen.getByPlaceholderText('Start time')).toBeInTheDocument()
})

test('no Distance button on first load', () => {
  render(<App />)
  expect(screen.queryByText('Distance')).not.toBeInTheDocument()
})
