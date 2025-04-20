<summary_title>
Financial Account Overview Dashboard with Net Worth Performance
</summary_title>

<image_analysis>
1. Content Structure:
- Main Content Elements: Net worth display (-$464.25), performance graph, account listing, summary panel
- Content Grouping: Three main sections - net worth overview, cash accounts, financial summary
- Visual Hierarchy: Net worth figure prominent, followed by graph, then account details
- Content Types: Numerical data, line graph, account cards, tabular summary
- Text Elements: Headers (NET WORTH, Cash), account names, balance amounts, timestamps

2. Layout Structure:
- Content Distribution: Single column layout with clear section separation
- Spacing Patterns: Consistent padding between sections, aligned margins
- Container Structure: Card-based containers for main sections
- Grid/Alignment: Left-aligned content with right-aligned numerical values
- Responsive Behavior: Flexible width containers with maintained spacing

3. UI Components (Page-Specific):
- Content Cards: Account summary card with bank logo
- Interactive Elements: Dropdown selectors for time period and performance metrics
- Data Display Elements: Line graph showing net worth trend
- Status Indicators: Last update timestamp ("20 minutes ago")
- Media Components: Bank logo in account card

4. Interactive Patterns:
- Content Interactions: Expandable/collapsible sections (Cash category)
- State Changes: Hoverable graph points showing specific values
- Dynamic Content: Auto-refreshing account balances
- Mobile Interactions: Touch-friendly large tap targets for dropdowns

</image_analysis>

<development_planning>
1. Component Structure:
- NetWorthDisplay component with performance metrics
- TimeSeriesGraph component for worth visualization
- AccountList component with individual AccountCard items
- SummaryPanel component for totals display

2. Content Layout:
- Flexbox-based main container
- CSS Grid for summary panel layout
- Responsive breakpoints for mobile optimization
- Dynamic height adjustments for expanding sections

3. Integration Points:
- Financial data API integration
- Theme system for consistent styling
- Shared components: buttons, dropdowns, icons
- Real-time update system for account balances

4. Performance Considerations:
- Lazy loading for graph data
- Cached account information
- Optimized bank logo images
- Debounced refresh functionality
- Progressive loading for account details

</development_planning>