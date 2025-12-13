import { render, screen, waitFor, within } from '@testing-library/react';
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

    it('show Try Again Button on no backend connection', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>);
        screen.debug()

        await waitFor(() => {
            const extraHeader = screen.getByText('Try Again');
            expect(extraHeader).toBeInTheDocument();

            const button = screen.getByRole('button');
            expect(within(button).getAllByText('Try Again').length).toBeGreaterThan(0);
        }, {timeout: 2000})
    });
});