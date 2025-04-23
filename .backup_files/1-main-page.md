Set up the frontend according to the following prompt:
  <frontend-prompt>
  Create detailed components with these requirements:
  1. Use 'use client' directive for client-side components
  2. Make sure to concatenate strings correctly using backslash
  3. Style with Tailwind CSS utility classes for responsive design
  4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
  5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
  6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
  7. Create root layout.tsx page that wraps necessary navigation items to all pages
  8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
  9. Accurately implement necessary grid layouts
  10. Follow proper import practices:
     - Use @/ path aliases
     - Keep component imports organized
     - Update current src/app/page.tsx with new comprehensive code
     - Don't forget root route (page.tsx) handling
     - You MUST complete the entire prompt before stopping
  </frontend-prompt>

  <summary_title>
Financial Management Dashboard UI - Personal Finance Analytics Platform
</summary_title>

<image_analysis>
1. Navigation Elements:
- Primary navigation: Dashboard, Accounts, Transactions, Cash Flow, Reports, Budget, Recurring, Goals, Investments
- Top header bar with logo (left), main menu items (center), and Sign in/Sign up buttons (right)
- Secondary navigation includes Features, For Couples, For Professionals, Pricing, Resources, Download
- Logo: Monarch butterfly icon in coral/orange color with "Monarch" text
- Header height approximately 64px with 16px padding

2. Layout Components:
- Main container width: 1200px max-width
- Left sidebar: ~240px width
- Content area: ~960px width
- Vertical spacing between sections: 24px
- Card components with 16px padding and 8px border radius

3. Content Sections:
- Hero section with large heading "Your home base for money clarity"
- Descriptive text section below hero
- Main dashboard view with:
  - Spending pie chart visualization
  - Transaction list table
  - Category breakdown with percentages
  - Summary statistics panel

4. Interactive Controls:
- Date picker: "This month" dropdown
- Filters button with icon
- Category filter dropdown
- Sort controls for transaction list
- Share, Edit multiple, and Export buttons
- Interactive pie chart segments

5. Colors:
- Primary: #FF5D1C (coral/orange)
- Secondary: #2D3142 (dark blue)
- Background: #FFFFFF
- Text: #333333
- Accent: #007AFF (blue links)
- Chart colors: Various pastels for categories

6. Grid/Layout Structure:
- 12-column grid system
- Sidebar: 3 columns
- Main content: 9 columns
- Responsive breakpoints at 768px, 992px, 1200px
</image_analysis>

<development_planning>
1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Sidebar
│   │   └── MainContent
│   ├── features/
│   │   ├── SpendingChart
│   │   ├── TransactionList
│   │   └── CategoryBreakdown
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```

2. Key Features:
- Real-time financial dashboard
- Transaction management system
- Category-based spending analysis
- Data visualization components
- Multi-account aggregation
- Export and sharing capabilities

3. State Management:
```typescript
interface AppState {
  transactions: {
    items: Transaction[]
    filters: FilterOptions
    sorting: SortOptions
  }
  categories: {
    spending: CategorySpending[]
    filters: CategoryFilter[]
  }
  accounts: {
    list: Account[]
    balances: AccountBalance[]
  }
}
```

4. Component Architecture:
- DashboardLayout (parent)
  - NavigationBar
  - SidebarNav
  - ContentArea
    - SpendingChart
    - TransactionList
    - CategoryBreakdown

5. Responsive Breakpoints:
```scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 992px,
  'wide': 1200px
);
```
</development_planning>