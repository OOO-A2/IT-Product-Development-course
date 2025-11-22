// src/components/MyComponent.test.tsx
import { render, screen, within } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Renders extra column on the teams view of instructors dashboard', () => {
    it('should display "Extra" column header in the main grades table', () => {
        render(<Dashboard/>);

        const extraHeader = screen.getAllByText('Extra')[0];
        expect(extraHeader).toBeInTheDocument();

        const table = screen.getByRole('table');
        expect(within(table).getAllByText('Extra').length).toBeGreaterThan(0);
    });
});