import { render, screen, within } from '@testing-library/react';
import Dashboard from './Dashboard';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';


describe('Renders extra column on the teams view of instructors dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        }

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });

        // Mock localStorage.getItem to return the scroll data
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'tableScroll') {
                return JSON.stringify({
                    scrollLeft: 0,
                    scrollTop: 0,
                });
            }
            return null;
        });
    });

    it('should display "Extra" column header in the main grades table', () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>);
        screen.debug()
        const extraHeader = screen.getAllByText('Extra')[0];
        expect(extraHeader).toBeInTheDocument();

        const table = screen.getByRole('table');
        expect(within(table).getAllByText('Extra').length).toBeGreaterThan(0);
    });
});