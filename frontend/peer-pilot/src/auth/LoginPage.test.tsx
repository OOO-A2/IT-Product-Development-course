    // src/components/MyComponent.test.tsx
    import { render, screen } from '@testing-library/react';
    import LoginPage from './LoginPage';

    describe('MyComponent', () => {
      it('renders the correct text', () => {
        render(<LoginPage onLogin={()=>{}} />);
        expect(screen.getByText('Sign in to continue to your account')).toBeInTheDocument();
      })
    });