import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TableListPage from './TableListPage';

vi.mock('../../layout/defaultLayout/DefaultLayout', () => {
  const HeaderLeft = function HeaderLeft({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="header-left">{children}</div>;
  };
  HeaderLeft.displayName = 'HeaderLeft';

  const Header = function Header({ children }: { children: React.ReactNode }) {
    return <div data-testid="header">{children}</div>;
  };
  Header.displayName = 'Header';
  Header.Left = HeaderLeft;

  const DefaultLayout = function DefaultLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="default-layout">{children}</div>;
  };
  DefaultLayout.displayName = 'DefaultLayout';
  DefaultLayout.Header = Header;

  return {
    default: DefaultLayout,
  };
});

vi.mock('./components/Table/Table', () => ({
  default: function Table({
    name,
    type,
    time,
  }: {
    name: string;
    type: string;
    time: number;
  }) {
    return (
      <div data-testid="table-component">
        <div>{name}</div>
        <div>{type}</div>
        <div>{time}</div>
      </div>
    );
  },
}));

vi.mock('./components/Table/AddTable', () => ({
  default: function AddTable() {
    return <div data-testid="add-table">테이블 추가</div>;
  },
}));

describe('TableListPage', () => {
  const renderTableListPage = () => {
    return render(
      <BrowserRouter>
        <TableListPage />
      </BrowserRouter>,
    );
  };

  it('renders DefaultLayout correctly', () => {
    renderTableListPage();
    expect(screen.getByTestId('default-layout')).toBeInTheDocument();
  });

  it('renders header with correct text', () => {
    renderTableListPage();
    const headerLeft = screen.getByTestId('header-left');
    expect(headerLeft).toBeInTheDocument();
    expect(headerLeft).toHaveTextContent('테이블 목록화면');
  });

  it('renders the correct number of tables', () => {
    renderTableListPage();
    const tables = screen.getAllByTestId('table-component');
    expect(tables).toHaveLength(4);
  });

  it('renders AddTable component', () => {
    renderTableListPage();
    expect(screen.getByTestId('add-table')).toBeInTheDocument();
  });

  it('renders main container with correct grid classes', () => {
    renderTableListPage();
    const mainContainer = document.querySelector('main');
    expect(mainContainer).toHaveClass('grid');
    expect(mainContainer).toHaveClass('grid-cols-3');
    expect(mainContainer).toHaveClass('justify-items-center');
    expect(mainContainer).toHaveClass('gap-6');
  });

  it('renders tables with correct data', () => {
    renderTableListPage();
    const tables = screen.getAllByTestId('table-component');

    // Check first table
    const firstTable = tables[0];
    expect(firstTable).toHaveTextContent('테이블1');
    expect(firstTable).toHaveTextContent('의회식 토론');
    expect(firstTable).toHaveTextContent('30');

    // Check second table
    const secondTable = tables[1];
    expect(secondTable).toHaveTextContent('테이블 2');
    expect(secondTable).toHaveTextContent('의회식 토론');
    expect(secondTable).toHaveTextContent('30');
  });

  it('renders parent container with correct classes', () => {
    renderTableListPage();
    const container = screen
      .getByTestId('default-layout')
      .querySelector('.flex.h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('h-screen');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('py-6');
  });
});
