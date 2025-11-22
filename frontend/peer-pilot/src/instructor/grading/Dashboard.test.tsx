    // src/components/MyComponent.test.tsx
    import { render, screen } from '@testing-library/react';
    import Dashboard from './Dashboard';

    describe('Renders extra column on the teams view of instructors dashboard', () => {
      it('renders the correct text', () => {
        render(<Dashboard />);
        expect(screen.getByText('Extra')).toBeInTheDocument();
      })
    });