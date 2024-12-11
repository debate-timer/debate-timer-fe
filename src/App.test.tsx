import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the App component with the correct text', () => {
  // App 컴포넌트를 렌더링
  render(<App />);

  // 화면에 "HI"라는 텍스트가 있는지 확인
  const textElement = screen.getByText(/HI/i);
  expect(textElement).toBeInTheDocument();

  // 스타일 클래스가 포함되어 있는지 확인 (선택적)
  expect(textElement).toHaveClass('p-4', 'font-bold', 'text-red-500');
});
